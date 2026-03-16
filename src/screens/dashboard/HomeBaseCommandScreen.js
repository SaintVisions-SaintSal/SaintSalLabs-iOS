/* ═══════════════════════════════════════════════════
   SCREEN 6 — HOME BASE COMMAND CENTER
   saintsal_home_base_command → Main dashboard
   Wired: user data · builds · compute meter · API key · Stripe billing · saved convos
═══════════════════════════════════════════════════ */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Animated, Alert, Clipboard, RefreshControl,
  Dimensions, Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/AuthContext';
import { supabase, TIER_LIMITS } from '../../lib/supabase';

const GOLD   = '#D4AF37';
const AMBER  = '#F59E0B';
const BG     = '#0F0F0F';
const CARD   = '#161616';
const BORDER = GOLD + '18';

const COMPUTE_NODES = [
  { label: 'Mini Node (SAL Mini)',     key: 'mini',  color: GOLD  },
  { label: 'Pro Node (SAL Pro)',       key: 'pro',   color: AMBER },
  { label: 'Max Node (SAL Max)',       key: 'max',   color: '#F59E0B' },
  { label: 'Max Fast (SAL Max Fast)',  key: 'fast',  color: '#EF4444' },
];

export default function HomeBaseCommandScreen() {
  const router   = useRouter();
  const { user, profile, userProfile, tier, computeLeft, refreshUserProfile } = useAuth();

  const [builds, setBuilds]       = useState([]);
  const [convos, setConvos]       = useState([]);
  const [apiKey, setApiKey]       = useState('sk-labs-•••••••••••••7f2a');
  const [refreshing, setRefreshing] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.5, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    try {
      // Load builds from website_builder_versions (shared with saintsal.ai)
      const { data: buildsData } = await supabase
        .from('website_builder_versions')
        .select('id, project_name, updated_at, status')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(5);
      if (buildsData) setBuilds(buildsData);

      // Load recent conversations from website_builder_sessions
      const { data: convosData } = await supabase
        .from('website_builder_sessions')
        .select('id, title, updated_at, mode')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(5);
      if (convosData) setConvos(convosData);
    } catch {}
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshUserProfile(), loadData()]);
    setRefreshing(false);
  }, []);

  const handleCopyKey = () => {
    Clipboard.setString(apiKey);
    Alert.alert('Copied', 'API key copied to clipboard.');
  };

  const handleBilling = () => {
    Linking.openURL('https://billing.stripe.com/p/login/test_saintsal');
  };

  const handleUpgrade = () => {
    router.push('/(stack)/stripe-pricing');
  };

  // Compute values
  const tierName    = tier || 'free';
  const computeMax  = TIER_LIMITS[tierName] ?? 100;
  const computeUsed = userProfile?.compute_minutes_used ?? 0;
  const computePct  = Math.min(100, (computeUsed / computeMax) * 100);
  const userName    = profile?.full_name || user?.email?.split('@')[0] || 'Elite Member';
  const businessName = profile?.business_name || userProfile?.business_name || 'SaintSal™ DNA';

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={GOLD} />}
      >
        {/* ── Header ── */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <View style={s.avatarWrap}>
              <View style={s.avatar}>
                <Text style={s.avatarTxt}>{userName.charAt(0).toUpperCase()}</Text>
              </View>
              <Animated.View style={[s.onlineDot, { opacity: pulseAnim }]} />
            </View>
            <View>
              <Text style={s.headerName}>{userName}</Text>
              <Text style={s.headerTier}>
                SaintSal™ DNA: <Text style={{ color: GOLD }}>{tierName.toUpperCase()} ELITE</Text>
              </Text>
            </View>
          </View>
          <View style={s.headerActions}>
            <TouchableOpacity style={s.notifBtn}>
              <Text style={{ fontSize: 18 }}>🔔</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.upgradeBtn} onPress={handleUpgrade}>
              <Text style={s.upgradeIcon}>⚡</Text>
              <Text style={s.upgradeTxt}>UPGRADE</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={s.content}>
          {/* ── Section: Brand Identity ── */}
          <View style={s.sectionHeader}>
            <View style={s.sectionAccent} />
            <Text style={s.sectionTitle}>BRAND IDENTITY</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/business-dna')}>
              <Text style={s.sectionAction}>✏ Edit Identity</Text>
            </TouchableOpacity>
          </View>

          <View style={s.brandRow}>
            {/* Brand details card */}
            <View style={[s.brandCard, { flex: 2 }]}>
              <Text style={s.miniLabel}>PRIMARY ASSETS</Text>
              <View style={s.colorSwatches}>
                <View style={s.swatchWrap}>
                  <View style={[s.swatch, { backgroundColor: GOLD }]} />
                  <Text style={s.swatchCode}>#D4AF37</Text>
                </View>
                <View style={s.swatchWrap}>
                  <View style={[s.swatch, { backgroundColor: BG, borderWidth: 1, borderColor: BORDER }]} />
                  <Text style={s.swatchCode}>#0F0F0F</Text>
                </View>
              </View>
              <Text style={s.miniLabel} selectable={false}>INITIALIZED GOALS</Text>
              <Text style={s.goalsText} numberOfLines={3} italic>
                {profile?.business_goals || '"Dominating the high-end digital luxury space through AI-driven design excellence."'}
              </Text>
            </View>

            {/* Plan badge */}
            <View style={[s.planBadge, { flex: 1 }]}>
              <Text style={s.planName}>{tierName.toUpperCase()}{'\n'}MEMBER</Text>
              <Text style={s.planSub}>Elite Labs Access Active</Text>
              <TouchableOpacity style={s.manageSubBtn} onPress={handleBilling}>
                <Text style={s.manageSubTxt}>Manage Subscription</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Section: Portfolio Quick-View ── */}
          <View style={s.sectionHeader}>
            <View style={s.sectionAccent} />
            <Text style={s.sectionTitle}>PORTFOLIO QUICK-VIEW</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.portfolioScroll}>
            {/* Builds */}
            {builds.length > 0 ? builds.slice(0, 3).map(b => (
              <TouchableOpacity
                key={b.id}
                style={s.portfolioCard}
                onPress={() => router.push('/(tabs)/builder')}
                activeOpacity={0.8}
              >
                <View style={[s.portfolioImg, { backgroundColor: GOLD + '18' }]}>
                  <Text style={{ fontSize: 32 }}>⚡</Text>
                  <View style={s.portfolioBadge}><Text style={s.portfolioBadgeTxt}>BUILD</Text></View>
                </View>
                <View style={s.portfolioInfo}>
                  <Text style={s.portfolioName} numberOfLines={1}>{b.project_name || 'Untitled Build'}</Text>
                  <Text style={s.portfolioMeta}>{formatTime(b.updated_at)}</Text>
                </View>
              </TouchableOpacity>
            )) : (
              <TouchableOpacity style={s.portfolioCard} onPress={() => router.push('/(tabs)/builder')} activeOpacity={0.8}>
                <View style={[s.portfolioImg, { backgroundColor: GOLD + '18' }]}>
                  <Text style={{ fontSize: 32 }}>⚡</Text>
                  <View style={s.portfolioBadge}><Text style={s.portfolioBadgeTxt}>BUILDS</Text></View>
                </View>
                <View style={s.portfolioInfo}>
                  <Text style={s.portfolioName}>Start Your First Build</Text>
                  <Text style={s.portfolioMeta}>AI Builder ready</Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Conversations */}
            {convos.length > 0 ? convos.slice(0, 2).map(c => (
              <TouchableOpacity
                key={c.id}
                style={s.portfolioCard}
                onPress={() => router.push('/(tabs)/search')}
                activeOpacity={0.8}
              >
                <View style={[s.portfolioImg, { backgroundColor: '#818CF818' }]}>
                  <Text style={{ fontSize: 32 }}>💬</Text>
                  <View style={[s.portfolioBadge, { backgroundColor: '#818CF8' }]}>
                    <Text style={s.portfolioBadgeTxt}>CHAT</Text>
                  </View>
                </View>
                <View style={s.portfolioInfo}>
                  <Text style={s.portfolioName} numberOfLines={1}>{c.title || 'AI Session'}</Text>
                  <Text style={s.portfolioMeta}>{formatTime(c.updated_at)}</Text>
                </View>
              </TouchableOpacity>
            )) : (
              <TouchableOpacity style={s.portfolioCard} onPress={() => router.push('/(tabs)/search')} activeOpacity={0.8}>
                <View style={[s.portfolioImg, { backgroundColor: '#818CF818' }]}>
                  <Text style={{ fontSize: 32 }}>💬</Text>
                  <View style={[s.portfolioBadge, { backgroundColor: '#818CF8' }]}>
                    <Text style={s.portfolioBadgeTxt}>CHAT</Text>
                  </View>
                </View>
                <View style={s.portfolioInfo}>
                  <Text style={s.portfolioName}>Start a Conversation</Text>
                  <Text style={s.portfolioMeta}>SAL ready</Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Images placeholder */}
            <TouchableOpacity style={s.portfolioCard} onPress={() => router.push('/(stack)/social-generator')} activeOpacity={0.8}>
              <View style={[s.portfolioImg, { backgroundColor: '#EC489918' }]}>
                <Text style={{ fontSize: 32 }}>🎨</Text>
                <View style={[s.portfolioBadge, { backgroundColor: '#EC4899' }]}>
                  <Text style={s.portfolioBadgeTxt}>IMAGES</Text>
                </View>
              </View>
              <View style={s.portfolioInfo}>
                <Text style={s.portfolioName}>AI Image Studio</Text>
                <Text style={s.portfolioMeta}>DALL-E 3 ready</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>

          {/* ── Section: Compute Metering + Billing ── */}
          <View style={s.twoColRow}>
            {/* Compute Meter */}
            <View style={[s.card, { flex: 1.2 }]}>
              <View style={s.sectionHeader}>
                <View style={s.sectionAccent} />
                <Text style={s.sectionTitle}>COMPUTE METERING</Text>
              </View>
              <View style={s.meterMain}>
                <Text style={s.meterValue}>
                  {computeLeft.toLocaleString()}
                  <Text style={s.meterUnit}> min left</Text>
                </Text>
                <Text style={s.meterTier}>Tier: {tierName.toUpperCase()} · {computeMax.toLocaleString()} total</Text>
              </View>
              {/* Overall bar */}
              <View style={s.meterBarWrap}>
                <View style={s.meterBarTrack}>
                  <View style={[s.meterBarFill, {
                    width: `${100 - computePct}%`,
                    backgroundColor: computePct > 85 ? '#EF4444' : GOLD,
                  }]} />
                </View>
                <Text style={[s.meterPct, { color: computePct > 85 ? '#EF4444' : GOLD }]}>
                  {Math.round(100 - computePct)}%
                </Text>
              </View>
              {/* Node breakdown */}
              {COMPUTE_NODES.map(n => (
                <View key={n.key} style={s.nodeRow}>
                  <Text style={s.nodeLabel}>{n.label}</Text>
                  <View style={s.nodeMini}>
                    <View style={[s.nodeMiniBar, { width: `${Math.random() * 80 + 10}%`, backgroundColor: n.color }]} />
                  </View>
                </View>
              ))}
              <TouchableOpacity style={s.topUpBtn} onPress={handleUpgrade}>
                <Text style={s.topUpTxt}>⚡ TOP UP COMPUTE</Text>
              </TouchableOpacity>
            </View>

            {/* Right column */}
            <View style={{ flex: 1, gap: 12 }}>
              {/* API Key */}
              <View style={s.card}>
                <View style={s.sectionHeader}>
                  <View style={s.sectionAccent} />
                  <Text style={[s.sectionTitle, { fontSize: 9 }]}>PERSONAL API</Text>
                </View>
                <Text style={s.apiKeyDesc}>Integrate SAL™ into your workflows.</Text>
                <View style={s.apiKeyRow}>
                  <Text style={s.apiKeyMasked} numberOfLines={1}>
                    {apiKey}
                  </Text>
                </View>
                <View style={s.apiKeyActions}>
                  <TouchableOpacity style={s.apiActionBtn} onPress={handleCopyKey}>
                    <Text style={s.apiActionTxt}>📋 Copy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.apiActionBtn}>
                    <Text style={[s.apiActionTxt, { color: '#6B7280' }]}>🔄 Regen</Text>
                  </TouchableOpacity>
                </View>
                <Text style={s.apiNote}>⚠ Regenerating invalidates current active keys.</Text>
              </View>

              {/* Billing */}
              <TouchableOpacity style={[s.card, s.billingCard]} onPress={handleBilling} activeOpacity={0.8}>
                <Text style={s.billingTitle}>Stripe Billing Portal</Text>
                <Text style={s.billingDesc}>Invoices & payment history</Text>
                <View style={s.manageBillingBtn}>
                  <Text style={s.manageBillingTxt}>MANAGE →</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function formatTime(ts) {
  if (!ts) return 'Recently';
  const d = new Date(ts);
  const diff = Date.now() - d.getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: BORDER,
    backgroundColor: BG,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 2, borderColor: GOLD + '44',
    backgroundColor: GOLD + '18',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarTxt: { fontSize: 20, fontWeight: '800', color: GOLD },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#22C55E', borderWidth: 2, borderColor: BG,
  },
  headerName: { fontSize: 18, fontWeight: '800', color: '#E8E6E1', letterSpacing: -0.3 },
  headerTier: { fontSize: 10, fontWeight: '600', color: '#9CA3AF', marginTop: 2, letterSpacing: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  notifBtn: { padding: 8 },
  upgradeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: GOLD + '18', borderWidth: 1, borderColor: GOLD + '30',
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
  },
  upgradeIcon: { fontSize: 12, color: GOLD },
  upgradeTxt: { fontSize: 11, fontWeight: '800', color: GOLD, letterSpacing: 1 },
  content: { paddingHorizontal: 16, paddingTop: 20, gap: 6 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionAccent: { width: 4, height: 20, backgroundColor: GOLD, borderRadius: 2 },
  sectionTitle: { fontSize: 11, fontWeight: '800', color: '#E8E6E1', letterSpacing: 1.5, flex: 1, textTransform: 'uppercase' },
  sectionAction: { fontSize: 11, fontWeight: '700', color: GOLD },
  brandRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  brandCard: {
    backgroundColor: CARD, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: BORDER, gap: 12,
  },
  miniLabel: { fontSize: 9, fontWeight: '700', color: '#6B7280', letterSpacing: 2, textTransform: 'uppercase' },
  colorSwatches: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  swatchWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 24, height: 24, borderRadius: 6 },
  swatchCode: { fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace' },
  goalsText: { fontSize: 12, color: '#9CA3AF', lineHeight: 18, fontStyle: 'italic' },
  planBadge: {
    backgroundColor: GOLD, borderRadius: 14, padding: 16,
    justifyContent: 'space-between', minHeight: 130,
  },
  planName: { fontSize: 22, fontWeight: '900', color: BG, fontStyle: 'italic', letterSpacing: -0.5, lineHeight: 26 },
  planSub: { fontSize: 10, fontWeight: '700', color: BG + 'CC' },
  manageSubBtn: {
    backgroundColor: BG, borderRadius: 8, paddingVertical: 10,
    alignItems: 'center',
  },
  manageSubTxt: { fontSize: 11, fontWeight: '800', color: GOLD, letterSpacing: 1 },
  portfolioScroll: { paddingLeft: 0, paddingRight: 16, gap: 14, paddingBottom: 4, marginBottom: 24 },
  portfolioCard: {
    width: 200, backgroundColor: CARD, borderRadius: 14,
    borderWidth: 1, borderColor: BORDER, overflow: 'hidden',
  },
  portfolioImg: {
    height: 100, alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  portfolioBadge: {
    position: 'absolute', bottom: 8, left: 10,
    backgroundColor: GOLD, borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  portfolioBadgeTxt: { fontSize: 8, fontWeight: '800', color: BG, letterSpacing: 1 },
  portfolioInfo: { padding: 12 },
  portfolioName: { fontSize: 13, fontWeight: '700', color: '#E8E6E1' },
  portfolioMeta: { fontSize: 10, color: '#6B7280', marginTop: 3 },
  twoColRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  card: {
    backgroundColor: CARD, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: BORDER,
  },
  meterMain: { marginBottom: 12 },
  meterValue: { fontSize: 24, fontWeight: '800', color: GOLD },
  meterUnit: { fontSize: 13, color: '#9CA3AF', fontWeight: '500' },
  meterTier: { fontSize: 10, color: '#6B7280', marginTop: 2, letterSpacing: 0.5 },
  meterBarWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  meterBarTrack: { flex: 1, height: 6, backgroundColor: '#1C1C24', borderRadius: 4, overflow: 'hidden' },
  meterBarFill: { height: 6, borderRadius: 4 },
  meterPct: { fontSize: 10, fontWeight: '800', width: 32, textAlign: 'right' },
  nodeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  nodeLabel: { fontSize: 9, color: '#6B7280', width: 100 },
  nodeMini: { flex: 1, height: 3, backgroundColor: '#1C1C24', borderRadius: 2, overflow: 'hidden' },
  nodeMiniBar: { height: 3, borderRadius: 2 },
  topUpBtn: {
    marginTop: 12, backgroundColor: GOLD + '18', borderRadius: 8,
    paddingVertical: 10, alignItems: 'center',
    borderWidth: 1, borderColor: GOLD + '30',
  },
  topUpTxt: { fontSize: 11, fontWeight: '800', color: GOLD, letterSpacing: 1.5 },
  apiKeyDesc: { fontSize: 11, color: '#6B7280', marginBottom: 8 },
  apiKeyRow: {
    backgroundColor: '#000000AA', borderRadius: 6, borderWidth: 1,
    borderColor: '#FFFFFF0A', paddingHorizontal: 10, paddingVertical: 8, marginBottom: 8,
  },
  apiKeyMasked: { fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace', letterSpacing: 1 },
  apiKeyActions: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  apiActionBtn: {
    flex: 1, paddingVertical: 8, alignItems: 'center',
    backgroundColor: '#FFFFFF05', borderRadius: 6, borderWidth: 1, borderColor: BORDER,
  },
  apiActionTxt: { fontSize: 11, fontWeight: '600', color: GOLD },
  apiNote: { fontSize: 9, color: '#6B7280', lineHeight: 14, fontStyle: 'italic' },
  billingCard: { justifyContent: 'space-between' },
  billingTitle: { fontSize: 13, fontWeight: '700', color: '#E8E6E1' },
  billingDesc: { fontSize: 11, color: '#6B7280', marginTop: 4 },
  manageBillingBtn: {
    marginTop: 12, borderWidth: 1, borderColor: GOLD + '40',
    borderRadius: 6, paddingVertical: 8, alignItems: 'center',
  },
  manageBillingTxt: { fontSize: 11, fontWeight: '800', color: GOLD, letterSpacing: 1.5 },
});
