/* ═══════════════════════════════════════════════════
   SAINTSALLABS — DASHBOARD SCREEN (LIVE WIRED)
   Supabase · Stripe Billing Portal · Compute Quota
   API Key · Pricing Route
   #0F0F0F · #D4AF37 · Public Sans
═══════════════════════════════════════════════════ */
import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Animated, Linking,
  ActivityIndicator, Clipboard, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '../../config/theme';
import { SALMark } from '../../components';
import { useUserDashboard } from '../../hooks/useUserDashboard';

/* ── Static display data (unchanged) ──────────────── */
const MARKET_TICKERS = [
  { symbol: 'BTC',   value: '$65,432', change: '+1.2%', up: true  },
  { symbol: 'S&P 500', value: '5,431', change: '+0.5%', up: true  },
  { symbol: 'ETH',   value: '$3,421',  change: '-0.8%', up: false },
  { symbol: 'NVDA',  value: '$924.80', change: '+2.4%', up: true  },
  { symbol: 'GOLD',  value: '$2,342',  change: '+0.3%', up: true  },
];

const SUITES = [
  { id: 'search',     icon: '🔍', label: 'Search',     desc: 'Universal AI Intelligence',      accent: C.amber  },
  { id: 'finance',    icon: '📈', label: 'Finance',    desc: 'Market Analysis & Forecasting',  accent: C.green  },
  { id: 'tech',       icon: '💻', label: 'Tech',       desc: 'Code & Development Ops',         accent: C.purple },
  { id: 'medical',    icon: '🏥', label: 'Medical',    desc: 'Clinical Health Insights',       accent: C.purple },
  { id: 'realestate', icon: '🏠', label: 'Real Estate',desc: 'Global Market Trends',           accent: C.pink   },
  { id: 'sports',     icon: '🏈', label: 'Sports',     desc: 'Scores, Stats & Strategy',       accent: C.green  },
  { id: 'news',       icon: '📰', label: 'News',       desc: 'Breaking & Analysis',            accent: C.red    },
  { id: 'builder',    icon: '⚡', label: 'Builder',    desc: 'Code. Create. Ship.',            accent: C.amber  },
  { id: 'career',     icon: '💼', label: 'Career',     desc: 'Get Hired. Get Paid.',           accent: C.purple },
  { id: 'bizplan',    icon: '📋', label: 'Biz Plan',   desc: 'Idea to Investor Deck',          accent: C.amber  },
  { id: 'bizcenter',  icon: '🏢', label: 'Biz Center', desc: 'Launch Your Company',           accent: C.green  },
  { id: 'domains',    icon: '🌐', label: 'Domains',    desc: 'Find Your Brand Name',           accent: C.blue   },
];

const TIER_COLORS = {
  free:       '#555',
  starter:    C.purple,
  pro:        C.amber,
  teams:      C.green,
  enterprise: C.pink,
};

/* ── Tier badge ────────────────────────────────────── */
function TierBadge({ tier }) {
  const color = TIER_COLORS[tier?.toLowerCase()] ?? '#555';
  return (
    <View style={[s.tierBadge, { borderColor: color + '55', backgroundColor: color + '18' }]}>
      <Text style={[s.tierBadgeText, { color }]}>{tier?.toUpperCase() ?? 'FREE'}</Text>
    </View>
  );
}

/* ── Quota bar ─────────────────────────────────────── */
function QuotaBar({ used, total }) {
  const pct = total > 0 ? Math.min(used / total, 1) : 0;
  const barColor = pct > 0.85 ? C.red : pct > 0.6 ? C.amber : C.green;
  return (
    <View style={s.quotaBarWrap}>
      <View style={s.quotaBarTrack}>
        <View style={[s.quotaBarFill, { width: `${(pct * 100).toFixed(1)}%`, backgroundColor: barColor }]} />
      </View>
    </View>
  );
}

