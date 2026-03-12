import React, { useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Animated, Dimensions, Alert,
} from 'react-native';
import { C } from '../../config/theme';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = (SCREEN_W - 52) / 2;

const VERTICALS = [
  {
    id: 'search',
    icon: '🔍',
    label: 'Search',
    title: 'Universal Intelligence Explorer',
    button: 'Initialize',
    accent: C.amber,
    accentGhost: C.amberGhost,
    gradStart: '#F59E0B',
    gradEnd: '#ec5b13',
  },
  {
    id: 'builder',
    icon: '⚡',
    label: 'Builder',
    title: 'System Architecture & Design',
    button: 'Open Lab',
    accent: C.purple,
    accentGhost: C.purpleGhost,
    gradStart: '#818CF8',
    gradEnd: '#3B82F6',
  },
  {
    id: 'social',
    icon: '🌐',
    label: 'Social',
    title: 'Community Collaboration Hub',
    button: 'Connect',
    accent: C.green,
    accentGhost: C.greenGhost,
    gradStart: '#22C55E',
    gradEnd: '#14B8A6',
  },
  {
    id: 'realestate',
    icon: '🏠',
    label: 'Real Estate',
    title: 'Premium Asset Management',
    button: 'Browse',
    accent: C.pink,
    accentGhost: C.pinkGhost,
    gradStart: '#EC4899',
    gradEnd: '#F43F5E',
  },
];

