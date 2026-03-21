/* ═══════════════════════════════════════════════════
   SAINTSALLABS — BUILDER PREVIEW
   Premium phone mockup with dashboard preview
   Revenue, Leads, Conversion, Activity Feed
   Matches: preview1.jpg / code-copy-2.html
   US Patent #10,290,222 · HACP Protocol
═══════════════════════════════════════════════════ */
import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Animated, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { C } from '../../config/theme';

const { width: SW } = Dimensions.get('window');

/* ── Device Toggle ─────────────────────────── */
const DEVICES = [
  { id: 'desktop', icon: '🖥', label: 'Desktop' },
  { id: 'tablet',  icon: '📱', label: 'Tablet' },
  { id: 'mobile',  icon: '📲', label: 'Mobile' },
];

/* ── Activity Items ────────────────────────── */
const ACTIVITY = [
  { icon: '👤', iconBg: C.amber + '22', label: 'New Client Signed', time: '2 minutes ago', color: C.amber },
  { icon: '💰', iconBg: C.green + '22', label: 'Payment Received', time: '45 minutes ago', color: C.green },
  { icon: '🚀', iconBg: C.purple + '22', label: 'Build Deployed', time: '1 hour ago', color: C.purple },
  { icon: '📊', iconBg: C.blue + '22', label: 'Report Generated', time: '3 hours ago', color: C.blue },
];

