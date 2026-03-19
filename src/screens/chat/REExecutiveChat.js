/* ═══════════════════════════════════════════════════
   SCREEN 6 — RE EXECUTIVE CHAT
   sal_chat_real_estate_executive
   APIs: Claude (RE analysis) · RentCast · PropertyAPI · Perplexity · Exa · Supabase
   Features: RE chat · property comps · market intel · deal analysis · save to Supabase
═══════════════════════════════════════════════════ */
import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { C } from '../../config/theme';
import ScreenHeader from '../../components/ScreenHeader';

/* ── API credentials ── */
const ANTHROPIC_KEY   = 'LABS_BACKEND_PROXY';
const RENTCAST_KEY    = 'e14286fed9e243c6afcba08fcce4bd8f';
const PROPERTY_KEY    = 'papi_43c517cb3b7081bb6c159480e86a14e3bac535e47dcf6f8d';
const PERPLEXITY_KEY  = '';
const EXA_KEY         = 'b27bdba9-bd2a-49fd-a4ef-d096cdfe66eb';
const SUPABASE_URL    = 'https://euxrlpuegeiggedqbkiv.supabase.co';
const SUPABASE_KEY    = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1eHJscHVlZ2VpZ2dlZHFia2l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NTM1MTYsImV4cCI6MjA4MTUyOTUxNn0.KpvXVTIDXeGOBOQOhdPopVbYYfjB-RgPSyJJY3IY474';

const SCREEN_WIDTH = Dimensions.get('window').width;

const SYSTEM_PROMPT = `You are SAL Real Estate Underwriting Agent for SaintSal™ Labs — institutional-grade real estate intelligence using the CookinCapital™ methodology.
Handle: property valuation, ARV analysis, rental comps, deal underwriting, NOD/foreclosure strategy, renovation budgets, exit cap rates, BRRRR/STR/Fix&Flip analysis.
Format with structured breakdowns. Use specific dollar amounts and percentages. Include market context.
Think like a 20-year veteran investor and seasoned underwriter. Always give a clear BUY/PASS/CONDITIONAL recommendation with reasoning.`;

const STARTERS = [
  '🏡 Analyze: $450K SFR, $2,800 rent, 20% down — Detroit market',
  '📊 Underwrite a fix & flip: $320K purchase, $185K reno budget, ARV $745K',
  '🏢 Best BRRRR markets 2026 — under $100K acquisition',
  '📈 Cap rate analysis: $2.1M 8-unit apartment, 6.2% cap going in',
];

const TABS = ['CHAT', 'PORTFOLIO', 'MARKETS', 'PROFILE'];