export default function NavigationHubScreen() {
  const pulseAnims = useRef(VERTICALS.map(() => new Animated.Value(0.7))).current;

  useEffect(() => {
    pulseAnims.forEach((anim, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: 1600 + i * 200, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.7, duration: 1600 + i * 200, useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  const handlePress = (v) => {
    Alert.alert(v.label, `Routing session to ${v.title}...`);
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.logoDot} />
          <Text style={s.logoText}>SaintSal <Text style={{ color: C.amber }}>Labs</Text></Text>
        </View>
        <TouchableOpacity style={s.bellBtn}>
          <Text style={{ fontSize: 18 }}>🔔</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={s.titleSection}>
          <Text style={s.title}>Navigation Hub</Text>
          <Text style={s.subtitle}>Select a vertical to route your session</Text>
        </View>

        {/* System Status Bar */}
        <View style={s.statusBar}>
          <View style={s.statusDot} />
          <Text style={s.statusText}>SYSTEM ONLINE</Text>
          <View style={s.statusDivider} />
          <Text style={s.statusText}>4 VERTICALS READY</Text>
          <View style={s.statusDivider} />
          <Text style={[s.statusText, { color: C.green }]}>HACP ACTIVE</Text>
        </View>

        {/* Cards Grid */}
        <View style={s.grid}>
          {VERTICALS.map((v, i) => (
            <View key={v.id} style={s.cardWrap}>
              <TouchableOpacity
                style={[s.card, { borderColor: v.accent + '20' }]}
                onPress={() => handlePress(v)}
                activeOpacity={0.85}
              >
                {/* Gradient Image Area (16:9) */}
                <View style={[s.imageArea, { backgroundColor: v.gradStart + '18' }]}>
                  <View style={[s.gradOverlay, { backgroundColor: v.gradEnd + '12' }]} />
                  <Animated.View style={[s.imageIcon, { opacity: pulseAnims[i], backgroundColor: v.accent + '20' }]}>
                    <Text style={{ fontSize: 32 }}>{v.icon}</Text>
                  </Animated.View>
                  <View style={[s.imageGlow, { backgroundColor: v.gradStart }]} />
                </View>

                {/* Content */}
                <View style={s.cardContent}>
                  <View style={s.labelRow}>
                    <View style={[s.labelDot, { backgroundColor: v.accent }]} />
                    <Text style={[s.labelText, { color: v.accent }]}>{v.label}</Text>
                  </View>
                  <Text style={s.cardTitle} numberOfLines={2}>{v.title}</Text>
                  <TouchableOpacity
                    style={[s.actionBtn, { backgroundColor: v.accent }]}
                    onPress={() => handlePress(v)}
                    activeOpacity={0.85}
                  >
                    <Text style={s.actionBtnText}>{v.button}</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Quick Access */}
        <View style={s.quickSection}>
          <Text style={s.quickLabel}>QUICK ACCESS</Text>
          <View style={s.quickRow}>
            {[
              { icon: '📰', label: 'News', accent: C.red },
              { icon: '📈', label: 'Finance', accent: C.green },
              { icon: '💻', label: 'Tech', accent: C.purple },
              { icon: '🏈', label: 'Sports', accent: C.green },
            ].map((q) => (
              <TouchableOpacity
                key={q.label}
                style={s.quickChip}
                onPress={() => Alert.alert(q.label, `Opening ${q.label} vertical...`)}
              >
                <Text style={{ fontSize: 16 }}>{q.icon}</Text>
                <Text style={s.quickChipText}>{q.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Session Info */}
        <View style={s.sessionCard}>
          <View style={s.sessionRow}>
            <Text style={{ fontSize: 14 }}>🛡</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.sessionTitle}>Active Session</Text>
              <Text style={s.sessionDetail}>Encrypted via HACP Protocol · Patent #10,290,222</Text>
            </View>
            <View style={s.sessionBadge}>
              <Text style={s.sessionBadgeText}>PRO</Text>
            </View>
          </View>
          <View style={s.sessionDivider} />
          <View style={s.sessionStats}>
            <View style={s.statItem}>
              <Text style={s.statValue}>1,247</Text>
              <Text style={s.statLabel}>Credits Used</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statItem}>
              <Text style={s.statValue}>753</Text>
              <Text style={s.statLabel}>Remaining</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statItem}>
              <Text style={s.statValue}>42</Text>
              <Text style={s.statLabel}>Sessions</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>SaintSal™ Labs · Intelligence. Amplified.</Text>
          <Text style={s.footerPatent}>US Patent #10,290,222 · HACP Protocol</Text>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.amber },
  logoText: { fontSize: 18, fontWeight: '800', color: C.text, letterSpacing: -0.3 },
  bellBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  titleSection: { paddingHorizontal: 20, marginTop: 24, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: C.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: C.textMuted, marginTop: 6 },
  statusBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 20, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: C.bgCard, borderRadius: 10, borderWidth: 1, borderColor: C.border, gap: 8 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.green },
  statusText: { fontSize: 9, fontWeight: '800', color: C.textDim, letterSpacing: 1.2 },
  statusDivider: { width: 1, height: 12, backgroundColor: C.border },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12 },
  cardWrap: { width: CARD_W },
  card: { backgroundColor: C.bgCard, borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  imageArea: { width: '100%', aspectRatio: 16 / 9, alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
  gradOverlay: { ...StyleSheet.absoluteFillObject },
  imageIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  imageGlow: { position: 'absolute', bottom: -20, width: 80, height: 40, borderRadius: 40, opacity: 0.15 },
  cardContent: { padding: 12 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  labelDot: { width: 6, height: 6, borderRadius: 3 },
  labelText: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
  cardTitle: { fontSize: 13, fontWeight: '700', color: C.text, lineHeight: 18, marginBottom: 12 },
  actionBtn: { paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  actionBtnText: { fontSize: 12, fontWeight: '800', color: C.bg, letterSpacing: 0.5 },
  quickSection: { marginTop: 28, paddingHorizontal: 20 },
  quickLabel: { fontSize: 10, fontWeight: '700', color: C.amber, letterSpacing: 1.5, marginBottom: 12 },
  quickRow: { flexDirection: 'row', gap: 8 },
  quickChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, backgroundColor: C.bgCard, borderRadius: 10, borderWidth: 1, borderColor: C.border },
  quickChipText: { fontSize: 11, fontWeight: '700', color: C.textSub },
  sessionCard: { marginTop: 24, marginHorizontal: 20, backgroundColor: C.bgCard, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 16 },
  sessionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sessionTitle: { fontSize: 14, fontWeight: '700', color: C.text },
  sessionDetail: { fontSize: 11, color: C.textDim, marginTop: 2 },
  sessionBadge: { backgroundColor: C.amber + '18', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  sessionBadgeText: { fontSize: 10, fontWeight: '800', color: C.amber, letterSpacing: 1 },
  sessionDivider: { height: 1, backgroundColor: C.border, marginVertical: 14 },
  sessionStats: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '800', color: C.text },
  statLabel: { fontSize: 10, color: C.textDim, marginTop: 2, fontWeight: '600' },
  statDivider: { width: 1, height: 28, backgroundColor: C.border },
  footer: { alignItems: 'center', marginTop: 28, paddingHorizontal: 20 },
  footerText: { fontSize: 12, fontWeight: '600', color: C.textDim },
  footerPatent: { fontSize: 9, color: C.textGhost, marginTop: 6, letterSpacing: 0.8 },
});
