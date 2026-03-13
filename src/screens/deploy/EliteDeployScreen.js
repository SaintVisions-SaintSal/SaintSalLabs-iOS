import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Animated, Alert, Linking,
} from 'react-native';
import { C } from '../../config/theme';
import { useRouter } from 'expo-router';

const STATUS_CARDS = [
  { id: 'health', icon: '💚', label: 'System Health', value: '99.98%', sub: 'uptime', color: C.green },
  { id: 'github', icon: '🐙', label: 'GitHub', value: 'Connected', sub: 'saintsal-org', color: C.green },
  { id: 'latency', icon: '⚡', label: 'Latency', value: '24ms', sub: 'global avg', color: C.amber },
];

const API_PROVIDERS = [
  { id: 'claude', icon: '🤖', name: 'Claude', org: 'Anthropic', desc: 'Language Model Orchestration', color: C.amber },
  { id: 'grok', icon: '🧠', name: 'Grok', org: 'xAI', desc: 'Real-time Intelligence Data', color: C.blue },
  { id: 'eleven', icon: '🎙', name: 'ElevenLabs', org: 'ElevenLabs', desc: 'Voice Synthesis & Cloning', color: C.purple },
  { id: 'gcp', icon: '☁', name: 'Google Cloud', org: 'Google', desc: 'Vision & Compute Engine', color: C.green },
];

const DEPLOY_TARGETS = [
  { id: 'vercel', icon: '▲', name: 'Vercel Edge', method: 'OAuth 2.0', status: 'live' },
  { id: 'render', icon: '🖥', name: 'Render Backend', method: 'OAuth 2.0', status: 'live' },
];

