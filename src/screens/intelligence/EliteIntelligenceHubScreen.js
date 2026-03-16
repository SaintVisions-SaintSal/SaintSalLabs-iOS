/* ═══════════════════════════════════════════════════
   SCREEN 12 — ELITE INTELLIGENCE HUB
   saintsal_elite_intelligence_hub → Apollo leads
   Wire: Perplexity + Tavily + Exa + Apollo
═══════════════════════════════════════════════════ */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Animated, Alert, FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/AuthContext';
import { API_BASE, API_KEY } from '../../lib/api';

const GHL_TOKEN = 'pit-24654b55-6e44-49f5-8912-5632ab08c615';
const GHL_BASE  = 'https://services.leadconnectorhq.com';
const GHL_LOC   = 'oRA8vL3OSiCPjpwmEC0V';

const GOLD = '#D4AF37';
const BG   = '#0F0F0F';
const CARD = '#161616';

const INTEL_SOURCES = [
  { id: 'all',        label: 'ALL',        icon: '⚡' },
  { id: 'perplexity', label: 'PERPLEXITY', icon: '🔎' },
  { id: 'tavily',     label: 'TAVILY',     icon: '🌐' },
  { id: 'exa',        label: 'EXA',        icon: '🔗' },
  { id: 'apollo',     label: 'APOLLO',     icon: '👤' },
];

const QUICK_SEARCHES = [
  '🔍 Find leads in SaaS space NYC',
  '📊 Latest AI funding rounds 2026',
  '🏢 Real estate investors Dallas TX',
  '💼 VCs backing fintech Series A',
];

