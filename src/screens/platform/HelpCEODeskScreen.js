/* ═══════════════════════════════════════════════════
   SCREEN 33 — ELITE HELP / CO-CEO DESK
   elite_help_co_ceo_desk → SAL as Co-CEO + support
   Wire: Claude claude-sonnet-4-6 streaming advisory
═══════════════════════════════════════════════════ */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Animated, Alert, Linking, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/AuthContext';
import { SAL_BACKEND } from '../../lib/api';

const GOLD = '#D4AF37';
const BG   = '#0F0F0F';
const CARD = '#161616';

const QUICK_ACTIONS = [
  { icon: '📊', label: 'Business Strategy Review' },
  { icon: '💰', label: 'Revenue Growth Plan' },
  { icon: '🚀', label: 'Product Launch Strategy' },
  { icon: '👥', label: 'Team Building Advice' },
  { icon: '🔍', label: 'Competitive Analysis' },
  { icon: '📈', label: 'Fundraising Strategy' },
];

const SUPPORT_TOPICS = [
  { icon: '🐛', label: 'Bug Report' },
  { icon: '💡', label: 'Feature Request' },
  { icon: '📚', label: 'Documentation' },
  { icon: '💳', label: 'Billing Help' },
  { icon: '🔌', label: 'API Issues' },
  { icon: '📞', label: 'Contact Support' },
];

