/* ═══════════════════════════════════════════════════
   KINETIC LABS — UNIFIED DASHBOARD (My Cell)
   Premium profile + GHL Bridge + Investments + RE + Pillars
   Matches: screen.jpg / code.html
   US Patent #10,290,222 · HACP Protocol
═══════════════════════════════════════════════════ */
import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Animated, Dimensions, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { C } from '../../config/theme';
import { supabase } from '../../lib/supabase';

const { width: SW } = Dimensions.get('window');

/* ── GHL Stats ─────────────────────────────── */
const GHL_STATS = [
  { label: 'Total Tasks', value: '24', badge: '→', badgeColor: C.amber },
  { label: 'Calendar', value: '8', badge: 'TODAY', badgeColor: C.green },
  { label: 'Contacts', value: '1,240', badge: '⟳', badgeColor: C.textDim },
  { label: 'New Leads', value: '+12', badge: '24H', badgeColor: C.textDim, accent: C.green },
];

/* ── RE Holdings ───────────────────────────── */
const RE_HOLDINGS = [
  { icon: '🏢', label: 'Investment Properties', count: '12', color: C.amber },
  { icon: '🌄', label: 'Land Assets', count: '4', color: C.amber },
  { icon: '🔧', label: 'Contractor Bids', count: '3', color: C.errorLight, border: true },
  { icon: '🎯', label: 'New Deal Targets', count: '5', color: C.green, border: true },
];

/* ── Pillars Tags ──────────────────────────── */
const FAVORITE_TEAMS = ['Lakers', 'Warriors'];
const TECH_TRACKERS = ['AI', 'Quantum'];

/* ── Saved Assets ──────────────────────────── */
const SAVED_ASSETS = [
  { label: 'Architectural_V3', tag: 'BUILD 01' },
  { label: 'Minimalist_Hull', tag: 'BUILD 02' },
  { label: 'Glass_Pavilion', tag: 'BUILD 03' },
];

/* ── Insight Searches ──────────────────────── */
const INSIGHTS = [
  'Tokenized RE Markets',
  'Neural Rendering 2024',
  'Hyper-Liquid Stocks',
];

