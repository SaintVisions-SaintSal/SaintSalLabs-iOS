/* ═══════════════════════════════════════════════════
   SAINTSALLABS — SAL™ HQ
   Personal Business Headquarters — Main Dashboard Tab
   US Patent #10,290,222 · HACP Protocol
   Sections:
     1. Profile Hero Card
     2. Quick Actions (horizontal scroll)
     3. Recent Activity (builds + chats)
     4. Business Overview (stat cards)
     5. Quick Settings
═══════════════════════════════════════════════════ */
import React, { useState, useEffect, useCallback } from 'react';
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
  Linking,
  Dimensions,
  Image,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUserDashboard } from '../../hooks/useUserDashboard';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabase';
import { MCP_BASE, MCP_KEY } from '../../lib/api';

/* ── Design Tokens ── */
const BG     = '#0A0A0A';
const CARD   = '#141416';
const GOLD   = '#D4AF37';
const GREEN  = '#22C55E';
const TEXT   = '#E8E6E1';
const MUTED  = 'rgba(255,255,255,0.4)';
const BORDER = 'rgba(255,255,255,0.06)';

const { width: SCREEN_W } = Dimensions.get('window');

/* ── Quick Actions config ── */
const QUICK_ACTIONS = [
  { icon: '🔍', label: 'Search',    route: '/(tabs)/index' },
  { icon: '🏗',  label: 'Builder',  route: '/(tabs)/builder' },
  { icon: '⚡', label: 'GHL Hub',  route: '/(stack)/ghl-intel-hub' },
  { icon: '💼', label: 'Career',   route: '/(stack)/career-suite' },
  { icon: '🏠', label: 'Real Est.', route: '/(stack)/elite-real-estate' },
  { icon: '📈', label: 'Finance',  route: '/(stack)/finance-chat' },
  { icon: '🃏', label: 'Cards',    route: '/(stack)/portfolio' },
  { icon: '⚙️', label: 'Settings', route: '/(stack)/api-settings' },
];

/* ── Tier badge label ── */
const tierLabel = (tier) => {
  const t = (tier || 'free').toLowerCase();
  if (t === 'max' || t === 'enterprise') return 'MAX';
  if (t === 'pro' || t === 'teams')      return 'PRO';
  return 'FREE';
};

/* ── Format relative date ── */
const fmtDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60)   return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