export default function HelpCEODeskScreen() {
  const router = useRouter();
  const { user, canUseAI, deductCompute } = useAuth();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Welcome back${user?.email ? ', ' + user.email.split('@')[0] : ''}. I'm SAL — your Co-CEO and strategic advisor. I have full context on your business. What executive decision can I help with today?` }
  ]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [activeTab, setActiveTab] = useState('coceo');
  const xhrRef = useRef(null);
  const scrollRef = useRef(null);
  const startTime = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleSend = async (quickInput) => {
    const msg = quickInput || input.trim();
    if (!msg) return;
    if (!canUseAI) return Alert.alert('Upgrade', 'Compute limit reached.', [
      { text: 'Upgrade', onPress: () => router.push('/(stack)/stripe-pricing') },
      { text: 'Cancel', style: 'cancel' },
    ]);
    setInput('');
    const newMessages = [...messages, { role: 'user', content: msg }];
    setMessages(newMessages);
    setStreaming(true);
    startTime.current = Date.now();

    const aiMsg = { role: 'assistant', content: '' };
    setMessages(prev => [...prev, aiMsg]);

    // SAL Supreme — POST /api/sal/respond (Make.com orchestration brain)
    const conversationHistory = newMessages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
    const lastMsg = newMessages.filter(m => m.role === 'user').pop()?.content || '';

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;
    let processed = 0;
    xhr.open('POST', `${SAL_BACKEND}/api/sal/respond`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onprogress = () => {
      const newText = xhr.responseText.slice(processed);
      processed = xhr.responseText.length;
      for (const line of newText.split('\n')) {
        if (!line.startsWith('data: ')) {
          try {
            const d = JSON.parse(line.trim());
            if (d.success && d.content) {
              setMessages(prev => { const u = [...prev]; u[u.length - 1] = { role: 'assistant', content: d.content }; return u; });
              return;
            }
          } catch {}
          continue;
        }
        const raw = line.slice(6).trim();
        if (raw === '[DONE]') return;
        try {
          const d = JSON.parse(raw);
          const chunk = d.delta?.text || d.choices?.[0]?.delta?.content || d.content || '';
          if (chunk) setMessages(prev => { const u = [...prev]; u[u.length - 1] = { role: 'assistant', content: u[u.length - 1].content + chunk }; return u; });
        } catch {}
      }
    };
    xhr.onload = () => {
      try {
        const d = JSON.parse(xhr.responseText);
        if (d.success && d.content && processed === 0) {
          setMessages(prev => { const u = [...prev]; u[u.length - 1] = { role: 'assistant', content: d.content }; return u; });
        }
      } catch {}
      setStreaming(false);
      deductCompute?.(Math.ceil((Date.now() - startTime.current) / 1000));
    };
    xhr.onerror = () => { Alert.alert('Error', 'Connection failed.'); setStreaming(false); };
    xhr.ontimeout = () => { Alert.alert('Error', 'Request timed out.'); setStreaming(false); };
    xhr.timeout = 120000;
    xhr.send(JSON.stringify({ message: lastMsg, context: conversationHistory, mode: 'global', stream: true }));
  };

  const handleStop = () => { xhrRef.current?.abort(); setStreaming(false); };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backTxt}>‹</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>SAL Co-CEO Desk</Text>
          <View style={s.liveRow}>
            <Animated.View style={[s.liveDot, { opacity: pulseAnim }]} />
            <Text style={s.liveTxt}>YOUR EXECUTIVE AI PARTNER</Text>
          </View>
        </View>
        <View style={s.salAvatar}>
          <Text style={s.salAvatarTxt}>SAL</Text>
        </View>
      </View>

      {/* Tab Bar */}
      <View style={s.tabBar}>
        {['coceo', 'support', 'docs'].map(t => (
          <TouchableOpacity key={t} style={[s.tab, activeTab === t && s.tabActive]} onPress={() => setActiveTab(t)}>
            <Text style={[s.tabTxt, activeTab === t && { color: BG }]}>
              {t === 'coceo' ? 'CO-CEO' : t.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Co-CEO Tab */}
      {activeTab === 'coceo' && (
        <>
          <ScrollView
            ref={scrollRef}
            style={s.messagesScroll}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            <View style={{ padding: 14 }}>
              {/* Quick Actions — only shown at start */}
              {messages.length <= 1 && (
                <>
                  <Text style={s.sectionLabel}>QUICK ACTIONS</Text>
                  <View style={s.quickGrid}>
                    {QUICK_ACTIONS.map((a, i) => (
                      <TouchableOpacity key={i} style={s.quickChip} onPress={() => handleSend(a.label)}>
                        <Text style={s.quickIcon}>{a.icon}</Text>
                        <Text style={s.quickLabel}>{a.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {/* Messages */}
              {messages.map((msg, i) => (
                <View key={i} style={[s.msgWrap, msg.role === 'user' ? s.msgUser : s.msgAssistant]}>
                  {msg.role === 'assistant' && (
                    <View style={s.msgAvatar}>
                      <Image source={require('../../../assets/logo-80.png')} style={{ width: 20, height: 20, borderRadius: 10 }} resizeMode="contain" />
                    </View>
                  )}
                  <View style={[s.msgBubble, msg.role === 'user' ? s.userBubble : s.aiBubble]}>
                    <Text style={[s.msgText, msg.role === 'user' && { color: '#E8E6E1' }]}>{msg.content}</Text>
                    {i === messages.length - 1 && streaming && <Text style={s.cursor}>▋</Text>}
                  </View>
                </View>
              ))}
            </View>
            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Input */}
          <View style={s.inputWrap}>
            <TextInput
              style={s.inputField}
              value={input}
              onChangeText={setInput}
              placeholder="Ask your Co-CEO anything..."
              placeholderTextColor="#444"
              multiline
              maxLength={2000}
            />
            <TouchableOpacity
              style={[s.sendBtn, streaming && s.stopBtn]}
              onPress={streaming ? handleStop : () => handleSend()}
            >
              <Text style={s.sendBtnTxt}>{streaming ? '■' : '↑'}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Support Tab */}
      {activeTab === 'support' && (
        <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
          <View style={s.pad}>
            <Text style={s.sectionLabel}>GET HELP</Text>
            <View style={s.supportGrid}>
              {SUPPORT_TOPICS.map((t, i) => (
                <TouchableOpacity
                  key={i}
                  style={s.supportChip}
                  onPress={() => {
                    if (t.label === 'Contact Support') Linking.openURL('mailto:support@saintvision.com');
                    else if (t.label === 'Documentation') Linking.openURL('https://saintsallabs.com/docs');
                    else setActiveTab('coceo');
                  }}
                >
                  <Text style={s.supportIcon}>{t.icon}</Text>
                  <Text style={s.supportLabel}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[s.sectionLabel, { marginTop: 20 }]}>APP VERSION</Text>
            <View style={s.versionCard}>
              <Text style={s.versionAppName}>SaintSalLabs</Text>
              <Text style={s.versionNum}>v1.0.0 (Build 1)</Text>
              <Text style={s.versionPlatform}>iOS · Expo SDK 54</Text>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Docs Tab */}
      {activeTab === 'docs' && (
        <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
          <View style={s.pad}>
            <Text style={s.sectionLabel}>QUICK GUIDES</Text>
            {[
              { title: 'Getting Started', desc: 'Set up your account and first AI chat', icon: '🚀' },
              { title: 'SAL Chat Modes', desc: 'Creative, Finance, Real Estate, Global Intel', icon: '🤖' },
              { title: 'GHL Smart Bridge', desc: 'Connect and manage GoHighLevel CRM', icon: '📊' },
              { title: 'Builder Suite', desc: 'AI planning, IDE, and deployment', icon: '🛠️' },
              { title: 'Billing & Plans', desc: 'Tier limits, compute credits, upgrades', icon: '💳' },
              { title: 'API Access', desc: 'Direct API access and key management', icon: '🔌' },
            ].map((doc, i) => (
              <TouchableOpacity key={i} style={s.docCard}>
                <Text style={s.docIcon}>{doc.icon}</Text>
                <View style={s.docInfo}>
                  <Text style={s.docTitle}>{doc.title}</Text>
                  <Text style={s.docDesc}>{doc.desc}</Text>
                </View>
                <Text style={s.docArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: GOLD + '20' },
  backBtn: { padding: 6 },
  backTxt: { fontSize: 26, color: GOLD, fontWeight: '300' },
  headerCenter: { flex: 1, marginLeft: 8 },
  headerTitle: { fontSize: 15, fontWeight: '800', color: '#E8E6E1' },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: GOLD },
  liveTxt: { fontSize: 8, fontWeight: '700', color: GOLD + '80', letterSpacing: 1.5 },
  salAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center', shadowColor: GOLD, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 8 },
  salAvatarTxt: { fontSize: 11, fontWeight: '800', color: BG },
  tabBar: { flexDirection: 'row', paddingHorizontal: 14, gap: 8, paddingVertical: 10 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: GOLD + '30', alignItems: 'center', backgroundColor: CARD },
  tabActive: { backgroundColor: GOLD, borderColor: GOLD },
  tabTxt: { fontSize: 9, fontWeight: '800', color: GOLD, letterSpacing: 1 },
  messagesScroll: { flex: 1 },
  scroll: { flex: 1 },
  pad: { padding: 14 },
  sectionLabel: { fontSize: 9, fontWeight: '800', color: '#6B7280', letterSpacing: 2, marginBottom: 12 },
  quickGrid: { gap: 8, marginBottom: 20 },
  quickChip: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: CARD, borderWidth: 1, borderColor: GOLD + '20', borderRadius: 12, padding: 12 },
  quickIcon: { fontSize: 18 },
  quickLabel: { flex: 1, fontSize: 13, color: '#E8E6E1', fontWeight: '500' },
  msgWrap: { marginBottom: 14 },
  msgUser: { alignItems: 'flex-end' },
  msgAssistant: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  msgAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  msgAvatarTxt: { fontSize: 10, fontWeight: '800', color: BG },
  msgBubble: { maxWidth: '85%', borderRadius: 16, padding: 12 },
  userBubble: { backgroundColor: GOLD + '18', borderWidth: 1, borderColor: GOLD + '30', borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: CARD, borderWidth: 1, borderColor: GOLD + '15', borderBottomLeftRadius: 4 },
  msgText: { fontSize: 14, color: '#E8E6E1', lineHeight: 22 },
  cursor: { color: GOLD, fontSize: 16 },
  inputWrap: { flexDirection: 'row', gap: 10, padding: 14, borderTopWidth: 1, borderTopColor: GOLD + '20' },
  inputField: { flex: 1, backgroundColor: CARD, borderWidth: 1, borderColor: GOLD + '30', borderRadius: 12, padding: 12, color: '#E8E6E1', fontSize: 14, maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' },
  stopBtn: { backgroundColor: '#EF4444' },
  sendBtnTxt: { fontSize: 20, fontWeight: '700', color: BG },
  supportGrid: { gap: 10 },
  supportChip: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: CARD, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: GOLD + '18' },
  supportIcon: { fontSize: 22 },
  supportLabel: { fontSize: 14, fontWeight: '600', color: '#E8E6E1' },
  versionCard: { backgroundColor: CARD, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: GOLD + '18', alignItems: 'center', gap: 4 },
  versionAppName: { fontSize: 16, fontWeight: '800', color: GOLD },
  versionNum: { fontSize: 13, color: '#E8E6E1' },
  versionPlatform: { fontSize: 11, color: '#6B7280' },
  docCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: CARD, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: GOLD + '18', marginBottom: 10 },
  docIcon: { fontSize: 22 },
  docInfo: { flex: 1 },
  docTitle: { fontSize: 13, fontWeight: '700', color: '#E8E6E1', marginBottom: 3 },
  docDesc: { fontSize: 11, color: '#6B7280' },
  docArrow: { fontSize: 20, color: GOLD },
});
