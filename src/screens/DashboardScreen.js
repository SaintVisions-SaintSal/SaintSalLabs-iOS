/* ═══════════════════════════════════════════════════
   SAINTSALLABS — DASHBOARD SCREEN
═══════════════════════════════════════════════════ */
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Linking, ActivityIndicator,
} from 'react-native';
import { C } from '../config/theme';
import { checkHealth } from '../lib/api';

const TIER_DATA = [
  { tier: 'Free',       price: '$0',    color: '#444',   features: ['SAL Mini', '100 credits/mo', 'Search + Chat', '7 verticals'] },
  { tier: 'Starter',    price: '$27',   color: '#818CF8',features: ['SAL Pro', '500 credits/mo', 'GitHub connect', 'Basic Builder', 'All verticals'] },
  { tier: 'Pro',        price: '$97',   color: C.amber,  features: ['SAL Max', '2,000 credits/mo', 'Full Builder', 'Voice AI', 'Career Suite', 'Image + Video gen', 'Vercel deploy'] },
  { tier: 'Teams',      price: '$297',  color: '#22C55E',features: ['SAL Max Fast', '10K credits/mo', '5 seats', 'GHL CRM', 'Cloudflare deploy', 'Custom domains'] },
  { tier: 'Enterprise', price: '$497',  color: '#EC4899',features: ['Unlimited', 'API access', 'White-label', 'HACP™ License', 'Enterprise SLA', 'Dedicated support'] },
];

const STRIPE_LINKS = {
  Free:       'https://buy.stripe.com/28EaEYgvk7zjbaPa2gbjW06',
  Starter:    'https://buy.stripe.com/8x2eVea6W3j30wb3DSbjW07',
  Pro:        'https://buy.stripe.com/5kQ3cw92S8Dn3In4HWbjW08',
  Teams:      'https://buy.stripe.com/fZufZi5QG9Hr2Ej4HWbjW09',
  Enterprise: 'https://buy.stripe.com/7sY5kEbb0cTDa6L2zObjW0a',
};