/* ═══════════════════════════════════════════════════
   MAIN SCREEN
═══════════════════════════════════════════════════ */
export default function SALHeadquarters() {
  const router = useRouter();
  const { signOut }  = useAuth();
  const {
    user,
    builds,
    conversations,
    imageCount,
    loading,
    displayName,
    displayEmail,
    tier,
    creditsUsed,
    creditsTotal,
    creditsLeft,
    getPortalUrl,
    refresh,
  } = useUserDashboard();

  /* ── Business profile from user_profiles ── */
  const [businessProfile, setBusinessProfile] = useState(null);
  const [profileLoading, setProfileLoading]   = useState(true);

  /* ── Refreshing state ── */
  const [refreshing, setRefreshing] = useState(false);

  /* ── Active quick-action route ── */
  const [activeRoute, setActiveRoute] = useState(null);

  /* ── Load user_profiles on mount or user change ── */
  const loadBusinessProfile = useCallback(async () => {
    if (!user?.id) { setProfileLoading(false); return; }
    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (!error && data) setBusinessProfile(data);
    } catch (e) {
      console.warn('SALHeadquarters: user_profiles fetch:', e?.message);
    } finally {
      setProfileLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { loadBusinessProfile(); }, [loadBusinessProfile]);

  /* ── Pull-to-refresh ── */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.allSettled([refresh(), loadBusinessProfile()]);
    setRefreshing(false);
  }, [refresh, loadBusinessProfile]);

  /* ── Credits progress bar width (0–1) ── */
  const creditsPct = creditsTotal > 0 ? Math.min(1, creditsUsed / creditsTotal) : 0;

  /* ── Handle Billing ── */
  const handleBilling = useCallback(async () => {
    try {
      const url = await getPortalUrl();
      if (url) await Linking.openURL(url);
    } catch (e) {
      Alert.alert('Billing', 'Unable to open billing portal. Please try again.');
    }
  }, [getPortalUrl]);

  /* ── Handle Sign Out ── */
  const handleSignOut = useCallback(async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/elite-auth');
          },
        },
      ]
    );
  }, [signOut, router]);

  /* ── Navigate quick action ── */
  const navigateTo = useCallback((route) => {
    setActiveRoute(route);
    router.push(route);
  }, [router]);

  /* ── Business name ── */
  const businessName =
    businessProfile?.business_name ||
    businessProfile?.company_name ||
    null;

  /* ── Tier badge color ── */
  const tierStr = tierLabel(tier);

  /* ════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════ */
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={GOLD}
            colors={[GOLD]}
          />
        }
      >

        {/* ════════════════════════════════════════════
            SECTION 1 — PROFILE HERO CARD
        ════════════════════════════════════════════ */}
        <View style={styles.heroCard}>
          {/* Top row: logo + name/email + tier badge */}
          <View style={styles.heroTop}>
            <View style={styles.heroLogoWrap}>
              <Image
                source={require('../../../assets/logo-80.png')}
                style={styles.heroLogo}
                resizeMode="contain"
              />
            </View>

            <View style={styles.heroInfo}>
              {loading ? (
                <ActivityIndicator color={GOLD} size="small" />
              ) : (
                <>
                  <Text style={styles.heroName} numberOfLines={1}>{displayName}</Text>
                  {businessName ? (
                    <Text style={styles.heroBusinessName} numberOfLines={1}>{businessName}</Text>
                  ) : null}
                  <Text style={styles.heroEmail} numberOfLines={1}>{displayEmail}</Text>
                </>
              )}
            </View>

            {/* Tier Badge */}
            <View style={styles.tierBadge}>
              <Text style={styles.tierBadgeText}>{tierStr}</Text>
            </View>
          </View>

          {/* Credits Progress Bar */}
          <View style={styles.creditsSection}>
            <View style={styles.creditsLabelRow}>
              <Text style={styles.creditsLabel}>CREDITS</Text>
              <Text style={styles.creditsValue}>
                {creditsUsed.toLocaleString()} / {creditsTotal.toLocaleString()}
              </Text>
            </View>
            <View style={styles.creditsBarTrack}>
              <View style={[styles.creditsBarFill, { width: `${Math.round(creditsPct * 100)}%` }]} />
            </View>
            <Text style={styles.creditsRemaining}>
              {creditsLeft.toLocaleString()} credits remaining
            </Text>
          </View>

          {/* Edit Business DNA button */}
          <TouchableOpacity
            style={styles.editDnaBtn}
            onPress={() => router.push('/(stack)/business-dna-setup')}
            activeOpacity={0.75}
          >
            <Text style={styles.editDnaBtnIcon}>✏</Text>
            <Text style={styles.editDnaBtnText}>Edit Business DNA</Text>
          </TouchableOpacity>
        </View>

        {/* ════════════════════════════════════════════
            SECTION 2 — QUICK ACTIONS
        ════════════════════════════════════════════ */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionBar} />
          <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.actionsScroll}
          style={styles.actionsScrollOuter}
        >
          {QUICK_ACTIONS.map((action, i) => {
            const isActive = activeRoute === action.route;
            return (
              <TouchableOpacity
                key={i}
                style={[styles.actionCard, isActive && styles.actionCardActive]}
                onPress={() => navigateTo(action.route)}
                activeOpacity={0.7}
              >
                <Text style={styles.actionIcon}>{action.icon}</Text>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ════════════════════════════════════════════
            SECTION 3 — RECENT ACTIVITY
        ════════════════════════════════════════════ */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionBar} />
          <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>
        </View>

        <View style={styles.activityRow}>
          {/* Left: Recent Builds */}
          <View style={styles.activityColumn}>
            <Text style={styles.activityColumnTitle}>Recent Builds</Text>
            {loading ? (
              <ActivityIndicator color={GOLD} size="small" style={{ marginTop: 12 }} />
            ) : builds.length === 0 ? (
              <View style={styles.activityEmpty}>
                <Text style={styles.activityEmptyIcon}>🏗</Text>
                <Text style={styles.activityEmptyText}>No builds yet</Text>
              </View>
            ) : (
              builds.slice(0, 3).map((build, i) => (
                <View key={build.id || i} style={styles.activityMiniCard}>
                  <Text style={styles.activityMiniName} numberOfLines={1}>
                    {build.name || build.project_name || 'Untitled Build'}
                  </Text>
                  <Text style={styles.activityMiniDate}>
                    {fmtDate(build.updated_at || build.created_at)}
                  </Text>
                </View>
              ))
            )}
          </View>

          {/* Right: Recent Chats */}
          <View style={styles.activityColumn}>
            <Text style={styles.activityColumnTitle}>Recent Chats</Text>
            {loading ? (
              <ActivityIndicator color={GOLD} size="small" style={{ marginTop: 12 }} />
            ) : conversations.length === 0 ? (
              <View style={styles.activityEmpty}>
                <Text style={styles.activityEmptyIcon}>💬</Text>
                <Text style={styles.activityEmptyText}>No chats yet</Text>
              </View>
            ) : (
              conversations.slice(0, 3).map((convo, i) => (
                <View key={convo.id || i} style={styles.activityMiniCard}>
                  <Text style={styles.activityMiniName} numberOfLines={1}>
                    {convo.title || 'Untitled Chat'}
                  </Text>
                  <Text style={styles.activityMiniDate}>
                    {fmtDate(convo.updated_at || convo.created_at)}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>

        {/* ════════════════════════════════════════════
            SECTION 4 — BUSINESS OVERVIEW
        ════════════════════════════════════════════ */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionBar} />
          <Text style={styles.sectionTitle}>BUSINESS OVERVIEW</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>CREDITS</Text>
            <Text style={styles.statValue} numberOfLines={1}>
              {creditsLeft.toLocaleString()}
            </Text>
            <Text style={styles.statSub}>/ {creditsTotal.toLocaleString()}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>BUILDS</Text>
            <Text style={styles.statValue}>{builds.length}</Text>
            <Text style={styles.statSub}>projects</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>IMAGES</Text>
            <Text style={styles.statValue}>{imageCount}</Text>
            <Text style={styles.statSub}>generated</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.billingBtn}
          onPress={handleBilling}
          activeOpacity={0.75}
        >
          <Text style={styles.billingBtnIcon}>💳</Text>
          <Text style={styles.billingBtnText}>Manage Billing</Text>
        </TouchableOpacity>

        {/* ════════════════════════════════════════════
            SECTION 5 — QUICK SETTINGS
        ════════════════════════════════════════════ */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionBar} />
          <Text style={styles.sectionTitle}>QUICK SETTINGS</Text>
        </View>

        <View style={styles.settingsRow}>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => router.push('/(stack)/api-settings')}
            activeOpacity={0.75}
          >
            <Text style={styles.settingsBtnIcon}>🔑</Text>
            <Text style={styles.settingsBtnText}>API Keys</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => router.push('/(stack)/business-dna-setup')}
            activeOpacity={0.75}
          >
            <Text style={styles.settingsBtnIcon}>🧬</Text>
            <Text style={styles.settingsBtnText}>Business DNA</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => router.push('/(stack)/pricing')}
            activeOpacity={0.75}
          >
            <Text style={styles.settingsBtnIcon}>⚡</Text>
            <Text style={styles.settingsBtnText}>Pricing</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingsBtn, styles.settingsBtnDanger]}
            onPress={handleSignOut}
            activeOpacity={0.75}
          >
            <Text style={styles.settingsBtnIcon}>🚪</Text>
            <Text style={[styles.settingsBtnText, styles.settingsBtnTextDanger]}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* ── Patent Footer ── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            SaintSal™ LABS · Patent #10,290,222 · HACP Protocol
          </Text>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ═══════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════ */
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },
  scroll: {
    flex: 1,
    backgroundColor: BG,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 20,
  },

  /* ── Section headers ── */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 28,
    marginBottom: 14,
  },
  sectionBar: {
    width: 4,
    height: 20,
    backgroundColor: GOLD,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: TEXT,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  /* ════════════════════════════════════════════
     SECTION 1 — PROFILE HERO CARD
  ════════════════════════════════════════════ */
  heroCard: {
    backgroundColor: CARD,
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  heroLogoWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: GOLD + '18',
    borderWidth: 1,
    borderColor: GOLD + '33',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroLogo: {
    width: 24,
    height: 24,
  },
  heroInfo: {
    flex: 1,
    gap: 2,
  },
  heroName: {
    fontSize: 17,
    fontWeight: '800',
    color: TEXT,
    letterSpacing: -0.3,
  },
  heroBusinessName: {
    fontSize: 12,
    fontWeight: '600',
    color: GOLD,
    marginTop: 1,
  },
  heroEmail: {
    fontSize: 11,
    color: MUTED,
    marginTop: 1,
  },

  /* Tier Badge */
  tierBadge: {
    backgroundColor: GOLD,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  tierBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#0A0A0A',
    letterSpacing: 2,
  },

  /* Credits */
  creditsSection: {
    marginBottom: 16,
  },
  creditsLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  creditsLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: MUTED,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  creditsValue: {
    fontSize: 11,
    fontWeight: '700',
    color: GOLD,
  },
  creditsBarTrack: {
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  creditsBarFill: {
    height: '100%',
    backgroundColor: GOLD,
    borderRadius: 3,
  },
  creditsRemaining: {
    fontSize: 10,
    color: MUTED,
    marginTop: 6,
  },

  /* Edit DNA button */
  editDnaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: GOLD + '55',
    borderRadius: 10,
    paddingVertical: 11,
    backgroundColor: GOLD + '0D',
  },
  editDnaBtnIcon: {
    fontSize: 14,
    color: GOLD,
  },
  editDnaBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: GOLD,
    letterSpacing: 0.5,
  },

  /* ════════════════════════════════════════════
     SECTION 2 — QUICK ACTIONS
  ════════════════════════════════════════════ */
  actionsScrollOuter: {
    marginLeft: -18,
    marginRight: -18,
  },
  actionsScroll: {
    paddingLeft: 18,
    paddingRight: 10,
    gap: 10,
  },
  actionCard: {
    width: 68,
    height: 78,
    backgroundColor: CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionCardActive: {
    borderColor: GOLD,
    backgroundColor: GOLD + '12',
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: MUTED,
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  /* ════════════════════════════════════════════
     SECTION 3 — RECENT ACTIVITY
  ════════════════════════════════════════════ */
  activityRow: {
    flexDirection: 'row',
    gap: 12,
  },
  activityColumn: {
    flex: 1,
    backgroundColor: CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    minHeight: 120,
  },
  activityColumnTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: GOLD,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  activityMiniCard: {
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    marginBottom: 1,
  },
  activityMiniName: {
    fontSize: 12,
    fontWeight: '600',
    color: TEXT,
    marginBottom: 2,
  },
  activityMiniDate: {
    fontSize: 10,
    color: MUTED,
  },
  activityEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    gap: 6,
  },
  activityEmptyIcon: {
    fontSize: 22,
    opacity: 0.4,
  },
  activityEmptyText: {
    fontSize: 11,
    color: MUTED,
    fontStyle: 'italic',
  },

  /* ════════════════════════════════════════════
     SECTION 4 — BUSINESS OVERVIEW
  ════════════════════════════════════════════ */
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: MUTED,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: GOLD,
    letterSpacing: -0.5,
  },
  statSub: {
    fontSize: 9,
    color: MUTED,
    marginTop: 3,
  },
  billingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: GOLD + '14',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: GOLD + '44',
    paddingVertical: 14,
    marginBottom: 4,
  },
  billingBtnIcon: {
    fontSize: 16,
  },
  billingBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: GOLD,
    letterSpacing: 0.5,
  },

  /* ════════════════════════════════════════════
     SECTION 5 — QUICK SETTINGS
  ════════════════════════════════════════════ */
  settingsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  settingsBtn: {
    flex: 1,
    backgroundColor: CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 5,
  },
  settingsBtnDanger: {
    borderColor: 'rgba(239,68,68,0.25)',
    backgroundColor: 'rgba(239,68,68,0.07)',
  },
  settingsBtnIcon: {
    fontSize: 18,
  },
  settingsBtnText: {
    fontSize: 9,
    fontWeight: '700',
    color: MUTED,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  settingsBtnTextDanger: {
    color: 'rgba(239,68,68,0.8)',
  },

  /* ── Footer ── */
  footer: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 4,
  },
  footerText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.2)',
    letterSpacing: 1.5,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