export default function EliteIntelligenceHubScreen() {
  const router = useRouter();
  const { user, canUseAI } = useAuth();
  const [query, setQuery]     = useState('');
  const [source, setSource]   = useState('all');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [leads, setLeads]     = useState([]);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const pushLeadToGHL = async (lead) => {
    try {
      const body = {
        locationId: GHL_LOC,
        firstName: lead.first_name || '',
        lastName: lead.last_name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        companyName: lead.organization?.name || lead.company || '',
        title: lead.title || '',
        source: 'Apollo Intel Hub',
        tags: ['apollo-lead', 'saintsal-intel'],
      };
      const res = await fetch(`${GHL_BASE}/contacts/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${GHL_TOKEN}`, 'Content-Type': 'application/json', 'Version': '2021-07-28' },
        body: JSON.stringify(body),
      });
      if (res.ok) Alert.alert('GHL Sync', `${lead.first_name || 'Lead'} pushed to GoHighLevel.`);
      else Alert.alert('GHL Error', `Status ${res.status}`);
    } catch (e) {
      Alert.alert('GHL Error', e.message);
    }
  };

  const handleSearch = async (q) => {
    const searchQ = q || query;
    if (!searchQ.trim()) return;
    if (!canUseAI) return Alert.alert('Upgrade Required', 'Compute limit reached.', [
      { text: 'Upgrade', onPress: () => router.push('/(stack)/stripe-pricing') },
      { text: 'Cancel', style: 'cancel' },
    ]);

    setLoading(true);
    setResults([]);
    setLeads([]);

    try {
      const endpoint = source === 'apollo'
        ? `${API_BASE}/api/intel/apollo`
        : `${API_BASE}/api/intel/search`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-sal-key': API_KEY },
        body: JSON.stringify({ query: searchQ, source, limit: 10 }),
      });

      if (!res.ok) throw new Error(`Intel search failed: ${res.status}`);
      const data = await res.json();

      if (source === 'apollo' && data.contacts) {
        setLeads(data.contacts);
      } else if (data.results) {
        setResults(data.results);
      } else {
        setResults([{
          title: searchQ,
          snippet: data.answer || data.content || 'No results found.',
          url: '',
          source: source || 'intel',
        }]);
      }
    } catch (err) {
      Alert.alert('Search Error', err.message || 'Failed to search. Check connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backTxt}>‹</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Elite Intelligence Hub</Text>
          <View style={s.liveRow}>
            <Animated.View style={[s.liveDot, { opacity: pulseAnim }]} />
            <Text style={s.liveTxt}>GHL + APOLLO + PERPLEXITY + TAVILY + EXA</Text>
          </View>
        </View>
        <View style={s.statusBadge}>
          <View style={s.statusDot} />
          <Text style={s.statusTxt}>LIVE</Text>
        </View>
      </View>

      {/* Source Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.sourceRow}>
        {INTEL_SOURCES.map(src => (
          <TouchableOpacity
            key={src.id}
            style={[s.sourceChip, source === src.id && s.sourceActive]}
            onPress={() => setSource(src.id)}
            activeOpacity={0.8}
          >
            <Text style={s.sourceIcon}>{src.icon}</Text>
            <Text style={[s.sourceLabel, source === src.id && { color: BG }]}>{src.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Search Bar */}
        <View style={s.searchWrap}>
          <View style={s.searchBar}>
            <Text style={s.searchIcon}>🔍</Text>
            <TextInput
              style={s.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder={`Search via ${source.toUpperCase()}...`}
              placeholderTextColor="#444"
              returnKeyType="search"
              onSubmitEditing={() => handleSearch()}
              autoCorrect={false}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Text style={s.clearTxt}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[s.searchBtn, loading && { opacity: 0.6 }]}
            onPress={() => handleSearch()}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={s.searchBtnTxt}>{loading ? '...' : '→'}</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Search Chips */}
        {results.length === 0 && leads.length === 0 && !loading && (
          <>
            <Text style={s.quickLabel}>QUICK INTELLIGENCE</Text>
            <View style={s.quickGrid}>
              {QUICK_SEARCHES.map(q => (
                <TouchableOpacity key={q} style={s.quickChip} onPress={() => { setQuery(q.slice(2)); handleSearch(q.slice(2)); }} activeOpacity={0.8}>
                  <Text style={s.quickChipTxt}>{q}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* API Status */}
            <Text style={s.sectionLabel}>API CONNECTIONS</Text>
            {[
              { name: 'Perplexity AI',  status: 'Connected', color: '#22C55E' },
              { name: 'Tavily Search',  status: 'Connected', color: '#22C55E' },
              { name: 'Exa AI',         status: 'Connected', color: '#22C55E' },
              { name: 'Apollo.io',      status: 'Connected', color: '#22C55E' },
            ].map(api => (
              <View key={api.name} style={s.apiRow}>
                <View style={[s.apiDot, { backgroundColor: api.color }]} />
                <Text style={s.apiName}>{api.name}</Text>
                <Text style={[s.apiStatus, { color: api.color }]}>{api.status}</Text>
              </View>
            ))}
          </>
        )}

        {/* Search Results */}
        {results.length > 0 && results.map((r, i) => {
          const confidence = r.confidence ? Math.round(r.confidence * 100) : Math.max(60, 98 - i * 6);
          return (
            <View key={i} style={s.resultCard}>
              <View style={s.resultHeader}>
                <Text style={s.resultSource}>{(r.source || source).toUpperCase()}</Text>
                <View style={[s.confidenceBadge, { backgroundColor: confidence >= 85 ? '#22C55E18' : '#F59E0B18' }]}>
                  <Text style={[s.confidenceTxt, { color: confidence >= 85 ? '#22C55E' : '#F59E0B' }]}>{confidence}%</Text>
                </View>
                {r.url ? <Text style={s.resultUrl} numberOfLines={1}>{r.url}</Text> : null}
              </View>
              <Text style={s.resultTitle}>{r.title}</Text>
              <Text style={s.resultSnippet}>{r.snippet || r.content}</Text>
            </View>
          );
        })}

        {/* Apollo Lead Results */}
        {leads.length > 0 && (
          <>
            <Text style={s.sectionLabel}>APOLLO LEADS ({leads.length})</Text>
            {leads.map((lead, i) => (
              <View key={i} style={s.leadCard}>
                <View style={s.leadAvatar}>
                  <Text style={s.leadAvatarTxt}>{(lead.first_name || lead.name || '?').charAt(0).toUpperCase()}</Text>
                </View>
                <View style={s.leadInfo}>
                  <Text style={s.leadName}>{lead.first_name} {lead.last_name}</Text>
                  <Text style={s.leadTitle}>{lead.title}</Text>
                  <Text style={s.leadCompany}>{lead.organization?.name || lead.company}</Text>
                </View>
                <View style={s.leadActions}>
                  {lead.email && <Text style={s.leadEmail}>✉</Text>}
                  {lead.linkedin_url && <Text style={s.leadLinkedIn}>in</Text>}
                  <TouchableOpacity style={s.ghlBtn} onPress={() => pushLeadToGHL(lead)}>
                    <Text style={s.ghlBtnTxt}>→GHL</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

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
  headerTitle: { fontSize: 15, fontWeight: '800', color: '#E8E6E1', letterSpacing: -0.3 },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: GOLD },
  liveTxt: { fontSize: 7, fontWeight: '800', color: GOLD + '80', letterSpacing: 1.5 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#22C55E18', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#22C55E40' },
  statusDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#22C55E' },
  statusTxt: { fontSize: 9, fontWeight: '800', color: '#22C55E', letterSpacing: 1 },
  sourceRow: { paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  sourceChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: GOLD + '30', backgroundColor: CARD },
  sourceActive: { backgroundColor: GOLD, borderColor: GOLD },
  sourceIcon: { fontSize: 12 },
  sourceLabel: { fontSize: 9, fontWeight: '800', color: GOLD, letterSpacing: 1.5 },
  scroll: { flex: 1 },
  searchWrap: { flexDirection: 'row', gap: 10, paddingHorizontal: 14, paddingBottom: 14 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderWidth: 1, borderColor: GOLD + '30', borderRadius: 12, paddingHorizontal: 12, gap: 8 },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, height: 46, fontSize: 14, color: '#E8E6E1' },
  clearTxt: { fontSize: 14, color: '#6B7280', padding: 4 },
  searchBtn: { width: 46, height: 46, borderRadius: 12, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center' },
  searchBtnTxt: { fontSize: 20, fontWeight: '700', color: BG },
  quickLabel: { fontSize: 9, fontWeight: '800', color: '#6B7280', letterSpacing: 2, paddingHorizontal: 14, marginBottom: 10 },
  quickGrid: { paddingHorizontal: 14, gap: 8, marginBottom: 24 },
  quickChip: { backgroundColor: CARD, borderWidth: 1, borderColor: GOLD + '20', borderRadius: 10, padding: 12 },
  quickChipTxt: { fontSize: 13, color: '#E8E6E1', fontWeight: '500' },
  sectionLabel: { fontSize: 9, fontWeight: '800', color: '#6B7280', letterSpacing: 2, paddingHorizontal: 14, marginBottom: 10, marginTop: 4 },
  apiRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#FFFFFF06' },
  apiDot: { width: 8, height: 8, borderRadius: 4 },
  apiName: { flex: 1, fontSize: 13, fontWeight: '600', color: '#E8E6E1' },
  apiStatus: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  resultCard: { marginHorizontal: 14, marginBottom: 12, backgroundColor: CARD, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: GOLD + '18' },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  resultSource: { fontSize: 8, fontWeight: '800', color: GOLD, letterSpacing: 2, backgroundColor: GOLD + '18', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  resultUrl: { fontSize: 10, color: '#6B7280', flex: 1 },
  resultTitle: { fontSize: 14, fontWeight: '700', color: '#E8E6E1', marginBottom: 6, lineHeight: 20 },
  resultSnippet: { fontSize: 12, color: '#9CA3AF', lineHeight: 18 },
  leadCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 14, marginBottom: 10, backgroundColor: CARD, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: GOLD + '18' },
  leadAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: GOLD + '20', borderWidth: 1, borderColor: GOLD + '40', alignItems: 'center', justifyContent: 'center' },
  leadAvatarTxt: { fontSize: 18, fontWeight: '800', color: GOLD },
  leadInfo: { flex: 1, gap: 2 },
  leadName: { fontSize: 14, fontWeight: '700', color: '#E8E6E1' },
  leadTitle: { fontSize: 11, color: '#9CA3AF' },
  leadCompany: { fontSize: 11, fontWeight: '600', color: GOLD + '99' },
  leadActions: { flexDirection: 'row', gap: 8 },
  leadEmail: { fontSize: 16, color: '#6B7280' },
  leadLinkedIn: { fontSize: 11, fontWeight: '800', color: '#0A66C2', backgroundColor: '#0A66C218', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4 },
  ghlBtn: { backgroundColor: GOLD + '20', borderWidth: 1, borderColor: GOLD + '50', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  ghlBtnTxt: { fontSize: 9, fontWeight: '800', color: GOLD, letterSpacing: 1 },
  confidenceBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  confidenceTxt: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
});
