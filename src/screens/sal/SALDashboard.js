/* ═══════════════════════════════════════════════════
   SAL™ TAB — Personalized Dashboard (Build #68)
   Tab 3 (center gold icon)
   New users: "Build Your SAL" onboarding prompt
   Returning users: 3 DNA verticals + recent chats + saved
═══════════════════════════════════════════════════ */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Image, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';

const GOLD = '#D4AF37';
const BG = '#0A0A0A';
const CARD = '#141416';

const DNA_CONFIG = {
  'Real Estate':   { icon: '🏠', color: '#22C55E', route: '/(stack)/elite-real-estate',  dataLabel: 'Latest Listings' },
  'Finance':       { icon: '📈', color: '#3B82F6', route: '/(stack)/finance-chat',        dataLabel: 'Market Watch' },
  'Sports':        { icon: '🏀', color: '#F97316', route: '/(stack)/elite-intelligence',  dataLabel: 'Live Scores' },
  'Collectibles':  { icon: '🃏', color: '#A855F7', route: '/(stack)/portfolio',            dataLabel: 'Portfolio Alerts' },
  'Tech':          { icon: '💻', color: '#06B6D4', route: '/(stack)/elite-intel-hub',     dataLabel: 'Trending Topics' },
  'News':          { icon: '📰', color: '#EF4444', route: '/(stack)/full-spectrum-intel', dataLabel: 'Breaking Stories' },
  'Medical':       { icon: '🏥', color: '#14B8A6', route: '/(stack)/full-spectrum-v2',    dataLabel: 'Research Updates' },
  'Business':      { icon: '🏢', color: '#F59E0B', route: '/(stack)/home-base-command',   dataLabel: 'Pipeline Summary' },
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function SALDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState(null);
  const [interests, setInterests] = useState([]);
  const [onboarded, setOnboarded] = useState(null); // null = loading
  const [refreshing, setRefreshing] = useState(false);
  const [displayName, setDisplayName] = useState('');

  const loadProfile = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setOnboarded(false);
        return;
      }
      setUser(session.user);

      const { data: profile } = await supabase
        .from('profiles')
        .select('interests, onboarding_complete, name, avatar_url, business_name')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setInterests(profile.interests || []);
        setOnboarded(profile.onboarding_complete || false);
        setDisplayName(profile.name || session.user.email?.split('@')[0] || 'there');
      } else {
        setOnboarded(false);
      }
    } catch {
      setOnboarded(false);
    }
  }, []);

  useEffect(() => { loadProfile(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  }, [loadProfile]);

  // Not logged in or not onboarded → show "Build Your SAL"
  if (onboarded === null) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.loadingWrap}>
          <Text style={{ fontSize: 40 }}>🤖</Text>
          <Text style={s.loadingText}>Loading your SAL...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user || !onboarded) {
    return (
      <SafeAreaView style={[s.container, { paddingTop: insets.top }]}>
        <ScrollView contentContainerStyle={s.onboardWrap}>
          <View style={s.salIconLarge}>
            <Text style={{ fontSize: 56 }}>🤖</Text>
          </View>
          <Text style={s.onboardTitle}>Build Your SAL™</Text>
          <Text style={s.onboardSub}>
            Pick your 3 intelligence areas and SAL personalizes everything for you — 
            your dashboard, chat context, and recommendations.
          </Text>
          <TouchableOpacity
            style={s.goldBtn}
            onPress={() => router.push('/(stack)/onboarding-welcome')}
          >
            <Text style={s.goldBtnText}>Get Started →</Text>
          </TouchableOpacity>
          {!user && (
            <TouchableOpacity
              style={s.ghostBtn}
              onPress={() => router.push('/(auth)/elite-auth')}
            >
              <Text style={s.ghostBtnText}>Sign in to your SAL</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Onboarded user — show personalized dashboard
  return (
    <SafeAreaView style={[s.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={GOLD} />}
      >
        {/* Header */}
        <View style={s.header}>
          <View style={s.avatarWrap}>
            <Text style={{ fontSize: 28 }}>🤖</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={s.greeting}>{getGreeting()}, {displayName}</Text>
            <View style={s.dnaRow}>
              {interests.map((interest, i) => {
                const cfg = DNA_CONFIG[interest] || { icon: '✨', color: GOLD };
                return (
                  <View key={i} style={[s.dnaPill, { backgroundColor: cfg.color + '20', borderColor: cfg.color + '40' }]}>
                    <Text style={{ fontSize: 12 }}>{cfg.icon}</Text>
                    <Text style={[s.dnaPillText, { color: cfg.color }]}>{interest}</Text>
                  </View>
                );
              })}
            </View>
          </View>
          <TouchableOpacity onPress={() => router.push('/(stack)/business-dna-setup')}>
            <Text style={s.editDna}>Edit DNA</Text>
          </TouchableOpacity>
        </View>

        {/* DNA Vertical Cards */}
        <Text style={s.sectionTitle}>Your Intelligence</Text>
        {interests.map((interest, i) => {
          const cfg = DNA_CONFIG[interest] || { icon: '✨', color: GOLD, route: '/(tabs)', dataLabel: 'Data' };
          return (
            <TouchableOpacity
              key={i}
              style={s.verticalCard}
              onPress={() => router.push(cfg.route)}
              activeOpacity={0.8}
            >
              <View style={[s.verticalIcon, { backgroundColor: cfg.color + '15' }]}>
                <Text style={{ fontSize: 28 }}>{cfg.icon}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={s.verticalTitle}>{interest}</Text>
                <Text style={s.verticalSub}>{cfg.dataLabel}</Text>
                <View style={s.verticalDataRow}>
                  <View style={[s.liveIndicator, { backgroundColor: cfg.color }]} />
                  <Text style={[s.liveText, { color: cfg.color }]}>Live data available</Text>
                </View>
              </View>
              <Text style={s.chevron}>›</Text>
            </TouchableOpacity>
          );
        })}

        {/* Quick Actions */}
        <Text style={s.sectionTitle}>Quick Actions</Text>
        <View style={s.quickRow}>
          <TouchableOpacity style={s.quickCard} onPress={() => router.push('/(tabs)')}>
            <Text style={{ fontSize: 24 }}>💬</Text>
            <Text style={s.quickLabel}>Chat with SAL</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.quickCard} onPress={() => router.push('/(tabs)/builder')}>
            <Text style={{ fontSize: 24 }}>⚡</Text>
            <Text style={s.quickLabel}>Builder</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.quickCard} onPress={() => router.push('/(tabs)/social')}>
            <Text style={{ fontSize: 24 }}>𝕏</Text>
            <Text style={s.quickLabel}>Social</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Chats placeholder */}
        <Text style={s.sectionTitle}>Recent Conversations</Text>
        <View style={s.emptyCard}>
          <Text style={s.emptyIcon}>💬</Text>
          <Text style={s.emptyText}>Your recent chats will appear here</Text>
          <TouchableOpacity style={s.smallGoldBtn} onPress={() => router.push('/(tabs)')}>
            <Text style={s.smallGoldBtnText}>Start Chatting</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 12 },

  // Onboard CTA
  onboardWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, paddingTop: 80 },
  salIconLarge: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(212,175,55,0.12)', borderWidth: 2, borderColor: GOLD,
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
    shadowColor: GOLD, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 20,
  },
  onboardTitle: { fontSize: 28, fontWeight: '900', color: '#fff', marginBottom: 12, textAlign: 'center' },
  onboardSub: { fontSize: 15, color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 22, marginBottom: 32, maxWidth: 300 },
  goldBtn: {
    backgroundColor: GOLD, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 48,
    marginBottom: 16, width: '100%', alignItems: 'center',
  },
  goldBtnText: { fontSize: 17, fontWeight: '800', color: BG },
  ghostBtn: { paddingVertical: 12 },
  ghostBtnText: { fontSize: 14, color: 'rgba(255,255,255,0.4)' },

  // Dashboard
  header: {
    flexDirection: 'row', alignItems: 'center', padding: 20,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  avatarWrap: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(212,175,55,0.12)', borderWidth: 2, borderColor: GOLD,
    alignItems: 'center', justifyContent: 'center',
  },
  greeting: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 6 },
  dnaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  dnaPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
    borderWidth: 1,
  },
  dnaPillText: { fontSize: 10, fontWeight: '700' },
  editDna: { fontSize: 12, color: 'rgba(255,255,255,0.3)' },

  sectionTitle: {
    fontSize: 14, fontWeight: '800', color: 'rgba(255,255,255,0.35)',
    letterSpacing: 1, textTransform: 'uppercase', marginTop: 24, marginBottom: 12, marginLeft: 20,
  },

  verticalCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: CARD, borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  verticalIcon: {
    width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
  },
  verticalTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 2 },
  verticalSub: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 4 },
  verticalDataRow: { flexDirection: 'row', alignItems: 'center' },
  liveIndicator: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  liveText: { fontSize: 11, fontWeight: '600' },
  chevron: { fontSize: 24, color: 'rgba(255,255,255,0.2)' },

  quickRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16 },
  quickCard: {
    flex: 1, backgroundColor: CARD, borderRadius: 14, padding: 16, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  quickLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginTop: 8 },

  emptyCard: {
    backgroundColor: CARD, borderRadius: 16, padding: 24, marginHorizontal: 16,
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  emptyIcon: { fontSize: 32, marginBottom: 8 },
  emptyText: { fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 16 },
  smallGoldBtn: {
    backgroundColor: 'rgba(212,175,55,0.15)', borderRadius: 10,
    paddingVertical: 8, paddingHorizontal: 20, borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)',
  },
  smallGoldBtnText: { fontSize: 13, fontWeight: '700', color: GOLD },
});