/* ── API Key row ───────────────────────────────────── */
function ApiKeyRow({ profile, getOrCreateApiKey }) {
  const [apiKey, setApiKey]   = useState(profile?.api_key ?? null);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReveal = useCallback(async () => {
    if (apiKey) { setVisible(v => !v); return; }
    setLoading(true);
    const k = await getOrCreateApiKey();
    setApiKey(k);
    setVisible(true);
    setLoading(false);
  }, [apiKey, getOrCreateApiKey]);

  const handleCopy = useCallback(() => {
    if (!apiKey) return;
    Clipboard.setString(apiKey);
    Alert.alert('Copied', 'API key copied to clipboard.');
  }, [apiKey]);

  const masked = apiKey ? apiKey.slice(0, 8) + '••••••••••••••••' : '••••••••••••••••••••';

  return (
    <View style={s.apiKeyCard}>
      <View style={s.apiKeyHeader}>
        <Text style={s.apiKeyTitle}>API KEY</Text>
        {apiKey && (
          <TouchableOpacity onPress={handleCopy} style={s.apiKeyAction}>
            <Text style={s.apiKeyActionText}>COPY</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={s.apiKeyRow}>
        <Text style={s.apiKeyValue} numberOfLines={1}>
          {visible ? apiKey : masked}
        </Text>
        <TouchableOpacity onPress={handleReveal} style={s.apiKeyReveal} disabled={loading}>
          {loading
            ? <ActivityIndicator size="small" color={C.amber} />
            : <Text style={s.apiKeyRevealText}>{visible ? 'HIDE' : 'SHOW'}</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ── Recent builds list ────────────────────────────── */
function RecentBuilds({ builds }) {
  if (!builds?.length) return null;
  return (
    <View style={s.recentCard}>
      <Text style={s.recentTitle}>RECENT BUILDS</Text>
      {builds.map((b, i) => (
        <View key={b.id ?? i} style={[s.recentRow, i < builds.length - 1 && s.recentRowBorder]}>
          <Text style={s.recentIcon}>⚡</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.recentLabel} numberOfLines={1}>{b.name ?? 'Untitled Build'}</Text>
            <Text style={s.recentSub}>{b.status ?? 'draft'}</Text>
          </View>
          <Text style={s.recentDate}>
            {b.updated_at ? new Date(b.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
          </Text>
        </View>
      ))}
    </View>
  );
}

/* ── Recent conversations list ─────────────────────── */
function RecentConversations({ conversations }) {
  if (!conversations?.length) return null;
  return (
    <View style={s.recentCard}>
      <Text style={s.recentTitle}>SAVED CONVERSATIONS</Text>
      {conversations.map((c, i) => (
        <View key={c.id ?? i} style={[s.recentRow, i < conversations.length - 1 && s.recentRowBorder]}>
          <Text style={s.recentIcon}>💬</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.recentLabel} numberOfLines={1}>{c.title ?? 'Untitled Chat'}</Text>
            <Text style={s.recentSub}>{c.vertical ?? 'general'}</Text>
          </View>
          <Text style={s.recentDate}>
            {c.updated_at ? new Date(c.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
          </Text>
        </View>
      ))}
    </View>
  );
}

/* ══════════════════════════════════════════════════ */
export default function DashboardScreen() {
  const router    = useRouter();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const {
    loading,
    displayName,
    displayEmail,
    tier,
    creditsLeft,
    creditsTotal,
    creditsUsed,
    builds,
    conversations,
    imageCount,
    profile,
    getOrCreateApiKey,
    getPortalUrl,
  } = useUserDashboard();

  /* Pulse animation (unchanged) */
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,   duration: 1200, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  /* Suite routing (unchanged) */
  const SUITE_ROUTES = {
    search:     '/(tabs)/search',
    builder:    '/(tabs)/builder',
    finance:    '/(tabs)/search',
    tech:       '/(tabs)/search',
    medical:    '/(tabs)/search',
    sports:     '/(tabs)/search',
    news:       '/(tabs)/search',
    career:     '/(tabs)/search',
    bizplan:    '/(tabs)/search',
    bizcenter:  '/(tabs)/search',
    realestate: '/(stack)/real-estate',
    domains:    '/(stack)/domain-hub',
  };

  const handleSuitePress = (suite) => {
    const route = SUITE_ROUTES[suite.id];
    if (route) router.push(route);
  };

  /* Manage Subscription → Stripe billing portal */
  const handleManageSubscription = useCallback(async () => {
    const url = await getPortalUrl();
    Linking.openURL(url);
  }, [getPortalUrl]);

  /* Upgrade → pricing screen */
  const handleUpgrade = useCallback(() => {
    router.push('/(stack)/stripe-pricing');
  }, [router]);

  /* Live credits display */
  const creditsDisplay = loading ? '—' : creditsLeft.toLocaleString();

  return (
    <SafeAreaView style={s.safe}>

      {/* ── Header (preserved) ──────────────────────── */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <SALMark size={38} />
          <View>
            <Text style={s.headerTitle}>SaintSal Labs</Text>
            <View style={s.engineRow}>
              <Animated.View style={[s.engineDot, { opacity: pulseAnim }]} />
              <Text style={s.engineText}>Neural Engine Active</Text>
            </View>
          </View>
        </View>
        <View style={s.headerRight}>
          <View style={s.creditBadge}>
            <Text style={s.creditIcon}>🗄️</Text>
            {loading
              ? <ActivityIndicator size="small" color={C.amber} style={{ width: 50 }} />
              : <Text style={s.creditValue}>{creditsDisplay} Credits</Text>
            }
          </View>
        </View>
      </View>

      {/* ── Market Ticker (preserved) ───────────────── */}
      <View style={s.tickerWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.tickerContent}
        >
          {MARKET_TICKERS.map((t) => (
            <View key={t.symbol} style={s.tickerCard}>
              <Text style={s.tickerArrow}>{t.up ? '📈' : '📉'}</Text>
              <Text style={s.tickerLabel}>
                <Text style={s.tickerSymbol}>{t.symbol}:</Text> {t.value}
              </Text>
              <Text style={[s.tickerChange, { color: t.up ? C.green : C.red }]}>{t.change}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* ── Main Scroll ─────────────────────────────── */}
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── User Profile Card ──────────────────────── */}
        <View style={s.profileCard}>
          <View style={s.profileTop}>
            <View style={s.profileAvatar}>
              <Text style={s.profileAvatarText}>
                {loading ? '…' : (displayName.charAt(0) ?? 'S').toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              {loading ? (
                <ActivityIndicator size="small" color={C.amber} />
              ) : (
                <>
                  <Text style={s.profileName}>{displayName}</Text>
                  <Text style={s.profileEmail} numberOfLines={1}>{displayEmail}</Text>
                </>
              )}
            </View>
            <TierBadge tier={tier} />
          </View>

          {/* Quota bar */}
          {!loading && (
            <View style={s.quotaSection}>
              <View style={s.quotaLabelRow}>
                <Text style={s.quotaLabel}>COMPUTE USAGE</Text>
                <Text style={s.quotaValue}>
                  {creditsUsed.toLocaleString()} / {creditsTotal.toLocaleString()}
                </Text>
              </View>
              <QuotaBar used={creditsUsed} total={creditsTotal} />
            </View>
          )}

          {/* Stats row */}
          <View style={s.profileStats}>
            <View style={s.profileStat}>
              <Text style={s.profileStatNum}>{loading ? '—' : builds.length}</Text>
              <Text style={s.profileStatLabel}>Builds</Text>
            </View>
            <View style={s.profileStatDivider} />
            <View style={s.profileStat}>
              <Text style={s.profileStatNum}>{loading ? '—' : conversations.length}</Text>
              <Text style={s.profileStatLabel}>Chats</Text>
            </View>
            <View style={s.profileStatDivider} />
            <View style={s.profileStat}>
              <Text style={s.profileStatNum}>{loading ? '—' : imageCount.toLocaleString()}</Text>
              <Text style={s.profileStatLabel}>Images</Text>
            </View>
          </View>

          {/* Account action buttons */}
          <View style={s.profileActions}>
            <TouchableOpacity style={s.manageBtn} onPress={handleManageSubscription}>
              <Text style={s.manageBtnText}>MANAGE SUBSCRIPTION</Text>
            </TouchableOpacity>
            {tier?.toLowerCase() !== 'enterprise' && (
              <TouchableOpacity style={s.upgradeBtn} onPress={handleUpgrade}>
                <Text style={s.upgradeBtnText}>UPGRADE ↗</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── API Key Card ───────────────────────────── */}
        {!loading && (
          <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
            <ApiKeyRow profile={profile} getOrCreateApiKey={getOrCreateApiKey} />
          </View>
        )}

        {/* ── Intelligence Suites (preserved) ────────── */}
        <View style={s.sectionTitleWrap}>
          <Text style={s.sectionTitle}>Intelligence Suites</Text>
          <Text style={s.sectionSubtitle}>Specialized AI models for your workflow</Text>
        </View>

        <View style={s.grid}>
          {SUITES.map((suite) => (
            <TouchableOpacity
              key={suite.id}
              style={s.suiteCard}
              onPress={() => handleSuitePress(suite)}
              activeOpacity={0.7}
            >
              <View style={[s.suiteIcon, { backgroundColor: suite.accent + '12' }]}>
                <Text style={s.suiteEmoji}>{suite.icon}</Text>
              </View>
              <Text style={s.suiteLabel}>{suite.label}</Text>
              <Text style={s.suiteDesc}>{suite.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Recent Builds ──────────────────────────── */}
        {!loading && builds.length > 0 && (
          <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
            <RecentBuilds builds={builds} />
          </View>
        )}

        {/* ── Recent Conversations ───────────────────── */}
        {!loading && conversations.length > 0 && (
          <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
            <RecentConversations conversations={conversations} />
          </View>
        )}

        {/* ── Quick Stats (live) ─────────────────────── */}
        <View style={s.statsWrap}>
          <Text style={s.statsTitle}>TODAY'S ACTIVITY</Text>
          <View style={s.statsRow}>
            {[
              { label: 'Saved Chats',       value: loading ? '—' : conversations.length,      icon: '💬' },
              { label: 'Saved Builds',      value: loading ? '—' : builds.length,             icon: '📄' },
              { label: 'Generated Images',  value: loading ? '—' : imageCount.toLocaleString(), icon: '🖼️' },
            ].map((stat) => (
              <View key={stat.label} style={s.statCard}>
                <Text style={s.statIcon}>{stat.icon}</Text>
                <Text style={s.statValue}>{stat.value}</Text>
                <Text style={s.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── System Status (preserved) ──────────────── */}
        <View style={s.statusBanner}>
          <View style={s.statusLeft}>
            <View style={s.statusDot} />
            <Text style={s.statusText}>GPU Clusters Online</Text>
          </View>
          <Text style={s.statusUptime}>99.9% Uptime</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── FAB (preserved) ────────────────────────── */}
      <TouchableOpacity style={s.fab} activeOpacity={0.8} onPress={() => router.replace('/(tabs)')}>
        <Text style={s.fabIcon}>💬</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

/* ══════════════════════════════════════════════════
   STYLES — #0F0F0F · #D4AF37 · all original preserved
═══════════════════════════════════════════════════ */
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerLeft:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: C.text, letterSpacing: -0.3 },
  engineRow:   { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  engineDot:   { width: 6, height: 6, borderRadius: 3, backgroundColor: C.amber },
  engineText:  { fontSize: 9, fontWeight: '800', letterSpacing: 1, color: C.amberDim, textTransform: 'uppercase' },
  creditBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 999, backgroundColor: C.amberGhost,
    borderWidth: 1, borderColor: C.amberDim + '33',
  },
  creditIcon:  { fontSize: 12 },
  creditValue: { fontSize: 11, fontWeight: '700', color: C.amber },

  /* Ticker */
  tickerWrap:    { backgroundColor: C.bgCard, borderBottomWidth: 1, borderBottomColor: C.border, paddingVertical: 8 },
  tickerContent: { paddingHorizontal: 12, gap: 10 },
  tickerCard:    {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 10, backgroundColor: C.bgElevated,
    borderWidth: 1, borderColor: C.border,
  },
  tickerArrow:   { fontSize: 12 },
  tickerLabel:   { fontSize: 11, fontWeight: '500', color: C.text },
  tickerSymbol:  { color: C.textMuted },
  tickerChange:  { fontSize: 10, fontWeight: '700' },

  /* Scroll */
  scroll: { flex: 1 },

  /* ── Profile Card ────────────────────────────────── */
  profileCard: {
    marginHorizontal: 16, marginTop: 20, marginBottom: 4,
    backgroundColor: '#111116',
    borderWidth: 1, borderColor: C.gold + '33',
    borderRadius: 16, padding: 18,
  },
  profileTop:       { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  profileAvatar:    {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: C.gold + '22', borderWidth: 1, borderColor: C.gold + '55',
    alignItems: 'center', justifyContent: 'center',
  },
  profileAvatarText: { fontSize: 20, fontWeight: '800', color: C.gold },
  profileName:       { fontSize: 16, fontWeight: '700', color: C.text, letterSpacing: -0.2 },
  profileEmail:      { fontSize: 11, color: C.textDim, marginTop: 2 },

  tierBadge:     {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 999, borderWidth: 1,
  },
  tierBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },

  /* Quota */
  quotaSection:   { marginBottom: 16 },
  quotaLabelRow:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  quotaLabel:     { fontSize: 9, fontWeight: '800', letterSpacing: 1, color: C.textGhost, textTransform: 'uppercase' },
  quotaValue:     { fontSize: 10, fontWeight: '700', color: C.textDim },
  quotaBarWrap:   {},
  quotaBarTrack:  { height: 4, borderRadius: 2, backgroundColor: C.border, overflow: 'hidden' },
  quotaBarFill:   { height: 4, borderRadius: 2 },

  /* Profile stats row */
  profileStats:       { flexDirection: 'row', alignItems: 'center', marginBottom: 18, paddingTop: 4 },
  profileStat:        { flex: 1, alignItems: 'center' },
  profileStatNum:     { fontSize: 20, fontWeight: '800', color: C.text },
  profileStatLabel:   { fontSize: 10, color: C.textMuted, marginTop: 3 },
  profileStatDivider: { width: 1, height: 30, backgroundColor: C.border },

  /* Profile action buttons */
  profileActions: { flexDirection: 'row', gap: 10 },
  manageBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: '#1A1A22',
    borderWidth: 1, borderColor: C.border,
    alignItems: 'center',
  },
  manageBtnText: { fontSize: 10, fontWeight: '800', color: C.textMuted, letterSpacing: 0.8 },
  upgradeBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: C.gold + '18',
    borderWidth: 1, borderColor: C.gold + '44',
    alignItems: 'center',
  },
  upgradeBtnText: { fontSize: 10, fontWeight: '800', color: C.gold, letterSpacing: 0.8 },

  /* ── API Key Card ─────────────────────────────────── */
  apiKeyCard: {
    backgroundColor: '#0D0D12',
    borderWidth: 1, borderColor: C.amber + '22',
    borderRadius: 12, padding: 14,
  },
  apiKeyHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  apiKeyTitle:      { fontSize: 9, fontWeight: '800', letterSpacing: 1.2, color: C.textGhost },
  apiKeyAction:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: C.amberGhost },
  apiKeyActionText: { fontSize: 9, fontWeight: '800', color: C.amber, letterSpacing: 0.8 },
  apiKeyRow:        { flexDirection: 'row', alignItems: 'center', gap: 10 },
  apiKeyValue:      { flex: 1, fontSize: 12, fontFamily: 'monospace', color: '#8A9CC5', letterSpacing: 0.5 },
  apiKeyReveal:     { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 7, backgroundColor: '#1A1A22', borderWidth: 1, borderColor: C.border },
  apiKeyRevealText: { fontSize: 9, fontWeight: '800', color: C.textDim, letterSpacing: 0.8 },

  /* ── Recent lists ─────────────────────────────────── */
  recentCard:       { backgroundColor: '#111116', borderWidth: 1, borderColor: C.border, borderRadius: 12, overflow: 'hidden' },
  recentTitle:      { fontSize: 9, fontWeight: '800', letterSpacing: 1, color: C.textGhost, padding: 12, paddingBottom: 8, textTransform: 'uppercase' },
  recentRow:        { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 11 },
  recentRowBorder:  { borderBottomWidth: 1, borderBottomColor: C.borderSm },
  recentIcon:       { fontSize: 14 },
  recentLabel:      { fontSize: 13, fontWeight: '600', color: C.text },
  recentSub:        { fontSize: 10, color: C.textGhost, marginTop: 2, textTransform: 'capitalize' },
  recentDate:       { fontSize: 10, color: C.textDim },

  /* Section Title */
  sectionTitleWrap: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 14 },
  sectionTitle:     { fontSize: 22, fontWeight: '800', color: C.text, letterSpacing: -0.3 },
  sectionSubtitle:  { fontSize: 13, color: C.textMuted, marginTop: 4 },

  /* Grid */
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 12 },
  suiteCard: {
    width: '47%', padding: 18, borderRadius: 14,
    borderWidth: 1, borderColor: C.border, backgroundColor: C.bgCard,
  },
  suiteIcon:  { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  suiteEmoji: { fontSize: 20 },
  suiteLabel: { fontSize: 15, fontWeight: '700', color: C.text },
  suiteDesc:  { fontSize: 11, color: C.textMuted, marginTop: 4 },

  /* Stats */
  statsWrap:  { paddingHorizontal: 16, marginTop: 24 },
  statsTitle: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, color: C.textDim, marginBottom: 12 },
  statsRow:   { flexDirection: 'row', gap: 10 },
  statCard:   { flex: 1, padding: 14, borderRadius: 12, backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border, alignItems: 'center' },
  statIcon:   { fontSize: 18, marginBottom: 6 },
  statValue:  { fontSize: 20, fontWeight: '800', color: C.text },
  statLabel:  { fontSize: 10, color: C.textMuted, marginTop: 4, textAlign: 'center' },

  /* Status Banner */
  statusBanner: {
    marginHorizontal: 16, marginTop: 20,
    padding: 14, borderRadius: 14,
    backgroundColor: C.amberGhost,
    borderWidth: 1, borderColor: C.amberDim + '33',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  statusLeft:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot:    { width: 8, height: 8, borderRadius: 4, backgroundColor: C.amber },
  statusText:   { fontSize: 13, fontWeight: '500', color: C.textSub },
  statusUptime: { fontSize: 10, fontWeight: '800', color: C.amber, letterSpacing: 0.5, textTransform: 'uppercase' },

  /* FAB */
  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: C.amber,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: C.amber, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  fabIcon: { fontSize: 24 },
});
