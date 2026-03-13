import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert, Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '../../config/theme';

const PLAN = { name: 'Pro', price: '$97/mo', credits: 2000, used: 1247, color: C.amber };

const USAGE = [
  { label: 'Queries', value: '1,842', icon: '🔍', sub: 'Last 30 days' },
  { label: 'Builds', value: '64', icon: '⚡', sub: 'Last 30 days' },
  { label: 'Credits Used', value: '1,247', icon: '🪙', sub: `of ${PLAN.credits.toLocaleString()}` },
];

const HISTORY = [
  { title: 'Intelligence Search', sub: '2 mins ago · Neural Deep Dive', cost: -420 },
  { title: 'Builder Deployment', sub: 'Yesterday · Production Cluster', cost: -1250 },
  { title: 'Vector Indexing', sub: '2 days ago · Documentation Batch', cost: -85 },
];

const SETTINGS = [
  { label: 'Notifications', icon: '🔔', type: 'toggle', key: 'notif' },
  { label: 'Dark Theme', icon: '🌙', type: 'toggle', key: 'theme', locked: true },
  { label: 'Data & Storage', icon: '💾', type: 'nav', key: 'data' },
  { label: 'Privacy', icon: '🔒', type: 'nav', key: 'privacy' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const [toggles, setToggles] = useState({ notif: true, theme: true });
  const creditPct = PLAN.used / PLAN.credits;

  const handleToggle = (key) => {
    if (key === 'theme') return;
    setToggles((p) => ({ ...p, [key]: !p[key] }));
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerBtn} onPress={() => router.back()}><Text style={s.headerIcon}>←</Text></TouchableOpacity>
        <Text style={s.headerTitle}>PROFILE</Text>
        <TouchableOpacity style={s.headerBtn}><Text style={s.headerIcon}>⚙️</Text></TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={s.banner}>
          <View style={s.bannerOverlay} />
        </View>

        {/* Avatar & Identity */}
        <View style={s.identity}>
          <View style={s.avatarRing}>
            <View style={s.avatar}>
              <Text style={s.avatarLetter}>C</Text>
            </View>
          </View>
          <Text style={s.name}>SaintSal Member</Text>
          <Text style={s.email}>member@saintsal.labs</Text>
          <View style={s.badge}>
            <Text style={s.badgeIcon}>🏆</Text>
            <Text style={s.badgeText}>{PLAN.name.toUpperCase()} PLAN</Text>
          </View>
        </View>

        {/* Credits Card */}
        <View style={s.section}>
          <View style={s.creditsCard}>
            <View style={s.creditsTop}>
              <View>
                <Text style={s.creditsLabel}>INTELLIGENCE BALANCE</Text>
                <Text style={s.creditsValue}>{(PLAN.credits - PLAN.used).toLocaleString()}</Text>
              </View>
              <Text style={{ fontSize: 28 }}>💰</Text>
            </View>
            <Text style={s.creditsSub}>
              {PLAN.used.toLocaleString()} of {PLAN.credits.toLocaleString()} credits used
            </Text>
            <View style={s.progressBg}>
              <View style={[s.progressFill, { width: `${Math.min(creditPct * 100, 100)}%` }]} />
            </View>
            <TouchableOpacity style={s.buyBtn} onPress={() => router.push('/(stack)/credit-topup')}>
              <Text style={s.buyBtnText}>Buy More Credits</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Usage Stats */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>USAGE STATS</Text>
          <View style={s.statsRow}>
            {USAGE.map((u) => (
              <View key={u.label} style={s.statCard}>
                <Text style={{ fontSize: 20 }}>{u.icon}</Text>
                <Text style={s.statValue}>{u.value}</Text>
                <Text style={s.statLabel}>{u.label}</Text>
                <Text style={s.statSub}>{u.sub}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Usage History */}
        <View style={s.section}>
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>USAGE HISTORY</Text>
            <Text style={s.sectionMeta}>Last 30 Days</Text>
          </View>
          {HISTORY.map((h, i) => (
            <View key={i} style={[s.historyRow, i < HISTORY.length - 1 && { marginBottom: 2 }]}>
              <View style={s.historyIcon}>
                <Text style={{ fontSize: 16 }}>{i === 0 ? '🔍' : i === 1 ? '🚀' : '📊'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.historyTitle}>{h.title}</Text>
                <Text style={s.historySub}>{h.sub}</Text>
              </View>
              <Text style={s.historyCost}>{h.cost.toLocaleString()}</Text>
            </View>
          ))}
          <TouchableOpacity style={s.viewAll}>
            <Text style={s.viewAllText}>VIEW FULL ANALYTICS</Text>
          </TouchableOpacity>
        </View>

        {/* Settings */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>SETTINGS</Text>
          {SETTINGS.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={s.settingRow}
              onPress={() => item.type === 'nav' && Alert.alert(item.label, 'Coming soon')}
              activeOpacity={0.7}
            >
              <View style={s.settingLeft}>
                <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                <Text style={s.settingLabel}>{item.label}</Text>
              </View>
              {item.type === 'toggle' ? (
                <Switch
                  value={toggles[item.key]}
                  onValueChange={() => handleToggle(item.key)}
                  trackColor={{ false: C.border, true: C.amber }}
                  thumbColor="#fff"
                  disabled={item.locked}
                />
              ) : (
                <Text style={s.chevron}>›</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Linked Services */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>LINKED SERVICES</Text>
          <TouchableOpacity style={s.settingRow} onPress={() => router.push('/(stack)/github-console')} activeOpacity={0.7}>
            <View style={s.settingLeft}>
              <Text style={{ fontSize: 18 }}>🔗</Text>
              <Text style={s.settingLabel}>Connected GitHub</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={s.statusBadge}>
                <Text style={s.statusText}>ACTIVE</Text>
              </View>
              <Text style={s.chevron}>›</Text>
            </View>
          </TouchableOpacity>
          <View style={s.settingRow}>
            <View style={s.settingLeft}>
              <Text style={{ fontSize: 18 }}>🛡️</Text>
              <Text style={s.settingLabel}>Security & 2FA</Text>
            </View>
            <Text style={s.chevron}>›</Text>
          </View>
        </View>

        {/* Quick Links */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>QUICK LINKS</Text>
          {[
            { icon: '🔑', label: 'API Keys', route: '/(stack)/api-settings' },
            { icon: '💎', label: 'Pricing', route: '/(stack)/stripe-pricing' },
            { icon: '🌐', label: 'Domain Hub', route: '/(stack)/domain-hub' },
            { icon: '🚀', label: 'Deploy Console', route: '/(stack)/elite-deploy' },
            { icon: '📊', label: 'Portfolio', route: '/(stack)/portfolio' },
            { icon: '🏠', label: 'Real Estate Intel', route: '/(stack)/real-estate' },
          ].map((link) => (
            <TouchableOpacity
              key={link.label}
              style={s.settingRow}
              onPress={() => router.push(link.route)}
              activeOpacity={0.7}
            >
              <View style={s.settingLeft}>
                <Text style={{ fontSize: 18 }}>{link.icon}</Text>
                <Text style={s.settingLabel}>{link.label}</Text>
              </View>
              <Text style={s.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out */}
        <View style={[s.section, { marginBottom: 40 }]}>
          <TouchableOpacity
            style={s.signOutBtn}
            onPress={() => Alert.alert('Sign Out', 'Are you sure?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Sign Out', style: 'destructive' },
            ])}
          >
            <Text style={s.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  headerBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.bgCard, alignItems: 'center', justifyContent: 'center' },
  headerIcon: { fontSize: 16, color: C.amber },
  headerTitle: { fontSize: 14, fontWeight: '800', letterSpacing: 2, color: C.text },
  scroll: { flex: 1 },
  banner: { height: 100, backgroundColor: C.amberGhost },
  bannerOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 50, backgroundColor: C.bg, opacity: 0.7 },
  identity: { alignItems: 'center', marginTop: -48 },
  avatarRing: { width: 100, height: 100, borderRadius: 50, backgroundColor: C.amberGhost, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.amber },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: C.bgCard, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { fontSize: 36, fontWeight: '800', color: C.amber },
  name: { fontSize: 22, fontWeight: '700', color: C.text, marginTop: 12 },
  email: { fontSize: 13, color: C.amberDim, marginTop: 4 },
  badge: { flexDirection: 'row', alignItems: 'center', marginTop: 10, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: C.amberGhost, borderWidth: 1, borderColor: C.borderGlow },
  badgeIcon: { fontSize: 12, marginRight: 6 },
  badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 2, color: C.amber },
  section: { paddingHorizontal: 20, marginTop: 28 },
  sectionTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 2, color: C.amberDim, marginBottom: 14 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionMeta: { fontSize: 10, fontWeight: '700', color: C.textDim },
  creditsCard: { backgroundColor: C.bgCard, borderRadius: 14, padding: 20, borderWidth: 1, borderColor: C.borderGlow },
  creditsTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  creditsLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 2, color: C.amberDim },
  creditsValue: { fontSize: 36, fontWeight: '800', color: C.text, marginTop: 4, letterSpacing: -1 },
  creditsSub: { fontSize: 12, color: C.textDim, marginTop: 12 },
  progressBg: { height: 6, borderRadius: 3, backgroundColor: C.border, marginTop: 10 },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: C.amber },
  buyBtn: { marginTop: 16, height: 48, borderRadius: 10, backgroundColor: C.amber, alignItems: 'center', justifyContent: 'center' },
  buyBtnText: { fontSize: 13, fontWeight: '800', color: C.bg, letterSpacing: 1, textTransform: 'uppercase' },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, backgroundColor: C.bgCard, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  statValue: { fontSize: 20, fontWeight: '800', color: C.text, marginTop: 8 },
  statLabel: { fontSize: 11, fontWeight: '600', color: C.textMuted, marginTop: 4 },
  statSub: { fontSize: 9, color: C.textDim, marginTop: 2 },
  historyRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.amberGhost, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: C.borderGlow },
  historyIcon: { width: 40, height: 40, borderRadius: 8, backgroundColor: C.bg, borderWidth: 1, borderColor: C.borderGlow, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  historyTitle: { fontSize: 13, fontWeight: '700', color: C.text },
  historySub: { fontSize: 10, color: C.textDim, marginTop: 2 },
  historyCost: { fontSize: 13, fontFamily: 'monospace', color: C.amber, fontWeight: '600' },
  viewAll: { paddingVertical: 16, alignItems: 'center' },
  viewAllText: { fontSize: 10, fontWeight: '800', letterSpacing: 2, color: C.amberDim },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingLabel: { fontSize: 14, fontWeight: '500', color: C.text },
  chevron: { fontSize: 20, color: C.textDim },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, backgroundColor: C.greenGhost, borderWidth: 1, borderColor: '#22C55E30' },
  statusText: { fontSize: 9, fontWeight: '800', color: C.green, letterSpacing: 1 },
  signOutBtn: { height: 50, borderRadius: 12, borderWidth: 1, borderColor: C.redGhost, backgroundColor: C.redGhost, alignItems: 'center', justifyContent: 'center' },
  signOutText: { fontSize: 14, fontWeight: '600', color: C.red },
});