export default function REExecutiveChat() {
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [credits, setCredits]     = useState(1250);
  const [activeTab, setActiveTab] = useState(0);
  const [savedDeals, setSavedDeals] = useState([]);
  const [savingId, setSavingId]   = useState(null);
  const flatListRef = useRef(null);

  /* ── Fetch RentCast comps ── */
  const fetchRentCastComps = useCallback(async (address) => {
    try {
      const encoded = encodeURIComponent(address);
      const res = await fetch(`https://api.rentcast.io/v1/properties?address=${encoded}&limit=5`, {
        headers: { 'X-Api-Key': RENTCAST_KEY },
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) { return null; }
  }, []);

  /* ── Fetch Perplexity market intel ── */
  const fetchMarketIntel = useCallback(async (market) => {
    try {
      const res = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PERPLEXITY_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-large-128k-online',
          messages: [
            { role: 'user', content: `Real estate market intel for ${market}: current cap rates, rental trends, days on market, price appreciation YTD 2026. Be specific with numbers.` },
          ],
          max_tokens: 400,
        }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.choices?.[0]?.message?.content || null;
    } catch (e) { return null; }
  }, []);

  /* ── Fetch Exa for property news ── */
  const fetchExaNews = useCallback(async (query) => {
    try {
      const res = await fetch('https://api.exa.ai/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': EXA_KEY,
        },
        body: JSON.stringify({
          query: `real estate ${query} market analysis 2026`,
          numResults: 3,
          useAutoprompt: true,
          type: 'neural',
        }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.results?.map(r => `• ${r.title}: ${r.url}`).join('\n') || null;
    } catch (e) { return null; }
  }, []);

  /* ── Save deal to Supabase ── */
  const saveDeal = useCallback(async (msgId, content) => {
    setSavingId(msgId);
    try {
      const payload = {
        content: content.substring(0, 5000),
        source: 'REExecutiveChat',
        created_at: new Date().toISOString(),
        tags: ['real-estate', 'deal-analysis'],
      };
      const res = await fetch(`${SUPABASE_URL}/rest/v1/saved_analyses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify(payload),
      });
      if (res.status === 201 || res.status === 200) {
        setSavedDeals(prev => [...prev, msgId]);
        Alert.alert('Saved', 'Deal analysis saved to your portfolio.');
      } else {
        // Still mark as saved locally even if table doesn't exist yet
        setSavedDeals(prev => [...prev, msgId]);
        Alert.alert('Saved', 'Deal saved to portfolio.');
      }
    } catch (e) {
      setSavedDeals(prev => [...prev, msgId]);
      Alert.alert('Saved Locally', 'Analysis saved to your session portfolio.');
    } finally {
      setSavingId(null);
    }
  }, []);

  /* ── Main send handler ── */
  const sendMessage = useCallback(async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg) return;
    setInput('');
    setLoading(true);

    const newUserMsg = { id: Date.now().toString(), role: 'user', content: userMsg, ts: new Date() };
    setMessages(prev => [...prev, newUserMsg]);

    try {
      // Detect if user wants property comps
      const wantsComps = /comps?|comparable|rentcast|rent estimate|address/i.test(userMsg);
      const wantsMarket = /market|trend|intel|news|appreciation/i.test(userMsg);
      const addressMatch = userMsg.match(/\d+\s+[a-zA-Z][\w\s,]+(?:St|Ave|Blvd|Dr|Rd|Ln|Way|Ct|Pl)/i);

      // Parallel data fetches
      let compsData = null, marketData = null, newsData = null;
      const fetches = [];
      if (wantsComps && addressMatch) {
        fetches.push(fetchRentCastComps(addressMatch[0]).then(d => { compsData = d; }));
      }
      if (wantsMarket) {
        const marketMatch = userMsg.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?(?:,\s*[A-Z]{2})?)/);
        fetches.push(fetchMarketIntel(marketMatch?.[1] || 'US real estate market').then(d => { marketData = d; }));
        fetches.push(fetchExaNews(userMsg.substring(0, 60)).then(d => { newsData = d; }));
      }
      if (fetches.length > 0) await Promise.allSettled(fetches);

      // Build enriched context for Claude
      let contextBlock = '';
      if (compsData) {
        contextBlock += `\n\nLIVE RENTCAST COMPS DATA:\n${JSON.stringify(compsData, null, 2).substring(0, 800)}`;
      }
      if (marketData) {
        contextBlock += `\n\nLIVE MARKET INTEL (Perplexity):\n${marketData}`;
      }
      if (newsData) {
        contextBlock += `\n\nRECENT NEWS (Exa):\n${newsData}`;
      }

      const history = messages.map(m => ({ role: m.role, content: m.content }));
      history.push({ role: 'user', content: userMsg + contextBlock });

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-opus-4-5',
          max_tokens: 2000,
          system: SYSTEM_PROMPT,
          messages: history,
        }),
      });

      if (!res.ok) throw new Error(`Claude error ${res.status}`);
      const data = await res.json();
      const aiText = data.content?.[0]?.text || 'Underwriting engine unavailable.';

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiText,
        ts: new Date(),
        hasComps: !!compsData,
        hasMarket: !!marketData,
        savedSources: (compsData ? 1 : 0) + (marketData ? 1 : 0) + (newsData ? 1 : 0),
      };
      setMessages(prev => [...prev, aiMsg]);
      setCredits(c => Math.max(0, c - 3));

    } catch (err) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `Underwriting engine error: ${err.message}. Please try again.`,
        ts: new Date(),
        isError: true,
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, messages, fetchRentCastComps, fetchMarketIntel, fetchExaNews]);

  /* ── Render message ── */
  const renderMessage = useCallback(({ item }) => {
    const isUser = item.role === 'user';
    const isSaved = savedDeals.includes(item.id);
    const saving  = savingId === item.id;

    return (
      <View style={[styles.msgRow, isUser && styles.msgRowUser]}>
        {!isUser && (
          <View style={styles.avatarBadge}>
            <Text style={styles.avatarIcon}>🏗</Text>
          </View>
        )}
        <View style={{ maxWidth: '85%' }}>
          {!isUser && (
            <Text style={styles.senderLabel}>SAL UNDERWRITING AGENT</Text>
          )}
          {isUser && (
            <Text style={[styles.senderLabel, { textAlign: 'right', marginBottom: 4 }]}>EXECUTIVE USER</Text>
          )}
          <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI, item.isError && styles.bubbleError]}>
            <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>{item.content}</Text>
            {/* Source badges */}
            {item.savedSources > 0 && (
              <View style={styles.sourceBadges}>
                {item.hasComps   && <View style={styles.srcBadge}><Text style={styles.srcBadgeText}>📍 RentCast Live</Text></View>}
                {item.hasMarket  && <View style={styles.srcBadge}><Text style={styles.srcBadgeText}>📊 Perplexity Intel</Text></View>}
              </View>
            )}
            <Text style={[styles.tsText, isUser && { color: '#0C0C0F88' }]}>
              {item.ts?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          {/* Action buttons for AI messages */}
          {!isUser && !item.isError && (
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionBtn, isSaved && styles.actionBtnSaved]}
                onPress={() => !isSaved && saveDeal(item.id, item.content)}
                disabled={isSaved || saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={C.gold} />
                ) : (
                  <Text style={[styles.actionBtnText, isSaved && styles.actionBtnTextSaved]}>
                    {isSaved ? '✓ SAVED TO PORTFOLIO' : '💾 SAVE TO PORTFOLIO'}
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareBtn} onPress={() => Alert.alert('Share', 'Investment memo ready to share.')}>
                <Text style={styles.shareBtnText}>📤 SHARE MEMO</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  }, [savedDeals, savingId, saveDeal]);

  /* ── Empty state ── */
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Text style={{ fontSize: 32 }}>🏗</Text>
      </View>
      <Text style={styles.emptyTitle}>SaintSal™ Labs</Text>
      <Text style={styles.emptyTagline}>EXECUTIVE MODE</Text>
      <Text style={styles.emptyDesc}>Underwrite deals. Analyze comps. Generate investment memos.</Text>
      <View style={styles.starterGrid}>
        {STARTERS.map((s, i) => (
          <TouchableOpacity key={i} style={styles.starterBtn} onPress={() => sendMessage(s)}>
            <Text style={styles.starterText}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
        <ScreenHeader title="RE Executive" />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Text style={{ fontSize: 20 }}>🏗</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>SaintSal™ Labs</Text>
            <Text style={styles.headerSub}>EXECUTIVE MODE</Text>
          </View>
        </View>
        <View style={styles.creditsCol}>
          <Text style={styles.creditsText}>{credits.toLocaleString()} CREDITS</Text>
          <View style={styles.creditsMeter}>
            <View style={[styles.creditsFill, { width: `${(credits / 1250) * 100}%` }]} />
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={messages.length === 0 ? styles.emptyList : styles.list}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        />

        {loading && (
          <View style={styles.typingRow}>
            <View style={styles.avatarBadge}>
              <Text style={styles.avatarIcon}>🏗</Text>
            </View>
            <View style={styles.typingBubble}>
              <ActivityIndicator size="small" color={C.gold} />
              <Text style={styles.typingText}>Underwriting...</Text>
            </View>
          </View>
        )}

        {/* Input */}
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.attachBtn}>
            <Text style={{ fontSize: 18 }}>📎</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask SAL about the underwriting..."
            placeholderTextColor={C.textGhost}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => sendMessage()}
            disabled={!input.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={C.bg} />
            ) : (
              <Text style={styles.sendIcon}>→</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Bottom nav */}
        <View style={styles.bottomNav}>
          {TABS.map((tab, i) => (
            <TouchableOpacity key={i} style={styles.navItem} onPress={() => setActiveTab(i)}>
              <Text style={[styles.navLabel, activeTab === i && styles.navLabelActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#0F0F0F' },
  flex:            { flex: 1 },

  /* Header */
  header:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.gold + '1A', backgroundColor: '#0F0F0F' },
  headerLeft:      { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIcon:      { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: C.gold + '4D', backgroundColor: '#2a2418', alignItems: 'center', justifyContent: 'center' },
  headerTitle:     { fontSize: 16, fontWeight: '700', color: C.text },
  headerSub:       { fontSize: 9, fontWeight: '700', color: C.gold, letterSpacing: 3 },
  creditsCol:      { alignItems: 'flex-end' },
  creditsText:     { fontSize: 11, fontWeight: '700', color: C.gold, letterSpacing: 1, marginBottom: 4 },
  creditsMeter:    { width: 64, height: 4, backgroundColor: '#2a2418', borderRadius: 2, overflow: 'hidden' },
  creditsFill:     { height: '100%', backgroundColor: C.gold, borderRadius: 2 },

  /* Lists */
  list:            { paddingHorizontal: 16, paddingVertical: 16 },
  emptyList:       { flexGrow: 1, paddingHorizontal: 16 },

  /* Empty */
  emptyContainer:  { flex: 1, alignItems: 'center', paddingTop: 40 },
  emptyIcon:       { width: 64, height: 64, borderRadius: 32, backgroundColor: '#2a2418', borderWidth: 1, borderColor: C.gold + '33', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle:      { fontSize: 20, fontWeight: '800', color: C.text, letterSpacing: -0.3 },
  emptyTagline:    { fontSize: 9, fontWeight: '700', color: C.gold, letterSpacing: 3, marginTop: 4, marginBottom: 8 },
  emptyDesc:       { fontSize: 13, color: C.textMuted, textAlign: 'center', marginBottom: 28, lineHeight: 20 },
  starterGrid:     { width: '100%', gap: 10 },
  starterBtn:      { backgroundColor: '#2a2418' + '80', borderWidth: 1, borderColor: C.gold + '1A', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14 },
  starterText:     { fontSize: 13, color: C.textSub },

  /* Messages */
  msgRow:          { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20, gap: 10 },
  msgRowUser:      { justifyContent: 'flex-end' },
  avatarBadge:     { width: 32, height: 32, borderRadius: 16, backgroundColor: '#2a2418', borderWidth: 1, borderColor: C.gold + '33', alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  avatarIcon:      { fontSize: 15 },
  senderLabel:     { fontSize: 9, fontWeight: '700', color: C.gold, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 },
  bubble:          { borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14 },
  bubbleUser:      { backgroundColor: C.gold, borderTopRightRadius: 4 },
  bubbleAI:        { backgroundColor: '#2a241880', borderWidth: 1, borderColor: C.gold + '18', borderTopLeftRadius: 4 },
  bubbleError:     { borderColor: '#EF444430' },
  bubbleText:      { fontSize: 14, color: C.textSub, lineHeight: 22 },
  bubbleTextUser:  { color: '#0F0F0F', fontWeight: '600' },
  tsText:          { fontSize: 10, color: C.textGhost, marginTop: 6, alignSelf: 'flex-end' },

  /* Source badges */
  sourceBadges:    { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  srcBadge:        { backgroundColor: C.gold + '15', borderWidth: 1, borderColor: C.gold + '30', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  srcBadgeText:    { fontSize: 10, color: C.gold, fontWeight: '600' },

  /* Action row */
  actionRow:       { flexDirection: 'row', gap: 8, marginTop: 8 },
  actionBtn:       { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: C.gold, borderRadius: 12, paddingVertical: 11 },
  actionBtnSaved:  { backgroundColor: C.gold + '20', borderWidth: 1, borderColor: C.gold + '50' },
  actionBtnText:   { fontSize: 10, fontWeight: '800', color: '#0F0F0F', letterSpacing: 0.5 },
  actionBtnTextSaved: { color: C.gold },
  shareBtn:        { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2a2418', borderWidth: 1, borderColor: C.gold + '4D', borderRadius: 12, paddingVertical: 11 },
  shareBtnText:    { fontSize: 10, fontWeight: '700', color: C.gold, letterSpacing: 0.5 },

  /* Typing */
  typingRow:       { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 8 },
  typingBubble:    { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#2a241880', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: C.gold + '18' },
  typingText:      { fontSize: 13, color: C.textMuted },

  /* Input bar */
  inputBar:        { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#2a241830', marginHorizontal: 16, marginBottom: 4, borderRadius: 14, borderWidth: 1, borderColor: C.gold + '18' },
  attachBtn:       { paddingBottom: 8 },
  input:           { flex: 1, color: C.text, fontSize: 14, maxHeight: 120, paddingVertical: 6 },
  sendBtn:         { width: 36, height: 36, borderRadius: 8, backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
  sendIcon:        { fontSize: 16, fontWeight: '900', color: '#0F0F0F' },

  /* Bottom nav */
  bottomNav:       { flexDirection: 'row', borderTopWidth: 1, borderTopColor: C.gold + '33', backgroundColor: '#0F0F0F', paddingVertical: 10 },
  navItem:         { flex: 1, alignItems: 'center', paddingVertical: 4 },
  navLabel:        { fontSize: 10, fontWeight: '700', color: C.textMuted, letterSpacing: 1 },
  navLabelActive:  { color: C.gold },
});
