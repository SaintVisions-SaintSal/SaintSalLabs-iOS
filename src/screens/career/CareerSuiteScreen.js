/**
 * CareerSuiteScreen.js
 * SaintSal Labs iOS — Career & Business HQ
 * Comprehensive Career Intelligence dashboard with 5 tabs:
 *   Overview · Jobs · Resume · Coach · Biz Plan
 */

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  KeyboardAvoidingView,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MCP_BASE, MCP_KEY, mcpChat } from '../../lib/api';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const BG     = '#0A0A0A';
const CARD   = '#141416';
const GOLD   = '#D4AF37';
const GREEN  = '#22C55E';
const TEXT   = '#E8E6E1';
const MUTED  = 'rgba(255,255,255,0.4)';
const BORDER = 'rgba(255,255,255,0.06)';

// ─── API Helpers ──────────────────────────────────────────────────────────────
const API_HEADERS = {
  'Content-Type': 'application/json',
  'x-sal-key': MCP_KEY,
};

async function apiFetch(path, options = {}) {
  const res = await fetch(`${MCP_BASE}${path}`, {
    headers: API_HEADERS,
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

// ─── Tab Config ───────────────────────────────────────────────────────────────
const TABS = [
  { key: 'overview', icon: '⊞', label: 'OVERVIEW' },
  { key: 'jobs',     icon: '⌕', label: 'JOBS'     },
  { key: 'resume',   icon: '⊡', label: 'RESUME'   },
  { key: 'coach',    icon: '◈', label: 'COACH'    },
  { key: 'bizplan',  icon: '◉', label: 'BIZ PLAN' },
];

// ═════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═════════════════════════════════════════════════════════════════════════════
export default function CareerSuiteScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <Header onBack={() => router.back()} />

      {/* Tab Bar */}
      <TabBar activeTab={activeTab} onSelect={setActiveTab} />

      {/* Tab Content */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'jobs'     && <JobsTab />}
        {activeTab === 'resume'   && <ResumeTab />}
        {activeTab === 'coach'    && <CoachTab />}
        {activeTab === 'bizplan'  && <BizPlanTab />}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// HEADER
// ═════════════════════════════════════════════════════════════════════════════
function Header({ onBack }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
        <Text style={styles.backIcon}>‹</Text>
      </TouchableOpacity>

      <View style={styles.headerCenter}>
        <Image
          source={require('../../../assets/logo-80.png')}
          style={styles.headerLogo}
        />
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Career & Biz HQ</Text>
          <Text style={styles.headerSub}>SAINTSALLABS · CAREER INTELLIGENCE</Text>
        </View>
      </View>

      <View style={styles.headerRight} />
    </View>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB BAR
// ═════════════════════════════════════════════════════════════════════════════
function TabBar({ activeTab, onSelect }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.tabBarScroll}
      contentContainerStyle={styles.tabBarContent}
    >
      {TABS.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabPill, isActive && styles.tabPillActive]}
            onPress={() => onSelect(tab.key)}
            activeOpacity={0.75}
          >
            <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>
              {tab.icon}
            </Text>
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB 1 — OVERVIEW
// ═════════════════════════════════════════════════════════════════════════════
function OverviewTab() {
  const router = useRouter();
  const [trackedJobs, setTrackedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch('/api/career/tracker/all');
        setTrackedJobs(Array.isArray(data) ? data : data.jobs || []);
      } catch {
        // silently handle — show zeros
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const interviews = trackedJobs.filter(
    (j) => j.status === 'interview' || j.status === 'interviewing',
  ).length;
  const applied = trackedJobs.filter(
    (j) => j.status === 'applied' || j.status === 'sent',
  ).length;

  const stats = [
    { label: 'Tracked', value: trackedJobs.length, color: GOLD  },
    { label: 'Interviews', value: interviews,       color: GREEN },
    { label: 'Applied',  value: applied,            color: TEXT  },
  ];

  const quickActions = [
    { label: 'Search Jobs',         icon: '⌕', color: GOLD,  onPress: () => {} },
    { label: 'Enhance Resume',      icon: '⊡', color: GREEN, onPress: () => {} },
    { label: 'Interview Prep',      icon: '◈', color: '#A78BFA', onPress: () => {} },
    { label: 'Business Card',       icon: '▣', color: '#38BDF8', onPress: () => {} },
  ];

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Stats Row */}
      <Text style={styles.sectionTitle}>Dashboard</Text>
      <View style={styles.statsRow}>
        {loading
          ? <ActivityIndicator color={GOLD} size="small" style={styles.centeredLoader} />
          : stats.map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))
        }
      </View>

      {/* Quick Actions */}
      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        {quickActions.map((a) => (
          <TouchableOpacity
            key={a.label}
            style={styles.quickActionCard}
            onPress={a.onPress}
            activeOpacity={0.75}
          >
            <Text style={[styles.quickActionIcon, { color: a.color }]}>{a.icon}</Text>
            <Text style={styles.quickActionLabel}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Tracked Jobs */}
      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Recent Tracked Jobs</Text>
      {loading ? (
        <ActivityIndicator color={GOLD} size="small" style={styles.centeredLoader} />
      ) : trackedJobs.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No tracked jobs yet. Start searching!</Text>
        </View>
      ) : (
        trackedJobs.slice(0, 5).map((job, i) => (
          <TrackedJobRow key={job.id || i} job={job} />
        ))
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB 2 — JOBS
// ═════════════════════════════════════════════════════════════════════════════
function JobsTab() {
  const [query, setQuery]         = useState('');
  const [location, setLocation]   = useState('');
  const [results, setResults]     = useState([]);
  const [tracked, setTracked]     = useState([]);
  const [searching, setSearching] = useState(false);
  const [loadingTracked, setLoadingTracked] = useState(true);
  const [trackingId, setTrackingId] = useState(null);

  useEffect(() => {
    loadTracked();
  }, []);

  const loadTracked = async () => {
    setLoadingTracked(true);
    try {
      const data = await apiFetch('/api/career/tracker/all');
      setTracked(Array.isArray(data) ? data : data.jobs || []);
    } catch {
      //
    } finally {
      setLoadingTracked(false);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      Alert.alert('Enter a search query');
      return;
    }
    setSearching(true);
    setResults([]);
    try {
      const params = new URLSearchParams({ q: query, location });
      const data = await apiFetch(`/api/career/jobs/search?${params}`);
      setResults(Array.isArray(data) ? data : data.results || []);
    } catch (e) {
      Alert.alert('Search Failed', e.message);
    } finally {
      setSearching(false);
    }
  };

  const handleTrack = async (job) => {
    const uid = job.id || job.url || job.title;
    setTrackingId(uid);
    try {
      await apiFetch('/api/career/tracker/add', {
        method: 'POST',
        body: JSON.stringify({
          title:   job.title   || '',
          company: job.company || '',
          url:     job.url     || '',
          status:  'applied',
        }),
      });
      Alert.alert('Tracked!', `${job.title} added to your tracker.`);
      loadTracked();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setTrackingId(null);
    }
  };

  const renderJobResult = ({ item, index }) => (
    <View style={styles.jobCard}>
      <View style={styles.jobCardTop}>
        <View style={styles.flex}>
          <Text style={styles.jobTitle} numberOfLines={2}>{item.title || 'Untitled'}</Text>
          <Text style={styles.jobCompany}>{item.company || '—'}</Text>
          <View style={styles.jobMeta}>
            {!!item.location && (
              <Text style={styles.jobMetaTag}>📍 {item.location}</Text>
            )}
            {!!item.salary && (
              <Text style={[styles.jobMetaTag, { color: GREEN }]}>💰 {item.salary}</Text>
            )}
            {!!item.posted && (
              <Text style={styles.jobMetaTag}>🕐 {item.posted}</Text>
            )}
          </View>
        </View>
        <TouchableOpacity
          style={styles.trackBtn}
          onPress={() => handleTrack(item)}
          activeOpacity={0.75}
          disabled={trackingId === (item.id || item.url || item.title)}
        >
          {trackingId === (item.id || item.url || item.title)
            ? <ActivityIndicator color={BG} size="small" />
            : <Text style={styles.trackBtnText}>Track</Text>
          }
        </TouchableOpacity>
      </View>
      {!!item.url && (
        <TouchableOpacity onPress={() => Linking.openURL(item.url)} activeOpacity={0.7}>
          <Text style={styles.jobLink} numberOfLines={1}>View Posting ↗</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      {/* Search Bar */}
      <Text style={styles.sectionTitle}>Job Search</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, styles.flex]}
          placeholder="Job title, keywords..."
          placeholderTextColor={MUTED}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
      </View>
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, styles.flex]}
          placeholder="Location (optional)"
          placeholderTextColor={MUTED}
          value={location}
          onChangeText={setLocation}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
      </View>
      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={handleSearch}
        activeOpacity={0.8}
        disabled={searching}
      >
        {searching
          ? <ActivityIndicator color={BG} size="small" />
          : <Text style={styles.primaryBtnText}>Search Jobs</Text>
        }
      </TouchableOpacity>

      {/* Results */}
      {results.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
            Results ({results.length})
          </Text>
          <FlatList
            data={results}
            keyExtractor={(item, i) => item.id || item.url || String(i)}
            renderItem={renderJobResult}
            scrollEnabled={false}
          />
        </>
      )}

      {/* Tracked Jobs */}
      <Text style={[styles.sectionTitle, { marginTop: 28 }]}>Tracked Jobs</Text>
      {loadingTracked ? (
        <ActivityIndicator color={GOLD} size="small" style={styles.centeredLoader} />
      ) : tracked.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No tracked jobs. Search and track to get started.</Text>
        </View>
      ) : (
        tracked.map((job, i) => <TrackedJobRow key={job.id || i} job={job} />)
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB 3 — RESUME
// ═════════════════════════════════════════════════════════════════════════════
function ResumeTab() {
  const [targetRole, setTargetRole]     = useState('');
  const [resumeText, setResumeText]     = useState('');
  const [enhanced, setEnhanced]         = useState('');
  const [loading, setLoading]           = useState(false);
  const [copied, setCopied]             = useState(false);

  const handleEnhance = async () => {
    if (!resumeText.trim()) {
      Alert.alert('Paste your resume text first');
      return;
    }
    setLoading(true);
    setEnhanced('');
    try {
      const data = await apiFetch('/api/career/resume/ai-enhance', {
        method: 'POST',
        body: JSON.stringify({
          resume_text: resumeText,
          target_role: targetRole,
        }),
      });
      setEnhanced(
        data.enhanced_resume ||
        data.result          ||
        data.text            ||
        JSON.stringify(data, null, 2),
      );
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      // Clipboard is available via expo-clipboard if installed; fallback gracefully
      const Clipboard = require('expo-clipboard');
      await Clipboard.setStringAsync(enhanced);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      Alert.alert('Copy', enhanced.slice(0, 300) + '...');
    }
  };

  return (
    <ScrollView
      style={styles.tabContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.sectionTitle}>AI Resume Enhancer</Text>

      {/* Target Role */}
      <Text style={styles.inputLabel}>Target Role</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Senior Product Manager"
        placeholderTextColor={MUTED}
        value={targetRole}
        onChangeText={setTargetRole}
      />

      {/* Resume Input */}
      <Text style={[styles.inputLabel, { marginTop: 16 }]}>Paste Your Resume</Text>
      <TextInput
        style={[styles.input, styles.resumeInput]}
        placeholder="Paste your resume text here..."
        placeholderTextColor={MUTED}
        value={resumeText}
        onChangeText={setResumeText}
        multiline
        textAlignVertical="top"
      />

      {/* Enhance Button */}
      <TouchableOpacity
        style={[styles.primaryBtn, { marginTop: 16 }]}
        onPress={handleEnhance}
        activeOpacity={0.8}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color={BG} size="small" />
          : <Text style={styles.primaryBtnText}>✦ Enhance with AI</Text>
        }
      </TouchableOpacity>

      {/* Enhanced Result */}
      {!!enhanced && (
        <View style={[styles.card, { marginTop: 24 }]}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultHeaderText}>Enhanced Resume</Text>
            <TouchableOpacity
              style={styles.copyBtn}
              onPress={handleCopy}
              activeOpacity={0.8}
            >
              <Text style={styles.copyBtnText}>{copied ? '✓ Copied' : 'Copy'}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.resultScroll} nestedScrollEnabled>
            <Text style={styles.resultText}>{enhanced}</Text>
          </ScrollView>
        </View>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB 4 — COACH
// ═════════════════════════════════════════════════════════════════════════════
function CoachTab() {
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [company, setCompany]     = useState('');
  const [role, setRole]           = useState('');
  const scrollRef = useRef(null);

  const QUICK_CHIPS = [
    { label: 'Interview prep',        action: 'interview_prep' },
    { label: 'Salary negotiation',    action: 'chat', msg: 'Give me expert tips on salary negotiation for a tech role.' },
    { label: 'Career pivot advice',   action: 'chat', msg: 'How do I successfully pivot my career into a new industry?' },
  ];

  const appendMessage = (role, text) => {
    setMessages((prev) => [...prev, { role, text, id: Date.now() + Math.random() }]);
  };

  const sendMessage = useCallback(async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg) return;
    setInput('');
    appendMessage('user', userMsg);
    setLoading(true);
    try {
      const history = messages.map((m) => ({ role: m.role, content: m.text }));
      const data = await apiFetch('/api/career/coach/chat', {
        method: 'POST',
        body: JSON.stringify({ message: userMsg, history }),
      });
      appendMessage(
        'assistant',
        data.reply || data.response || data.message || data.text || JSON.stringify(data),
      );
    } catch (e) {
      appendMessage('assistant', `Error: ${e.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
    }
  }, [input, messages]);

  const handleInterviewPrep = async () => {
    if (!company.trim() && !role.trim()) {
      Alert.alert('Enter a company and/or role for tailored prep');
      return;
    }
    setLoading(true);
    try {
      const data = await apiFetch('/api/career/coach/interview-prep', {
        method: 'POST',
        body: JSON.stringify({ company, role }),
      });
      const reply = data.prep || data.response || data.text || JSON.stringify(data);
      appendMessage('user', `Interview prep for ${role || 'this role'} at ${company || 'this company'}`);
      appendMessage('assistant', reply);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
    }
  };

  const handleChip = (chip) => {
    if (chip.action === 'interview_prep') {
      handleInterviewPrep();
    } else {
      sendMessage(chip.msg);
    }
  };

  return (
    <View style={styles.flex}>
      {/* Interview Prep Inputs */}
      <View style={styles.coachPrepRow}>
        <TextInput
          style={[styles.input, styles.flex, { marginRight: 8 }]}
          placeholder="Company"
          placeholderTextColor={MUTED}
          value={company}
          onChangeText={setCompany}
        />
        <TextInput
          style={[styles.input, styles.flex]}
          placeholder="Role"
          placeholderTextColor={MUTED}
          value={role}
          onChangeText={setRole}
        />
      </View>

      {/* Quick Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
        contentContainerStyle={styles.chipContent}
      >
        {QUICK_CHIPS.map((chip) => (
          <TouchableOpacity
            key={chip.label}
            style={styles.chip}
            onPress={() => handleChip(chip)}
            activeOpacity={0.75}
          >
            <Text style={styles.chipText}>{chip.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.messagesScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.length === 0 && (
          <View style={styles.emptyChat}>
            <Text style={styles.emptyChatIcon}>◈</Text>
            <Text style={styles.emptyChatText}>Your AI Career Coach is ready.</Text>
            <Text style={styles.emptyChatSub}>Ask anything or use the quick chips above.</Text>
          </View>
        )}
        {messages.map((m) => (
          <View
            key={m.id}
            style={[
              styles.bubble,
              m.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant,
            ]}
          >
            {m.role === 'assistant' && (
              <Text style={styles.bubbleLabel}>COACH</Text>
            )}
            <Text style={[
              styles.bubbleText,
              m.role === 'user' && styles.bubbleTextUser,
            ]}>
              {m.text}
            </Text>
          </View>
        ))}
        {loading && (
          <View style={[styles.bubble, styles.bubbleAssistant]}>
            <Text style={styles.bubbleLabel}>COACH</Text>
            <ActivityIndicator color={GOLD} size="small" />
          </View>
        )}
      </ScrollView>

      {/* Input Bar */}
      <View style={styles.chatInputBar}>
        <TextInput
          style={[styles.chatInput, styles.flex]}
          placeholder="Ask your coach..."
          placeholderTextColor={MUTED}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={1000}
          returnKeyType="send"
          onSubmitEditing={() => sendMessage()}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
          onPress={() => sendMessage()}
          activeOpacity={0.8}
          disabled={loading || !input.trim()}
        >
          <Text style={styles.sendBtnText}>↑</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB 5 — BIZ PLAN
// ═════════════════════════════════════════════════════════════════════════════
function BizPlanTab() {
  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Business Planning Suite</Text>

      <BizPlanCard
        title="SWOT Analysis"
        icon="⊞"
        placeholder="Describe your business idea..."
        buildPrompt={(input) => `Generate a comprehensive SWOT analysis for: ${input}`}
      />

      <BizPlanCard
        title="Business Plan Outline"
        icon="◉"
        placeholder="Describe your business concept..."
        buildPrompt={(input) => `Create a detailed business plan outline for the following business: ${input}. Include executive summary, market analysis, products/services, marketing strategy, operations, and financial projections.`}
      />

      <BizPlanCard
        title="Market Research"
        icon="⌕"
        placeholder="What market or industry to research?"
        buildPrompt={(input) => `Conduct thorough market research for: ${input}. Include market size, target demographics, key competitors, trends, opportunities, and entry strategies.`}
      />

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function BizPlanCard({ title, icon, placeholder, buildPrompt }) {
  const [input, setInput]       = useState('');
  const [result, setResult]     = useState('');
  const [loading, setLoading]   = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleGenerate = async () => {
    if (!input.trim()) {
      Alert.alert('Enter a description first');
      return;
    }
    setLoading(true);
    setResult('');
    setExpanded(false);
    try {
      const res = await mcpChat({
        message:  buildPrompt(input),
        model:    'pro',
        vertical: 'general',
      });
      const text =
        typeof res === 'string'
          ? res
          : res.reply || res.response || res.message || res.text || JSON.stringify(res, null, 2);
      setResult(text);
      setExpanded(true);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.card, { marginBottom: 16 }]}>
      {/* Card Header */}
      <View style={styles.bizCardHeader}>
        <Text style={styles.bizCardIcon}>{icon}</Text>
        <Text style={styles.bizCardTitle}>{title}</Text>
      </View>

      {/* Input */}
      <TextInput
        style={[styles.input, { marginTop: 12 }]}
        placeholder={placeholder}
        placeholderTextColor={MUTED}
        value={input}
        onChangeText={setInput}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

      {/* Generate Button */}
      <TouchableOpacity
        style={[styles.primaryBtn, { marginTop: 12 }]}
        onPress={handleGenerate}
        activeOpacity={0.8}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color={BG} size="small" />
          : <Text style={styles.primaryBtnText}>Generate</Text>
        }
      </TouchableOpacity>

      {/* Result */}
      {!!result && (
        <>
          <TouchableOpacity
            style={styles.expandToggle}
            onPress={() => setExpanded((e) => !e)}
            activeOpacity={0.8}
          >
            <Text style={styles.expandToggleText}>
              {expanded ? '▲ Collapse' : '▼ Show Result'}
            </Text>
          </TouchableOpacity>
          {expanded && (
            <ScrollView
              style={styles.resultScroll}
              nestedScrollEnabled
            >
              <Text style={styles.resultText}>{result}</Text>
            </ScrollView>
          )}
        </>
      )}
    </View>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// SHARED SUBCOMPONENTS
// ═════════════════════════════════════════════════════════════════════════════
function TrackedJobRow({ job }) {
  const statusColors = {
    applied:     GOLD,
    interview:   GREEN,
    interviewing: GREEN,
    offer:       '#A78BFA',
    rejected:    '#EF4444',
    saved:       MUTED,
  };
  const statusColor = statusColors[job.status] || MUTED;

  return (
    <View style={styles.trackedRow}>
      <View style={styles.flex}>
        <Text style={styles.trackedTitle} numberOfLines={1}>{job.title || 'Untitled'}</Text>
        <Text style={styles.trackedCompany}>{job.company || '—'}</Text>
      </View>
      <View style={[styles.statusBadge, { borderColor: statusColor }]}>
        <Text style={[styles.statusBadgeText, { color: statusColor }]}>
          {(job.status || 'saved').toUpperCase()}
        </Text>
      </View>
    </View>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// STYLES
// ═════════════════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  // ─── Layout ────────────────────────────────────────────────────────────────
  root: {
    flex:            1,
    backgroundColor: BG,
  },
  flex: {
    flex: 1,
  },

  // ─── Header ────────────────────────────────────────────────────────────────
  header: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    backgroundColor: CARD,
  },
  backBtn: {
    width:           36,
    height:          36,
    alignItems:      'center',
    justifyContent:  'center',
  },
  backIcon: {
    color:    TEXT,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '300',
  },
  headerCenter: {
    flex:           1,
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            10,
  },
  headerLogo: {
    width:        24,
    height:       24,
    borderRadius: 12,
  },
  headerText: {
    alignItems: 'flex-start',
  },
  headerTitle: {
    color:      TEXT,
    fontSize:   16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  headerSub: {
    color:     GOLD,
    fontSize:  9,
    fontWeight: '600',
    letterSpacing: 1.2,
    marginTop: 1,
  },
  headerRight: {
    width: 36,
  },

  // ─── Tab Bar ───────────────────────────────────────────────────────────────
  tabBarScroll: {
    maxHeight:       52,
    backgroundColor: CARD,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  tabBarContent: {
    paddingHorizontal: 12,
    paddingVertical:   8,
    gap:               8,
    alignItems:        'center',
  },
  tabPill: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius:    20,
    borderWidth:     1,
    borderColor:     BORDER,
    backgroundColor: 'transparent',
    gap:             6,
    marginRight:     4,
  },
  tabPillActive: {
    backgroundColor: GOLD,
    borderColor:     GOLD,
  },
  tabIcon: {
    color:    MUTED,
    fontSize: 14,
  },
  tabIconActive: {
    color: BG,
  },
  tabLabel: {
    color:       MUTED,
    fontSize:    11,
    fontWeight:  '600',
    letterSpacing: 0.8,
  },
  tabLabelActive: {
    color: BG,
  },

  // ─── Tab Content ───────────────────────────────────────────────────────────
  tabContent: {
    flex:            1,
    paddingHorizontal: 16,
    paddingTop:      20,
  },

  // ─── Section Titles ────────────────────────────────────────────────────────
  sectionTitle: {
    color:         GOLD,
    fontSize:      11,
    fontWeight:    '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom:  12,
  },

  // ─── Stats Row ─────────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    gap:           12,
  },
  statCard: {
    flex:            1,
    backgroundColor: CARD,
    borderRadius:    14,
    borderWidth:     1,
    borderColor:     BORDER,
    padding:         16,
    alignItems:      'center',
  },
  statValue: {
    fontSize:   28,
    fontWeight: '800',
    lineHeight: 34,
  },
  statLabel: {
    color:       MUTED,
    fontSize:    11,
    fontWeight:  '500',
    marginTop:   4,
    letterSpacing: 0.5,
  },

  // ─── Quick Actions ─────────────────────────────────────────────────────────
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           12,
  },
  quickActionCard: {
    width:           '47%',
    backgroundColor: CARD,
    borderRadius:    14,
    borderWidth:     1,
    borderColor:     BORDER,
    padding:         16,
    alignItems:      'flex-start',
    gap:             8,
  },
  quickActionIcon: {
    fontSize:   22,
    lineHeight: 26,
  },
  quickActionLabel: {
    color:      TEXT,
    fontSize:   13,
    fontWeight: '600',
  },

  // ─── Empty States ──────────────────────────────────────────────────────────
  emptyCard: {
    backgroundColor: CARD,
    borderRadius:    14,
    borderWidth:     1,
    borderColor:     BORDER,
    padding:         24,
    alignItems:      'center',
  },
  emptyText: {
    color:      MUTED,
    fontSize:   13,
    textAlign:  'center',
    lineHeight: 20,
  },
  centeredLoader: {
    marginVertical: 24,
  },

  // ─── Tracked Job Row ───────────────────────────────────────────────────────
  trackedRow: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: CARD,
    borderRadius:    12,
    borderWidth:     1,
    borderColor:     BORDER,
    paddingHorizontal: 14,
    paddingVertical:  12,
    marginBottom:    8,
  },
  trackedTitle: {
    color:      TEXT,
    fontSize:   14,
    fontWeight: '600',
  },
  trackedCompany: {
    color:    MUTED,
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    borderWidth:     1,
    borderRadius:    8,
    paddingHorizontal: 8,
    paddingVertical:  4,
    marginLeft:      12,
  },
  statusBadgeText: {
    fontSize:      9,
    fontWeight:    '700',
    letterSpacing: 0.8,
  },

  // ─── Job Cards ─────────────────────────────────────────────────────────────
  jobCard: {
    backgroundColor: CARD,
    borderRadius:    14,
    borderWidth:     1,
    borderColor:     BORDER,
    padding:         16,
    marginBottom:    12,
  },
  jobCardTop: {
    flexDirection: 'row',
    alignItems:    'flex-start',
    gap:           12,
  },
  jobTitle: {
    color:      TEXT,
    fontSize:   15,
    fontWeight: '700',
    lineHeight: 20,
  },
  jobCompany: {
    color:      GOLD,
    fontSize:   13,
    fontWeight: '600',
    marginTop:  4,
  },
  jobMeta: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           6,
    marginTop:     8,
  },
  jobMetaTag: {
    color:     MUTED,
    fontSize:  12,
  },
  jobLink: {
    color:      GOLD,
    fontSize:   12,
    marginTop:  10,
    fontWeight: '600',
  },
  trackBtn: {
    backgroundColor: GOLD,
    borderRadius:    10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems:      'center',
    justifyContent:  'center',
    minWidth:        60,
  },
  trackBtnText: {
    color:      BG,
    fontSize:   13,
    fontWeight: '700',
  },

  // ─── Input Row ─────────────────────────────────────────────────────────────
  inputRow: {
    flexDirection: 'row',
    marginBottom:  10,
    gap:           8,
  },

  // ─── Generic Input ─────────────────────────────────────────────────────────
  input: {
    backgroundColor: CARD,
    borderRadius:    12,
    borderWidth:     1,
    borderColor:     BORDER,
    color:           TEXT,
    fontSize:        14,
    paddingHorizontal: 14,
    paddingVertical:  12,
    marginBottom:    2,
  },
  inputLabel: {
    color:         MUTED,
    fontSize:      11,
    fontWeight:    '600',
    letterSpacing: 0.8,
    marginBottom:  6,
  },
  resumeInput: {
    height:       200,
    paddingTop:   12,
  },

  // ─── Primary Button ────────────────────────────────────────────────────────
  primaryBtn: {
    backgroundColor: GOLD,
    borderRadius:    12,
    paddingVertical: 14,
    alignItems:      'center',
    justifyContent:  'center',
    minHeight:       48,
  },
  primaryBtnText: {
    color:      BG,
    fontSize:   15,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  // ─── Card ──────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: CARD,
    borderRadius:    14,
    borderWidth:     1,
    borderColor:     BORDER,
    padding:         16,
  },

  // ─── Result Area ───────────────────────────────────────────────────────────
  resultHeader: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   10,
  },
  resultHeaderText: {
    color:      GOLD,
    fontSize:   12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  copyBtn: {
    borderWidth:     1,
    borderColor:     GOLD,
    borderRadius:    8,
    paddingHorizontal: 12,
    paddingVertical:  6,
  },
  copyBtnText: {
    color:      GOLD,
    fontSize:   12,
    fontWeight: '600',
  },
  resultScroll: {
    maxHeight: 300,
  },
  resultText: {
    color:      TEXT,
    fontSize:   13,
    lineHeight: 20,
  },

  // ─── Coach Tab ─────────────────────────────────────────────────────────────
  coachPrepRow: {
    flexDirection:     'row',
    paddingHorizontal: 16,
    paddingTop:        12,
    gap:               8,
  },
  chipScroll: {
    maxHeight: 44,
    marginTop: 8,
  },
  chipContent: {
    paddingHorizontal: 16,
    gap:               8,
    alignItems:        'center',
  },
  chip: {
    borderWidth:       1,
    borderColor:       GOLD,
    borderRadius:      20,
    paddingHorizontal: 14,
    paddingVertical:   7,
    marginRight:       4,
  },
  chipText: {
    color:      GOLD,
    fontSize:   12,
    fontWeight: '600',
  },
  messagesScroll: {
    flex: 1,
    marginTop: 8,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical:   8,
  },
  emptyChat: {
    alignItems:   'center',
    marginTop:    60,
    paddingHorizontal: 32,
  },
  emptyChatIcon: {
    color:    GOLD,
    fontSize: 36,
    marginBottom: 12,
  },
  emptyChatText: {
    color:      TEXT,
    fontSize:   16,
    fontWeight: '600',
    textAlign:  'center',
  },
  emptyChatSub: {
    color:     MUTED,
    fontSize:  13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  bubble: {
    maxWidth:      '80%',
    borderRadius:  14,
    padding:       12,
    marginBottom:  10,
  },
  bubbleUser: {
    backgroundColor: GOLD,
    alignSelf:       'flex-end',
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: CARD,
    alignSelf:       'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth:     1,
    borderColor:     BORDER,
  },
  bubbleLabel: {
    color:         GOLD,
    fontSize:      9,
    fontWeight:    '700',
    letterSpacing: 1.2,
    marginBottom:  4,
  },
  bubbleText: {
    color:      TEXT,
    fontSize:   14,
    lineHeight: 20,
  },
  bubbleTextUser: {
    color: BG,
  },
  chatInputBar: {
    flexDirection:     'row',
    alignItems:        'flex-end',
    paddingHorizontal: 16,
    paddingVertical:   10,
    borderTopWidth:    1,
    borderTopColor:    BORDER,
    backgroundColor:   CARD,
    gap:               8,
  },
  chatInput: {
    backgroundColor: BG,
    borderRadius:    12,
    borderWidth:     1,
    borderColor:     BORDER,
    color:           TEXT,
    fontSize:        14,
    paddingHorizontal: 14,
    paddingVertical:  10,
    maxHeight:       100,
  },
  sendBtn: {
    backgroundColor: GOLD,
    width:           40,
    height:          40,
    borderRadius:    20,
    alignItems:      'center',
    justifyContent:  'center',
  },
  sendBtnDisabled: {
    backgroundColor: BORDER,
  },
  sendBtnText: {
    color:      BG,
    fontSize:   18,
    fontWeight: '700',
    lineHeight: 22,
  },

  // ─── Biz Plan Tab ──────────────────────────────────────────────────────────
  bizCardHeader: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           10,
  },
  bizCardIcon: {
    color:    GOLD,
    fontSize: 20,
  },
  bizCardTitle: {
    color:      TEXT,
    fontSize:   16,
    fontWeight: '700',
  },
  expandToggle: {
    marginTop:  12,
    alignItems: 'center',
  },
  expandToggleText: {
    color:      GOLD,
    fontSize:   12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