export default function KineticDashboard() {
  const router = useRouter();
  const fadeIn = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [profile, setProfile] = useState({ name: '', plan: 'TEAMS', avatar: null });

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, plan_tier')
          .eq('id', user.id)
          .single();
        if (data) {
          setProfile({
            name: data.full_name || user.email?.split('@')[0] || 'User',
            plan: (data.plan_tier || 'free').toUpperCase(),
            avatar: data.avatar_url,
          });
        }
      }
    } catch (e) {
      // silent
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <Animated.View style={{ flex: 1, opacity: fadeIn }}>
        {/* ═══ Top Bar ═══ */}
        <View style={s.topBar}>
          <View style={s.topBarLeft}>
            <View style={s.avatarSmall}>
              {profile.avatar ? (
                <Image source={{ uri: profile.avatar }} style={s.avatarImg} />
              ) : (
                <LinearGradient colors={[C.goldBright, C.amber]} style={s.avatarFallback}>
                  <Text style={s.avatarInitial}>{profile.name?.[0]?.toUpperCase() || 'S'}</Text>
                </LinearGradient>
              )}
              <View style={s.onlineDot} />
            </View>
            <Text style={s.topBarBrand}>KINETIC_LABS</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(stack)/api-settings')}>
            <Text style={{ fontSize: 18, color: C.textDim }}>⚙️</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          {/* ═══ SECTION 1: BUSINESS DNA PROFILE ═══ */}
          <View style={s.profileSection}>
            {/* Cover image area */}
            <LinearGradient
              colors={['#1A1A2E', '#0F0F0F']}
              style={s.coverArea}
            >
              <View style={s.coverOverlay}>
                <Text style={s.coverWatermark}>SAINTSALLABS</Text>
              </View>
            </LinearGradient>

            {/* Avatar + info */}
            <View style={s.profileInfo}>
              <View style={s.profileAvatarWrap}>
                {profile.avatar ? (
                  <Image source={{ uri: profile.avatar }} style={s.profileAvatar} />
                ) : (
                  <LinearGradient colors={[C.goldBright, C.amber]} style={s.profileAvatarFallback}>
                    <Text style={s.profileAvatarInitial}>{profile.name?.[0]?.toUpperCase() || 'S'}</Text>
                  </LinearGradient>
                )}
                <View style={s.profileOnlineDot} />
              </View>
              <View style={s.profileMeta}>
                <View style={s.profileNameRow}>
                  <Text style={s.profileName}>CLIENT: UNIFIED DASHBOARD</Text>
                  <View style={s.eliteBadge}>
                    <Text style={s.eliteBadgeText}>ALPHA ELITE</Text>
                  </View>
                </View>
                <View style={s.profileTags}>
                  <Text style={s.profileTag}>✓ {profile.plan} plan active</Text>
                  <View style={s.tagDot} />
                  <View style={s.systemRow}>
                    <Animated.View style={[s.systemDot, { opacity: pulseAnim }]} />
                    <Text style={s.systemText}>SYSTEM NOMINAL</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* ═══ SECTION 2: GHL OPERATIONAL BRIDGE ═══ */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <View style={s.sectionTitleRow}>
                <Text style={{ fontSize: 16, marginRight: 6 }}>🔗</Text>
                <Text style={s.sectionTitle}>GHL OPERATIONAL BRIDGE</Text>
              </View>
              <TouchableOpacity
                style={s.configBtn}
                onPress={() => router.push('/(stack)/ghl-command')}
              >
                <Text style={s.configBtnText}>SaaS Configurator Settings</Text>
              </TouchableOpacity>
            </View>
            <View style={s.statGrid}>
              {GHL_STATS.map((stat, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    s.statCard,
                    i === 3 && { borderBottomWidth: 2, borderBottomColor: C.green + '66' },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => router.push('/(stack)/ghl-command')}
                >
                  <Text style={s.statLabel}>{stat.label}</Text>
                  <View style={s.statValueRow}>
                    <Text style={[s.statValue, stat.accent && { color: stat.accent }]}>
                      {stat.value}
                    </Text>
                    <Text style={[s.statBadge, { color: stat.badgeColor }]}>{stat.badge}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ═══ SECTION 3: INVESTMENT PORTFOLIO ═══ */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <View style={s.sectionTitleRow}>
                <Text style={{ fontSize: 16, marginRight: 6 }}>💰</Text>
                <Text style={s.sectionTitle}>INVESTMENT PORTFOLIO</Text>
              </View>
              <View style={s.syncBadge}>
                <Animated.View style={[s.syncDot, { opacity: pulseAnim }]} />
                <Text style={s.syncText}>ALPACA SYNC: WIRED & ACTIVE</Text>
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.portfolioScroll}>
              {/* Market holdings card */}
              <View style={s.portfolioCard}>
                <Text style={s.portfolioLabel}>Market Holdings</Text>
                <Text style={s.portfolioValue}>$1,240,500.00</Text>
                <View style={s.portfolioChart}>
                  {[40, 60, 50, 80, 100].map((h, i) => (
                    <View
                      key={i}
                      style={[
                        s.chartBar,
                        { height: h * 0.4, backgroundColor: i === 4 ? C.green : C.green + '66' },
                      ]}
                    />
                  ))}
                  <Text style={s.chartGain}>+4.2%</Text>
                </View>
                <Text style={s.portfolioSub}>STOCKS & BONDS CONSOLIDATED</Text>
              </View>

              {/* Asset protection */}
              <View style={s.portfolioCard}>
                <Text style={s.portfolioLabel}>Asset Protection</Text>
                <View style={s.assetRow}>
                  <Text style={s.assetLabel}>Annuities & Life</Text>
                  <Text style={s.assetStatus}>SECURED</Text>
                </View>
                <View style={s.progressTrack}>
                  <View style={[s.progressFill, { width: '85%' }]} />
                </View>
                <View style={[s.assetRow, { marginTop: 12 }]}>
                  <Text style={s.assetLabel}>Estate Plans</Text>
                  <Text style={s.assetStatus}>OPTIMIZED</Text>
                </View>
                <View style={s.progressTrack}>
                  <View style={[s.progressFill, { width: '100%' }]} />
                </View>
              </View>

              {/* New opportunities — gold gradient */}
              <LinearGradient
                colors={[C.goldBright, C.amber]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.portfolioCardGold}
              >
                <Text style={s.goldLabel}>NEW OPPORTUNITIES</Text>
                <Text style={s.goldBody}>3 High-Yield REITs detected in your preferred zip codes.</Text>
                <TouchableOpacity style={s.goldBtn}>
                  <Text style={s.goldBtnText}>Review Matches</Text>
                </TouchableOpacity>
              </LinearGradient>
            </ScrollView>
          </View>

          {/* ═══ SECTION 4: REAL ESTATE HOLDINGS ═══ */}
          <View style={s.section}>
            <View style={s.sectionTitleRow}>
              <Text style={{ fontSize: 16, marginRight: 6 }}>🏠</Text>
              <Text style={s.sectionTitle}>REAL ESTATE HOLDINGS</Text>
            </View>
            <View style={s.reList}>
              {RE_HOLDINGS.map((item, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    s.reRow,
                    item.border && item.color === C.errorLight && { borderLeftWidth: 3, borderLeftColor: C.red + '88' },
                    item.border && item.color === C.green && { borderLeftWidth: 3, borderLeftColor: C.green + '88' },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => router.push('/(stack)/elite-real-estate')}
                >
                  <View style={[s.reIcon, { backgroundColor: (item.color || C.amber) + '18' }]}>
                    <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                  </View>
                  <Text style={s.reLabel}>{item.label}</Text>
                  <Text style={[s.reCount, { color: item.color }]}>{item.count}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ═══ SECTION 5: PILLARS OF INTELLIGENCE ═══ */}
          <View style={s.section}>
            <View style={s.sectionTitleRow}>
              <Text style={{ fontSize: 16, marginRight: 6 }}>🧠</Text>
              <Text style={s.sectionTitle}>PILLARS OF INTELLIGENCE</Text>
            </View>

            <View style={s.pillarGroup}>
              <Text style={s.pillarLabel}>FAVORITE TEAMS</Text>
              <View style={s.tagRow}>
                {FAVORITE_TEAMS.map(t => (
                  <View key={t} style={s.pillarTag}>
                    <Text style={s.pillarTagText}>{t}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={s.pillarGroup}>
              <Text style={s.pillarLabel}>TECH TRACKERS</Text>
              <View style={s.tagRow}>
                {TECH_TRACKERS.map(t => (
                  <View key={t} style={[s.pillarTag, t === 'AI' && s.pillarTagActive]}>
                    <Text style={[s.pillarTagText, t === 'AI' && { color: C.green }]}>{t}</Text>
                    {t === 'AI' && <View style={s.pillarActiveDot} />}
                  </View>
                ))}
              </View>
            </View>

            <View style={s.pillarGroup}>
              <Text style={s.pillarLabel}>REAL ESTATE WATCHLIST</Text>
              <View style={s.watchRow}>
                <Text style={{ fontSize: 12, color: C.amber, marginRight: 6 }}>📍</Text>
                <Text style={s.watchText}>Orange County Foreclosures</Text>
              </View>
            </View>
          </View>

          {/* ═══ SECTION 6: SAVED LABORATORY ASSETS ═══ */}
          <View style={s.section}>
            <View style={s.sectionTitleRow}>
              <Text style={{ fontSize: 16, marginRight: 6 }}>🔬</Text>
              <Text style={s.sectionTitle}>SAVED LABORATORY ASSETS</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {SAVED_ASSETS.map((asset, i) => (
                <View key={i} style={s.assetCard}>
                  <LinearGradient
                    colors={['#1A1A2E', '#0F0F0F']}
                    style={s.assetThumb}
                  >
                    <Text style={{ fontSize: 28, opacity: 0.6 }}>🏗</Text>
                  </LinearGradient>
                  <Text style={s.assetTag}>{asset.tag}</Text>
                  <Text style={s.assetName}>{asset.label}</Text>
                </View>
              ))}
            </ScrollView>

            {/* Insight searches */}
            <View style={s.insightBox}>
              <Text style={s.insightHeader}>Insight Searches</Text>
              {INSIGHTS.map((q, i) => (
                <TouchableOpacity key={i} style={s.insightRow}>
                  <Text style={s.insightIcon}>🕐</Text>
                  <Text style={s.insightText}>{q}</Text>
                </TouchableOpacity>
              ))}
              <View style={s.insightFooter}>
                <Text style={s.insightCount}>12</Text>
                <Text style={s.insightTotal}>TOTAL SAVED</Text>
              </View>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

/* ═══ STYLES ═══ */
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  /* Top bar */
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, height: 52,
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarSmall: { width: 32, height: 32, borderRadius: 16, overflow: 'hidden' },
  avatarImg: { width: 32, height: 32, borderRadius: 16 },
  avatarFallback: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: 14, fontWeight: '800', color: '#000' },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 10, height: 10, borderRadius: 5, backgroundColor: C.green,
    borderWidth: 2, borderColor: C.bg,
  },
  topBarBrand: {
    fontSize: 16, fontWeight: '900', color: C.amber,
    letterSpacing: -0.5, textTransform: 'uppercase',
  },

  scroll: { paddingBottom: 20 },

  /* Profile section */
  profileSection: { marginBottom: 24 },
  coverArea: { height: 120, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  coverOverlay: { position: 'absolute', opacity: 0.04 },
  coverWatermark: { fontSize: 48, fontWeight: '900', color: '#fff', letterSpacing: -2 },
  profileInfo: {
    paddingHorizontal: 20, marginTop: -40,
  },
  profileAvatarWrap: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: C.bg, overflow: 'visible' },
  profileAvatar: { width: 72, height: 72, borderRadius: 36 },
  profileAvatarFallback: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  profileAvatarInitial: { fontSize: 28, fontWeight: '900', color: '#000' },
  profileOnlineDot: {
    position: 'absolute', bottom: 2, right: 2,
    width: 14, height: 14, borderRadius: 7, backgroundColor: C.green,
    borderWidth: 3, borderColor: C.bg,
  },
  profileMeta: { marginTop: 12 },
  profileNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  profileName: { fontSize: 20, fontWeight: '900', color: C.text, letterSpacing: -0.5 },
  eliteBadge: {
    backgroundColor: C.amber, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99,
  },
  eliteBadgeText: { fontSize: 8, fontWeight: '900', color: C.bg, letterSpacing: 1 },
  profileTags: { flexDirection: 'row', alignItems: 'center', marginTop: 6, flexWrap: 'wrap' },
  profileTag: { fontSize: 11, fontWeight: '600', color: C.textSub },
  tagDot: {
    width: 4, height: 4, borderRadius: 2, backgroundColor: C.outlineVariant + '50',
    marginHorizontal: 8,
  },
  systemRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  systemDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.green },
  systemText: { fontSize: 11, fontWeight: '600', color: C.green },

  /* Section */
  section: {
    backgroundColor: C.surfaceLow, borderRadius: 16, marginHorizontal: 16,
    padding: 20, marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16, flexWrap: 'wrap', gap: 8,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: C.text, letterSpacing: 0.5 },
  configBtn: {
    borderWidth: 1, borderColor: C.amber + '55', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4,
  },
  configBtnText: { fontSize: 9, fontWeight: '800', letterSpacing: 1, color: C.amber, textTransform: 'uppercase' },

  /* GHL stat grid */
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statCard: {
    width: (SW - 80) / 2, backgroundColor: C.surfaceHighest, borderRadius: 10, padding: 14,
  },
  statLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1.5, color: C.textMuted, textTransform: 'uppercase' },
  statValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 8 },
  statValue: { fontSize: 26, fontWeight: '900', color: C.text },
  statBadge: { fontSize: 9, fontWeight: '700' },

  /* Portfolio */
  portfolioScroll: { marginTop: -4 },
  portfolioCard: {
    width: SW * 0.65, backgroundColor: C.surfaceLow, borderRadius: 14, padding: 18,
    marginRight: 12, borderWidth: 1, borderColor: C.outlineVariant + '18',
  },
  portfolioCardGold: {
    width: SW * 0.65, borderRadius: 14, padding: 18, marginRight: 12,
  },
  portfolioLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1.5, color: C.textMuted, textTransform: 'uppercase' },
  portfolioValue: { fontSize: 22, fontWeight: '900', color: C.text, marginTop: 4 },
  portfolioChart: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, marginTop: 12, height: 40 },
  chartBar: { width: 4, borderRadius: 2 },
  chartGain: { fontSize: 11, fontWeight: '700', color: C.green, marginLeft: 8 },
  portfolioSub: { fontSize: 9, fontWeight: '600', color: C.textDim, marginTop: 12, letterSpacing: 0.5 },

  /* Asset protection */
  assetRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  assetLabel: { fontSize: 12, color: C.textSub },
  assetStatus: { fontSize: 10, fontWeight: '700', color: C.amber },
  progressTrack: { height: 3, backgroundColor: C.surfaceHighest, borderRadius: 2, marginTop: 6, overflow: 'hidden' },
  progressFill: { height: 3, backgroundColor: C.amber, borderRadius: 2 },

  /* Gold card */
  goldLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.5, color: '#472A00' },
  goldBody: { fontSize: 13, fontWeight: '700', color: '#472A00', marginTop: 8, lineHeight: 20 },
  goldBtn: {
    backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 8, padding: 10,
    alignItems: 'center', marginTop: 14,
  },
  goldBtnText: { fontSize: 10, fontWeight: '900', color: '#472A00', letterSpacing: 1, textTransform: 'uppercase' },

  /* Sync badge */
  syncBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: C.green + '15', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4,
  },
  syncDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.green },
  syncText: { fontSize: 8, fontWeight: '700', color: C.green, letterSpacing: 0.5 },

  /* RE Holdings */
  reList: { gap: 6 },
  reRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.surfaceHighest, borderRadius: 10, padding: 14,
  },
  reIcon: { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  reLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: C.text },
  reCount: { fontSize: 17, fontWeight: '900' },

  /* Pillars */
  pillarGroup: { marginBottom: 16 },
  pillarLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1.5, color: C.textMuted, marginBottom: 8 },
  tagRow: { flexDirection: 'row', gap: 8 },
  pillarTag: {
    backgroundColor: C.surfaceHighest, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4,
    borderWidth: 1, borderColor: C.outlineVariant + '33',
  },
  pillarTagActive: { backgroundColor: C.green + '15', borderColor: 'transparent' },
  pillarTagText: { fontSize: 12, fontWeight: '500', color: C.text },
  pillarActiveDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: C.green, position: 'absolute', top: 4, right: 4 },
  watchRow: { flexDirection: 'row', alignItems: 'center' },
  watchText: { fontSize: 13, fontWeight: '500', color: C.text },

  /* Saved assets */
  assetCard: { width: 140, marginRight: 12 },
  assetThumb: {
    height: 100, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    marginBottom: 8, overflow: 'hidden',
  },
  assetTag: { fontSize: 8, fontWeight: '900', letterSpacing: 1.5, color: C.amber, marginBottom: 2 },
  assetName: { fontSize: 12, fontWeight: '700', color: C.text },

  /* Insight */
  insightBox: {
    backgroundColor: C.surfaceLow, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: C.amber + '15',
  },
  insightHeader: { fontSize: 9, fontWeight: '700', letterSpacing: 1.5, color: C.textMuted, marginBottom: 12, textTransform: 'uppercase' },
  insightRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  insightIcon: { fontSize: 12, color: C.textDim },
  insightText: { fontSize: 13, fontWeight: '500', color: C.text },
  insightFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  insightCount: { fontSize: 22, fontWeight: '900', color: C.text },
  insightTotal: { fontSize: 9, fontWeight: '700', letterSpacing: 1.5, color: C.amber },
});
