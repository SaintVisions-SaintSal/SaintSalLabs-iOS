/* ═══════════════════════════════════════════════════
   SCREEN 15 — BUILDER AI PLANNING AGENT
   builder_ai_planning_agent
   Wire: Claude claude-opus-4-5 (architecture), Perplexity
         (research), Supabase (save plans)
═══════════════════════════════════════════════════ */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, TextInput, ActivityIndicator, Alert, Modal,
  KeyboardAvoidingView, Platform, Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '../../config/theme';
import { mcpChat } from '../../lib/api';

// MCP gateway handles all AI routing (Build #70)
const PERPLEXITY_KEY = '';
const SUPABASE_URL = 'https://euxrlpuegeiggedqbkiv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1eHJscHVlZ2VpZ2dlZHFia2l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NTM1MTYsImV4cCI6MjA4MTUyOTUxNn0.KpvXVTIDXeGOBOQOhdPopVbYYfjB-RgPSyJJY3IY474';

const PLANNING_SYSTEM_PROMPT = `You are SAL Builder — the SaintSal Labs AI Planning Agent powered by the HACP Protocol (US Patent #10,290,222). You generate comprehensive software architecture and project plans.

When given a project goal, respond with a structured JSON plan in this exact format:
{
  "overview": "1-2 sentence project overview",
  "techStack": {
    "frontend": ["tech1", "tech2"],
    "backend": ["tech1", "tech2"],
    "database": ["tech1"],
    "deployment": ["tech1", "tech2"],
    "aiServices": ["tech1"]
  },
  "phases": [
    { "name": "Phase Name", "duration": "X days", "tasks": ["task1", "task2", "task3"] }
  ],
  "architecture": "Describe the overall system architecture in 2-3 sentences",
  "keyDecisions": ["Decision 1: reason", "Decision 2: reason"],
  "envVars": ["VAR_NAME=description", "VAR2=description"],
  "estimatedComplexity": "Low|Medium|High|Very High",
  "estimatedTimeline": "X weeks"
}

Always return valid JSON. Be specific, practical, and production-ready.`;

const TABS = ['Chat', 'Plan', 'Research'];

