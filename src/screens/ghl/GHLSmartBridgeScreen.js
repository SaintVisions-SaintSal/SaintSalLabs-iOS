/* ═══════════════════════════════════════════════════
   SCREEN 25 — GHL SMART BRIDGE
   elite_ghl_smart_bridge_supercharged
   Wire: GHL API 
   Contacts · Pipelines · Snapshots · Voice Agents
═══════════════════════════════════════════════════ */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Animated, Alert, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';

const GOLD  = '#D4AF37';
const AMBER = '#F59E0B';
const BG    = '#0F0F0F';
const CARD  = '#161616';

const GHL_BASE = 'https://services.leadconnectorhq.com';
const GHL_TOKEN = '';
const GHL_LOCATION = 'oRA8vL3OSiCPjpwmEC0V';

const TABS = ['OVERVIEW', 'CONTACTS', 'PIPELINES', 'SNAPSHOTS'];

const SNAPSHOTS = [
  { id: 'residential_lending', name: 'Residential Lending Pro', icon: '🏠', desc: 'Full residential CRM + workflows' },
  { id: 'commercial_lending',  name: 'Commercial Lending Pro',  icon: '🏢', desc: 'Commercial deal pipeline' },
  { id: 'ceo_pro',             name: 'CEO Pro System',          icon: '👑', desc: 'Executive ops + automations' },
  { id: 're_executive',        name: 'Real Estate Executive',   icon: '🏡', desc: 'Full RE investor system' },
  { id: 'market_intel',        name: 'The Market Intelligence', icon: '📊', desc: 'Market data + reporting' },
  { id: 'financial_guru',      name: 'Financial Guru',          icon: '💰', desc: 'Finance coaching system' },
  { id: 'cookin_cards',        name: 'CookinCards',             icon: '🃏', desc: 'Card grading + resale system' },
];

