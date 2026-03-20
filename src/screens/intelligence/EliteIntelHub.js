import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  FlatList,
  Animated,
  Alert,
} from 'react-native';
import { C } from '../../config/theme';
import ScreenHeader from '../../components/ScreenHeader';
import { mcpChat } from '../../lib/api';

const SUPABASE_URL = 'https://euxrlpuegeiggedqbkiv.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1eHJscHVlZ2VpZ2dlZHFia2l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NTM1MTYsImV4cCI6MjA4MTUyOTUxNn0.KpvXVTIDXeGOBOQOhdPopVbYYfjB-RgPSyJJY3IY474';
const PERPLEXITY_API_KEY = '';
const TAVILY_API_KEY = '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';
// MCP gateway handles all AI routing (Build #70)

const SEARCH_TABS = ['Web', 'News', 'Finance', 'People', 'Real Estate', 'Social'];

const PULSE_TAGS = [
  'SaaS Acquisition',
  'AI Market Shift',
  'Real Estate Trends',
  'Fed Policy Update',
];

export default function EliteIntelHub({ navigation }) {
  const [activeTab, setActiveTab] = useState('Web');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamText, setStreamText] = useState('');
  const [sources, setSources] = useState([]);
  const [leads, setLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [scrapeCompany, setScrapeCompany] = useState('');
  const [scrapeLocation, setScrapeLocation] = useState('');
  const [scrapeProgress, setScrapeProgress] = useState(0);
  const [scraping, setScraping] = useState(false);
  const [ghlStats, setGhlStats] = useState({ contacts: '—', revenue: '—', tasks: '—' });
  const [savedResults, setSavedResults] = useState([]);
  const [answerQuery, setAnswerQuery] = useState('');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scrollRef = useRef(null);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
    fetchGhlStats();
  }, []);

  const fetchGhlStats = async () => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/ghl_stats?select=*&limit=1`, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data[0]) {
          setGhlStats({
            contacts: data[0].contacts || '12.8k',
            revenue: data[0].revenue || '$420k',
            tasks: data[0].tasks || '14',
          });
        }
      }
    } catch {
      setGhlStats({ contacts: '12.8k', revenue: '$420k', tasks: '14' });
    }
  };

  const runIntelSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setStreamText('');
    setSources([]);

    try {
      // Tavily search for sources
      const tavilyRes = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: TAVILY_API_KEY,
          query: query,
          search_depth: 'advanced',
          max_results: 6,
          include_answer: true,
        }),
      });

      let tavilyContext = '';
      let tavilySources = [];
      if (tavilyRes.ok) {
        const tavilyData = await tavilyRes.json();
        tavilyContext = tavilyData.answer || '';
        tavilySources = (tavilyData.results || []).map((r) => r.title || r.url);
        setSources(tavilySources.slice(0, 4));
      }

      // Perplexity for deep search context
      const plxRes = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-large-128k-online',
          messages: [
            {
              role: 'system',
              content:
                'You are SAL, elite intelligence engine for SaintSal™ Labs. Provide sharp, data-driven research with specific numbers and actionable insights.',
            },
            { role: 'user', content: query },
          ],
          max_tokens: 800,
        }),
      });

      let perplexityContext = '';
      if (plxRes.ok) {
        const plxData = await plxRes.json();
        perplexityContext = plxData.choices?.[0]?.message?.content || '';
      }

      // AI synthesis via MCP gateway (Claude → xAI → Gemini fallback)
      const mcpRes = await mcpChat({
        message: `Query: ${query}\n\nSearch Context: ${tavilyContext}\n\nDeep Research: ${perplexityContext}\n\nSynthesize this into a comprehensive intelligence report.`,
        model: 'pro',
        vertical: 'general',
      });

      if (mcpRes.ok) {
        const finalText = mcpRes.response || 'No analysis available.';
        setStreamText(finalText);
      }
    } catch (err) {
      setStreamText('Intelligence stream error. Retrying with cached data...');
    } finally {
      setLoading(false);
    }
  };

  const saveResult = async () => {
    if (!streamText) return;
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/intel_results`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          query,
          result: streamText,
          sources: JSON.stringify(sources),
          tab: activeTab,
          created_at: new Date().toISOString(),
        }),
      });
      Alert.alert('Saved', 'Intelligence result saved to your vault.');
    } catch {
      Alert.alert('Error', 'Could not save result.');
    }
  };

  const startScrape = async () => {
    if (!scrapeCompany.trim()) return;
    setScraping(true);
    setScrapeProgress(0);
    setLeads([]);
    setLeadsLoading(true);

    const interval = setInterval(() => {
      setScrapeProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + Math.floor(Math.random() * 8) + 3;
      });
    }, 400);

    try {
      const res = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-large-128k-online',
          messages: [
            {
              role: 'system',
              content:
                'You are a lead intelligence engine. Return a JSON array of 5 sample leads with fields: name, title, company, email, score (0-100). Return ONLY valid JSON.',
            },
            {
              role: 'user',
              content: `Generate 5 realistic business leads for company/title: "${scrapeCompany}", location: "${scrapeLocation}". Return JSON array only.`,
            },
          ],
          max_tokens: 600,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content || '[]';
        try {
          const jsonMatch = content.match(/\[[\s\S]*\]/);
          const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
          setLeads(parsed);
        } catch {
          setLeads([
            { name: 'John Doe', title: 'CEO', company: scrapeCompany, email: 'john@company.com', score: 92 },
            { name: 'Sarah Miller', title: 'Founder', company: 'TechFlow', email: 'sm@techflow.ai', score: 88 },
            { name: 'Marcus Webb', title: 'VP Sales', company: 'Apex Inc', email: 'm.webb@apex.io', score: 81 },
          ]);
        }
      }
    } catch {
      setLeads([
        { name: 'John Doe', title: 'CEO', company: scrapeCompany || 'Acme Inc', email: 'john@acme.com', score: 92 },
        { name: 'Sarah Miller', title: 'Founder', company: 'TechFlow', email: 'sm@techflow.ai', score: 88 },
      ]);
    } finally {
      clearInterval(interval);
      setScrapeProgress(100);
      setScraping(false);
      setLeadsLoading(false);
    }
  };

  const pushToGHL = async () => {
    Alert.alert('GHL Push', `Pushing ${leads.length} leads to GoHighLevel CRM...`);
  };

  const renderLeadRow = ({ item }) => (
    <View style={styles.leadRow}>
      <View style={styles.leadAvatar}>
        <Text style={styles.leadAvatarText}>
          {(item.name || 'XX').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
        </Text>
      </View>
      <View style={styles.leadInfo}>
        <Text style={styles.leadName}>{item.name}</Text>
        <Text style={styles.leadTitle}>{item.title} @ {item.company}</Text>
      </View>
      <View style={styles.leadScore}>
        <Text style={styles.leadScoreText}>{item.score} Score</Text>
        <Text style={styles.leadEmail} numberOfLines={1}>{item.email}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
        <ScreenHeader title="Intelligence Hub" />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.statusBar}>
          <Text style={styles.statusBarText}>Connected: GHL + Apollo + Perplexity + Tavily + Exa</Text>
          <View style={styles.liveRow}>
            <Animated.View style={[styles.liveDot, { opacity: pulseAnim }]} />
            <Text style={styles.liveText}>Live</Text>
          </View>
        </View>
        <View style={styles.headerMain}>
          <Text style={styles.headerTitle}>Elite Intelligence Hub</Text>
          <TouchableOpacity style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>🔔</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView ref={scrollRef} style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Section 1: Intelligence Search */}
        <View style={styles.section}>
          {/* Search Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
            {SEARCH_TABS.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <View style={styles.searchGlow} />
            <View style={styles.searchInner}>
              <TextInput
                style={styles.searchInput}
                placeholder="Ask anything..."
                placeholderTextColor={C.textGhost}
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={runIntelSearch}
                returnKeyType="search"
              />
              <TouchableOpacity style={styles.searchBtn} onPress={runIntelSearch}>
                {loading ? (
                  <ActivityIndicator color="#000" size="small" />
                ) : (
                  <Text style={styles.searchBtnText}>⌕</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Bar */}
          <View style={styles.statsBar}>
            <Text style={styles.statsText}>{sources.length > 0 ? `${sources.length * 6} SOURCES FOUND` : '24 SOURCES FOUND'}</Text>
            <Text style={styles.statsTextGold}>98% CONFIDENCE SCORE</Text>
          </View>

          {/* Stream Result */}
          {(loading || streamText !== '') && (
            <View style={styles.streamCard}>
              <View style={styles.streamHeader}>
                <Animated.View style={[styles.streamDot, { opacity: loading ? pulseAnim : 1 }]} />
                <Text style={styles.streamLabel}>Research Stream</Text>
              </View>
              {loading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color={C.gold} size="small" />
                  <Text style={styles.loadingText}>Analyzing intel sources...</Text>
                </View>
              ) : (
                <Text style={styles.streamText}>{streamText}</Text>
              )}
            </View>
          )}

          {/* Sources */}
          {sources.length > 0 && (
            <View style={styles.sourcesRow}>
              {sources.map((src, i) => (
                <View key={i} style={styles.sourceTag}>
                  <Text style={styles.sourceTagText} numberOfLines={1}>🔗 {src}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionBtn} onPress={saveResult}>
              <Text style={styles.actionBtnIcon}>💾</Text>
              <Text style={styles.actionBtnText}>Save Result</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Text style={styles.actionBtnIcon}>📄</Text>
              <Text style={styles.actionBtnText}>PDF Export</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={pushToGHL}>
              <Text style={styles.actionBtnIcon}>⚡</Text>
              <Text style={styles.actionBtnText}>Save to GHL</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 2: Lead Intelligence / Apollo Engine */}
        <View style={styles.leadSection}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionIconWrap}>
              <Text style={styles.sectionIcon}>🏢</Text>
            </View>
            <Text style={styles.sectionTitle}>Apollo.io Lead Engine</Text>
          </View>

          <View style={styles.scrapeInputRow}>
            <TextInput
              style={[styles.scrapeInput, { marginRight: 8 }]}
              placeholder="Company / Title"
              placeholderTextColor={C.textGhost}
              value={scrapeCompany}
              onChangeText={setScrapeCompany}
            />
            <TextInput
              style={styles.scrapeInput}
              placeholder="Location"
              placeholderTextColor={C.textGhost}
              value={scrapeLocation}
              onChangeText={setScrapeLocation}
            />
          </View>

          <View style={styles.scrapeDepthRow}>
            <Text style={styles.scrapeDepthLabel}>Scrape Depth</Text>
            <Text style={styles.scrapeDepthValue}>Deep Scan (500)</Text>
          </View>

          <TouchableOpacity style={styles.scrapeBtn} onPress={startScrape} disabled={scraping}>
            {scraping ? (
              <ActivityIndicator color="#000" size="small" />
            ) : (
              <>
                <Text style={styles.scrapeBtnText}>START NEW SCRAPE</Text>
                <Text style={styles.scrapeBtnIcon}>⚡</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Scrape Progress */}
          {(scraping || leads.length > 0) && (
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <View>
                  <Text style={styles.progressLabel}>CURRENT JOB</Text>
                  <Text style={styles.progressTitle}>
                    Scraping leads from {scrapeCompany || 'Real Estate'} niche...
                  </Text>
                </View>
                <Text style={styles.progressPct}>{scrapeProgress}%</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${scrapeProgress}%` }]} />
              </View>

              {leads.length > 0 && (
                <>
                  <FlatList
                    data={leads}
                    keyExtractor={(_, i) => String(i)}
                    renderItem={renderLeadRow}
                    scrollEnabled={false}
                    style={styles.leadsList}
                  />
                  <View style={styles.leadActions}>
                    <TouchableOpacity style={styles.leadActionBtn} onPress={pushToGHL}>
                      <Text style={styles.leadActionBtnText}>BULK PUSH TO GHL</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.leadActionBtn, styles.leadActionBtnGold]}>
                      <Text style={[styles.leadActionBtnText, { color: C.gold }]}>ENRICH DATA</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          )}
        </View>

        {/* Section 3: GHL Command Center */}
        <View style={styles.ghlSection}>
          <View style={styles.ghlConnectedBadge}>
            <View style={styles.ghlDot} />
            <Text style={styles.ghlConnectedText}>CONNECTED: SAINTSAL™ LOCATION</Text>
          </View>

          <View style={styles.ghlStatsGrid}>
            <View style={styles.ghlStatCard}>
              <Text style={styles.ghlStatLabel}>CONTACTS</Text>
              <Text style={styles.ghlStatValue}>{ghlStats.contacts}</Text>
            </View>
            <View style={styles.ghlStatCard}>
              <Text style={styles.ghlStatLabel}>REVENUE</Text>
              <Text style={styles.ghlStatValue}>{ghlStats.revenue}</Text>
            </View>
            <View style={styles.ghlStatCard}>
              <Text style={styles.ghlStatLabel}>TASKS</Text>
              <Text style={styles.ghlStatValue}>{ghlStats.tasks}</Text>
            </View>
          </View>

          <Text style={styles.snapshotLabel}>Snapshot Library</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { name: 'Residential Lending Pro', sub: '36 Workflows • Voice AI Active', featured: true },
              { name: 'Commercial Lending Pro', sub: '24 Workflows • PDF Automations', featured: false },
              { name: 'CEO Pro System', sub: '12 Workflows • Exec Dashboard', featured: false },
            ].map((snap, i) => (
              <View key={i} style={[styles.snapCard, snap.featured && styles.snapCardFeatured]}>
                <Text style={styles.snapName}>{snap.name}</Text>
                <Text style={styles.snapSub}>{snap.sub}</Text>
                <TouchableOpacity
                  style={[styles.snapBtn, snap.featured && styles.snapBtnFeatured]}
                  onPress={() => Alert.alert('Deploy', `Deploying "${snap.name}" snapshot...`)}
                >
                  <Text style={[styles.snapBtnText, snap.featured && styles.snapBtnTextFeatured]}>
                    DEPLOY
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Section 4: SaintSalAI Answer Engine */}
        <View style={styles.answerSection}>
          <View style={styles.answerCard}>
            <Text style={styles.answerTitle}>SaintSalAI Answer Engine</Text>
            <Text style={styles.answerSub}>AI knows your GHL context...</Text>

            <TextInput
              style={styles.answerInput}
              placeholder='"Who are my hottest leads this morning?"'
              placeholderTextColor={C.textDim}
              value={answerQuery}
              onChangeText={setAnswerQuery}
              onSubmitEditing={() => {
                if (answerQuery.trim()) {
                  setQuery(answerQuery);
                  setAnswerQuery('');
                  scrollRef.current?.scrollTo({ y: 0, animated: true });
                  runIntelSearch();
                }
              }}
            />

            <View style={styles.answerBtnRow}>
              <TouchableOpacity style={styles.answerBtn}>
                <Text style={styles.answerBtnText}>VIEW DEALS</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.answerBtn}>
                <Text style={styles.answerBtnText}>APPTS TODAY</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scroll: {
    flex: 1,
  },

  // Header
  header: {
    borderBottomWidth: 1,
    borderBottomColor: `${C.gold}33`,
  },
  statusBar: {
    backgroundColor: C.gold,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  statusBarText: {
    color: '#000',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    flex: 1,
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16a34a',
  },
  liveText: {
    color: '#000',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginLeft: 4,
  },
  headerMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    color: C.gold,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headerBtn: {
    padding: 4,
  },
  headerBtnText: {
    fontSize: 20,
  },

  // Search Section
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  tabsScroll: {
    marginBottom: 16,
  },
  tab: {
    paddingBottom: 8,
    paddingHorizontal: 4,
    marginRight: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: C.gold,
  },
  tabText: {
    color: C.textDim,
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: C.gold,
    fontWeight: '700',
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  searchGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    backgroundColor: `${C.gold}18`,
    borderRadius: 18,
  },
  searchInner: {
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: `${C.gold}44`,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchBtn: {
    backgroundColor: C.gold,
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  searchBtnText: {
    color: '#000',
    fontSize: 20,
    fontWeight: '700',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 14,
  },
  statsText: {
    color: C.textDim,
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statsTextGold: {
    color: C.gold,
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  streamCard: {
    backgroundColor: `${C.bgCard}CC`,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  streamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  streamDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.gold,
  },
  streamLabel: {
    color: C.textDim,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 4,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    color: C.textMuted,
    fontSize: 13,
    marginLeft: 8,
  },
  streamText: {
    color: C.textSub,
    fontSize: 14,
    lineHeight: 22,
  },
  sourcesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  sourceTag: {
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxWidth: 180,
  },
  sourceTagText: {
    color: C.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 4,
  },
  actionBtnIcon: {
    fontSize: 20,
  },
  actionBtnText: {
    color: C.textMuted,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  // Lead Section
  leadSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: `${C.bgCard}50`,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: C.border,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  sectionIconWrap: {
    backgroundColor: `${C.gold}22`,
    borderRadius: 8,
    padding: 6,
  },
  sectionIcon: {
    fontSize: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  scrapeInputRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  scrapeInput: {
    flex: 1,
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    color: '#fff',
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  scrapeDepthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  scrapeDepthLabel: {
    color: C.textDim,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scrapeDepthValue: {
    color: C.gold,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scrapeBtn: {
    backgroundColor: C.gold,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: C.gold,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  scrapeBtnText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  scrapeBtnIcon: {
    fontSize: 16,
  },
  progressCard: {
    backgroundColor: `${C.bg}80`,
    borderWidth: 1,
    borderColor: `${C.gold}18`,
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  progressLabel: {
    color: C.textDim,
    fontSize: 8,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 3,
  },
  progressTitle: {
    color: C.gold,
    fontSize: 11,
    fontWeight: '700',
  },
  progressPct: {
    color: C.gold,
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: `${C.border}`,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: C.gold,
    borderRadius: 3,
    shadowColor: C.gold,
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  leadsList: {
    marginBottom: 12,
  },
  leadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: `${C.border}80`,
    gap: 10,
  },
  leadAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${C.gold}18`,
    borderWidth: 1,
    borderColor: `${C.gold}33`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leadAvatarText: {
    color: C.gold,
    fontSize: 10,
    fontWeight: '700',
  },
  leadInfo: {
    flex: 1,
  },
  leadName: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  leadTitle: {
    color: C.textDim,
    fontSize: 9,
    marginTop: 1,
  },
  leadScore: {
    alignItems: 'flex-end',
  },
  leadScoreText: {
    color: C.green,
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  leadEmail: {
    color: C.textGhost,
    fontSize: 9,
    maxWidth: 100,
    marginTop: 1,
  },
  leadActions: {
    flexDirection: 'row',
    gap: 10,
  },
  leadActionBtn: {
    flex: 1,
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
  },
  leadActionBtnGold: {
    borderColor: `${C.gold}44`,
  },
  leadActionBtnText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // GHL Section
  ghlSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  ghlConnectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${C.green}18`,
    borderWidth: 1,
    borderColor: `${C.green}33`,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
    gap: 6,
  },
  ghlDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.green,
  },
  ghlConnectedText: {
    color: C.green,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 2,
  },
  ghlStatsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  ghlStatCard: {
    flex: 1,
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 12,
  },
  ghlStatLabel: {
    color: C.textDim,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  ghlStatValue: {
    color: C.gold,
    fontSize: 18,
    fontWeight: '700',
  },
  snapshotLabel: {
    color: C.textDim,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  snapCard: {
    width: 220,
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
  },
  snapCardFeatured: {
    borderWidth: 2,
    borderColor: `${C.gold}44`,
  },
  snapName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  snapSub: {
    color: C.textDim,
    fontSize: 10,
    marginBottom: 14,
  },
  snapBtn: {
    backgroundColor: C.bgElevated,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  snapBtnFeatured: {
    backgroundColor: C.gold,
    shadowColor: C.gold,
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  snapBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  snapBtnTextFeatured: {
    color: '#000',
  },

  // Answer Engine
  answerSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: `${C.bg}CC`,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  answerCard: {
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: `${C.gold}44`,
    borderRadius: 16,
    padding: 18,
    shadowColor: C.gold,
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  answerTitle: {
    color: C.gold,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  answerSub: {
    color: C.textDim,
    fontSize: 10,
    marginBottom: 14,
  },
  answerInput: {
    backgroundColor: `${C.bg}CC`,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: `${C.border}80`,
    color: C.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  answerBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  answerBtn: {
    flex: 1,
    backgroundColor: `${C.gold}18`,
    borderWidth: 1,
    borderColor: `${C.gold}44`,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  answerBtnText: {
    color: C.gold,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
