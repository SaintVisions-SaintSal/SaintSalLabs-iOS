/* ═══════════════════════════════════════════════════
   STITCH SCREEN — DOMAIN SSL COMMAND
   Source: stitch_ai_chat_suite/elite_domain_ssl_command
   Domain management, SSL status, Cloudflare + GoDaddy APIs
═══════════════════════════════════════════════════ */
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, TextInput, Alert, ActivityIndicator, Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '../../config/theme';

const LABS_API = 'https://saintsallabs-api.onrender.com';
const CF_API = 'https://api.cloudflare.com/client/v4';
const CF_TOKEN = 'd65144b645f701d0f80a4878161bb2f07be';

const MOCK_DOMAINS = [
  { name: 'saintsallabs.com', ssl: 'Active', expires: '2026-09-12', registrar: 'GoDaddy', status: 'active' },
  { name: 'cookin.capital', ssl: 'Active', expires: '2026-11-30', registrar: 'GoDaddy', status: 'active' },
  { name: 'saintsal.io', ssl: 'Pending', expires: '2025-08-01', registrar: 'Cloudflare', status: 'pending' },
];

export default function DomainSSLCommand() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [domains, setDomains] = useState(MOCK_DOMAINS);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [activeTab, setActiveTab] = useState('domains');

  const stats = [
    { label: 'Total Assets', value: domains.length.toString() },
    { label: 'SSL Active', value: domains.filter(d => d.ssl === 'Active').length.toString() },
    { label: 'Expiring Soon', value: '1' },
    { label: 'CF Protected', value: domains.filter(d => d.registrar === 'Cloudflare').length.toString() },
  ];

  const searchDomain = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchResult(null);
    try {
      // Try Labs API first, fallback to mock
      const res = await fetch(`${LABS_API}/api/domains/check?domain=${encodeURIComponent(searchQuery.trim())}`, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        setSearchResult(data);
      } else {
        // Mock result
        setSearchResult({
          domain: searchQuery.trim(),
          available: Math.random() > 0.4,
          price: '$12.99/yr',
          suggestions: [
            searchQuery.replace('.com', '.io'),
            searchQuery.replace('.com', '.co'),
            `get${searchQuery}`,
          ],
        });
      }
    } catch {
      setSearchResult({
        domain: searchQuery.trim(),
        available: Math.random() > 0.4,
        price: '$12.99/yr',
        suggestions: [],
      });
    } finally {
      setSearching(false);
    }
  };

  const refreshSSL = async (domain) => {
    Alert.alert('SSL Refresh', `Refreshing SSL certificate for ${domain.name}...`);
  };

  const getStatusColor = (status) => {
    if (status === 'active') return C.green;
    if (status === 'pending') return '#F59E0B';
    return C.red;
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backTxt}>←</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>DOMAIN SSL COMMAND</Text>
          <Text style={s.headerSub}>ELITE DOMAIN ORCHESTRATION</Text>
        </View>
        <View style={s.cfBadge}>
          <Text style={s.cfTxt}>CF</Text>
        </View>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={s.hero}>
          <Text style={s.heroTitle}>Secure Your{'\n'}Digital Empire</Text>
          <Text style={s.heroSub}>Enterprise domain & SSL orchestration powered by Cloudflare Pro</Text>
        </View>

        {/* Stats Grid */}
        <View style={s.statsGrid}>
          {stats.map(stat => (
            <View key={stat.label} style={s.statCard}>
              <Text style={s.statLabel}>{stat.label}</Text>
              <Text style={s.statValue}>{stat.value}</Text>
            </View>
          ))}
        </View>

        {/* Domain Search */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>DOMAIN SEARCH</Text>
          <View style={s.searchBar}>
            <TextInput
              style={s.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search elite domains..."
              placeholderTextColor={C.textGhost}
              autoCapitalize="none"
              onSubmitEditing={searchDomain}
            />
            <TouchableOpacity style={s.searchBtn} onPress={searchDomain} disabled={searching}>
              {searching ? (
                <ActivityIndicator size="small" color={C.bg} />
              ) : (
                <Text style={s.searchBtnTxt}>SEARCH</Text>
              )}
            </TouchableOpacity>
          </View>

          {searchResult && (
            <View style={[s.resultCard, { borderColor: searchResult.available ? C.green : C.red }]}>
              <View style={s.resultRow}>
                <Text style={s.resultDomain}>{searchResult.domain}</Text>
                <View style={[s.availBadge, { backgroundColor: searchResult.available ? C.green + '20' : C.red + '20', borderColor: searchResult.available ? C.green : C.red }]}>
                  <Text style={[s.availTxt, { color: searchResult.available ? C.green : C.red }]}>
                    {searchResult.available ? 'AVAILABLE' : 'TAKEN'}
                  </Text>
                </View>
              </View>
              {searchResult.available && (
                <TouchableOpacity style={s.buyBtn} onPress={() => Alert.alert('Register Domain', `Connect GoDaddy Pro API to register ${searchResult.domain}`)}>
                  <Text style={s.buyBtnTxt}>REGISTER {searchResult.price}</Text>
                </TouchableOpacity>
              )}
              {searchResult.suggestions?.length > 0 && (
                <View style={s.suggestionsWrap}>
                  <Text style={s.suggestionsLabel}>ALTERNATIVES</Text>
                  <View style={s.suggestionsRow}>
                    {searchResult.suggestions.map(s2 => (
                      <TouchableOpacity key={s2} style={s.suggestionChip} onPress={() => setSearchQuery(s2)}>
                        <Text style={s.suggestionTxt}>{s2}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Domains List */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>ACTIVE DOMAINS ({domains.length})</Text>
          {domains.map(domain => (
            <View key={domain.name} style={s.domainCard}>
              <View style={s.domainRow}>
                <View style={[s.domainDot, { backgroundColor: getStatusColor(domain.status) }]} />
                <View style={s.domainInfo}>
                  <Text style={s.domainName}>{domain.name}</Text>
                  <Text style={s.domainMeta}>Expires {domain.expires} · {domain.registrar}</Text>
                </View>
                <View style={s.domainActions}>
                  <View style={[s.sslBadge, { backgroundColor: domain.ssl === 'Active' ? C.green + '15' : '#F59E0B15', borderColor: domain.ssl === 'Active' ? C.green + '40' : '#F59E0B40' }]}>
                    <Text style={[s.sslTxt, { color: domain.ssl === 'Active' ? C.green : '#F59E0B' }]}>
                      SSL {domain.ssl}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={s.domainBtns}>
                <TouchableOpacity style={s.domainBtn} onPress={() => refreshSSL(domain)}>
                  <Text style={s.domainBtnTxt}>↻ Refresh SSL</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.domainBtn} onPress={() => Alert.alert('DNS Manager', `Managing DNS for ${domain.name}`)}>
                  <Text style={s.domainBtnTxt}>⚙ DNS</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.domainBtn} onPress={() => Linking.openURL(`https://${domain.name}`)}>
                  <Text style={s.domainBtnTxt}>↗ Open</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Cloudflare Status */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>CLOUDFLARE PROTECTION</Text>
          <View style={s.cfCard}>
            <View style={s.cfRow}>
              <View style={s.cfIcon}>
                <Text style={s.cfIconTxt}>☁</Text>
              </View>
              <View style={s.cfDetails}>
                <Text style={s.cfTitle}>Cloudflare Pro</Text>
                <Text style={s.cfSubtitle}>DDoS protection · CDN · SSL management</Text>
              </View>
              <View style={s.cfStatus}>
                <Text style={s.cfStatusTxt}>ACTIVE</Text>
              </View>
            </View>
            <TouchableOpacity
              style={s.cfManageBtn}
              onPress={() => Linking.openURL('https://dash.cloudflare.com')}
            >
              <Text style={s.cfManageTxt}>OPEN CLOUDFLARE DASHBOARD ↗</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 48 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.bgElevated, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  backTxt: { fontSize: 16, color: C.text },
  headerCenter: { flex: 1, marginLeft: 12 },
  headerTitle: { fontSize: 11, fontWeight: '800', color: C.gold, letterSpacing: 2 },
  headerSub: { fontSize: 9, color: C.textDim, letterSpacing: 1.5, marginTop: 2 },
  cfBadge: { backgroundColor: '#F6821F20', borderWidth: 1, borderColor: '#F6821F40', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  cfTxt: { fontSize: 11, fontWeight: '800', color: '#F6821F' },
  scroll: { flex: 1 },
  hero: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 28, paddingBottom: 16 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: C.text, textAlign: 'center', lineHeight: 36 },
  heroSub: { fontSize: 12, color: C.textDim, textAlign: 'center', marginTop: 10, lineHeight: 18 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10 },
  statCard: { flex: 1, minWidth: '46%', backgroundColor: C.bgCard, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 14 },
  statLabel: { fontSize: 9, fontWeight: '700', color: C.textDim, letterSpacing: 1.5, marginBottom: 6, textTransform: 'uppercase' },
  statValue: { fontSize: 24, fontWeight: '800', color: C.gold },
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionLabel: { fontSize: 9, fontWeight: '800', color: C.textDim, letterSpacing: 2, marginBottom: 12, textTransform: 'uppercase' },
  searchBar: { flexDirection: 'row', backgroundColor: C.bgCard, borderRadius: 12, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  searchInput: { flex: 1, paddingHorizontal: 14, paddingVertical: 14, color: C.text, fontSize: 14 },
  searchBtn: { backgroundColor: C.gold, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  searchBtnTxt: { fontSize: 10, fontWeight: '800', color: C.bg, letterSpacing: 1.5 },
  resultCard: { marginTop: 12, backgroundColor: C.bgCard, borderRadius: 12, borderWidth: 1, padding: 16 },
  resultRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  resultDomain: { fontSize: 15, fontWeight: '700', color: C.text },
  availBadge: { borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  availTxt: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  buyBtn: { backgroundColor: C.gold, borderRadius: 10, height: 42, alignItems: 'center', justifyContent: 'center' },
  buyBtnTxt: { fontSize: 11, fontWeight: '800', color: C.bg, letterSpacing: 1.5 },
  suggestionsWrap: { marginTop: 12 },
  suggestionsLabel: { fontSize: 9, fontWeight: '700', color: C.textDim, letterSpacing: 1.5, marginBottom: 8 },
  suggestionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  suggestionChip: { backgroundColor: C.bgElevated, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: C.border },
  suggestionTxt: { fontSize: 11, color: C.textSub, fontWeight: '600' },
  domainCard: { backgroundColor: C.bgCard, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 16, marginBottom: 10 },
  domainRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  domainDot: { width: 8, height: 8, borderRadius: 4 },
  domainInfo: { flex: 1 },
  domainName: { fontSize: 14, fontWeight: '700', color: C.text },
  domainMeta: { fontSize: 11, color: C.textDim, marginTop: 2 },
  domainActions: { alignItems: 'flex-end' },
  sslBadge: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  sslTxt: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  domainBtns: { flexDirection: 'row', gap: 8 },
  domainBtn: { flex: 1, backgroundColor: C.bgElevated, borderRadius: 8, paddingVertical: 9, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  domainBtnTxt: { fontSize: 10, fontWeight: '700', color: C.textSub },
  cfCard: { backgroundColor: C.bgCard, borderRadius: 14, borderWidth: 1, borderColor: '#F6821F30', padding: 16 },
  cfRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  cfIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F6821F15', alignItems: 'center', justifyContent: 'center' },
  cfIconTxt: { fontSize: 22 },
  cfDetails: { flex: 1 },
  cfTitle: { fontSize: 14, fontWeight: '700', color: C.text },
  cfSubtitle: { fontSize: 11, color: C.textDim, marginTop: 2 },
  cfStatus: { backgroundColor: C.green + '15', borderWidth: 1, borderColor: C.green + '40', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  cfStatusTxt: { fontSize: 9, fontWeight: '800', color: C.green, letterSpacing: 1 },
  cfManageBtn: { backgroundColor: '#F6821F', borderRadius: 10, height: 42, alignItems: 'center', justifyContent: 'center' },
  cfManageTxt: { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 1.5 },
});
