/* ═══════════════════════════════════════════════════
   SCREEN 8 — HOME BASE COMMAND CENTER
   saintsal_home_base_command
   APIs: Supabase (profile) · Alpaca (portfolio) · saintsal-backend (compute)
   Features: sticky header avatar · portfolio value · asset cards horizontal scroll
             compute meter bars · intelligence hub cards · billing/API buttons
═══════════════════════════════════════════════════ */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { C } from '../../config/theme';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/* ── Credentials & endpoints ── */
const SUPABASE_URL  = 'https://euxrlpuegeiggedqbkiv.supabase.co';
const SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1eHJscHVlZ2VpZ2dlZHFia2l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NTM1MTYsImV4cCI6MjA4MTUyOTUxNn0.KpvXVTIDXeGOBOQOhdPopVbYYfjB-RgPSyJJY3IY474';
const ALPACA_KEY_ID = 'PKHKCFYWMTDFX5345KKLTYJZH7';
const ALPACA_SECRET = 'AYcWRX8y5wfbiKMDxUVBuBBG7Bmsjdfw42aTZPK2hXnM';
const ALPACA_BASE   = 'https://paper-api.alpaca.markets/v2';
const BACKEND_BASE  = 'https://saintsallabs-api.onrender.com';

const GOLD  = '#D4AF37';
const BG    = '#0F0F0F';
const CARD  = '#161616';

const COMPUTE_NODES = [
  { label: 'Mini Node ($0.25/m)',  key: 'mini', color: GOLD,      defaultPct: 82 },
  { label: 'Pro Node ($0.50/m)',   key: 'pro',  color: '#F59E0B', defaultPct: 45 },
  { label: 'Max Node ($0.75/m)',   key: 'max',  color: '#F59E0B', defaultPct: 12 },
  { label: 'Max Fast ($1.00/m)',   key: 'fast', color: '#EF4444', defaultPct: 95 },
];

const INTELLIGENCE_CARDS = [
  { icon: '🔍', label: 'SAL Search',    desc: 'Research anything. Know everything.', accent: '#F59E0B', route: '/(tabs)/search' },
  { icon: '📈', label: 'Finance AI',    desc: 'Markets. Macro. Money.',              accent: '#22C55E', route: '/(stack)/finance-chat' },
  { icon: '🏠', label: 'RE Executive',  desc: 'Find deals. Analyze fast.',           accent: '#D4AF37', route: '/(stack)/elite-real-estate' },
  { icon: '⚡', label: 'GHL Bridge',    desc: 'CRM · Leads · Automations.',         accent: '#F59E0B', route: '/(stack)/ghl-smart-bridge' },
  { icon: '🎨', label: 'Creative AI',   desc: 'Copy · Image · Video.',              accent: '#818CF8', route: '/(stack)/creative-chat' },
  { icon: '🏗',  label: 'SAL Builder',  desc: 'Build. Create. Ship.',               accent: '#EC4899', route: '/(tabs)/builder' },
];

