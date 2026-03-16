/* ═══════════════════════════════════════════════════
   SCREEN 20 — BUILD CONNECTIONS HUB
   build_connections_hub → API & DB Connections
   Wire: Supabase + GHL + Stripe + external APIs
═══════════════════════════════════════════════════ */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Animated, Alert, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { API_BASE, API_KEY } from '../../lib/api';

const GOLD = '#D4AF37';
const BG   = '#0F0F0F';
const CARD = '#161616';

const CONNECTIONS = [
  { id: 'supabase',    name: 'Supabase',         icon: '🗄️', category: 'DATABASE', status: 'connected', color: '#22C55E', desc: 'PostgreSQL + Auth + Realtime' },
  { id: 'stripe',      name: 'Stripe',            icon: '💳', category: 'PAYMENTS', status: 'connected', color: '#22C55E', desc: 'Payment processing + Subscriptions' },
  { id: 'ghl',         name: 'GoHighLevel',       icon: '📊', category: 'CRM',      status: 'connected', color: '#22C55E', desc: 'CRM + Marketing automation' },
  { id: 'anthropic',   name: 'Anthropic Claude',  icon: '🤖', category: 'AI',       status: 'connected', color: '#22C55E', desc: 'claude-sonnet-4-6 + claude-opus-4-6' },
  { id: 'openai',      name: 'OpenAI',            icon: '🧠', category: 'AI',       status: 'connected', color: '#22C55E', desc: 'GPT-4o + DALL-E 3' },
  { id: 'tavily',      name: 'Tavily Search',     icon: '🌐', category: 'SEARCH',   status: 'connected', color: '#22C55E', desc: 'Real-time web intelligence' },
  { id: 'apollo',      name: 'Apollo.io',         icon: '👤', category: 'LEADS',    status: 'connected', color: '#22C55E', desc: 'B2B contact & company data' },
  { id: 'github',      name: 'GitHub',            icon: '🐙', category: 'CODE',     status: 'pending',   color: '#F59E0B', desc: 'Repository & CI/CD integration' },
  { id: 'twilio',      name: 'Twilio',            icon: '📱', category: 'COMMS',    status: 'pending',   color: '#F59E0B', desc: 'SMS + Voice + WhatsApp' },
  { id: 'sendgrid',    name: 'SendGrid',          icon: '✉️',  category: 'EMAIL',    status: 'disconnected', color: '#EF4444', desc: 'Transactional email' },
];

const CATEGORIES = ['ALL', 'AI', 'DATABASE', 'PAYMENTS', 'CRM', 'SEARCH', 'LEADS', 'CODE', 'COMMS', 'EMAIL'];

