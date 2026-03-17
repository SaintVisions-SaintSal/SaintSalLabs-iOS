/* ═══════════════════════════════════════════════════
   SAINTSAL LABS — NAVIGATION HUB
   saintsal_elite_navigation_hub_wired — All 34+ screens
═══════════════════════════════════════════════════ */
import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, StatusBar, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

const GOLD = '#D4AF37';
const BLACK = '#0F0F0F';
const SURFACE = 'rgba(255,255,255,0.04)';
const BORDER = 'rgba(255,255,255,0.08)';
const GOLD_DIM = 'rgba(212,175,55,0.1)';
const MUTED = 'rgba(255,255,255,0.5)';
const CARD_BG = '#161616';

const NAV_CATEGORIES = [
  {
    id: 'ai-chat',
    label: 'AI CHAT',
    icon: '💬',
    screens: [
      { label: 'SAL Chat', sub: 'Strategic AI companion', route: '/sal-chat', icon: '🧠' },
      { label: 'Creative Mastermind', sub: 'Creative ideation mode', route: '/creative-chat', icon: '🎨' },
      { label: 'Global Intelligence', sub: 'World insights via Grok', route: '/global-intel-chat', icon: '🌐' },
      { label: 'RE Executive Chat', sub: 'Real estate intelligence', route: '/re-executive-chat', icon: '🏙️' },
      { label: 'Finance Chat', sub: 'Market & investment AI', route: '/finance-chat', icon: '📈' },
    ],
  },
  {
    id: 'intelligence',
    label: 'INTELLIGENCE',
    icon: '🔮',
    screens: [
      { label: 'Elite Intel Hub', sub: 'Full spectrum intelligence', route: '/elite-intel-hub', icon: '⚡' },
      { label: 'Full Spectrum', sub: 'Deep research & analysis', route: '/full-spectrum-v2', icon: '🔬' },
      { label: 'Image Hub', sub: 'AI image generation', route: '/image-hub-v2', icon: '🖼️' },
      { label: 'Geo Master Hub', sub: 'Maps & geo intelligence', route: '/geo-master', icon: '🗺️' },
      { label: 'Search Intelligence', sub: 'Gemini-powered search', route: '/elite-intelligence', icon: '🔍' },
    ],
  },
  {
    id: 'real-estate',
    label: 'REAL ESTATE',
    icon: '🏡',
    screens: [
      { label: 'Elite RE Finder', sub: 'AI property discovery', route: '/elite-re-finder', icon: '🔍' },
      { label: 'RE Suite', sub: 'Full real estate dashboard', route: '/re-manifest', icon: '📊' },
      { label: 'Portfolio', sub: 'Investment portfolio', route: '/portfolio', icon: '💼' },
      { label: 'Investor Analysis', sub: 'Deal analysis AI', route: '/investor-analysis', icon: '📐' },
    ],
  },
  {
    id: 'social',
    label: 'SOCIAL STUDIO',
    icon: '📲',
    screens: [
      { label: 'Social Studio', sub: 'Content command center', route: '/social-studio-v2', icon: '🎬' },
      { label: 'Content Generator', sub: 'AI content creation', route: '/content-generator', icon: '✍️' },
      { label: 'Social Connections', sub: 'Platform integrations', route: '/social-connections', icon: '🔗' },
    ],
  },
  {
    id: 'builder',
    label: 'BUILDER',
    icon: '🏗️',
    screens: [
      { label: 'High Fidelity IDE', sub: 'Full-stack development', route: '/high-fidelity-ide', icon: '💻' },
      { label: 'AI Planning Agent', sub: 'Architect with Claude', route: '/ai-planning-agent', icon: '🤖' },
      { label: 'Builder Viewport', sub: 'Preview sites live', route: '/builder-viewport', icon: '📱' },
      { label: 'Build Connections', sub: 'API integrations hub', route: '/build-connections', icon: '🔌' },
      { label: 'Connectors Hub', sub: 'Service connectors', route: '/connectors-hub', icon: '🔗' },
    ],
  },
  {
    id: 'platform',
    label: 'PLATFORM',
    icon: '⚙️',
    screens: [
      { label: 'GHL Bridge', sub: 'CRM & pipeline hub', route: '/ghl-smart-bridge-v2', icon: '📞' },
      { label: 'Domain & SSL', sub: 'GoDaddy domain manager', route: '/domain-ssl-command', icon: '🌐' },
      { label: 'Business Formation', sub: 'CorpNet entity filing', route: '/business-formation', icon: '🏢' },
      { label: 'Legal Vault', sub: 'Compliance & contracts', route: '/legal-vault', icon: '⚖️' },
      { label: 'GitHub Console', sub: 'Repo management', route: '/github-console-v2', icon: '👾' },
      { label: 'Hook Workflow', sub: 'Automation builder', route: '/hook-workflow', icon: '⚡' },
      { label: 'Co-CEO Desk', sub: 'Executive AI assistant', route: '/help-ceo-desk', icon: '👔' },
      { label: 'Elite Connectors', sub: 'Premium integrations', route: '/elite-connectors', icon: '🔮' },
    ],
  },
  {
    id: 'payments',
    label: 'PAYMENTS',
    icon: '💰',
    screens: [
      { label: 'Pricing Plans', sub: 'SaintSal subscriptions', route: '/pricing', icon: '💎' },
      { label: 'Stripe Pricing', sub: 'Live Stripe checkout', route: '/stripe-pricing', icon: '💳' },
      { label: 'Credit Top-Up', sub: 'Add compute credits', route: '/credit-topup', icon: '⚡' },
    ],
  },
];

