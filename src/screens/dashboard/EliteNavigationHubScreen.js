/* ═══════════════════════════════════════════════════
   SCREEN 7 — ELITE NAVIGATION HUB
   saintsal_elite_navigation_hub_wired → All 34 screens routed
   Colors: #0C0C0F bg · #F59E0B primary · Space Grotesk
═══════════════════════════════════════════════════ */
import React, { useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/AuthContext';

const AMBER  = '#F59E0B';
const GOLD   = '#D4AF37';
const BG     = '#0C0C0F';
const CARD   = '#16161A';
const BORDER = AMBER + '33';

/* Full wired navigation — all 34 screens */
const NAV_SECTIONS = [
  {
    title: 'Intelligence',
    items: [
      { icon: '⚡', label: 'Elite Intel Hub',        desc: 'Apollo · Perplexity · Tavily · Exa',  route: '/(stack)/elite-intelligence' },
      { icon: '🎯', label: 'My Arena',               desc: 'Full spectrum intelligence',           route: '/(stack)/full-spectrum-intel' },
      { icon: '🎨', label: 'Image + Vision Hub',     desc: 'DALL-E 3 · Tavily search',             route: '/(stack)/image-hub' },
      { icon: '🗺', label: 'Geo Master Hub',         desc: 'Geopolitical · Regional intelligence', route: '/(stack)/geo-master' },
    ],
  },
  {
    title: 'SAL Chat Suites',
    items: [
      { icon: '🎨', label: 'Creative Mastermind',    desc: 'Creative mode · DALL-E 3',             route: '/(stack)/sal-chat?mode=creative' },
      { icon: '📈', label: 'Strategic Analysis',     desc: 'Finance · Markets · Macro',            route: '/(stack)/sal-chat?mode=finance' },
      { icon: '🏠', label: 'Real Estate Executive',  desc: 'Deal analysis · Underwriting',         route: '/(stack)/sal-chat?mode=realestate' },
      { icon: '🌍', label: 'Global Intelligence',    desc: 'Geopolitical · Economic · Military',   route: '/(stack)/sal-chat?mode=global' },
    ],
  },
  {
    title: 'Builder',
    items: [
      { icon: '⚡', label: 'AI Planning Agent',      desc: 'HACP protocol · Architecture',         route: '/(stack)/builder-planning' },
      { icon: '💻', label: 'Builder IDE',            desc: 'Full-stack development suite',         route: '/(tabs)/builder' },
      { icon: '📱', label: 'Viewport Simulator',     desc: 'Preview · Build · Deploy',             route: '/(stack)/builder-viewport' },
      { icon: '🔌', label: 'Build Connections',      desc: 'API & database integrations',          route: '/(stack)/build-connections' },
    ],
  },
  {
    title: 'Social & Content',
    items: [
      { icon: '✨', label: 'Content Generator',      desc: 'Multi-platform · GPT-4o',              route: '/(stack)/social-content-gen' },
      { icon: '📱', label: 'Social Studio',          desc: 'Connections & publishing lab',         route: '/(stack)/social-studio' },
    ],
  },
  {
    title: 'Real Estate',
    items: [
      { icon: '🏡', label: 'Elite RE Finder',        desc: 'Tavily · Perplexity · AI analysis',    route: '/(stack)/elite-real-estate' },
      { icon: '📊', label: 'Investor Analysis',      desc: 'Portfolio · ROI · Deal analysis',      route: '/(stack)/investor-analysis' },
      { icon: '📋', label: 'RE Manifest',            desc: 'Portfolio manifest · AI analysis',      route: '/(stack)/re-manifest' },
    ],
  },
  {
    title: 'GHL & CRM',
    items: [
      { icon: '🤝', label: 'GHL Smart Bridge',       desc: 'Contacts · Pipelines · Snapshots',     route: '/(stack)/ghl-smart-bridge' },
    ],
  },
  {
    title: 'Platform',
    items: [
      { icon: '⚙️', label: 'Elite Connectors',       desc: 'Make · Zapier · Webhooks · N8N',       route: '/(stack)/elite-connectors' },
      { icon: '🪝', label: 'Hook In Workflow',        desc: 'SAL orchestration brain',              route: '/(stack)/hook-workflow' },
      { icon: '🏛️', label: 'Business Formation',     desc: 'LLC · Corp · EIN · Operating Agmt',    route: '/(stack)/business-formation' },
      { icon: '⚖️',  label: 'Legal & Compliance',    desc: 'Contracts · Privacy · Vault',          route: '/(stack)/legal-vault' },
      { icon: '🌐', label: 'Domains & SSL',          desc: 'GoDaddy Pro asset manager',            route: '/(stack)/domain-hub' },
      { icon: '🐙', label: 'GitHub Console',         desc: 'Repos · PRs · CI/CD',                  route: '/(stack)/github-console' },
      { icon: '💳', label: 'Pricing & Plans',        desc: 'Stripe billing & subscriptions',       route: '/(stack)/stripe-pricing' },
      { icon: '🛟', label: 'SAL Co-CEO Help',        desc: 'Executive AI advisor + support',       route: '/(stack)/help-ceo-desk' },
    ],
  },
];

export default function EliteNavigationHubScreen() {
  const router = useRouter();
  const { user, tier, computeLeft } = useAuth();
  const pingAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pingAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
        Animated.timing(pingAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <SafeAreaView style={s.safe}>
      {/* ── Header ── */}
      <View style={s.header}>
        <View style={s.avatarThumb}>
          <Text style={s.avatarTxt}>{user?.email?.charAt(0)?.toUpperCase() ?? 'S'}</Text>
        </View>
        <Text style={s.brandTxt}>SaintSal™</Text>
        <TouchableOpacity style={s.menuBtn} onPress={() => router.push('/(tabs)/dashboard')}>
          <Text style={s.menuIcon}>☰</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Hero */}
        <View style={s.hero}>
          <Text style={s.heroTitle}>Navigation Hub</Text>
          <Text style={s.heroSub}>SAINTSAL™ NEURAL ROUTER</Text>
        </View>

        {/* System status */}
        <View style={s.statusRow}>
          <View style={s.pingWrap}>
            <Animated.View style={[s.pingRing, { opacity: pingAnim }]} />
            <View style={s.pingDot} />
          </View>
          <Text style={s.statusTxt}>
            SYSTEM FULLY OPERATIONAL · {tier?.toUpperCase()} · {computeLeft} min compute left
          </Text>
        </View>

        {/* Nav sections */}
        {NAV_SECTIONS.map((section) => (
          <View key={section.title} style={s.sectionWrap}>
            <Text style={s.sectionLabel}>{section.title.toUpperCase()}</Text>
            {section.items.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={s.navCard}
                onPress={() => router.push(item.route)}
                activeOpacity={0.8}
              >
                <View style={s.navIconBox}>
                  <Text style={s.navIcon}>{item.icon}</Text>
                </View>
                <View style={s.navInfo}>
                  <Text style={s.navLabel}>{item.label}</Text>
                  <Text style={s.navDesc}>{item.desc}</Text>
                </View>
                <Text style={s.navChevron}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerTxt}>US Patent #10,290,222 · HACP Protocol™</Text>
          <Text style={s.footerSub}>SaintSal™ Labs · Intelligence. Amplified.</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Bottom Nav Bar ── */}
      <View style={s.bottomNav}>
        <TouchableOpacity style={s.navTabItem} onPress={() => router.push('/(tabs)/')}>
          <Text style={s.navTabIcon}>🏠</Text>
          <Text style={s.navTabLbl}>HOME</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navTabItem} onPress={() => router.push('/(tabs)/search')}>
          <Text style={s.navTabIcon}>🔍</Text>
          <Text style={s.navTabLbl}>SEARCH</Text>
        </TouchableOpacity>
        {/* Center FAB */}
        <TouchableOpacity
          style={s.fabCenter}
          onPress={() => router.push('/(tabs)/builder')}
          activeOpacity={0.85}
        >
          <Text style={s.fabCenterTxt}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navTabItem} onPress={() => router.push('/(stack)/portfolio')}>
          <Text style={s.navTabIcon}>📊</Text>
          <Text style={s.navTabLbl}>PORTFOLIO</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navTabItem} onPress={() => router.push('/(tabs)/settings')}>
          <Text style={s.navTabIcon}>👤</Text>
          <Text style={s.navTabLbl}>ACCOUNT</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: BG + 'CC', borderBottomWidth: 1, borderBottomColor: '#FFFFFF0A',
  },
  avatarThumb: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 1, borderColor: AMBER + '30',
    backgroundColor: AMBER + '15', alignItems: 'center', justifyContent: 'center',
  },
  avatarTxt: { fontSize: 16, fontWeight: '800', color: AMBER },
  brandTxt: { fontSize: 18, fontWeight: '800', color: AMBER, letterSpacing: 2 },
  menuBtn: { padding: 8 },
  menuIcon: { fontSize: 22, color: AMBER },
  scroll: { paddingHorizontal: 16, paddingBottom: 20 },
  hero: { paddingVertical: 28, alignItems: 'center' },
  heroTitle: { fontSize: 42, fontWeight: '300', color: AMBER, letterSpacing: -1 },
  heroSub: { fontSize: 9, fontWeight: '600', color: '#6B7280', letterSpacing: 3, marginTop: 6, textTransform: 'uppercase' },
  statusRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginBottom: 24, paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: '#22C55E18', borderRadius: 10, borderWidth: 1, borderColor: '#22C55E30',
  },
  pingWrap: { width: 12, height: 12, alignItems: 'center', justifyContent: 'center' },
  pingRing: {
    position: 'absolute', width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#22C55E', opacity: 0.5,
  },
  pingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E' },
  statusTxt: { fontSize: 9, fontWeight: '700', color: '#22C55E', letterSpacing: 1.2, flex: 1 },
  sectionWrap: { marginBottom: 20 },
  sectionLabel: {
    fontSize: 9, fontWeight: '800', color: AMBER + '80',
    letterSpacing: 2.5, marginBottom: 10, textTransform: 'uppercase',
  },
  navCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: CARD, borderWidth: 1, borderColor: BORDER,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14,
    marginBottom: 8,
  },
  navIconBox: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: AMBER + '18', alignItems: 'center', justifyContent: 'center',
  },
  navIcon: { fontSize: 22 },
  navInfo: { flex: 1, gap: 3 },
  navLabel: { fontSize: 15, fontWeight: '600', color: '#E8E6E1', lineHeight: 18 },
  navDesc: { fontSize: 11, color: '#6B7280' },
  navChevron: { fontSize: 20, color: '#333344', fontWeight: '300' },
  footer: { alignItems: 'center', paddingTop: 16, gap: 4 },
  footerTxt: { fontSize: 9, color: '#6B7280', letterSpacing: 1 },
  footerSub: { fontSize: 10, color: '#444455', letterSpacing: 0.5 },
  bottomNav: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
    backgroundColor: BG, borderTopWidth: 1, borderTopColor: '#FFFFFF08',
    paddingHorizontal: 20, paddingBottom: 28, paddingTop: 10,
  },
  navTabItem: { flex: 1, alignItems: 'center', gap: 3 },
  navTabIcon: { fontSize: 20 },
  navTabLbl: { fontSize: 8, fontWeight: '700', color: '#6B7280', letterSpacing: 1 },
  fabCenter: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: AMBER, alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
    shadowColor: AMBER, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  fabCenterTxt: { fontSize: 28, fontWeight: '300', color: BG, lineHeight: 32 },
});