export default function BuilderPreviewScreen() {
  const router = useRouter();
  const [activeDevice, setActiveDevice] = useState('mobile');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <SafeAreaView style={s.safe}>
      <Animated.View style={[{ flex: 1 }, { opacity: fadeIn }]}>
        {/* ═══ Header ═══ */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={s.headerBrand}>SAINTSALLABS</Text>
          </View>
          {/* Device toggles */}
          <View style={s.deviceBar}>
            {DEVICES.map(d => (
              <TouchableOpacity
                key={d.id}
                style={[s.deviceBtn, activeDevice === d.id && s.deviceBtnActive]}
                onPress={() => setActiveDevice(d.id)}
              >
                <Text style={{ fontSize: 16 }}>{d.icon}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={s.headerGear}
            onPress={() => router.push('/(stack)/api-settings')}
          >
            <Text style={{ fontSize: 18, color: C.textDim }}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* ═══ Connection status ═══ */}
        <View style={s.statusBar}>
          <View style={s.statusDot}>
            <Animated.View style={[s.statusDotInner, { opacity: pulseAnim }]} />
          </View>
          <Text style={s.statusLabel}>CONNECTED: RENDER</Text>
          <View style={s.statusSep} />
          <Text style={s.statusPing}>Ping: 14ms</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
          {/* ═══ Phone Mockup Frame ═══ */}
          <View style={s.phoneFrame}>
            {/* Notch */}
            <View style={s.phoneNotch} />

            {/* Status bar */}
            <View style={s.phoneStatusBar}>
              <Text style={s.phoneTime}>9:41</Text>
              <View style={s.phoneSignals}>
                <Text style={s.phoneSignalText}>📶 📡 🔋</Text>
              </View>
            </View>

            {/* Overview header */}
            <View style={s.phoneOverview}>
              <Text style={s.overviewTitle}>Overview</Text>
              <Text style={{ fontSize: 18, color: C.amber }}>🔔</Text>
            </View>

            {/* Revenue card */}
            <View style={s.revenueCard}>
              <Text style={s.revenueLabel}>TOTAL REVENUE</Text>
              <Text style={s.revenueAmount}>$42,904.00</Text>
              <View style={s.revenueGrow}>
                <Text style={s.revenueGrowIcon}>📈</Text>
                <Text style={s.revenueGrowText}>+12.5% vs last month</Text>
              </View>
            </View>

            {/* Metric row */}
            <View style={s.metricRow}>
              <View style={s.metricCard}>
                <Text style={s.metricLabel}>NEW LEADS</Text>
                <Text style={s.metricValue}>128</Text>
              </View>
              <View style={s.metricCard}>
                <Text style={s.metricLabel}>CONVERSION</Text>
                <Text style={s.metricValue}>4.2%</Text>
              </View>
            </View>

            {/* Recent activity */}
            <Text style={s.activityTitle}>RECENT ACTIVITY</Text>
            {ACTIVITY.slice(0, 2).map((item, i) => (
              <View key={i} style={s.activityRow}>
                <View style={[s.activityIcon, { backgroundColor: item.iconBg }]}>
                  <Text style={{ fontSize: 16 }}>{item.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.activityLabel}>{item.label}</Text>
                  <Text style={s.activityTime}>{item.time}</Text>
                </View>
              </View>
            ))}

            {/* CTA button */}
            <LinearGradient
              colors={[C.goldBright, C.amber]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.phoneCTA}
            >
              <Text style={s.phoneCTAText}>Launch New Campaign</Text>
            </LinearGradient>

            {/* Mini tab bar */}
            <View style={s.phoneTabs}>
              <Text style={s.phoneTabActive}>🏠</Text>
              <Text style={s.phoneTabInactive}>💬</Text>
              <Text style={s.phoneTabInactive}>📅</Text>
              <Text style={s.phoneTabInactive}>⚙️</Text>
            </View>
          </View>

          {/* ═══ Quick Actions ═══ */}
          <View style={s.actionsRow}>
            <TouchableOpacity
              style={s.actionCard}
              onPress={() => router.push('/(tabs)/builder')}
            >
              <LinearGradient
                colors={[C.goldBright, C.amber]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.actionGradient}
              >
                <Text style={s.actionIcon}>⚡</Text>
                <Text style={s.actionLabel}>Open Builder</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.actionCardDark}
              onPress={() => router.push('/(stack)/high-fidelity-ide')}
            >
              <Text style={s.actionIconDark}>📁</Text>
              <Text style={s.actionLabelDark}>File Explorer</Text>
            </TouchableOpacity>
          </View>

          {/* Spacer */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

/* ═══ STYLES ═══ */
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  /* Header */
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, height: 56,
  },
  headerLeft: { flex: 1 },
  headerBrand: {
    fontSize: 16, fontWeight: '900', color: C.amber,
    letterSpacing: -0.5, textTransform: 'uppercase',
  },
  deviceBar: {
    flexDirection: 'row', backgroundColor: C.surfaceHighest,
    borderRadius: 8, padding: 3,
  },
  deviceBtn: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6,
  },
  deviceBtnActive: {
    backgroundColor: C.surfaceBright,
  },
  headerGear: { marginLeft: 16 },

  /* Status bar */
  statusBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 8, backgroundColor: C.surfaceHighest + '99',
    marginHorizontal: 20, borderRadius: 6, marginBottom: 16,
  },
  statusDot: { marginRight: 8 },
  statusDotInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.green },
  statusLabel: { fontSize: 10, fontWeight: '700', color: C.textMuted, letterSpacing: 1 },
  statusSep: { width: 1, height: 12, backgroundColor: C.textGhost, marginHorizontal: 12 },
  statusPing: { fontSize: 10, fontWeight: '600', color: C.textDim },

  scrollContent: { paddingHorizontal: 20 },

  /* Phone mockup */
  phoneFrame: {
    backgroundColor: C.bgCard, borderRadius: 32, padding: 16,
    borderWidth: 3, borderColor: '#2A2A2A',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6, shadowRadius: 24,
    overflow: 'hidden',
  },
  phoneNotch: {
    width: 120, height: 24, backgroundColor: '#000',
    borderRadius: 12, alignSelf: 'center', marginBottom: 8,
  },
  phoneStatusBar: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 8, marginBottom: 16,
  },
  phoneTime: { fontSize: 14, fontWeight: '600', color: C.text },
  phoneSignals: {},
  phoneSignalText: { fontSize: 10, color: C.text },
  phoneOverview: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 4, marginBottom: 16,
  },
  overviewTitle: { fontSize: 22, fontWeight: '800', color: C.text, letterSpacing: -0.5 },

  /* Revenue */
  revenueCard: {
    backgroundColor: C.surfaceHighest, borderRadius: 12, padding: 20, marginBottom: 12,
  },
  revenueLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, color: C.textMuted, marginBottom: 6 },
  revenueAmount: { fontSize: 32, fontWeight: '900', color: C.text, letterSpacing: -1 },
  revenueGrow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  revenueGrowIcon: { fontSize: 12, marginRight: 4 },
  revenueGrowText: { fontSize: 12, fontWeight: '600', color: C.green },

  /* Metrics */
  metricRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  metricCard: {
    flex: 1, backgroundColor: C.surfaceHighest, borderRadius: 12, padding: 16,
  },
  metricLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1.5, color: C.textMuted, marginBottom: 8 },
  metricValue: { fontSize: 28, fontWeight: '900', color: C.text },

  /* Activity */
  activityTitle: {
    fontSize: 11, fontWeight: '800', letterSpacing: 2, color: C.textMuted,
    marginBottom: 12, paddingHorizontal: 4,
  },
  activityRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.surfaceHighest, borderRadius: 10, padding: 14, marginBottom: 8,
  },
  activityIcon: {
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
  },
  activityLabel: { fontSize: 14, fontWeight: '600', color: C.text },
  activityTime: { fontSize: 11, color: C.textDim, marginTop: 2 },

  /* Phone CTA */
  phoneCTA: {
    borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 12, marginBottom: 12,
  },
  phoneCTAText: { fontSize: 13, fontWeight: '800', color: '#000', letterSpacing: 0.5 },

  /* Phone tabs */
  phoneTabs: {
    flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: C.surfaceHighest,
  },
  phoneTabActive: { fontSize: 20 },
  phoneTabInactive: { fontSize: 18, opacity: 0.4 },

  /* Quick actions */
  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  actionCard: { flex: 1, borderRadius: 14, overflow: 'hidden' },
  actionGradient: {
    padding: 20, alignItems: 'center',
  },
  actionIcon: { fontSize: 24, marginBottom: 6 },
  actionLabel: { fontSize: 12, fontWeight: '800', color: '#000', letterSpacing: 0.5 },
  actionCardDark: {
    flex: 1, backgroundColor: C.surfaceLow, borderRadius: 14,
    padding: 20, alignItems: 'center', justifyContent: 'center',
  },
  actionIconDark: { fontSize: 24, marginBottom: 6 },
  actionLabelDark: { fontSize: 12, fontWeight: '700', color: C.text },
});