export default function DashboardScreen() {
  const [health, setHealth] = useState(null);
  const [healthLoading, setHealthLoading] = useState(true);

  useEffect(() => {
    checkHealth().then(h => { setHealth(h); setHealthLoading(false); });
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSub}>SaintSal™ command center</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>

        {/* Brand card */}
        <View style={styles.brandCard}>
          <View style={styles.brandRow}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>S</Text>
            </View>
            <View>
              <Text style={styles.brandName}>SaintSal™ Labs</Text>
              <Text style={styles.brandSub}>saintsallabs.com</Text>
            </View>
          </View>
          <Text style={styles.brandPatent}>US Patent #10,290,222 · HACP Protocol · 53 AI Models · 88 API Connectors</Text>
          <View style={styles.brandStats}>
            {[['53', 'AI Models'], ['88', 'Connectors'], ['7', 'Verticals'], ['5', 'Tiers']].map(([n, l]) => (
              <View key={l} style={styles.stat}>
                <Text style={styles.statNum}>{n}</Text>
                <Text style={styles.statLabel}>{l}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* API Health */}
        <Text style={styles.sectionLabel}>API STATUS</Text>
        <View style={styles.healthCard}>
          {healthLoading ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <ActivityIndicator size="small" color={C.amber} />
              <Text style={{ color: '#555', fontSize: 13 }}>Checking API gateway...</Text>
            </View>
          ) : (
            <View>
              <View style={styles.healthRow}>
                <View style={[styles.healthDot, { backgroundColor: health?.status === 'ok' ? '#22C55E' : '#EF4444' }]} />
                <Text style={{ color: C.text, fontSize: 14, fontWeight: '600' }}>
                  {health?.status === 'ok' ? 'All systems operational' : 'API offline'}
                </Text>
              </View>
              <View style={styles.providerRow}>
                {health?.providers && Object.entries(health.providers).map(([k, v]) => (
                  <View key={k} style={[styles.providerBadge, { borderColor: v ? '#22C55E33' : '#EF444433', backgroundColor: v ? '#22C55E0A' : '#EF44440A' }]}>
                    <View style={[styles.providerDot, { backgroundColor: v ? '#22C55E' : '#EF4444' }]} />
                    <Text style={[styles.providerLabel, { color: v ? '#22C55E' : '#EF4444' }]}>{k}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Quick actions */}
        <Text style={styles.sectionLabel}>QUICK LAUNCH</Text>
        <View style={styles.quickGrid}>
          {[
            { label: 'Chat',     sub: '12 verticals',        color: C.amber,   icon: '💬' },
            { label: 'Builder',  sub: 'Code · Social · Video', color: '#818CF8', icon: '⚡' },
            { label: 'Search',   sub: 'Web grounded',         color: '#22C55E', icon: '🔍' },
            { label: 'Settings', sub: 'Profile · API keys',   color: '#EC4899', icon: '⚙️' },
          ].map(item => (
            <View key={item.label} style={[styles.quickCard, { borderColor: item.color + '22' }]}>
              <Text style={styles.quickIcon}>{item.icon}</Text>
              <Text style={[styles.quickLabel, { color: item.color }]}>{item.label}</Text>
              <Text style={styles.quickSub}>{item.sub}</Text>
            </View>
          ))}
        </View>

        {/* Pricing */}
        <Text style={styles.sectionLabel}>PLANS & PRICING</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 12, paddingRight: 16 }}>
            {TIER_DATA.map(t => (
              <View key={t.tier} style={[styles.tierCard, { borderColor: t.color + '33' }]}>
                <Text style={[styles.tierName, { color: t.color }]}>{t.tier}</Text>
                <Text style={[styles.tierPrice, { color: t.color }]}>{t.price}<Text style={{ fontSize: 11, fontWeight: '400', color: '#555' }}>/mo</Text></Text>
                {t.features.map(f => (
                  <View key={f} style={styles.tierFeature}>
                    <Text style={{ color: t.color, fontSize: 12 }}>✓ </Text>
                    <Text style={styles.tierFeatureText}>{f}</Text>
                  </View>
                ))}
                {t.tier !== 'Free' && (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(STRIPE_LINKS[t.tier])}
                    style={[styles.tierBtn, { backgroundColor: t.color + '18', borderColor: t.color + '44' }]}
                  >
                    <Text style={[styles.tierBtnText, { color: t.color }]}>Get {t.tier} →</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Links */}
        <Text style={[styles.sectionLabel, { marginTop: 20 }]}>LINKS</Text>
        <View style={styles.linksCard}>
          {[
            { label: 'saintsallabs.com', url: 'https://saintsallabs.com' },
            { label: 'saintsal.ai', url: 'https://saintsal.ai' },
            { label: 'GitHub Repo', url: 'https://github.com/SaintVisions-SaintSal/saintsallabs-v2' },
            { label: 'hacpglobal.ai', url: 'https://hacpglobal.ai' },
          ].map(link => (
            <TouchableOpacity key={link.label} onPress={() => Linking.openURL(link.url)} style={styles.linkRow}>
              <Text style={styles.linkLabel}>{link.label}</Text>
              <Text style={styles.linkArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: C.borderSm, backgroundColor: C.sidebar },
  headerTitle: { fontSize: 16, fontWeight: '800', color: C.amber },
  headerSub: { fontSize: 11, color: C.textGhost, marginTop: 1 },
  brandCard: { backgroundColor: '#111116', borderWidth: 1, borderColor: C.amber + '22', borderRadius: 14, padding: 18, marginBottom: 20 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  brandMark: { width: 40, height: 40, borderRadius: 10, backgroundColor: C.amber, alignItems: 'center', justifyContent: 'center' },
  brandMarkText: { fontSize: 18, fontWeight: '900', color: '#000' },
  brandName: { fontSize: 17, fontWeight: '800', color: C.amber },
  brandSub: { fontSize: 11, color: '#444', marginTop: 1 },
  brandPatent: { fontSize: 11, color: '#333', marginBottom: 14, lineHeight: 17 },
  brandStats: { flexDirection: 'row', gap: 16 },
  stat: { alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: '800', color: C.text },
  statLabel: { fontSize: 10, color: '#444', marginTop: 1 },
  sectionLabel: { fontSize: 9, color: '#333', fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 },
  healthCard: { backgroundColor: '#111116', borderWidth: 1, borderColor: '#1C1C24', borderRadius: 12, padding: 16, marginBottom: 20 },
  healthRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  healthDot: { width: 8, height: 8, borderRadius: 4 },
  providerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  providerBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 7, borderWidth: 1 },
  providerDot: { width: 5, height: 5, borderRadius: 3 },
  providerLabel: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 11, marginBottom: 20 },
  quickCard: { width: '47%', backgroundColor: '#111116', borderWidth: 1, borderRadius: 11, padding: 16, gap: 4 },
  quickIcon: { fontSize: 22, marginBottom: 4 },
  quickLabel: { fontSize: 15, fontWeight: '700' },
  quickSub: { fontSize: 11, color: '#555' },
  tierCard: { width: 180, backgroundColor: '#111116', borderWidth: 1, borderRadius: 12, padding: 16 },
  tierName: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  tierPrice: { fontSize: 24, fontWeight: '800', marginBottom: 14 },
  tierFeature: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  tierFeatureText: { fontSize: 12, color: '#888', flex: 1 },
  tierBtn: { marginTop: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
  tierBtnText: { fontSize: 12.5, fontWeight: '700' },
  linksCard: { backgroundColor: '#111116', borderWidth: 1, borderColor: '#1C1C24', borderRadius: 12, overflow: 'hidden' },
  linkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderBottomWidth: 1, borderBottomColor: '#141420' },
  linkLabel: { fontSize: 13.5, color: C.amber, fontWeight: '500' },
  linkArrow: { fontSize: 14, color: '#333' },
});