export default function EliteDeployScreen() {
  const router = useRouter();
  const [githubConnected, setGithubConnected] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.7, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleDeploy = () => {
    setDeploying(true);
    Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
    ).start();
    setTimeout(() => {
      spinAnim.stopAnimation();
      spinAnim.setValue(0);
      setDeploying(false);
      Alert.alert('Deploy Complete', 'Production deployment successful. All edge nodes updated.');
    }, 3000);
  };

  const handleGetKey = (provider) => {
    Alert.alert(`${provider.name} API`, `Opening ${provider.org} dashboard to retrieve your API key...`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Dashboard', onPress: () => {} },
    ]);
  };

  const toggleGitHub = () => {
    if (githubConnected) {
      Alert.alert('Disconnect GitHub', 'Remove GitHub OAuth connection?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Disconnect', style: 'destructive', onPress: () => setGithubConnected(false) },
      ]);
    } else {
      Alert.alert('Connect GitHub', 'Redirecting to GitHub OAuth...', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Connect', onPress: () => setGithubConnected(true) },
      ]);
    }
  };

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={{ fontSize: 18 }}>🧪</Text>
          <Text style={s.headerTitle}>SaintSal <Text style={{ color: C.amber }}>Labs</Text></Text>
        </View>
        <View style={s.headerRight}>
          <View style={s.liveBadge}>
            <Animated.View style={[s.liveDot, { opacity: pulseAnim }]} />
            <Text style={s.liveText}>Production Active</Text>
          </View>
          <TouchableOpacity style={s.bellBtn}>
            <Text style={{ fontSize: 16 }}>🔔</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={s.titleSection}>
          <Text style={s.title}>Elite API Management</Text>
          <Text style={s.titleSub}>Configure your neural mesh and deployment orchestration.</Text>
          <View style={s.planRow}>
            <View style={s.planBadge}>
              <Text style={s.planBadgeText}>TIER-PRO-EX-09</Text>
            </View>
            <TouchableOpacity style={s.upgradeBtn}>
              <Text style={s.upgradeBtnText}>Upgrade</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Status Cards */}
        <View style={s.statusRow}>
          {STATUS_CARDS.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={s.statusCard}
              onPress={card.id === 'github' ? toggleGitHub : undefined}
              activeOpacity={card.id === 'github' ? 0.7 : 1}
            >
              <Text style={{ fontSize: 18 }}>{card.icon}</Text>
              <Text style={[s.statusValue, { color: card.id === 'github' ? (githubConnected ? C.green : C.red) : card.color }]}>
                {card.id === 'github' ? (githubConnected ? 'Connected' : 'Disconnected') : card.value}
              </Text>
              <Text style={s.statusLabel}>{card.label}</Text>
              <Text style={s.statusSub}>{card.id === 'github' ? (githubConnected ? 'saintsal-org' : 'Tap to connect') : card.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* API Stitching */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionLabel}>API STITCHING</Text>
            <Text style={s.sectionSub}>4 providers</Text>
          </View>
          <View style={s.providerGrid}>
            {API_PROVIDERS.map((p) => (
              <View key={p.id} style={s.providerCard}>
                <View style={s.providerTop}>
                  <Text style={{ fontSize: 22 }}>{p.icon}</Text>
                  <View style={[s.providerDot, { backgroundColor: C.green }]} />
                </View>
                <Text style={s.providerName}>{p.name}</Text>
                <Text style={s.providerOrg}>{p.org}</Text>
                <Text style={s.providerDesc}>{p.desc}</Text>
                <TouchableOpacity style={[s.getKeyBtn, { borderColor: p.color + '40' }]} onPress={() => handleGetKey(p)}>
                  <Text style={[s.getKeyText, { color: p.color }]}>GET KEY</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Deployment Orchestration */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>DEPLOYMENT ORCHESTRATION</Text>

          {/* Deploy Button */}
          <TouchableOpacity
            style={[s.deployBtn, deploying && s.deployBtnActive]}
            onPress={handleDeploy}
            disabled={deploying}
            activeOpacity={0.85}
          >
            {deploying ? (
              <Animated.Text style={[{ fontSize: 18 }, { transform: [{ rotate: spin }] }]}>⟳</Animated.Text>
            ) : (
              <Text style={{ fontSize: 18 }}>🚀</Text>
            )}
            <Text style={s.deployBtnText}>
              {deploying ? 'DEPLOYING TO PRODUCTION...' : 'TRIGGER MANUAL DEPLOY'}
            </Text>
          </TouchableOpacity>

          {/* Deploy Targets */}
          {DEPLOY_TARGETS.map((t) => (
            <View key={t.id} style={s.targetCard}>
              <View style={s.targetLeft}>
                <Text style={{ fontSize: 20 }}>{t.icon}</Text>
                <View>
                  <Text style={s.targetName}>{t.name}</Text>
                  <Text style={s.targetMethod}>Connected via {t.method}</Text>
                </View>
              </View>
              <View style={s.targetRight}>
                <View style={s.livePill}>
                  <Animated.View style={[s.livePillDot, { opacity: pulseAnim }]} />
                  <Text style={s.livePillText}>LIVE</Text>
                </View>
                <TouchableOpacity
                  style={s.manageBtn}
                  onPress={() => Alert.alert(t.name, 'Opening management console...')}
                >
                  <Text style={s.manageBtnText}>Manage</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Security Footer */}
        <View style={s.secFooter}>
          <View style={s.secRow}>
            <Text style={{ fontSize: 14 }}>🔒</Text>
            <Text style={s.secText}>All credentials encrypted via HACP Protocol</Text>
          </View>
          <Text style={s.secPatent}>Patent #10,290,222 · SaintSal™ Labs</Text>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: C.text, letterSpacing: -0.3 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.greenGhost, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.green },
  liveText: { fontSize: 10, fontWeight: '700', color: C.green, letterSpacing: 0.5 },
  bellBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  titleSection: { paddingHorizontal: 20, marginTop: 22 },
  title: { fontSize: 24, fontWeight: '800', color: C.text, letterSpacing: -0.5 },
  titleSub: { fontSize: 13, color: C.textMuted, marginTop: 6, lineHeight: 20 },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
  planBadge: { backgroundColor: C.amberGhost, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: C.borderGlow },
  planBadgeText: { fontSize: 10, fontWeight: '800', color: C.amber, letterSpacing: 1.2 },
  upgradeBtn: { backgroundColor: C.amber, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8 },
  upgradeBtnText: { fontSize: 11, fontWeight: '800', color: C.bg },
  statusRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginTop: 22 },
  statusCard: { flex: 1, backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 12, alignItems: 'center' },
  statusValue: { fontSize: 16, fontWeight: '800', marginTop: 8 },
  statusLabel: { fontSize: 10, fontWeight: '700', color: C.textDim, marginTop: 4, letterSpacing: 0.5 },
  statusSub: { fontSize: 9, color: C.textGhost, marginTop: 2 },
  section: { paddingHorizontal: 20, marginTop: 28 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionLabel: { fontSize: 10, fontWeight: '700', color: C.amber, letterSpacing: 1.5, marginBottom: 14 },
  sectionSub: { fontSize: 11, color: C.textDim },
  providerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  providerCard: { width: '48%', backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 14 },
  providerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  providerDot: { width: 8, height: 8, borderRadius: 4 },
  providerName: { fontSize: 14, fontWeight: '700', color: C.text },
  providerOrg: { fontSize: 11, color: C.textDim, marginTop: 1 },
  providerDesc: { fontSize: 11, color: C.textMuted, marginTop: 6, lineHeight: 16 },
  getKeyBtn: { marginTop: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
  getKeyText: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  deployBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: C.amber, paddingVertical: 16, borderRadius: 14, marginBottom: 14 },
  deployBtnActive: { backgroundColor: C.orange },
  deployBtnText: { fontSize: 13, fontWeight: '800', color: C.bg, letterSpacing: 1 },
  targetCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 16, marginBottom: 8 },
  targetLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  targetName: { fontSize: 14, fontWeight: '700', color: C.text },
  targetMethod: { fontSize: 11, color: C.textDim, marginTop: 2 },
  targetRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.greenGhost, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  livePillDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: C.green },
  livePillText: { fontSize: 9, fontWeight: '800', color: C.green, letterSpacing: 1 },
  manageBtn: { backgroundColor: C.bgElevated, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: C.border },
  manageBtnText: { fontSize: 11, fontWeight: '700', color: C.textSub },
  secFooter: { marginTop: 28, marginHorizontal: 20, backgroundColor: C.amberGhost, borderWidth: 1, borderColor: C.borderGlow, borderRadius: 14, padding: 16 },
  secRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  secText: { fontSize: 12, color: C.textMuted, flex: 1 },
  secPatent: { fontSize: 9, color: C.textGhost, marginTop: 8, letterSpacing: 0.8 },
});