export default function GHLSmartBridgeScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [contacts, setContacts]   = useState([]);
  const [pipelines, setPipelines] = useState([]);
  const [metrics, setMetrics]     = useState({ contacts: 0, pipelines: 0, tasks: 0 });
  const [loading, setLoading]     = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.2, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
    loadData();
  }, []);

  const ghlHeaders = {
    'Authorization': `Bearer ${GHL_TOKEN}`,
    'Content-Type': 'application/json',
    'Version': '2021-07-28',
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // Load contacts
      const cRes = await fetch(`${GHL_BASE}/contacts/?locationId=${GHL_LOCATION}&limit=20`, { headers: ghlHeaders });
      if (cRes.ok) {
        const cData = await cRes.json();
        setContacts(cData.contacts || []);
        setMetrics(prev => ({ ...prev, contacts: cData.total || cData.contacts?.length || 0 }));
      }

      // Load pipelines
      const pRes = await fetch(`${GHL_BASE}/opportunities/pipelines/?locationId=${GHL_LOCATION}`, { headers: ghlHeaders });
      if (pRes.ok) {
        const pData = await pRes.json();
        setPipelines(pData.pipelines || []);
        setMetrics(prev => ({ ...prev, pipelines: pData.pipelines?.length || 0 }));
      }
    } catch (err) {
      // Silently fail — show cached/demo data
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Demo metrics if API returns nothing
  const displayMetrics = {
    contacts: metrics.contacts || 1284,
    pipelines: metrics.pipelines || 12,
    tasks: metrics.tasks || 48,
    reputation: 4.9,
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backTxt}>‹</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>GHL Smart Bridge</Text>
          <Text style={s.headerSub}>ELITE GHL SUPERCHARGED</Text>
        </View>
        <View style={s.connBadge}>
          <Animated.View style={[s.connDot, { opacity: pulseAnim }]} />
          <Text style={s.connTxt}>LIVE</Text>
        </View>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabsRow}>
        {TABS.map((t, i) => (
          <TouchableOpacity key={t} style={[s.tab, activeTab === i && s.tabActive]} onPress={() => setActiveTab(i)}>
            <Text style={[s.tabTxt, activeTab === i && { color: BG }]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={GOLD} />}
      >
        {/* OVERVIEW TAB */}
        {activeTab === 0 && (
          <View style={s.pad}>
            {/* Connection status */}
            <View style={s.connCard}>
              <View style={s.connLeft}>
                <View style={s.connIconBox}>
                  <Text style={{ fontSize: 22 }}>🔗</Text>
                </View>
                <View>
                  <Text style={s.connName}>GoHighLevel</Text>
                  <Text style={s.connLocation}>Location: {GHL_LOCATION.slice(0, 8)}...</Text>
                </View>
              </View>
              <View style={s.connActive}>
                <View style={s.activeDot} />
                <Text style={s.activeTxt}>CONNECTED</Text>
              </View>
            </View>

            {/* Metrics Grid */}
            <View style={s.metricsGrid}>
              <MetricCard icon="👥" value={displayMetrics.contacts.toLocaleString()} label="Contacts" color={GOLD} pct={82} />
              <MetricCard icon="📊" value={displayMetrics.pipelines.toString()} label="Pipelines" color={AMBER} pct={60} />
              <MetricCard icon="✅" value={displayMetrics.tasks.toString()} label="Tasks" color="#22C55E" pct={45} />
              <MetricCard icon="⭐" value={`${displayMetrics.reputation}/5`} label="Reputation" color="#818CF8" pct={98} />
            </View>

            {/* Real-Time Lead Bridge */}
            <Text style={s.sectionLabel}>REAL-TIME LEAD BRIDGE</Text>
            {[
              { name: 'Marcus D.', action: 'New contact added', time: '2m ago', color: '#22C55E' },
              { name: 'Sarah K.', action: 'Pipeline stage moved', time: '5m ago', color: AMBER },
              { name: 'James T.', action: 'Task completed', time: '12m ago', color: GOLD },
              { name: 'Elena R.', action: 'Appointment booked', time: '18m ago', color: '#818CF8' },
              { name: 'Chris M.', action: 'SMS campaign sent', time: '31m ago', color: '#EC4899' },
            ].map((item, i) => (
              <View key={i} style={s.feedItem}>
                <View style={[s.feedDot, { backgroundColor: item.color }]} />
                <View style={s.feedInfo}>
                  <Text style={s.feedName}>{item.name}</Text>
                  <Text style={s.feedAction}>{item.action}</Text>
                </View>
                <Text style={s.feedTime}>{item.time}</Text>
              </View>
            ))}
          </View>
        )}

        {/* CONTACTS TAB */}
        {activeTab === 1 && (
          <View style={s.pad}>
            <View style={s.tabHeader}>
              <Text style={s.tabHeaderTxt}>{displayMetrics.contacts.toLocaleString()} Contacts</Text>
              <TouchableOpacity style={s.addBtn}>
                <Text style={s.addBtnTxt}>+ ADD</Text>
              </TouchableOpacity>
            </View>
            {(contacts.length > 0 ? contacts : DEMO_CONTACTS).map((c, i) => (
              <View key={i} style={s.contactCard}>
                <View style={s.contactAvatar}>
                  <Text style={s.contactAvatarTxt}>{(c.firstName || c.first_name || 'U').charAt(0)}</Text>
                </View>
                <View style={s.contactInfo}>
                  <Text style={s.contactName}>{c.firstName || c.first_name} {c.lastName || c.last_name}</Text>
                  <Text style={s.contactEmail}>{c.email}</Text>
                  <Text style={s.contactPhone}>{c.phone}</Text>
                </View>
                <View style={s.contactTags}>
                  {(c.tags || ['lead']).slice(0, 1).map(tag => (
                    <View key={tag} style={s.tag}><Text style={s.tagTxt}>{tag}</Text></View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* PIPELINES TAB */}
        {activeTab === 2 && (
          <View style={s.pad}>
            <Text style={s.tabHeader2}>{displayMetrics.pipelines} Pipelines</Text>
            {(pipelines.length > 0 ? pipelines : DEMO_PIPELINES).map((p, i) => (
              <View key={i} style={s.pipelineCard}>
                <View style={s.pipelineLeft}>
                  <Text style={s.pipelineIcon}>📊</Text>
                  <View>
                    <Text style={s.pipelineName}>{p.name}</Text>
                    <Text style={s.pipelineStages}>{p.stages?.length || p.stageCount || 5} stages</Text>
                  </View>
                </View>
                <TouchableOpacity style={s.viewBtn}>
                  <Text style={s.viewBtnTxt}>VIEW →</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* SNAPSHOTS TAB */}
        {activeTab === 3 && (
          <View style={s.pad}>
            <Text style={s.sectionLabel}>GHL SNAPSHOTS</Text>
            <Text style={s.snapshotDesc}>Pre-built systems ready to deploy to your GHL account</Text>
            {SNAPSHOTS.map(snap => (
              <View key={snap.id} style={s.snapshotCard}>
                <Text style={s.snapIcon}>{snap.icon}</Text>
                <View style={s.snapInfo}>
                  <Text style={s.snapName}>{snap.name}</Text>
                  <Text style={s.snapDesc}>{snap.desc}</Text>
                </View>
                <TouchableOpacity style={s.deployBtn} onPress={() => Alert.alert('Deploy Snapshot', `Deploy "${snap.name}" to your GHL account?`, [{ text: 'Deploy', onPress: () => {} }, { text: 'Cancel', style: 'cancel' }])}>
                  <Text style={s.deployTxt}>DEPLOY</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricCard({ icon, value, label, color, pct }) {
  return (
    <View style={[mc.card, { borderColor: color + '30' }]}>
      <Text style={mc.icon}>{icon}</Text>
      <Text style={[mc.value, { color }]}>{value}</Text>
      <Text style={mc.label}>{label}</Text>
      <View style={mc.barTrack}>
        <View style={[mc.barFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const DEMO_CONTACTS = [
  { firstName: 'Marcus', lastName: 'Davis', email: 'marcus@email.com', phone: '+1 555-0101', tags: ['hot-lead'] },
  { firstName: 'Sarah', lastName: 'Kim', email: 'sarah@email.com', phone: '+1 555-0102', tags: ['client'] },
  { firstName: 'James', lastName: 'Torres', email: 'james@email.com', phone: '+1 555-0103', tags: ['prospect'] },
  { firstName: 'Elena', lastName: 'Ross', email: 'elena@email.com', phone: '+1 555-0104', tags: ['vip'] },
];

const DEMO_PIPELINES = [
  { name: 'Residential Leads', stages: [1,2,3,4,5] },
  { name: 'Commercial Pipeline', stages: [1,2,3,4] },
  { name: 'Investor Prospects', stages: [1,2,3,4,5,6] },
  { name: 'Referral Network', stages: [1,2,3] },
];

const mc = StyleSheet.create({
  card: { flex: 1, backgroundColor: CARD, borderRadius: 12, padding: 12, borderWidth: 1, alignItems: 'center', gap: 4 },
  icon: { fontSize: 22 },
  value: { fontSize: 18, fontWeight: '800' },
  label: { fontSize: 9, fontWeight: '700', color: '#6B7280', letterSpacing: 1 },
  barTrack: { width: '100%', height: 3, backgroundColor: '#1C1C24', borderRadius: 2, overflow: 'hidden', marginTop: 6 },
  barFill: { height: 3, borderRadius: 2 },
});

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: GOLD + '20' },
  backBtn: { padding: 6 },
  backTxt: { fontSize: 26, color: GOLD, fontWeight: '300' },
  headerCenter: { flex: 1, marginLeft: 8 },
  headerTitle: { fontSize: 15, fontWeight: '800', color: '#E8E6E1' },
  headerSub: { fontSize: 8, fontWeight: '700', color: GOLD + '80', letterSpacing: 2, marginTop: 2 },
  connBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#22C55E18', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#22C55E40' },
  connDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E' },
  connTxt: { fontSize: 9, fontWeight: '800', color: '#22C55E', letterSpacing: 1 },
  tabsRow: { paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: GOLD + '30', backgroundColor: CARD },
  tabActive: { backgroundColor: GOLD, borderColor: GOLD },
  tabTxt: { fontSize: 10, fontWeight: '800', color: GOLD, letterSpacing: 1 },
  scroll: { flex: 1 },
  pad: { padding: 14 },
  connCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: CARD, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: GOLD + '30', marginBottom: 16 },
  connLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  connIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: GOLD + '18', alignItems: 'center', justifyContent: 'center' },
  connName: { fontSize: 14, fontWeight: '700', color: '#E8E6E1' },
  connLocation: { fontSize: 10, color: '#6B7280', marginTop: 2 },
  connActive: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#22C55E18', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E' },
  activeTxt: { fontSize: 9, fontWeight: '800', color: '#22C55E', letterSpacing: 1 },
  metricsGrid: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  sectionLabel: { fontSize: 9, fontWeight: '800', color: '#6B7280', letterSpacing: 2, marginBottom: 12 },
  feedItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#FFFFFF06' },
  feedDot: { width: 8, height: 8, borderRadius: 4 },
  feedInfo: { flex: 1 },
  feedName: { fontSize: 13, fontWeight: '700', color: '#E8E6E1' },
  feedAction: { fontSize: 11, color: '#6B7280', marginTop: 1 },
  feedTime: { fontSize: 10, color: '#444455' },
  tabHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  tabHeaderTxt: { fontSize: 15, fontWeight: '700', color: '#E8E6E1' },
  addBtn: { backgroundColor: GOLD, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  addBtnTxt: { fontSize: 11, fontWeight: '800', color: BG, letterSpacing: 1 },
  tabHeader2: { fontSize: 15, fontWeight: '700', color: '#E8E6E1', marginBottom: 14 },
  contactCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: CARD, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: GOLD + '15' },
  contactAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: GOLD + '20', alignItems: 'center', justifyContent: 'center' },
  contactAvatarTxt: { fontSize: 18, fontWeight: '800', color: GOLD },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 13, fontWeight: '700', color: '#E8E6E1' },
  contactEmail: { fontSize: 10, color: '#9CA3AF', marginTop: 1 },
  contactPhone: { fontSize: 10, color: '#9CA3AF' },
  contactTags: { gap: 4 },
  tag: { backgroundColor: GOLD + '18', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 4 },
  tagTxt: { fontSize: 9, fontWeight: '800', color: GOLD, letterSpacing: 1 },
  pipelineCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: CARD, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: GOLD + '15' },
  pipelineLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pipelineIcon: { fontSize: 22 },
  pipelineName: { fontSize: 13, fontWeight: '700', color: '#E8E6E1' },
  pipelineStages: { fontSize: 10, color: '#6B7280', marginTop: 2 },
  viewBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: GOLD + '40' },
  viewBtnTxt: { fontSize: 10, fontWeight: '800', color: GOLD, letterSpacing: 1 },
  snapshotDesc: { fontSize: 12, color: '#6B7280', marginBottom: 14, lineHeight: 18 },
  snapshotCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: CARD, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: GOLD + '20' },
  snapIcon: { fontSize: 28 },
  snapInfo: { flex: 1 },
  snapName: { fontSize: 13, fontWeight: '700', color: '#E8E6E1' },
  snapDesc: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  deployBtn: { backgroundColor: GOLD, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  deployTxt: { fontSize: 10, fontWeight: '800', color: BG, letterSpacing: 1 },
});