export default function AIPlanningAgent() {
  const router = useRouter();
  const scrollRef = useRef(null);
  const [activeTab, setActiveTab] = useState('Chat');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '**HACP Protocol Active**\n\nDescribe your project goal and I\'ll architect a complete implementation plan — tech stack, phases, timeline, env vars, and all deployment details.',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [plan, setPlan] = useState(null);
  const [research, setResearch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [researchLoading, setResearchLoading] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);
  const [taskProgress, setTaskProgress] = useState([]);
  const [savedPlans, setSavedPlans] = useState([]);
  const [plansModalVisible, setPlansModalVisible] = useState(false);

  useEffect(() => {
    fetchSavedPlans();
  }, []);

  const fetchSavedPlans = async () => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/ai_plans?select=id,title,created_at&order=created_at.desc&limit=20`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setSavedPlans(data || []);
      }
    } catch { /* silent */ }
  };

  const callClaude = useCallback(async (userMessage) => {
    setLoading(true);
    const progress = [
      { label: 'Init schema analysis', status: 'pending' },
      { label: 'Generate API routes', status: 'pending' },
      { label: 'UI component bridging', status: 'pending' },
      { label: 'Deployment config', status: 'pending' },
    ];
    setTaskProgress(progress);
    setActiveTab('Chat');

    // Animate task progress
    const updateTask = (idx, status) => {
      setTaskProgress(prev => prev.map((t, i) => i === idx ? { ...t, status } : t));
    };

    updateTask(0, 'running');
    await new Promise(r => setTimeout(r, 500));
    updateTask(0, 'done');
    updateTask(1, 'running');

    try {
      const conversationHistory = [
        ...messages.slice(1).map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMessage },
      ];

      const mcpRes = await mcpChat({
        message: userMessage,
        model: 'pro',
        vertical: 'general',
        history: conversationHistory.slice(-10),
      });
      const assistantContent = mcpRes.response || '';

      updateTask(1, 'done');
      updateTask(2, 'running');
      await new Promise(r => setTimeout(r, 300));
      updateTask(2, 'done');
      updateTask(3, 'running');

      // Try to parse as JSON plan
      let parsedPlan = null;
      try {
        const jsonMatch = assistantContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedPlan = JSON.parse(jsonMatch[0]);
          setPlan({ ...parsedPlan, title: userMessage.slice(0, 60) });
          setActiveTab('Plan');
        }
      } catch { /* not a JSON response, just display as chat */ }

      updateTask(3, 'done');

      setMessages(prev => [
        ...prev,
        { role: 'user', content: userMessage, timestamp: new Date().toISOString() },
        { role: 'assistant', content: assistantContent, timestamp: new Date().toISOString(), hasPlan: !!parsedPlan },
      ]);

      // Auto-fetch research
      if (parsedPlan) {
        fetchResearch(userMessage, parsedPlan);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'user', content: userMessage, timestamp: new Date().toISOString() },
        { role: 'assistant', content: `Error generating plan: ${err.message}. Please try again.`, timestamp: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
      setTaskProgress([]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const fetchResearch = async (goal, planData) => {
    setResearchLoading(true);
    try {
      const query = `Best practices and latest tools for: ${goal}. Tech stack: ${Object.values(planData?.techStack || {}).flat().join(', ')}`;
      const res = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PERPLEXITY_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-large-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are a technical researcher. Provide concise bullet-pointed insights about the latest best practices, tools, and gotchas for the given technology stack. Format with sections: ## Best Practices, ## Key Libraries, ## Common Pitfalls, ## Latest Updates (2025-2026).',
            },
            { role: 'user', content: query },
          ],
          max_tokens: 1500,
          temperature: 0.2,
          return_citations: true,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const content = data.choices[0]?.message?.content || '';
        setResearch({
          content,
          citations: data.citations || [],
          goal,
        });
      }
    } catch { /* silent */ }
    setResearchLoading(false);
  };

  const savePlan = async () => {
    if (!plan) return;
    setSavingPlan(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/ai_plans`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          title: plan.title || 'Untitled Plan',
          plan_data: plan,
          overview: plan.overview,
          tech_stack: plan.techStack,
          estimated_timeline: plan.estimatedTimeline,
          created_at: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        Alert.alert('Plan Saved', 'Your architecture plan has been saved to Supabase.');
        fetchSavedPlans();
      } else {
        throw new Error('Failed to save plan');
      }
    } catch (err) {
      Alert.alert('Save Error', err.message);
    } finally {
      setSavingPlan(false);
    }
  };

  const sharePlan = async () => {
    if (!plan) return;
    const planText = `
# ${plan.title || 'AI Architecture Plan'}
## Overview
${plan.overview}

## Tech Stack
${Object.entries(plan.techStack || {}).map(([k, v]) => `${k}: ${v.join(', ')}`).join('\n')}

## Timeline: ${plan.estimatedTimeline}
## Complexity: ${plan.estimatedComplexity}

## Phases
${(plan.phases || []).map(p => `### ${p.name} (${p.duration})\n${p.tasks.map(t => `- ${t}`).join('\n')}`).join('\n\n')}

Generated by SaintSal Labs AI Planning Agent — HACP Protocol™
    `.trim();

    try {
      await Share.share({ message: planText, title: plan.title });
    } catch { /* user cancelled */ }
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    setInput('');
    callClaude(trimmed);
  };

  const renderChatMessage = (msg, idx) => {
    const isUser = msg.role === 'user';
    return (
      <View key={idx} style={[s.msgWrap, isUser && s.msgWrapUser]}>
        {!isUser && (
          <View style={s.avatarWrap}>
            <Text style={s.avatarTxt}>SS</Text>
          </View>
        )}
        <View style={[s.msgBubble, isUser ? s.msgBubbleUser : s.msgBubbleAI]}>
          <Text style={[s.msgTxt, isUser && s.msgTxtUser]}>{msg.content}</Text>
          {msg.hasPlan && (
            <TouchableOpacity style={s.viewPlanBtn} onPress={() => setActiveTab('Plan')}>
              <Text style={s.viewPlanBtnTxt}>↗ VIEW ARCHITECTURE PLAN</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderTaskProgress = () => {
    if (taskProgress.length === 0) return null;
    return (
      <View style={s.progressCard}>
        <View style={s.progressHeader}>
          <View style={s.progressIconWrap}>
            <Text style={s.progressIcon}>⚡</Text>
          </View>
          <Text style={s.progressTitle}>Architecting Implementation...</Text>
        </View>
        {taskProgress.map((task, idx) => (
          <View key={idx} style={s.progressRow}>
            <View style={s.progressLeft}>
              {task.status === 'done' ? (
                <Text style={s.progressCheckmark}>✓</Text>
              ) : task.status === 'running' ? (
                <ActivityIndicator size="small" color={C.gold} style={{ width: 16, height: 16 }} />
              ) : (
                <View style={s.progressPending} />
              )}
              <Text style={[s.progressLabel, task.status === 'running' && { color: C.gold }, task.status === 'done' && { color: '#22C55E' }]}>
                {task.label}
              </Text>
            </View>
            {task.status === 'running' && (
              <Text style={s.progressWorking}>Working...</Text>
            )}
          </View>
        ))}
        {/* Terminal */}
        <View style={s.terminal}>
          <View style={s.terminalDots}>
            <View style={[s.termDot, { backgroundColor: '#FF5F57' }]} />
            <View style={[s.termDot, { backgroundColor: '#FEBC2E' }]} />
            <View style={[s.termDot, { backgroundColor: '#28C840' }]} />
          </View>
          <Text style={s.termLine}><Text style={{ color: '#22C55E' }}>&gt; </Text>Injecting environment variables...</Text>
          <Text style={s.termLine}><Text style={{ color: C.textDim }}>SUPABASE_URL: </Text><Text style={{ color: C.gold + 'CC' }}>https://******.supabase.co</Text></Text>
          <Text style={s.termLine}><Text style={{ color: C.textDim }}>ANTHROPIC_KEY: </Text><Text style={{ color: C.gold + 'CC' }}>sk-ant-api03-***...</Text></Text>
          <Text style={[s.termLine, { color: '#60A5FA' }]}>_ Generating architecture plan...</Text>
        </View>
      </View>
    );
  };

  const renderPlanTab = () => {
    if (!plan) {
      return (
        <View style={s.emptyPlan}>
          <Text style={s.emptyPlanIcon}>📐</Text>
          <Text style={s.emptyPlanTitle}>No Plan Yet</Text>
          <Text style={s.emptyPlanSub}>Describe your project in the Chat tab to generate an architecture plan.</Text>
        </View>
      );
    }
    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Plan Header */}
        <View style={s.planHeader}>
          <Text style={s.planTitle}>{plan.title}</Text>
          <View style={s.planMeta}>
            <View style={s.planMetaBadge}>
              <Text style={s.planMetaTxt}>⏱ {plan.estimatedTimeline}</Text>
            </View>
            <View style={[s.planMetaBadge, {
              backgroundColor: plan.estimatedComplexity === 'Low' ? '#22C55E15' : plan.estimatedComplexity === 'Very High' ? '#EF444415' : C.gold + '15',
              borderColor: plan.estimatedComplexity === 'Low' ? '#22C55E30' : plan.estimatedComplexity === 'Very High' ? '#EF444430' : C.gold + '30',
            }]}>
              <Text style={[s.planMetaTxt, { color: plan.estimatedComplexity === 'Low' ? '#22C55E' : plan.estimatedComplexity === 'Very High' ? '#EF4444' : C.gold }]}>
                {plan.estimatedComplexity}
              </Text>
            </View>
          </View>
          <Text style={s.planOverview}>{plan.overview}</Text>
        </View>

        {/* Tech Stack */}
        {plan.techStack && (
          <View style={s.planSection}>
            <Text style={s.planSectionTitle}>TECH STACK</Text>
            {Object.entries(plan.techStack).map(([category, techs]) => (
              techs && techs.length > 0 && (
                <View key={category} style={s.techRow}>
                  <Text style={s.techCategory}>{category.toUpperCase()}:</Text>
                  <View style={s.techTags}>
                    {techs.map(tech => (
                      <View key={tech} style={s.techTag}>
                        <Text style={s.techTagTxt}>{tech}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )
            ))}
          </View>
        )}

        {/* Architecture */}
        {plan.architecture && (
          <View style={s.planSection}>
            <Text style={s.planSectionTitle}>ARCHITECTURE</Text>
            <Text style={s.planArchitectureText}>{plan.architecture}</Text>
          </View>
        )}

        {/* Phases */}
        {plan.phases && plan.phases.length > 0 && (
          <View style={s.planSection}>
            <Text style={s.planSectionTitle}>IMPLEMENTATION PHASES</Text>
            {plan.phases.map((phase, idx) => (
              <View key={idx} style={s.phaseCard}>
                <View style={s.phaseHeader}>
                  <View style={s.phaseNumber}>
                    <Text style={s.phaseNumberTxt}>{idx + 1}</Text>
                  </View>
                  <View style={s.phaseTitleWrap}>
                    <Text style={s.phaseName}>{phase.name}</Text>
                    <Text style={s.phaseDuration}>{phase.duration}</Text>
                  </View>
                </View>
                {phase.tasks && phase.tasks.map((task, tidx) => (
                  <View key={tidx} style={s.phaseTask}>
                    <Text style={s.phaseTaskDot}>▸</Text>
                    <Text style={s.phaseTaskTxt}>{task}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Key Decisions */}
        {plan.keyDecisions && plan.keyDecisions.length > 0 && (
          <View style={s.planSection}>
            <Text style={s.planSectionTitle}>KEY DECISIONS</Text>
            {plan.keyDecisions.map((decision, idx) => (
              <View key={idx} style={s.decisionRow}>
                <Text style={s.decisionNum}>{idx + 1}</Text>
                <Text style={s.decisionTxt}>{decision}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Env Vars */}
        {plan.envVars && plan.envVars.length > 0 && (
          <View style={s.planSection}>
            <Text style={s.planSectionTitle}>ENVIRONMENT VARIABLES</Text>
            <View style={s.envBlock}>
              {plan.envVars.map((v, idx) => (
                <Text key={idx} style={s.envLine}>{v}</Text>
              ))}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={s.planActions}>
          <TouchableOpacity
            style={[s.savePlanBtn, savingPlan && { opacity: 0.7 }]}
            onPress={savePlan}
            disabled={savingPlan}
          >
            {savingPlan ? (
              <ActivityIndicator size="small" color={C.bg} />
            ) : (
              <Text style={s.savePlanBtnTxt}>💾 SAVE PLAN</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={s.sharePlanBtn} onPress={sharePlan}>
            <Text style={s.sharePlanBtnTxt}>↗ SHARE</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    );
  };

  const renderResearchTab = () => {
    if (researchLoading) {
      return (
        <View style={s.researchLoading}>
          <ActivityIndicator size="large" color={C.gold} />
          <Text style={s.researchLoadingTxt}>Perplexity researching best practices...</Text>
        </View>
      );
    }
    if (!research) {
      return (
        <View style={s.emptyPlan}>
          <Text style={s.emptyPlanIcon}>🔍</Text>
          <Text style={s.emptyPlanTitle}>No Research Yet</Text>
          <Text style={s.emptyPlanSub}>Generate a plan first — Perplexity will auto-research the latest best practices for your stack.</Text>
        </View>
      );
    }
    return (
      <ScrollView showsVerticalScrollIndicator={false} style={s.researchScroll}>
        <View style={s.researchHeader}>
          <Text style={s.researchTitle}>Research: {research.goal?.slice(0, 50)}...</Text>
          <View style={s.perplexityBadge}>
            <Text style={s.perplexityBadgeTxt}>via PERPLEXITY</Text>
          </View>
        </View>
        <Text style={s.researchContent}>{research.content}</Text>
        {research.citations && research.citations.length > 0 && (
          <View style={s.citationsSection}>
            <Text style={s.citationsTitle}>SOURCES</Text>
            {research.citations.map((c, idx) => (
              <Text key={idx} style={s.citation} numberOfLines={1}>{idx + 1}. {c}</Text>
            ))}
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backTxt}>←</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>AI Planning Agent</Text>
          <View style={s.hacp}>
            <View style={s.hacpDot} />
            <Text style={s.hacpTxt}>HACP PROTOCOL ACTIVE</Text>
          </View>
        </View>
        <TouchableOpacity style={s.plansBtn} onPress={() => setPlansModalVisible(true)}>
          <Text style={s.plansBtnTxt}>📋</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View style={s.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[s.tab, activeTab === tab && s.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[s.tabTxt, activeTab === tab && s.tabTxtActive]}>{tab.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      {activeTab === 'Chat' && (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <ScrollView
            ref={scrollRef}
            style={s.chatScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.chatContent}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map(renderChatMessage)}
            {renderTaskProgress()}
            {loading && taskProgress.length === 0 && (
              <View style={s.typingIndicator}>
                <View style={s.avatarWrap}>
                  <Text style={s.avatarTxt}>SS</Text>
                </View>
                <View style={s.typingBubble}>
                  <ActivityIndicator size="small" color={C.gold} />
                  <Text style={s.typingTxt}>Architecting...</Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Input Bar */}
          <View style={s.inputBar}>
            <TextInput
              style={s.input}
              value={input}
              onChangeText={setInput}
              placeholder="Describe your project goal..."
              placeholderTextColor={C.textGhost}
              multiline
              maxLength={2000}
              autoCapitalize="sentences"
            />
            <TouchableOpacity
              style={[s.sendBtn, (!input.trim() || loading) && s.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!input.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={C.bg} />
              ) : (
                <Text style={s.sendBtnTxt}>→</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      {activeTab === 'Plan' && (
        <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 8 }}>
          {renderPlanTab()}
        </View>
      )}

      {activeTab === 'Research' && (
        <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 8 }}>
          {renderResearchTab()}
        </View>
      )}

      {/* Saved Plans Modal */}
      <Modal
        visible={plansModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setPlansModalVisible(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalHeaderRow}>
              <Text style={s.modalTitle}>Saved Plans</Text>
              <TouchableOpacity onPress={() => setPlansModalVisible(false)}>
                <Text style={s.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            {savedPlans.length === 0 ? (
              <Text style={s.noPlansText}>No saved plans yet. Generate a plan and save it!</Text>
            ) : (
              <ScrollView>
                {savedPlans.map((p, idx) => (
                  <View key={p.id || idx} style={s.savedPlanRow}>
                    <Text style={s.savedPlanTitle} numberOfLines={1}>{p.title || 'Untitled Plan'}</Text>
                    <Text style={s.savedPlanDate}>{new Date(p.created_at).toLocaleDateString()}</Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.gold + '20',
    backgroundColor: C.bgCard,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: C.bgElevated, borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  backTxt: { fontSize: 18, color: C.text, fontWeight: '500' },
  headerCenter: { flex: 1, marginLeft: 12 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: C.gold, letterSpacing: 1 },
  hacp: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  hacpDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E' },
  hacpTxt: { fontSize: 9, fontWeight: '800', color: '#22C55E', letterSpacing: 1.5, fontFamily: 'monospace' },
  plansBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: C.bgElevated, borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  plansBtnTxt: { fontSize: 18 },

  // Tab Bar
  tabBar: { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  tab: {
    flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: 'center',
    backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.gold + '20',
  },
  tabActive: { backgroundColor: C.gold + '20', borderColor: C.gold + '60' },
  tabTxt: { fontSize: 10, fontWeight: '800', color: C.textDim, letterSpacing: 1.5 },
  tabTxtActive: { color: C.gold },

  // Chat
  chatScroll: { flex: 1 },
  chatContent: { padding: 16, gap: 16 },
  msgWrap: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  msgWrapUser: { flexDirection: 'row-reverse' },
  avatarWrap: {
    width: 32, height: 32, borderRadius: 8, backgroundColor: C.gold,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  avatarTxt: { fontSize: 10, fontWeight: '800', color: C.bg },
  msgBubble: { maxWidth: '82%', borderRadius: 16, padding: 14 },
  msgBubbleAI: { backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.gold + '18', borderTopLeftRadius: 4 },
  msgBubbleUser: { backgroundColor: C.gold + '15', borderWidth: 1, borderColor: C.gold + '30', borderTopRightRadius: 4 },
  msgTxt: { fontSize: 13, color: C.textSub, lineHeight: 20 },
  msgTxtUser: { color: C.text },
  viewPlanBtn: {
    marginTop: 10, paddingHorizontal: 10, paddingVertical: 6,
    backgroundColor: C.gold + '20', borderRadius: 8, borderWidth: 1, borderColor: C.gold + '40',
    alignSelf: 'flex-start',
  },
  viewPlanBtnTxt: { fontSize: 10, fontWeight: '800', color: C.gold, letterSpacing: 1 },

  // Task Progress
  progressCard: {
    backgroundColor: C.bgCard, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: C.gold + '20', gap: 12,
  },
  progressHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressIconWrap: {
    width: 32, height: 32, borderRadius: 8, backgroundColor: C.gold,
    alignItems: 'center', justifyContent: 'center',
  },
  progressIcon: { fontSize: 16 },
  progressTitle: { fontSize: 13, fontWeight: '700', color: C.gold },
  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressCheckmark: { fontSize: 14, color: '#22C55E', fontWeight: '800', width: 16, textAlign: 'center' },
  progressPending: { width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: C.textGhost },
  progressLabel: { fontSize: 12, color: C.textDim, fontFamily: 'monospace' },
  progressWorking: { fontSize: 10, color: C.gold, fontWeight: '700' },

  // Terminal
  terminal: { backgroundColor: '#000000AA', borderRadius: 8, padding: 12, gap: 4, borderWidth: 1, borderColor: '#FFFFFF08' },
  terminalDots: { flexDirection: 'row', gap: 4, marginBottom: 8 },
  termDot: { width: 8, height: 8, borderRadius: 4 },
  termLine: { fontSize: 11, fontFamily: 'monospace', color: C.textDim, lineHeight: 16 },

  typingIndicator: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  typingBubble: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.bgCard, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: C.gold + '18' },
  typingTxt: { fontSize: 12, color: C.textDim },

  // Input Bar
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: C.gold + '15',
    backgroundColor: C.bgCard,
  },
  input: {
    flex: 1, backgroundColor: C.bgElevated, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    color: C.text, fontSize: 14, maxHeight: 100,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: C.gold,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: C.gold + '40' },
  sendBtnTxt: { fontSize: 20, color: C.bg, fontWeight: '700' },

  // Plan Tab
  planHeader: { marginBottom: 16 },
  planTitle: { fontSize: 18, fontWeight: '800', color: C.text, marginBottom: 10, lineHeight: 24 },
  planMeta: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  planMetaBadge: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
    backgroundColor: C.gold + '15', borderWidth: 1, borderColor: C.gold + '30',
  },
  planMetaTxt: { fontSize: 11, fontWeight: '700', color: C.gold },
  planOverview: { fontSize: 13, color: C.textSub, lineHeight: 20, backgroundColor: C.bgCard, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: C.border },
  planSection: { marginBottom: 20 },
  planSectionTitle: { fontSize: 10, fontWeight: '800', color: C.gold, letterSpacing: 3, marginBottom: 12, textTransform: 'uppercase' },
  techRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  techCategory: { fontSize: 10, fontWeight: '800', color: C.textDim, letterSpacing: 1, width: 70, marginTop: 4 },
  techTags: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  techTag: { backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  techTagTxt: { fontSize: 11, color: C.textSub, fontWeight: '600' },
  planArchitectureText: { fontSize: 13, color: C.textSub, lineHeight: 20, backgroundColor: C.bgCard, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: C.border },
  phaseCard: { backgroundColor: C.bgCard, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: C.border, marginBottom: 10 },
  phaseHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  phaseNumber: { width: 28, height: 28, borderRadius: 8, backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center' },
  phaseNumberTxt: { fontSize: 13, fontWeight: '800', color: C.bg },
  phaseTitleWrap: { flex: 1 },
  phaseName: { fontSize: 14, fontWeight: '700', color: C.text },
  phaseDuration: { fontSize: 11, color: C.gold, marginTop: 2, fontWeight: '600' },
  phaseTask: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginBottom: 6 },
  phaseTaskDot: { fontSize: 12, color: C.gold, marginTop: 1 },
  phaseTaskTxt: { fontSize: 12, color: C.textSub, flex: 1, lineHeight: 18 },
  decisionRow: { flexDirection: 'row', gap: 10, marginBottom: 10, backgroundColor: C.bgCard, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: C.border },
  decisionNum: { fontSize: 13, fontWeight: '800', color: C.gold, width: 20 },
  decisionTxt: { fontSize: 12, color: C.textSub, flex: 1, lineHeight: 18 },
  envBlock: { backgroundColor: '#000000AA', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: C.border + '80' },
  envLine: { fontSize: 12, color: '#22C55E', fontFamily: 'monospace', marginBottom: 6, lineHeight: 18 },
  planActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  savePlanBtn: { flex: 1, height: 50, backgroundColor: C.gold, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  savePlanBtnTxt: { fontSize: 12, fontWeight: '800', color: C.bg, letterSpacing: 1.5 },
  sharePlanBtn: { width: 90, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.gold + '50' },
  sharePlanBtnTxt: { fontSize: 12, fontWeight: '700', color: C.gold },
  emptyPlan: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: 12 },
  emptyPlanIcon: { fontSize: 48 },
  emptyPlanTitle: { fontSize: 18, fontWeight: '700', color: C.text },
  emptyPlanSub: { fontSize: 13, color: C.textDim, textAlign: 'center', lineHeight: 20, paddingHorizontal: 32 },

  // Research Tab
  researchLoading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  researchLoadingTxt: { fontSize: 13, color: C.textDim },
  researchScroll: { flex: 1 },
  researchHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 10 },
  researchTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: C.text, lineHeight: 20 },
  perplexityBadge: { backgroundColor: C.gold + '15', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: C.gold + '30' },
  perplexityBadgeTxt: { fontSize: 8, fontWeight: '800', color: C.gold, letterSpacing: 1 },
  researchContent: { fontSize: 13, color: C.textSub, lineHeight: 22 },
  citationsSection: { marginTop: 20 },
  citationsTitle: { fontSize: 9, fontWeight: '800', color: C.textDim, letterSpacing: 2, marginBottom: 10 },
  citation: { fontSize: 11, color: C.textDim, marginBottom: 6, lineHeight: 16 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: '#000000AA', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: C.bgCard, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '70%', borderTopWidth: 1, borderColor: C.border },
  modalHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  modalTitle: { fontSize: 16, fontWeight: '800', color: C.text },
  modalClose: { fontSize: 20, color: C.textDim, padding: 4 },
  noPlansText: { fontSize: 13, color: C.textDim, textAlign: 'center', paddingVertical: 32 },
  savedPlanRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  savedPlanTitle: { flex: 1, fontSize: 13, fontWeight: '600', color: C.text, marginRight: 12 },
  savedPlanDate: { fontSize: 11, color: C.textDim },
});