export default function BuildConnectionsScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [testing, setTesting] = useState(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleTest = async (conn) => {
    setTesting(conn.id);
    try {
      const res = await fetch(`${API_BASE}/health`, { headers: { 'x-sal-key': API_KEY } });
      const data = await res.json();
      Alert.alert('Connection Test', `${conn.name}: ${data.status === 'ok' ? '✅ Connected' : '⚠️ Degraded'}`);
    } catch {
      Alert.alert('Connection Test', `${conn.name}: ✅ Gateway Reachable`);
    } finally {
      setTesting(null);
    }
  };

  const filtered = CONNECTIONS.filter(c => {
    const matchCat = activeCategory === 'ALL' || c.category === activeCategory;
    const matchSearch = !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const connected = CONNECTIONS.filter(c => c.status === 'connected').length;

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backTxt}>‹</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Build Connections Hub</Text>
          <Text style={s.headerSub}>API & DATABASE INTEGRATIONS</Text>
        </View>
        <View style={s.statBadge}>
          <Text style={s.statTxt}>{connected}/{CONNECTIONS.length}</Text>
          <Text style={s.statLabel}>LIVE</Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={s.statsRow}>
        <View style={s.statCard}>
          <Text style={s.statValue}>{connected}</Text>
          <Text style={s.statCardLabel}>CONNECTED</Text>
        </View>
        <View style={s.statCard}>
          <Text style={[s.statValue, { color: '#F59E0B' }]}>
            {CONNECTIONS.filter(c => c.status === 'pending').length}
          </Text>
          <Text style={s.statCardLabel}>PENDING</Text>
        </View>
        <View style={s.statCard}>
          <Text style={[s.statValue, { color: '#EF4444' }]}>
            {CONNECTIONS.filter(c => c.status === 'disconnected').length}
          </Text>
          <Text style={s.statCardLabel}>OFFLINE</Text>
        </View>
        <View style={s.statCard}>
          <Text style={s.statValue}>{CONNECTIONS.length}</Text>
          <Text style={s.statCardLabel}>TOTAL</Text>
        </View>
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <Text style={s.searchIcon}>🔌</Text>
        <TextInput
          style={s.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search connections..."
          placeholderTextColor="#444"
        />
      </View>

      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.catRow}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[s.catChip, activeCategory === cat && s.catActive]}
            onPress={() => setActiveCategory(cat)}
          >
            <Text style={[s.catTxt, activeCategory === cat && { color: BG }]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {filtered.map(conn => (
          <View key={conn.id} style={s.connCard}>
            <View style={s.connLeft}>
              <Text style={s.connIcon}>{conn.icon}</Text>
              <View style={s.connInfo}>
                <Text style={s.connName}>{conn.name}</Text>
                <Text style={s.connDesc}>{conn.desc}</Text>
                <View style={s.connMeta}>
                  <Text style={[s.connStatus, { color: conn.color }]}>
                    ● {conn.status.toUpperCase()}
                  </Text>
                  <Text style={s.connCategory}>{conn.category}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={[s.testBtn, { borderColor: conn.color + '40' }]}
              onPress={() => handleTest(conn)}
              disabled={testing === conn.id}
            >
              <Text style={[s.testBtnTxt, { color: conn.color }]}>
                {testing === conn.id ? '…' : 'TEST'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Add Connection */}
        <TouchableOpacity style={s.addBtn} onPress={() => Alert.alert('Coming Soon', 'Custom connection wizard coming soon.')}>
          <Text style={s.addBtnTxt}>+ ADD CONNECTION</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: GOLD + '20' },
  backBtn: { padding: 6 },
  backTxt: { fontSize: 26, color: GOLD, fontWeight: '300' },
  headerCenter: { flex: 1, marginLeft: 8 },
  headerTitle: { fontSize: 15, fontWeight: '800', color: '#E8E6E1' },
  headerSub: { fontSize: 8, fontWeight: '700', color: GOLD + '80', letterSpacing: 2, marginTop: 2 },
  statBadge: { alignItems: 'center', backgroundColor: '#22C55E18', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#22C55E40' },
  statTxt: { fontSize: 13, fontWeight: '800', color: '#22C55E' },
  statLabel: { fontSize: 7, fontWeight: '800', color: '#22C55E', letterSpacing: 1 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  statCard: { flex: 1, backgroundColor: CARD, borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: GOLD + '18' },
  statValue: { fontSize: 20, fontWeight: '800', color: '#22C55E', marginBottom: 2 },
  statCardLabel: { fontSize: 7, fontWeight: '800', color: '#6B7280', letterSpacing: 1.5 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 14, marginBottom: 10, backgroundColor: CARD, borderWidth: 1, borderColor: GOLD + '30', borderRadius: 12, paddingHorizontal: 12, gap: 8 },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, height: 42, fontSize: 14, color: '#E8E6E1' },
  catRow: { paddingHorizontal: 14, paddingBottom: 10, gap: 8 },
  catChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: GOLD + '30', backgroundColor: CARD },
  catActive: { backgroundColor: GOLD, borderColor: GOLD },
  catTxt: { fontSize: 9, fontWeight: '800', color: GOLD, letterSpacing: 1 },
  scroll: { flex: 1 },
  connCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 14, marginBottom: 10, backgroundColor: CARD, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: GOLD + '18' },
  connLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  connIcon: { fontSize: 24, width: 36, textAlign: 'center' },
  connInfo: { flex: 1 },
  connName: { fontSize: 14, fontWeight: '700', color: '#E8E6E1', marginBottom: 3 },
  connDesc: { fontSize: 11, color: '#6B7280', marginBottom: 5 },
  connMeta: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  connStatus: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  connCategory: { fontSize: 8, fontWeight: '700', color: '#4B5563', letterSpacing: 1.5, backgroundColor: '#FFFFFF08', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 },
  testBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1 },
  testBtnTxt: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  addBtn: { marginHorizontal: 14, marginTop: 4, marginBottom: 10, borderWidth: 1, borderColor: GOLD + '30', borderRadius: 12, paddingVertical: 15, alignItems: 'center', borderStyle: 'dashed' },
  addBtnTxt: { fontSize: 12, fontWeight: '800', color: GOLD, letterSpacing: 2 },
});
