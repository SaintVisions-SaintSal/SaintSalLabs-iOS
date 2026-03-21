/* ═══════════════════════════════════════════════════
   GHL INTEL HUB (Build #1)
   GoHighLevel CRM Intelligence Hub
   Contacts · Pipeline · Add Lead · AI Assistant
   All calls proxied through MCP Gateway
═══════════════════════════════════════════════════ */
import React, { useState, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { MCP_BASE, MCP_KEY, mcpChat } from '../../lib/api';

// ── Design Tokens ──────────────────────────────────
const BG     = '#0A0A0A';
const CARD   = '#141416';
const GOLD   = '#D4AF37';
const GREEN  = '#22C55E';
const TEXT   = '#E8E6E1';
const MUTED  = 'rgba(255,255,255,0.4)';
const BORDER = 'rgba(255,255,255,0.06)';

// ── Tab Config ─────────────────────────────────────
const TABS = ['Contacts', 'Pipeline', 'Add Lead', 'AI Assistant'];

// ── CRM API Utility ────────────────────────────────
async function crmPost(action, params = {}) {
  const res = await fetch(`${MCP_BASE}/api/mcp/crm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-sal-key': MCP_KEY,
    },
    body: JSON.stringify({ action, ...params }),
  });
  if (!res.ok) throw new Error(`CRM error ${res.status}`);
  return res.json();
}

// ── System prompt for AI Assistant ────────────────
const CRM_SYSTEM_PROMPT =
  'You are SAL CRM Intelligence — expert at GoHighLevel CRM management, lead scoring, pipeline optimization, and sales automation. Help manage contacts, analyze pipeline health, suggest follow-up strategies, and automate workflows.';

// ── Quick action chips ────────────────────────────
const QUICK_ACTIONS = [
  'Pipeline health check',
  'Top leads to follow up',
  'Workflow automation ideas',
];

// ─────────────────────────────────────────────────
export default function GHLIntelHub() {
  const router = useRouter();

  // Tab state
  const [activeTab, setActiveTab] = useState('Contacts');

  // ── Contacts state ─────────────────────────────
  const [contacts, setContacts]     = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsRefreshing, setContactsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // ── Pipeline state ─────────────────────────────
  const [pipeline, setPipeline]           = useState(null);
  const [pipelineLoading, setPipelineLoading] = useState(false);
  const [selectedStageIdx, setSelectedStageIdx] = useState(0);

  // ── Add Lead form state ─────────────────────────
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    tags: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // ── AI Assistant state ─────────────────────────
  const [messages, setMessages]     = useState([]);
  const [chatInput, setChatInput]   = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // ── Load contacts on mount and tab switch ──────
  const loadContacts = useCallback(async () => {
    setContactsLoading(true);
    try {
      const data = await crmPost('list_contacts');
      setContacts(data.contacts || data.data || []);
    } catch (e) {
      console.warn('[GHLIntelHub] contacts error:', e.message);
    } finally {
      setContactsLoading(false);
    }
  }, []);

  const onRefreshContacts = useCallback(async () => {
    setContactsRefreshing(true);
    await loadContacts();
    setContactsRefreshing(false);
  }, [loadContacts]);

  // ── Load pipeline on mount and tab switch ──────
  const loadPipeline = useCallback(async () => {
    setPipelineLoading(true);
    try {
      const data = await crmPost('get_pipeline');
      setPipeline(data.pipeline || data.data || data || null);
    } catch (e) {
      console.warn('[GHLIntelHub] pipeline error:', e.message);
    } finally {
      setPipelineLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'Contacts') loadContacts();
    if (activeTab === 'Pipeline') loadPipeline();
  }, [activeTab]);

  // ── Add Lead handler ───────────────────────────
  const handleAddLead = async () => {
    if (!form.firstName.trim()) {
      Alert.alert('Required', 'First name is required.');
      return;
    }
    if (!form.email.trim()) {
      Alert.alert('Required', 'Email address is required.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await crmPost('add_contact', {
        firstName: form.firstName.trim(),
        lastName:  form.lastName.trim(),
        email:     form.email.trim(),
        phone:     form.phone.trim(),
        tags:      ['sal-lead'],
      });
      const name = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();
      Alert.alert(
        'Lead Added',
        `${name} (${form.email.trim()}) has been added to GoHighLevel.`,
        [{ text: 'OK' }]
      );
      setForm({ firstName: '', lastName: '', email: '', phone: '', tags: '' });
    } catch (e) {
      Alert.alert('Error', 'Failed to add lead. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── AI Chat handler ────────────────────────────
  const sendMessage = useCallback(async (text) => {
    const userText = (text || chatInput).trim();
    if (!userText) return;
    setChatInput('');

    const userMsg = { role: 'user', content: userText, id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setChatLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const data = await mcpChat({
        message: `${CRM_SYSTEM_PROMPT}\n\nUser: ${userText}`,
        model: 'pro',
        vertical: 'general',
        history,
      });
      const aiMsg = {
        role: 'assistant',
        content: data.response || 'No response received.',
        id: Date.now() + 1,
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      const errMsg = {
        role: 'assistant',
        content: 'Connection error. Please try again.',
        id: Date.now() + 1,
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setChatLoading(false);
    }
  }, [chatInput, messages]);

  // ── Filtered contacts (client-side) ───────────
  const filteredContacts = contacts.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (c.firstName  || '').toLowerCase().includes(q) ||
      (c.lastName   || '').toLowerCase().includes(q) ||
      (c.email      || '').toLowerCase().includes(q) ||
      (c.phone      || '').toLowerCase().includes(q)
    );
  });

  // ── Stages & opportunities for selected stage ─
  const stages = pipeline?.stages || [];
  const selectedStage = stages[selectedStageIdx] || null;
  const stageOpportunities = selectedStage?.opportunities || [];

  // ── Render helpers ─────────────────────────────

  function renderContactItem({ item: c }) {
    const hasTag = c.tags && c.tags.length > 0;
    return (
      <TouchableOpacity
        style={[s.contactCard, hasTag && s.contactCardTagged]}
        activeOpacity={0.75}
      >
        {hasTag && <View style={s.goldAccentBar} />}
        <View style={s.contactAvatar}>
          <Text style={s.contactAvatarText}>
            {((c.firstName || c.email || '?')[0]).toUpperCase()}
          </Text>
        </View>
        <View style={s.contactInfo}>
          <Text style={s.contactName}>
            {[c.firstName, c.lastName].filter(Boolean).join(' ') || 'Unknown'}
          </Text>
          {!!c.email && <Text style={s.contactEmail}>{c.email}</Text>}
          {!!c.phone && <Text style={s.contactPhone}>{c.phone}</Text>}
          {hasTag && (
            <View style={s.tagsRow}>
              {c.tags.slice(0, 3).map((tag, i) => (
                <View key={i} style={s.tagChip}>
                  <Text style={s.tagText}>{tag}</Text>
                </View>
              ))}
              {c.tags.length > 3 && (
                <Text style={s.tagOverflow}>+{c.tags.length - 3}</Text>
              )}
            </View>
          )}
        </View>
        <Text style={s.chevron}>›</Text>
      </TouchableOpacity>
    );
  }

  function renderContactsTab() {
    return (
      <View style={{ flex: 1 }}>
        <TextInput
          style={s.searchInput}
          placeholder="Search contacts..."
          placeholderTextColor={MUTED}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {contactsLoading ? (
          <View style={s.centeredLoader}>
            <ActivityIndicator color={GOLD} size="large" />
            <Text style={s.loaderText}>Loading contacts from GHL...</Text>
          </View>
        ) : filteredContacts.length === 0 ? (
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>👥</Text>
            <Text style={s.emptyTitle}>No contacts found</Text>
            <Text style={s.emptySubtitle}>
              {searchQuery ? 'Try a different search term.' : 'Your GHL contacts will appear here.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredContacts}
            keyExtractor={(c, i) => c.id || String(i)}
            renderItem={renderContactItem}
            contentContainerStyle={{ paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
            onRefresh={onRefreshContacts}
            refreshing={contactsRefreshing}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          />
        )}
      </View>
    );
  }

  function renderPipelineTab() {
    if (pipelineLoading) {
      return (
        <View style={s.centeredLoader}>
          <ActivityIndicator color={GOLD} size="large" />
          <Text style={s.loaderText}>Loading pipeline from GHL...</Text>
        </View>
      );
    }
    if (!pipeline || stages.length === 0) {
      return (
        <View style={s.emptyState}>
          <Text style={s.emptyIcon}>📊</Text>
          <Text style={s.emptyTitle}>No pipeline data</Text>
          <Text style={s.emptySubtitle}>Your GHL pipeline stages will appear here.</Text>
        </View>
      );
    }
    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Pipeline name */}
        {!!pipeline.name && (
          <Text style={s.pipelineName}>{pipeline.name}</Text>
        )}

        {/* Stage selector — horizontal scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.stagesScroll}
          style={{ marginBottom: 16 }}
        >
          {stages.map((stage, idx) => {
            const isSelected = idx === selectedStageIdx;
            const count = (stage.opportunities || []).length;
            return (
              <TouchableOpacity
                key={stage.id || idx}
                style={[s.stageCard, isSelected && s.stageCardActive]}
                onPress={() => setSelectedStageIdx(idx)}
                activeOpacity={0.8}
              >
                <Text style={[s.stageName, isSelected && s.stageNameActive]}>
                  {stage.name || `Stage ${idx + 1}`}
                </Text>
                <View style={[s.stageBadge, isSelected && s.stageBadgeActive]}>
                  <Text style={[s.stageBadgeText, isSelected && s.stageBadgeTextActive]}>
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Opportunities in selected stage */}
        {selectedStage && (
          <View>
            <Text style={s.sectionLabel}>
              {selectedStage.name} · {stageOpportunities.length} opportunit{stageOpportunities.length === 1 ? 'y' : 'ies'}
            </Text>
            {stageOpportunities.length === 0 ? (
              <View style={s.emptyState}>
                <Text style={s.emptySubtitle}>No opportunities in this stage.</Text>
              </View>
            ) : (
              stageOpportunities.map((opp, i) => (
                <View key={opp.id || i} style={s.oppCard}>
                  <View style={s.oppHeader}>
                    <Text style={s.oppName}>{opp.name || opp.contactName || 'Opportunity'}</Text>
                    {!!opp.monetaryValue && (
                      <Text style={s.oppValue}>
                        ${Number(opp.monetaryValue).toLocaleString()}
                      </Text>
                    )}
                  </View>
                  {!!opp.status && (
                    <Text style={s.oppStatus}>{opp.status}</Text>
                  )}
                  {!!opp.assignedTo && (
                    <Text style={s.oppAssigned}>Assigned: {opp.assignedTo}</Text>
                  )}
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    );
  }

  function renderAddLeadTab() {
    const fields = [
      { key: 'firstName', label: 'First Name', required: true, keyboard: 'default', cap: 'words' },
      { key: 'lastName',  label: 'Last Name',  required: false, keyboard: 'default', cap: 'words' },
      { key: 'email',     label: 'Email',       required: true,  keyboard: 'email-address', cap: 'none' },
      { key: 'phone',     label: 'Phone',       required: false, keyboard: 'phone-pad', cap: 'none' },
      { key: 'tags',      label: 'Tags (comma-separated)', required: false, keyboard: 'default', cap: 'none' },
    ];
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 140 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={s.formHeading}>Add New Lead</Text>
          <Text style={s.formSubheading}>
            Lead will be tagged with <Text style={{ color: GOLD }}>sal-lead</Text> in GoHighLevel.
          </Text>

          {fields.map(field => (
            <View key={field.key} style={s.fieldWrap}>
              <Text style={s.fieldLabel}>
                {field.label}
                {field.required && <Text style={s.requiredStar}> *</Text>}
              </Text>
              <TextInput
                style={s.fieldInput}
                placeholder={field.label}
                placeholderTextColor={MUTED}
                value={form[field.key]}
                onChangeText={v => setForm(prev => ({ ...prev, [field.key]: v }))}
                keyboardType={field.keyboard}
                autoCapitalize={field.cap}
                autoCorrect={false}
              />
            </View>
          ))}

          <TouchableOpacity
            style={[s.addLeadBtn, submitting && s.addLeadBtnDisabled]}
            onPress={handleAddLead}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color={BG} size="small" />
            ) : (
              <Text style={s.addLeadBtnText}>Add to GHL</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  function renderAITab() {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={120}
      >
        {/* Quick action chips */}
        {messages.length === 0 && (
          <View style={s.aiIntro}>
            <Text style={s.aiIntroTitle}>SAL CRM Intelligence</Text>
            <Text style={s.aiIntroSubtitle}>
              Ask anything about your pipeline, leads, or CRM workflows.
            </Text>
            <View style={s.quickActionsRow}>
              {QUICK_ACTIONS.map((action, i) => (
                <TouchableOpacity
                  key={i}
                  style={s.quickChip}
                  onPress={() => sendMessage(action)}
                  activeOpacity={0.75}
                >
                  <Text style={s.quickChipText}>{action}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Chat history */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={s.chatScroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map(msg => (
            <View
              key={msg.id}
              style={[
                s.bubbleWrap,
                msg.role === 'user' ? s.bubbleWrapUser : s.bubbleWrapAI,
              ]}
            >
              {msg.role === 'assistant' && (
                <Image
                  source={require('../../../assets/logo-80.png')}
                  style={s.helmetAvatar}
                  resizeMode="contain"
                />
              )}
              <View
                style={[
                  s.bubble,
                  msg.role === 'user' ? s.bubbleUser : s.bubbleAI,
                ]}
              >
                <Text style={msg.role === 'user' ? s.bubbleUserText : s.bubbleAIText}>
                  {msg.content}
                </Text>
              </View>
            </View>
          ))}

          {chatLoading && (
            <View style={[s.bubbleWrap, s.bubbleWrapAI]}>
              <Image
                source={require('../../../assets/logo-80.png')}
                style={s.helmetAvatar}
                resizeMode="contain"
              />
              <View style={[s.bubble, s.bubbleAI, s.bubbleTyping]}>
                <ActivityIndicator color={GOLD} size="small" />
                <Text style={s.typingText}>Analyzing...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input row */}
        <View style={s.chatInputRow}>
          <TextInput
            style={s.chatInput}
            placeholder="Ask about your CRM..."
            placeholderTextColor={MUTED}
            value={chatInput}
            onChangeText={setChatInput}
            multiline
            returnKeyType="send"
            blurOnSubmit
            onSubmitEditing={() => sendMessage()}
          />
          <TouchableOpacity
            style={[s.sendBtn, (!chatInput.trim() || chatLoading) && s.sendBtnDisabled]}
            onPress={() => sendMessage()}
            disabled={!chatInput.trim() || chatLoading}
            activeOpacity={0.8}
          >
            <Text style={s.sendBtnText}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // ── Main render ────────────────────────────────
  return (
    <SafeAreaView style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={s.backBtnText}>‹</Text>
        </TouchableOpacity>

        <View style={s.headerCenter}>
          <View style={s.headerTitleRow}>
            <Image
              source={require('../../../assets/logo-80.png')}
              style={s.headerLogo}
              resizeMode="contain"
            />
            <Text style={s.headerTitle}>GHL Intel Hub</Text>
          </View>
          <Text style={s.headerSubtitle}>GOHIGHLEVEL · CRM · PIPELINE</Text>
        </View>

        <View style={s.liveBadge}>
          <View style={s.liveDot} />
          <Text style={s.liveText}>LIVE</Text>
        </View>
      </View>

      {/* Tab bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.tabBar}
        contentContainerStyle={s.tabBarContent}
      >
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[s.tabPill, activeTab === tab && s.tabPillActive]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.75}
          >
            <Text style={[s.tabPillText, activeTab === tab && s.tabPillTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tab content */}
      <View style={s.content}>
        {activeTab === 'Contacts'     && renderContactsTab()}
        {activeTab === 'Pipeline'     && renderPipelineTab()}
        {activeTab === 'Add Lead'     && renderAddLeadTab()}
        {activeTab === 'AI Assistant' && renderAITab()}
      </View>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────
const s = StyleSheet.create({
  // ── Root ───────────────────────────────────────
  root: {
    flex: 1,
    backgroundColor: BG,
  },

  // ── Header ─────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  backBtnText: {
    fontSize: 22,
    color: TEXT,
    lineHeight: 26,
    marginTop: -2,
  },
  headerCenter: {
    flex: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogo: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: TEXT,
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: MUTED,
    letterSpacing: 1.2,
    marginTop: 2,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34,197,94,0.12)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.25)',
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: GREEN,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: GREEN,
    letterSpacing: 1.5,
  },

  // ── Tab bar ────────────────────────────────────
  tabBar: {
    maxHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  tabBarContent: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabPillActive: {
    backgroundColor: 'rgba(212,175,55,0.12)',
    borderColor: GOLD,
  },
  tabPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: MUTED,
  },
  tabPillTextActive: {
    color: GOLD,
  },

  // ── Content wrapper ────────────────────────────
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // ── Shared ─────────────────────────────────────
  centeredLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  loaderText: {
    fontSize: 13,
    color: MUTED,
    marginTop: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: MUTED,
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: MUTED,
    letterSpacing: 0.8,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  chevron: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.18)',
    marginLeft: 8,
  },

  // ── Search ─────────────────────────────────────
  searchInput: {
    backgroundColor: CARD,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: TEXT,
    fontSize: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },

  // ── Contact cards ──────────────────────────────
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
  },
  contactCardTagged: {
    borderLeftColor: GOLD,
    borderLeftWidth: 3,
  },
  goldAccentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: GOLD,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  contactAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(212,175,55,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
  },
  contactAvatarText: {
    fontSize: 17,
    fontWeight: '800',
    color: GOLD,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 2,
  },
  contactEmail: {
    fontSize: 12,
    color: MUTED,
    marginBottom: 1,
  },
  contactPhone: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
  },
  tagChip: {
    backgroundColor: 'rgba(212,175,55,0.1)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
    color: GOLD,
    letterSpacing: 0.3,
  },
  tagOverflow: {
    fontSize: 10,
    color: MUTED,
    alignSelf: 'center',
    marginLeft: 2,
  },

  // ── Pipeline ───────────────────────────────────
  pipelineName: {
    fontSize: 18,
    fontWeight: '800',
    color: TEXT,
    marginBottom: 16,
  },
  stagesScroll: {
    paddingRight: 16,
    gap: 10,
    flexDirection: 'row',
  },
  stageCard: {
    backgroundColor: CARD,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
    minWidth: 110,
    borderWidth: 1,
    borderColor: BORDER,
  },
  stageCardActive: {
    backgroundColor: 'rgba(212,175,55,0.1)',
    borderColor: GOLD,
  },
  stageName: {
    fontSize: 13,
    fontWeight: '600',
    color: MUTED,
    marginBottom: 8,
    textAlign: 'center',
  },
  stageNameActive: {
    color: GOLD,
  },
  stageBadge: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    minWidth: 30,
    alignItems: 'center',
  },
  stageBadgeActive: {
    backgroundColor: GOLD,
  },
  stageBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: MUTED,
  },
  stageBadgeTextActive: {
    color: BG,
  },
  oppCard: {
    backgroundColor: CARD,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: BORDER,
  },
  oppHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  oppName: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT,
    flex: 1,
    marginRight: 8,
  },
  oppValue: {
    fontSize: 15,
    fontWeight: '800',
    color: GOLD,
  },
  oppStatus: {
    fontSize: 12,
    color: MUTED,
    marginBottom: 2,
  },
  oppAssigned: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.25)',
  },

  // ── Add Lead form ──────────────────────────────
  formHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: TEXT,
    marginBottom: 4,
  },
  formSubheading: {
    fontSize: 13,
    color: MUTED,
    marginBottom: 24,
    lineHeight: 20,
  },
  fieldWrap: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: MUTED,
    letterSpacing: 0.8,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  requiredStar: {
    color: '#EF4444',
  },
  fieldInput: {
    backgroundColor: CARD,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: TEXT,
    fontSize: 15,
    borderWidth: 1,
    borderColor: BORDER,
  },
  addLeadBtn: {
    backgroundColor: GOLD,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 8,
  },
  addLeadBtnDisabled: {
    opacity: 0.55,
  },
  addLeadBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: BG,
    letterSpacing: 0.5,
  },

  // ── AI Chat ────────────────────────────────────
  aiIntro: {
    paddingBottom: 20,
  },
  aiIntroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: TEXT,
    marginBottom: 6,
  },
  aiIntroSubtitle: {
    fontSize: 13,
    color: MUTED,
    lineHeight: 20,
    marginBottom: 16,
  },
  quickActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickChip: {
    backgroundColor: CARD,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
  },
  quickChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: GOLD,
  },
  chatScroll: {
    paddingBottom: 16,
    gap: 12,
  },
  bubbleWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  bubbleWrapUser: {
    justifyContent: 'flex-end',
    flexDirection: 'row-reverse',
  },
  bubbleWrapAI: {
    justifyContent: 'flex-start',
  },
  helmetAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(212,175,55,0.08)',
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: '80%',
  },
  bubbleUser: {
    backgroundColor: GOLD,
    borderBottomRightRadius: 4,
  },
  bubbleAI: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderBottomLeftRadius: 4,
  },
  bubbleUserText: {
    fontSize: 14,
    color: BG,
    lineHeight: 20,
    fontWeight: '600',
  },
  bubbleAIText: {
    fontSize: 14,
    color: TEXT,
    lineHeight: 22,
  },
  bubbleTyping: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  typingText: {
    fontSize: 13,
    color: MUTED,
    fontStyle: 'italic',
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 8 : 16,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  chatInput: {
    flex: 1,
    backgroundColor: CARD,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: TEXT,
    fontSize: 14,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: BORDER,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.35,
  },
  sendBtnText: {
    fontSize: 20,
    fontWeight: '800',
    color: BG,
    lineHeight: 24,
  },
});
