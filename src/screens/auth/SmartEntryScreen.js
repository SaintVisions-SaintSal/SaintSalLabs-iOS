/* ═══════════════════════════════════════════════════
   SAINTSALLABS — SMART ENTRY SCREEN
   Frictionless first-screen: 3 paths × 3 user states
   First time · Guest returning · Logged in returning
═══════════════════════════════════════════════════ */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Animated, Modal, StatusBar, ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';

/* ── Design Tokens ───────────────────────────────── */
const GOLD        = '#D4AF37';
const BLACK       = '#0F0F0F';
const SURFACE     = 'rgba(255,255,255,0.04)';
const BORDER      = 'rgba(255,255,255,0.08)';
const GOLD_BORDER = 'rgba(212,175,55,0.22)';
const GOLD_DIM    = 'rgba(212,175,55,0.1)';
const MUTED       = 'rgba(255,255,255,0.5)';
const DIM         = 'rgba(255,255,255,0.2)';

const LABS_API = 'https://www.saintsallabs.com';

/* ── Pulse animation hook ────────────────────────── */
function usePulse(duration = 2000) {
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1.02, duration: duration / 2, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1.0,  duration: duration / 2, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return anim;
}

/* ── Compute bar ─────────────────────────────────── */
function ComputeBar({ minutesLeft, limit }) {
  const pct = limit > 0 ? Math.max(0, Math.min(1, minutesLeft / limit)) : 0;
  const barWidth = useRef(new Animated.Value(pct)).current;
  useEffect(() => {
    Animated.timing(barWidth, { toValue: pct, duration: 600, useNativeDriver: false }).start();
  }, [pct]);
  return (
    <View style={styles.computeWrap}>
      <View style={styles.computeRow}>
        <Text style={styles.computeLabel}>⚡ Compute</Text>
        <Text style={styles.computeValue}>{Math.round(minutesLeft)} / {limit} min</Text>
      </View>
      <View style={styles.computeTrack}>
        <Animated.View
          style={[
            styles.computeFill,
            { width: barWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
          ]}
        />
      </View>
    </View>
  );
}

/* ── Feature card ────────────────────────────────── */
function FeatureCard({ icon, title, subtitle, onPress, pulse }) {
  return (
    <Animated.View style={{ transform: [{ scale: pulse }] }}>
      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
        <Text style={styles.cardIcon}>{icon}</Text>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>{title}</Text>
          {!!subtitle && <Text style={styles.cardSub}>{subtitle}</Text>}
        </View>
        <Text style={styles.cardArrow}>›</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

/* ── Guest Gate Modal ────────────────────────────── */
function GuestGateModal({ visible, onClose, router, hard = false }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>
            {hard ? '🔒 Compute limit reached' : 'Save your work & unlock more'}
          </Text>
          <Text style={styles.sheetSub}>
            {hard
              ? "You've used 30 minutes of free compute. Create a free account to get 100 more minutes."
              : 'Create a free account to save builds, access history, and get 100 min compute free.'}
          </Text>
          <TouchableOpacity
            style={styles.sheetPrimary}
            onPress={() => { onClose(); router.push('/(auth)/signup'); }}
          >
            <Text style={styles.sheetPrimaryTxt}>Create Free Account</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sheetSecondary}
            onPress={() => { onClose(); router.push('/(auth)/login'); }}
          >
            <Text style={styles.sheetSecondaryTxt}>Sign In</Text>
          </TouchableOpacity>
          {!hard && (
            <TouchableOpacity style={styles.sheetGhost} onPress={onClose}>
              <Text style={styles.sheetGhostTxt}>Continue as Guest</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

/* ══════════════════════════════════════════════════
   MAIN SCREEN
══════════════════════════════════════════════════ */
export default function SmartEntryScreen() {
  const router = useRouter();
  const { mode: modeParam } = useLocalSearchParams();

  const [viewMode, setViewMode]       = useState(null); // 'first-time' | 'returning' | 'guest-returning'
  const [loading, setLoading]         = useState(true);
  const [profile, setProfile]         = useState(null);
  const [session, setSession]         = useState(null);
  const [quota, setQuota]             = useState({ minutesLeft: 100, limit: 100 });
  const [lastConvo, setLastConvo]     = useState(null);
  const [lastBuild, setLastBuild]     = useState(null);
  const [guestMessages, setGuestMessages] = useState(0);
  const [guestMinutes, setGuestMinutes]   = useState(0);
  const [gateVisible, setGateVisible]     = useState(false);
  const [hardGate, setHardGate]           = useState(false);

  const pulse = usePulse(2000);

  /* ── Boot sequence ─────────────────────────────── */
  useEffect(() => {
    boot();
  }, []);

  const boot = async () => {
    try {
      const { data: { session: s } } = await supabase.auth.getSession();
      const [hasVisited, lc, lb, gm, gmin] = await Promise.all([
        AsyncStorage.getItem('sal_has_visited'),
        AsyncStorage.getItem('sal_last_convo'),
        AsyncStorage.getItem('sal_last_build'),
        AsyncStorage.getItem('sal_guest_messages'),
        AsyncStorage.getItem('sal_guest_minutes'),
      ]);

      setLastConvo(lc);
      setLastBuild(lb);
      setGuestMessages(parseInt(gm || '0'));
      setGuestMinutes(parseFloat(gmin || '0'));

      if (s) {
        setSession(s);
        // Load profile
        const { data: prof } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', s.user.id)
          .single();
        setProfile(prof);

        // Fetch live quota
        try {
          const qRes = await fetch(`${LABS_API}/api/builder/compute-quota`, {
            headers: { Authorization: `Bearer ${s.access_token}` },
          });
          if (qRes.ok) {
            const q = await qRes.json();
            setQuota({ minutesLeft: q.minutesLeft ?? 100, limit: q.limit ?? 100 });
          }
        } catch {}

        setViewMode('returning');
      } else if (hasVisited) {
        setViewMode('guest-returning');
      } else {
        await AsyncStorage.setItem('sal_has_visited', 'true');
        setViewMode('first-time');
      }
    } catch (err) {
      console.warn('[SmartEntry] boot error:', err);
      setViewMode('first-time');
    } finally {
      setLoading(false);
    }
  };

  /* ── Guest guard ───────────────────────────────── */
  const guardGuest = useCallback((onProceed) => {
    if (guestMinutes >= 30) {
      setHardGate(true);
      setGateVisible(true);
      return;
    }
    if (guestMessages >= 10) {
      setHardGate(false);
      setGateVisible(true);
      return;
    }
    onProceed();
  }, [guestMessages, guestMinutes]);

  /* ── Sign out ──────────────────────────────────── */
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    await AsyncStorage.removeItem('sal_has_visited');
    router.replace('/');
  };

  /* ── Loading ───────────────────────────────────── */
  if (loading) {
    return (
      <SafeAreaView style={styles.root}>
        <ActivityIndicator color={GOLD} size="large" />
      </SafeAreaView>
    );
  }

  /* ══════════════════════════════════════════════
     FIRST TIME VIEW
  ══════════════════════════════════════════════ */
  if (viewMode === 'first-time') {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={styles.center} showsVerticalScrollIndicator={false}>
          {/* Logo */}
          <Text style={styles.logo}>SaintSal™ Labs</Text>
          <Text style={styles.tagline}>Responsible Intelligence</Text>

          <Text style={styles.question}>What do you want to do?</Text>

          <FeatureCard
            icon="🔍"
            title="INTELLIGENCE"
            subtitle="Search, research, analyze anything — powered by Claude"
            pulse={pulse}
            onPress={() => router.replace('/(tabs)')}
          />
          <FeatureCard
            icon="💬"
            title="SAL CHAT"
            subtitle="Talk to SAL across every vertical — finance, real estate, creative"
            pulse={pulse}
            onPress={() => router.replace('/(stack)/sal-chat')}
          />
          <FeatureCard
            icon="⚡"
            title="BUILDER"
            subtitle="Build apps, content, sites with AI — deploy instantly"
            pulse={pulse}
            onPress={() => router.replace('/(tabs)/builder')}
          />

          <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.signInLink}>
            <Text style={styles.signInTxt}>Already a member? <Text style={styles.signInGold}>Sign In</Text></Text>
          </TouchableOpacity>

          <Text style={styles.footer}>Free · No credit card needed</Text>
          <Text style={styles.footerSub}>Patent #10,290,222 · Responsible Intelligence</Text>
        </ScrollView>

        <GuestGateModal
          visible={gateVisible}
          onClose={() => setGateVisible(false)}
          router={router}
          hard={hardGate}
        />
      </SafeAreaView>
    );
  }

  /* ══════════════════════════════════════════════
     RETURNING USER VIEW (has session)
  ══════════════════════════════════════════════ */
  if (viewMode === 'returning') {
    const displayName = profile?.business_name
      || profile?.full_name
      || session?.user?.email
      || 'there';
    const tier  = profile?.tier || profile?.role || 'free';
    const limit = { free: 100, starter: 500, pro: 2000, teams: 10000, enterprise: 9999 }[tier] ?? 100;

    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Text style={styles.logo}>SaintSal™ Labs</Text>
          <Text style={styles.welcome}>👋 Welcome back, {displayName}</Text>

          {/* Compute bar */}
          <ComputeBar minutesLeft={quota.minutesLeft} limit={limit} />

          <Text style={styles.question}>Where are we going?</Text>

          <FeatureCard
            icon="🏠"
            title="DASHBOARD"
            subtitle="Your hub — metrics, projects, quick actions"
            pulse={pulse}
            onPress={() => router.replace('/(tabs)')}
          />
          <FeatureCard
            icon="💬"
            title="CONTINUE CHAT"
            subtitle={lastConvo || 'Pick up where you left off'}
            pulse={pulse}
            onPress={() => router.replace('/(stack)/sal-chat')}
          />
          <FeatureCard
            icon="⚡"
            title="BUILDER"
            subtitle={lastBuild || 'Build something new'}
            pulse={pulse}
            onPress={() => router.replace('/(tabs)/builder')}
          />
          <FeatureCard
            icon="🔍"
            title="INTELLIGENCE"
            subtitle="Research, analyze, synthesize"
            pulse={pulse}
            onPress={() => router.replace('/(tabs)')}
          />

          {/* Tier badge + sign out */}
          <View style={styles.tierRow}>
            <View style={styles.tierBadge}>
              <Text style={styles.tierTxt}>{tier.toUpperCase()}</Text>
            </View>
            <TouchableOpacity onPress={handleSignOut}>
              <Text style={styles.signOutTxt}>Sign Out</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footerSub}>Patent #10,290,222 · Responsible Intelligence</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  /* ══════════════════════════════════════════════
     GUEST RETURNING VIEW
  ══════════════════════════════════════════════ */
  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.center} showsVerticalScrollIndicator={false}>
        <Text style={styles.logo}>SaintSal™ Labs</Text>
        <Text style={styles.tagline}>Responsible Intelligence</Text>

        <Text style={styles.question}>Continue where you left off</Text>

        <FeatureCard
          icon="🔍"
          title="CONTINUE INTELLIGENCE"
          subtitle={`${guestMessages} searches this session`}
          pulse={pulse}
          onPress={() => guardGuest(() => router.replace('/(tabs)'))}
        />
        <FeatureCard
          icon="💬"
          title="CONTINUE CHAT"
          subtitle={lastConvo || 'Resume your last conversation'}
          pulse={pulse}
          onPress={() => guardGuest(() => router.replace('/(stack)/sal-chat'))}
        />
        <FeatureCard
          icon="⚡"
          title="CONTINUE BUILDER"
          subtitle={lastBuild || `${Math.round(guestMinutes)} min used`}
          pulse={pulse}
          onPress={() => guardGuest(() => router.replace('/(tabs)/builder'))}
        />

        <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.signInLink}>
          <Text style={styles.signInTxt}>Already a member? <Text style={styles.signInGold}>Sign In</Text></Text>
        </TouchableOpacity>

        <Text style={styles.footer}>Free · No credit card needed</Text>
        <Text style={styles.footerSub}>Patent #10,290,222 · Responsible Intelligence</Text>
      </ScrollView>

      <GuestGateModal
        visible={gateVisible}
        onClose={() => setGateVisible(false)}
        router={router}
        hard={hardGate}
      />
    </SafeAreaView>
  );
}