export default function NavigationHub() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user));
  }, []);

  const allScreens = NAV_CATEGORIES.flatMap(cat => cat.screens.map(s => ({ ...s, category: cat.label })));
  const filteredScreens = search.trim()
    ? allScreens.filter(s =>
        s.label.toLowerCase().includes(search.toLowerCase()) ||
        s.sub.toLowerCase().includes(search.toLowerCase()) ||
        s.category.toLowerCase().includes(search.toLowerCase())
      )
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BLACK} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{user?.email?.[0]?.toUpperCase() || 'S'}</Text>
          </View>
        </View>
        <Text style={styles.headerTitle}>SaintSal™</Text>
        <TouchableOpacity style={styles.menuBtn} onPress={() => router.push('/(tabs)')}>
          <Text style={styles.menuIcon}>≡</Text>
        </TouchableOpacity>
      </View>

      {/* Hero */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>Navigation Hub</Text>
        <Text style={styles.heroSub}>SAINTSAL™ NEURAL ROUTER</Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search screens..."
          placeholderTextColor={MUTED}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.searchClear}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Search results */}
        {filteredScreens ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>RESULTS ({filteredScreens.length})</Text>
            {filteredScreens.map((screen, i) => (
              <NavCard key={i} screen={screen} router={router} />
            ))}
            {filteredScreens.length === 0 && (
              <Text style={styles.noResults}>No screens found for "{search}"</Text>
            )}
          </View>
        ) : (
          NAV_CATEGORIES.map((cat) => (
            <View key={cat.id} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionIcon}>{cat.icon}</Text>
                <Text style={styles.sectionLabel}>{cat.label}</Text>
                <View style={styles.sectionLine} />
              </View>
              {cat.screens.map((screen, i) => (
                <NavCard key={i} screen={screen} router={router} />
              ))}
            </View>
          ))
        )}

        {/* Status indicator */}
        <View style={styles.statusRow}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>SYSTEM FULLY OPERATIONAL // ID: SAINT_SAL_BETA_1.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function NavCard({ screen, router }) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(screen.route)}
      activeOpacity={0.75}
    >
      <View style={styles.cardIcon}>
        <Text style={styles.cardIconText}>{screen.icon}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{screen.label}</Text>
        <Text style={styles.cardSub}>{screen.sub}</Text>
      </View>
      <Text style={styles.cardArrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0C0C0F' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderBottomWidth: 1, borderBottomColor: BORDER,
    backgroundColor: 'rgba(12,12,15,0.8)',
  },
  headerLeft: {},
  avatarCircle: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: GOLD_DIM,
    borderWidth: 1, borderColor: `${GOLD}33`, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: GOLD, fontWeight: '700', fontSize: 16, fontFamily: 'PublicSans-Bold' },
  headerTitle: { color: GOLD, fontWeight: '700', fontSize: 20, letterSpacing: 3, fontFamily: 'PublicSans-Bold' },
  menuBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  menuIcon: { color: GOLD, fontSize: 24 },
  heroSection: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 8 },
  heroTitle: { color: GOLD, fontSize: 40, fontWeight: '300', letterSpacing: -1, fontFamily: 'PublicSans-Light' },
  heroSub: { color: MUTED, fontSize: 10, fontWeight: '500', letterSpacing: 5, marginTop: 4, fontFamily: 'PublicSans-Bold' },
  searchWrapper: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, marginVertical: 12,
    backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER,
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, color: '#fff', fontSize: 14, fontFamily: 'PublicSans-Regular' },
  searchClear: { color: MUTED, fontSize: 14, padding: 4 },
  scroll: { paddingHorizontal: 16, paddingBottom: 40 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionIcon: { fontSize: 16 },
  sectionLabel: { color: MUTED, fontSize: 10, fontWeight: '700', letterSpacing: 3, fontFamily: 'PublicSans-Bold' },
  sectionLine: { flex: 1, height: 1, backgroundColor: BORDER },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16,
    backgroundColor: CARD_BG, borderWidth: 1, borderColor: `${GOLD}1A`,
    borderRadius: 12, marginBottom: 8,
  },
  cardIcon: {
    width: 48, height: 48, borderRadius: 10, backgroundColor: GOLD_DIM,
    alignItems: 'center', justifyContent: 'center',
  },
  cardIconText: { fontSize: 22 },
  cardContent: { flex: 1 },
  cardTitle: { color: '#e5e7eb', fontWeight: '600', fontSize: 15, fontFamily: 'PublicSans-Bold' },
  cardSub: { color: 'rgba(107,114,128,1)', fontSize: 12, marginTop: 2, fontFamily: 'PublicSans-Regular' },
  cardArrow: { color: 'rgba(55,65,81,1)', fontSize: 20 },
  noResults: { color: MUTED, fontSize: 14, textAlign: 'center', paddingVertical: 24, fontFamily: 'PublicSans-Regular' },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 24 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' },
  statusText: { color: '#22c55e', fontSize: 9, fontFamily: 'PublicSans-Regular', letterSpacing: 2 },
});