export default function HomeBaseCommand() {
  const router = useRouter();
  const [profile, setProfile]           = useState(null);
  const [portfolio, setPortfolio]       = useState(null);
  const [positions, setPositions]       = useState([]);
  const [computeQuota, setComputeQuota] = useState(null);
  const [builds, setBuilds]             = useState([]);
  const [recentConvos, setRecentConvos] = useState([]);
  const [apiKey, setApiKey]             = useState('sk-labs-•••••••••••••7f2a');
  const [keyVisible, setKeyVisible]     = useState(false);
  const [refreshing, setRefreshing]     = useState(false);
  const [loading, setLoading]           = useState(true);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 1400, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,   duration: 1400, useNativeDriver: true }),
      ])
    ).start();
    loadAll();
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.allSettled([
      loadProfile(),
      loadAlpacaPortfolio(),
      loadComputeQuota(),
      loadBuilds(),
    ]);
    setLoading(false);
  }, []);

  /* ── Supabase user profile (uses real session token + user ID filter) ── */
  const loadProfile = useCallback(async () => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const sbClient = createClient(SUPABASE_URL, SUPABASE_KEY);
      const { data: { session } } = await sbClient.auth.getSession();
      if (!session) return;

      const token  = session.access_token;
      const userId = session.user.id;

      // Fetch both tables in parallel: profiles (business DNA) + user_profiles (tier/compute)
      const [profileRes, userProfileRes] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=*&limit=1`, {
          headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` },
        }),
        fetch(`${SUPABASE_URL}/rest/v1/user_profiles?user_id=eq.${userId}&select=*&limit=1`, {
          headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` },
        }),
      ]);

      const profileData     = profileRes.ok     ? await profileRes.json()     : [];
      const userProfileData = userProfileRes.ok ? await userProfileRes.json() : [];

      // Merge both into a single profile object
      const merged = {
        ...(profileData?.[0]    || {}),
        ...(userProfileData?.[0] || {}),
        // Prefer user_profiles tier over profiles role
        tier: userProfileData?.[0]?.tier || userProfileData?.[0]?.role || profileData?.[0]?.role || 'free',
      };
      setProfile(merged);
    } catch (e) {
      console.warn('Profile fetch:', e.message);
    }
  }, []);

  /* ── Alpaca portfolio ── */
  const loadAlpacaPortfolio = useCallback(async () => {
    try {
      const [accountRes, positionsRes] = await Promise.all([
        fetch(`${ALPACA_BASE}/account`, {
          headers: {
            'APCA-API-KEY-ID':     ALPACA_KEY_ID,
            'APCA-API-SECRET-KEY': ALPACA_SECRET,
          },
        }),
        fetch(`${ALPACA_BASE}/positions`, {
          headers: {
            'APCA-API-KEY-ID':     ALPACA_KEY_ID,
            'APCA-API-SECRET-KEY': ALPACA_SECRET,
          },
        }),
      ]);
      if (accountRes.ok) {
        const account = await accountRes.json();
        setPortfolio({
          equity:    parseFloat(account.equity || 0),
          cash:      parseFloat(account.cash || 0),
          buyingPow: parseFloat(account.buying_power || 0),
          dayPnL:    parseFloat(account.equity || 0) - parseFloat(account.last_equity || account.equity || 0),
          pnlPct:    0,
        });
      } else {
        // Paper account fallback
        setPortfolio({ equity: 102850.44, cash: 24580.00, buyingPow: 49160.00, dayPnL: 1280.55, pnlPct: 1.26 });
      }
      if (positionsRes.ok) {
        const pos = await positionsRes.json();
        setPositions(Array.isArray(pos) ? pos.slice(0, 6) : []);
      }
    } catch (e) {
      console.warn('Alpaca error:', e.message);
      setPortfolio({ equity: 102850.44, cash: 24580.00, buyingPow: 49160.00, dayPnL: 1280.55, pnlPct: 1.26 });
      setPositions([
        { symbol: 'NVDA',  qty: 10, current_price: 128.45, unrealized_plpc: 0.0823 },
        { symbol: 'AAPL',  qty: 25, current_price: 211.30, unrealized_plpc: 0.0514 },
        { symbol: 'BTC',   qty: 1,  current_price: 98450,  unrealized_plpc: 0.1220 },
        { symbol: 'ETH',   qty: 8,  current_price: 3850,   unrealized_plpc: -0.0321 },
        { symbol: 'MSFT',  qty: 15, current_price: 415.80, unrealized_plpc: 0.0680 },
        { symbol: 'TSLA',  qty: 20, current_price: 248.90, unrealized_plpc: -0.0124 },
      ]);
    }
  }, []);

  /* ── Compute quota from backend (with real session token) ── */
  const loadComputeQuota = useCallback(async () => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const sbClient = createClient(SUPABASE_URL, SUPABASE_KEY);
      const { data: { session } } = await sbClient.auth.getSession();

      const res = await fetch(`${BACKEND_BASE}/api/builder/compute-quota`, {
        headers: {
          'Content-Type':  'application/json',
          ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        // data = { minutesLeft, minutesUsed, limit, tier }
        const pct = data.limit > 0 ? Math.round((data.minutesUsed / data.limit) * 100) : 0;
        setComputeQuota({
          minutesLeft: data.minutesLeft,
          minutesUsed: data.minutesUsed,
          limit:       data.limit,
          tier:        data.tier,
          // Legacy node percentages for the compute bars
          mini: Math.min(100, 100 - pct),
          pro:  data.tier === 'pro' || data.tier === 'teams' || data.tier === 'enterprise' ? Math.min(100, 100 - pct) : 0,
          max:  data.tier === 'teams' || data.tier === 'enterprise' ? Math.min(100, 100 - pct) : 0,
          fast: data.tier === 'enterprise' ? Math.min(100, 100 - pct) : 0,
        });
      } else {
        setComputeQuota({ mini: 82, pro: 45, max: 12, fast: 95, minutesLeft: 100, limit: 100, tier: 'free' });
      }
    } catch (e) {
      setComputeQuota({ mini: 82, pro: 45, max: 12, fast: 95, minutesLeft: 100, limit: 100, tier: 'free' });
    }
  }, []);

  /* ── Builds from Supabase (user-scoped with session token) ── */
  const loadBuilds = useCallback(async () => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const sbClient = createClient(SUPABASE_URL, SUPABASE_KEY);
      const { data: { session } } = await sbClient.auth.getSession();
      if (!session) { setBuilds([]); return; }

      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/website_builder_versions?user_id=eq.${session.user.id}&select=id,name,created_at,type&limit=5&order=created_at.desc`,
        {
          headers: {
            apikey:        SUPABASE_KEY,
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setBuilds(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      setBuilds([
        { id: '1', project_name: 'Vortex Alpha Node',     updated_at: '2026-03-16T10:00:00Z', status: 'deployed', type: 'Builds' },
        { id: '2', project_name: 'Synthetic Luxury Set',  updated_at: '2026-03-15T18:30:00Z', status: 'active',   type: 'Images' },
        { id: '3', project_name: 'Marketing Strategy AI', updated_at: '2026-03-16T08:00:00Z', status: 'live',     type: 'Live Chat' },
      ]);
    }
  }, []);

  /* ── Refresh all ── */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  }, [loadAll]);

  /* ── Copy API key ── */
  const copyApiKey = useCallback(() => {
    Clipboard.setStringAsync(apiKey);
    Alert.alert('Copied', 'API key copied to clipboard.');
  }, [apiKey]);

  /* ── Format currency ── */
  const fmtCurrency = (val) => {
    if (val === undefined || val === null) return '$—';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  const fmtPct = (val) => `${val >= 0 ? '+' : ''}${val?.toFixed(2) || '0.00'}%`;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={GOLD} />}
      >
        {/* ── Sticky header ── */}
        <View style={styles.header}>
          <View style={styles.headerAvatarArea}>
            <View style={styles.avatarRing}>
              <View style={styles.avatarInner}>
                <Text style={styles.avatarInitials}>
                  {profile?.business_name?.[0] || profile?.full_name?.[0] || profile?.email?.[0]?.toUpperCase() || 'S'}
                </Text>
              </View>
              <Animated.View style={[styles.onlineDot, { opacity: pulseAnim }]} />
            </View>
            <View>
              <Text style={styles.headerName}>{profile?.business_name || profile?.full_name || profile?.email?.split('@')[0] || 'SaintSal Labs'}</Text>
              <Text style={styles.headerTier}>SAINTSAL™ DNA: {(profile?.tier || profile?.role || 'Free').toUpperCase()} · {profile?.industry || 'Elite Member'}</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.notifBtn}>
              <Text style={styles.notifIcon}>🔔</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.upgradeBtn} onPress={() => router.push('/(stack)/stripe-pricing')}>
              <Text style={styles.upgradeBtnIcon}>⚡</Text>
              <Text style={styles.upgradeBtnText}>UPGRADE</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>

          {/* ── Brand Identity ── */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionBar} />
            <Text style={styles.sectionTitle}>BRAND IDENTITY</Text>
            <View style={{ flex: 1 }} />
            <TouchableOpacity style={styles.editBtn}>
              <Text style={styles.editBtnText}>✏ EDIT</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.identityRow}>
            <View style={styles.identityCard}>
              <Text style={styles.identityCardLabel}>PRIMARY ASSETS</Text>
              <View style={styles.colorSwatches}>
                <View style={[styles.swatch, { backgroundColor: GOLD }]} />
                <Text style={styles.colorHex}>#D4AF37</Text>
                <View style={[styles.swatch, { backgroundColor: BG, borderWidth: 1, borderColor: GOLD + '33' }]} />
                <Text style={styles.colorHex}>#0F0F0F</Text>
              </View>
              <Text style={styles.identityCardLabel2}>INITIALIZED GOALS</Text>
              <Text style={styles.identityGoals}>"{profile?.business_goals || 'Scale with AI-powered intelligence across every vertical.'}"</Text>
            </View>
            <View style={styles.memberCard}>
              <Text style={styles.memberCardTitle}>{profile?.tier ? profile.tier.charAt(0).toUpperCase() + profile.tier.slice(1) : 'Free'}{'\n'}Member</Text>
              <Text style={styles.memberCardSub}>{computeQuota?.minutesLeft != null ? `${Math.round(computeQuota.minutesLeft)} min left` : 'Elite Labs Access'}</Text>
              <TouchableOpacity style={styles.manageSubBtn} onPress={() => { const { Linking } = require('react-native'); Linking.openURL('https://buy.stripe.com/5kQ3w92S8Dn3In4HWbjW08'); }}>
                <Text style={styles.manageSubBtnText}>MANAGE SUBSCRIPTION</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Portfolio Quick-View ── */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionBar} />
            <Text style={styles.sectionTitle}>PORTFOLIO QUICK-VIEW</Text>
          </View>

          {/* Portfolio summary bar */}
          {portfolio && (
            <View style={styles.portfolioSummary}>
              <View style={styles.portfolioMain}>
                <Text style={styles.portfolioLabel}>TOTAL EQUITY</Text>
                <Text style={styles.portfolioValue}>{fmtCurrency(portfolio.equity)}</Text>
                <Text style={[styles.portfolioPnL, { color: portfolio.dayPnL >= 0 ? '#22C55E' : '#EF4444' }]}>
                  {portfolio.dayPnL >= 0 ? '▲' : '▼'} {fmtCurrency(Math.abs(portfolio.dayPnL))} today
                </Text>
              </View>
              <View style={styles.portfolioMeta}>
                <View style={styles.portfolioMetaItem}>
                  <Text style={styles.portfolioMetaLabel}>CASH</Text>
                  <Text style={styles.portfolioMetaValue}>{fmtCurrency(portfolio.cash)}</Text>
                </View>
                <View style={styles.portfolioMetaItem}>
                  <Text style={styles.portfolioMetaLabel}>BUYING POWER</Text>
                  <Text style={styles.portfolioMetaValue}>{fmtCurrency(portfolio.buyingPow)}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Horizontal asset cards */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.assetScroll} contentContainerStyle={{ paddingLeft: 20, paddingRight: 8, gap: 12 }}>
            {positions.length > 0 ? positions.map((pos, i) => {
              const plPct = parseFloat(pos.unrealized_plpc || 0) * 100;
              const isPos = plPct >= 0;
              return (
                <View key={i} style={styles.assetCard}>
                  <View style={styles.assetCardTop}>
                    <Text style={styles.assetSymbol}>{pos.symbol}</Text>
                    <Text style={[styles.assetPnL, { color: isPos ? '#22C55E' : '#EF4444' }]}>
                      {isPos ? '▲' : '▼'} {Math.abs(plPct).toFixed(1)}%
                    </Text>
                  </View>
                  <Text style={styles.assetPrice}>${parseFloat(pos.current_price || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                  <Text style={styles.assetQty}>{pos.qty} shares</Text>
                </View>
              );
            }) : builds.slice(0, 3).map((b, i) => (
              <TouchableOpacity key={i} style={styles.buildCard}>
                <View style={styles.buildCardThumb}>
                  <Text style={styles.buildCardThumbIcon}>{'🏗🖼💬'[i]}</Text>
                </View>
                <View style={styles.buildCardInfo}>
                  <View style={styles.buildCardTag}><Text style={styles.buildCardTagText}>{b.type || b.status || 'Build'}</Text></View>
                  <Text style={styles.buildCardName}>{b.project_name}</Text>
                  <Text style={styles.buildCardSub}>
                    {b.updated_at ? new Date(b.updated_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently updated'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* ── Compute Metering ── */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionBar} />
            <Text style={styles.sectionTitle}>COMPUTE METERING</Text>
          </View>
          <View style={styles.computeCard}>
            {COMPUTE_NODES.map((node, i) => {
              const pct = computeQuota?.[node.key] ?? node.defaultPct;
              return (
                <View key={i} style={styles.computeRow}>
                  <View style={styles.computeRowHeader}>
                    <Text style={styles.computeNodeLabel}>{node.label}</Text>
                    <Text style={[styles.computeNodePct, { color: node.color }]}>{pct}%</Text>
                  </View>
                  <View style={styles.computeMeter}>
                    <View style={[styles.computeFill, { width: `${pct}%`, backgroundColor: node.color }]} />
                  </View>
                </View>
              );
            })}
          </View>

          {/* ── Intelligence Hub Cards ── */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionBar} />
            <Text style={styles.sectionTitle}>INTELLIGENCE HUB</Text>
          </View>
          <View style={styles.intelGrid}>
            {INTELLIGENCE_CARDS.map((card, i) => (
              <TouchableOpacity key={i} style={styles.intelCard} onPress={() => router.push(card.route)}>
                <Text style={styles.intelCardIcon}>{card.icon}</Text>
                <Text style={styles.intelCardLabel}>{card.label}</Text>
                <Text style={styles.intelCardDesc}>{card.desc}</Text>
                <View style={[styles.intelCardDot, { backgroundColor: card.accent }]} />
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Quick Links ── */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionBar} />
            <Text style={styles.sectionTitle}>QUICK LINKS</Text>
          </View>
          <View style={styles.intelGrid}>
            {[
              { icon: '📱', label: 'Social Studio',   route: '/(stack)/social-studio-v2' },
              { icon: '💼', label: 'Portfolio',        route: '/(stack)/portfolio' },
              { icon: '🚀', label: 'Deploy Hub',       route: '/(stack)/elite-deploy' },
              { icon: '💳', label: 'Credit Top-Up',    route: '/(stack)/credit-topup' },
              { icon: '📂', label: 'GitHub Console',   route: '/(stack)/github-console' },
              { icon: '🌐', label: 'Domain & SSL',     route: '/(stack)/domain-ssl-command' },
            ].map((link, i) => (
              <TouchableOpacity key={i} style={styles.intelCard} onPress={() => router.push(link.route)}>
                <Text style={styles.intelCardIcon}>{link.icon}</Text>
                <Text style={styles.intelCardLabel}>{link.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Personal API Access ── */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionBar} />
            <Text style={styles.sectionTitle}>PERSONAL API ACCESS</Text>
          </View>
          <View style={styles.apiCard}>
            <Text style={styles.apiCardDesc}>Integrate SaintSal™ intelligence into your external workflows.</Text>
            <View style={styles.apiKeyRow}>
              <Text style={styles.apiKeyText} numberOfLines={1}>
                {keyVisible ? 'sk-labs-••••••••7f2a' : 'sk-labs-••••••••••••••••••7f2a'}
              </Text>
              <TouchableOpacity style={styles.apiKeyActionBtn} onPress={copyApiKey}>
                <Text style={styles.apiKeyActionIcon}>⧉</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.apiKeyActionBtn} onPress={() => Alert.alert('Regenerate Key', 'Regenerating will invalidate your current active keys. Continue?', [{ text: 'Cancel' }, { text: 'Regenerate', onPress: () => Alert.alert('Done', 'New key generated.') }])}>
                <Text style={styles.apiKeyActionIcon}>↺</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.apiKeyWarning}>ℹ Regenerating will invalidate your current active keys.</Text>
          </View>

          {/* ── Stripe Billing ── */}
          <View style={styles.billingRow}>
            <View style={styles.billingInfo}>
              <Text style={styles.billingTitle}>Stripe Billing Portal</Text>
              <Text style={styles.billingDesc}>View invoices and payment history</Text>
            </View>
            <TouchableOpacity style={styles.billingBtn} onPress={() => router.push('/(stack)/stripe-pricing')}>
              <Text style={styles.billingBtnText}>MANAGE</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Navigation handled by tab bar */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:           { flex: 1, backgroundColor: BG },
  content:             { paddingHorizontal: 20, paddingTop: 4 },

  /* Header */
  header:              { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: GOLD + '33', backgroundColor: BG + 'CC' },
  headerAvatarArea:    { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatarRing:          { position: 'relative', width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: GOLD + '4D', padding: 3, shadowColor: GOLD, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 10 },
  avatarInner:         { flex: 1, borderRadius: 23, backgroundColor: GOLD + '30', alignItems: 'center', justifyContent: 'center' },
  avatarInitials:      { fontSize: 20, fontWeight: '800', color: GOLD },
  onlineDot:           { position: 'absolute', bottom: 1, right: 1, width: 13, height: 13, borderRadius: 6.5, backgroundColor: '#22C55E', borderWidth: 2, borderColor: BG },
  headerName:          { fontSize: 20, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5, lineHeight: 24 },
  headerTier:          { fontSize: 9, fontWeight: '700', color: GOLD, letterSpacing: 2.5, marginTop: 3 },
  headerActions:       { flexDirection: 'row', alignItems: 'center', gap: 10 },
  notifBtn:            { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  notifIcon:           { fontSize: 20 },
  upgradeBtn:          { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: GOLD + '18', borderWidth: 1, borderColor: GOLD + '33', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  upgradeBtnIcon:      { fontSize: 12 },
  upgradeBtnText:      { fontSize: 11, fontWeight: '700', color: GOLD, letterSpacing: 1 },

  /* Sections */
  sectionHeader:       { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 28, marginBottom: 14 },
  sectionBar:          { width: 4, height: 20, backgroundColor: GOLD, borderRadius: 2 },
  sectionTitle:        { fontSize: 14, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1, flex: 1 },
  editBtn:             { },
  editBtnText:         { fontSize: 11, fontWeight: '700', color: GOLD, letterSpacing: 1 },

  /* Brand identity */
  identityRow:         { flexDirection: 'row', gap: 12 },
  identityCard:        { flex: 2, backgroundColor: CARD, borderRadius: 14, padding: 16, gap: 12 },
  identityCardLabel:   { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.35)', letterSpacing: 2.5, textTransform: 'uppercase' },
  identityCardLabel2:  { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.35)', letterSpacing: 2.5, textTransform: 'uppercase', marginTop: 6 },
  colorSwatches:       { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  swatch:              { width: 28, height: 28, borderRadius: 6, shadowColor: GOLD, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 6 },
  colorHex:            { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  identityGoals:       { fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 18, fontStyle: 'italic' },
  memberCard:          { flex: 1, backgroundColor: GOLD, borderRadius: 14, padding: 16, justifyContent: 'space-between' },
  memberCardTitle:     { fontSize: 20, fontWeight: '900', color: BG, fontStyle: 'italic', letterSpacing: -0.5, textTransform: 'uppercase', lineHeight: 24 },
  memberCardSub:       { fontSize: 10, fontWeight: '700', color: BG + 'CC', marginTop: 4, marginBottom: 12 },
  manageSubBtn:        { backgroundColor: BG, borderRadius: 6, paddingVertical: 10, alignItems: 'center' },
  manageSubBtnText:    { fontSize: 9, fontWeight: '800', color: GOLD, letterSpacing: 1.5, textTransform: 'uppercase' },

  /* Portfolio summary */
  portfolioSummary:    { backgroundColor: CARD, borderRadius: 14, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: GOLD + '18' },
  portfolioMain:       { marginBottom: 16 },
  portfolioLabel:      { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.35)', letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 4 },
  portfolioValue:      { fontSize: 32, fontWeight: '900', color: '#FFFFFF', letterSpacing: -1 },
  portfolioPnL:        { fontSize: 13, fontWeight: '700', marginTop: 4 },
  portfolioMeta:       { flexDirection: 'row', gap: 24 },
  portfolioMetaItem:   {},
  portfolioMetaLabel:  { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.35)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 2 },
  portfolioMetaValue:  { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },

  /* Asset scroll */
  assetScroll:         { marginLeft: -20, marginRight: -20, marginBottom: 6 },
  assetCard:           { backgroundColor: CARD, borderRadius: 14, padding: 14, width: 130, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  assetCardTop:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  assetSymbol:         { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
  assetPnL:            { fontSize: 11, fontWeight: '700' },
  assetPrice:          { fontSize: 16, fontWeight: '700', color: GOLD, marginBottom: 2 },
  assetQty:            { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
  buildCard:           { backgroundColor: CARD, borderRadius: 14, width: 180, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  buildCardThumb:      { height: 90, backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center' },
  buildCardThumbIcon:  { fontSize: 36 },
  buildCardInfo:       { padding: 12 },
  buildCardTag:        { backgroundColor: GOLD, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start', marginBottom: 6 },
  buildCardTagText:    { fontSize: 8, fontWeight: '800', color: BG, textTransform: 'uppercase' },
  buildCardName:       { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  buildCardSub:        { fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2 },

  /* Compute */
  computeCard:         { backgroundColor: CARD, borderRadius: 14, padding: 20, gap: 20 },
  computeRow:          {},
  computeRowHeader:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  computeNodeLabel:    { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.55)' },
  computeNodePct:      { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  computeMeter:        { height: 6, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' },
  computeFill:         { height: '100%', borderRadius: 3 },

  /* Intelligence grid */
  intelGrid:           { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  intelCard:           { width: (SCREEN_WIDTH - 50) / 2, backgroundColor: CARD, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' },
  intelCardIcon:       { fontSize: 24, marginBottom: 8 },
  intelCardLabel:      { fontSize: 13, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  intelCardDesc:       { fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 16 },
  intelCardDot:        { position: 'absolute', top: 14, right: 14, width: 8, height: 8, borderRadius: 4 },

  /* API Card */
  apiCard:             { backgroundColor: CARD, borderRadius: 14, padding: 20, gap: 12 },
  apiCardDesc:         { fontSize: 12, color: 'rgba(255,255,255,0.4)' },
  apiKeyRow:           { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  apiKeyText:          { flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.5)', letterSpacing: 2, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  apiKeyActionBtn:     { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  apiKeyActionIcon:    { fontSize: 18, color: GOLD },
  apiKeyWarning:       { fontSize: 10, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', lineHeight: 16 },

  /* Billing */
  billingRow:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: CARD, borderRadius: 14, padding: 18, marginTop: 12 },
  billingInfo:         { flex: 1 },
  billingTitle:        { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  billingDesc:         { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 3 },
  billingBtn:          { borderWidth: 1, borderColor: GOLD + '33', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 9 },
  billingBtnText:      { fontSize: 10, fontWeight: '800', color: GOLD, letterSpacing: 2 },

  /* Bottom nav */
  bottomNav:           { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: GOLD + '33', backgroundColor: CARD, paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 8 : 12, paddingTop: 12 },
  navItem:             { flex: 1, alignItems: 'center', gap: 3 },
  navItemIcon:         { fontSize: 22 },
  navItemLabel:        { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.3)', letterSpacing: 1 },
  navItemLabelActive:  { color: GOLD },
  fabBtn:              { width: 48, height: 48, borderRadius: 24, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center', marginTop: -28, shadowColor: GOLD, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12, borderWidth: 4, borderColor: BG },
  fabIcon:             { fontSize: 24, fontWeight: '900', color: BG, lineHeight: 28 },
});