/* ── Styles ──────────────────────────────────────── */
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BLACK,
  },
  center: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logo: {
    fontSize: 28,
    fontWeight: '800',
    color: GOLD,
    letterSpacing: 1,
    marginBottom: 6,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 13,
    color: MUTED,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 40,
    textAlign: 'center',
  },
  welcome: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  question: {
    fontSize: 15,
    color: DIM,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 16,
    textAlign: 'center',
  },
  /* Card */
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: GOLD_BORDER,
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    width: '100%',
    shadowColor: GOLD,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  cardIcon: {
    fontSize: 28,
    marginRight: 14,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: GOLD,
    letterSpacing: 1,
    marginBottom: 2,
  },
  cardSub: {
    fontSize: 13,
    color: MUTED,
    lineHeight: 18,
  },
  cardArrow: {
    fontSize: 22,
    color: GOLD,
    marginLeft: 8,
  },
  /* Compute bar */
  computeWrap: {
    width: '100%',
    marginBottom: 24,
  },
  computeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  computeLabel: {
    fontSize: 12,
    color: GOLD,
    fontWeight: '600',
    letterSpacing: 1,
  },
  computeValue: {
    fontSize: 12,
    color: MUTED,
  },
  computeTrack: {
    height: 4,
    backgroundColor: BORDER,
    borderRadius: 2,
    overflow: 'hidden',
  },
  computeFill: {
    height: '100%',
    backgroundColor: GOLD,
    borderRadius: 2,
  },
  /* Tier row */
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 24,
    marginBottom: 12,
  },
  tierBadge: {
    backgroundColor: GOLD_DIM,
    borderWidth: 1,
    borderColor: GOLD_BORDER,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tierTxt: {
    fontSize: 11,
    fontWeight: '800',
    color: GOLD,
    letterSpacing: 1.5,
  },
  signOutTxt: {
    fontSize: 13,
    color: MUTED,
    textDecorationLine: 'underline',
  },
  /* Links / footer */
  signInLink: {
    marginTop: 28,
    marginBottom: 16,
  },
  signInTxt: {
    fontSize: 14,
    color: MUTED,
    textAlign: 'center',
  },
  signInGold: {
    color: GOLD,
    fontWeight: '700',
  },
  footer: {
    fontSize: 12,
    color: DIM,
    textAlign: 'center',
    marginBottom: 4,
  },
  footerSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.15)',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginTop: 4,
    marginBottom: 16,
  },
  /* Guest gate modal */
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: GOLD_BORDER,
    padding: 28,
    paddingBottom: 48,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  sheetSub: {
    fontSize: 14,
    color: MUTED,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  sheetPrimary: {
    backgroundColor: GOLD,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  sheetPrimaryTxt: {
    fontSize: 16,
    fontWeight: '800',
    color: BLACK,
    letterSpacing: 0.5,
  },
  sheetSecondary: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  sheetSecondaryTxt: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  sheetGhost: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  sheetGhostTxt: {
    fontSize: 14,
    color: MUTED,
  },
});
