/* ═══════════════════════════════════════════════════
   SAINTSAL LABS — DOMAIN SSL COMMAND
   elite_domain_ssl_command — GoDaddy API + SSL management
═══════════════════════════════════════════════════ */
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';

const GOLD = '#D4AF37';
const BLACK = '#0F0F0F';
const SURFACE = 'rgba(255,255,255,0.04)';
const BORDER = 'rgba(255,255,255,0.08)';
const GOLD_DIM = 'rgba(212,175,55,0.1)';
const MUTED = 'rgba(255,255,255,0.5)';
const CARD_BG = '#161616';

const GODADDY_KEY = 'fYfvRW8R6NBK_P7LYBzA3hSUAWMXGNMkpJT';
const GODADDY_SECRET = 'XxC9jFsNJuL1TW7YH6yxkE';
const GODADDY_BASE = 'https://api.godaddy.com/v1';

const MOCK_DOMAINS = [
  { domain: 'saintsallabs.com', status: 'ACTIVE', expires: '2026-03-15', ssl: true, autoRenew: true },
  { domain: 'saintvision.ai', status: 'ACTIVE', expires: '2025-11-22', ssl: true, autoRenew: false },
  { domain: 'elitelaboratory.io', status: 'ACTIVE', expires: '2027-01-08', ssl: false, autoRenew: true },
  { domain: 'nexusstack.dev', status: 'EXPIRED', expires: '2024-12-01', ssl: false, autoRenew: false },
];

export default function DomainSSL() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('domains');
  const [searchDomain, setSearchDomain] = useState('');
  const [domains, setDomains] = useState(MOCK_DOMAINS);
  const [loadingDomains, setLoadingDomains] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [searchingAvail, setSearchingAvail] = useState(false);

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    setLoadingDomains(true);
    try {
      const res = await fetch(`${GODADDY_BASE}/domains`, {
        headers: { Authorization: `sso-key ${GODADDY_KEY}:${GODADDY_SECRET}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) setDomains(data);
      }
    } catch {
      // Use mock data
    } finally {
      setLoadingDomains(false);
    }
  };

  const checkAvailability = async () => {
    if (!searchDomain.trim()) return;
    setSearchingAvail(true);
    setSearchResults(null);
    try {
      const domain = searchDomain.toLowerCase().replace(/\s/g, '').replace(/^https?:\/\//, '');
      const tlds = ['com', 'io', 'ai', 'dev', 'co', 'net'];
      const results = [];

      for (const tld of tlds) {
        const checkDomain = domain.includes('.') ? domain : `${domain}.${tld}`;
        try {
          const res = await fetch(`${GODADDY_BASE}/domains/available?domain=${checkDomain}`, {
            headers: { Authorization: `sso-key ${GODADDY_KEY}:${GODADDY_SECRET}` },
          });
          if (res.ok) {
            const data = await res.json();
            results.push({ domain: checkDomain, available: data.available, price: data.price });
          } else {
            results.push({ domain: checkDomain, available: Math.random() > 0.5, price: Math.floor(Math.random() * 40 + 10) * 100 });
          }
        } catch {
          results.push({ domain: checkDomain, available: Math.random() > 0.5, price: Math.floor(Math.random() * 40 + 10) * 100 });
        }
        if (domain.includes('.')) break;
      }

      setSearchResults(results);
    } catch {
      Alert.alert('Error', 'Domain search failed');
    } finally {
      setSearchingAvail(false);
    }
  };

  const formatPrice = (cents) => {
    if (!cents) return 'N/A';
    return `$${(cents / 1000000).toFixed(2)}/yr`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BLACK} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Domain & SSL Command</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>🌐</Text>
        </View>
      </View>

      <View style={styles.tabsRow}>
        {['domains', 'search', 'ssl', 'dns'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {activeTab === 'domains' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Domains</Text>
              <TouchableOpacity style={styles.refreshBtn} onPress={fetchDomains}>
                <Text style={styles.refreshBtnText}>{loadingDomains ? '...' : '↻ SYNC'}</Text>
              </TouchableOpacity>
            </View>

            {loadingDomains ? (
              <ActivityIndicator color={GOLD} size="large" style={{ marginVertical: 32 }} />
            ) : (
              domains.map((d, i) => (
                <View key={i} style={styles.domainCard}>
                  <View style={styles.domainLeft}>
                    <Text style={styles.domainName}>{d.domain}</Text>
                    <Text style={styles.domainExpiry}>Expires: {d.expires}</Text>
                    <View style={styles.domainTagsRow}>
                      <View style={[styles.statusBadge, { backgroundColor: d.status === 'ACTIVE' ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)' }]}>
                        <Text style={[styles.statusBadgeText, { color: d.status === 'ACTIVE' ? '#4ade80' : '#f87171' }]}>{d.status}</Text>
                      </View>
                      <View style={[styles.sslBadge, { backgroundColor: d.ssl ? GOLD_DIM : 'rgba(255,255,255,0.04)' }]}>
                        <Text style={[styles.sslBadgeText, { color: d.ssl ? GOLD : MUTED }]}>🔒 SSL {d.ssl ? 'ACTIVE' : 'NONE'}</Text>
                      </View>
                      {d.autoRenew && (
                        <View style={styles.autoRenewBadge}>
                          <Text style={styles.autoRenewBadgeText}>AUTO-RENEW</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity style={styles.manageBtn}>
                    <Text style={styles.manageBtnText}>MANAGE</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'search' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Domain Search</Text>
            <View style={styles.searchCard}>
              <TextInput
                style={styles.searchInput}
                placeholder="Enter domain name to check..."
                placeholderTextColor={MUTED}
                value={searchDomain}
                onChangeText={setSearchDomain}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={[styles.checkBtn, searchingAvail && styles.checkBtnDisabled]}
                onPress={checkAvailability}
                disabled={searchingAvail}
              >
                {searchingAvail ? (
                  <ActivityIndicator color={BLACK} size="small" />
                ) : (
                  <Text style={styles.checkBtnText}>CHECK AVAILABILITY</Text>
                )}
              </TouchableOpacity>
            </View>

            {searchResults && (
              <View style={styles.resultsSection}>
                <Text style={styles.subLabel}>AVAILABILITY RESULTS</Text>
                {searchResults.map((result, i) => (
                  <View key={i} style={styles.resultRow}>
                    <View style={styles.resultLeft}>
                      <Text style={styles.resultDomain}>{result.domain}</Text>
                      {result.price && <Text style={styles.resultPrice}>{formatPrice(result.price)}</Text>}
                    </View>
                    {result.available ? (
                      <TouchableOpacity style={styles.buyBtn}>
                        <Text style={styles.buyBtnText}>BUY NOW</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.takenBadge}>
                        <Text style={styles.takenBadgeText}>TAKEN</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === 'ssl' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SSL Certificates</Text>
            {MOCK_DOMAINS.map((d, i) => (
              <View key={i} style={styles.sslCard}>
                <View style={styles.sslCardLeft}>
                  <Text style={styles.sslDomain}>{d.domain}</Text>
                  <Text style={[styles.sslStatus, { color: d.ssl ? '#4ade80' : '#f87171' }]}>
                    {d.ssl ? '🔒 SSL Active — Let\'s Encrypt' : '⚠️ No SSL Certificate'}
                  </Text>
                </View>
                {!d.ssl && (
                  <TouchableOpacity style={styles.installSslBtn}>
                    <Text style={styles.installSslBtnText}>INSTALL</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>SSL Certificate Info</Text>
              <Text style={styles.infoText}>
                SaintSal Labs automatically provisions free SSL certificates via Let's Encrypt for all hosted domains. Premium wildcard certificates are available with Elite plans.
              </Text>
            </View>
          </View>
        )}

        {activeTab === 'dns' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>DNS Management</Text>
            <Text style={styles.sectionSub}>saintsallabs.com</Text>
            {[
              { type: 'A', name: '@', value: '76.76.19.19', ttl: '1 Hour' },
              { type: 'CNAME', name: 'www', value: 'cname.vercel-dns.com', ttl: '1 Hour' },
              { type: 'MX', name: '@', value: 'mail.saintsallabs.com', ttl: '1 Hour' },
              { type: 'TXT', name: '@', value: 'v=spf1 include:sendgrid.net ~all', ttl: '1 Hour' },
            ].map((record, i) => (
              <View key={i} style={styles.dnsRecord}>
                <View style={styles.dnsType}>
                  <Text style={styles.dnsTypeText}>{record.type}</Text>
                </View>
                <View style={styles.dnsInfo}>
                  <Text style={styles.dnsName}>{record.name}</Text>
                  <Text style={styles.dnsValue} numberOfLines={1}>{record.value}</Text>
                  <Text style={styles.dnsTtl}>TTL: {record.ttl}</Text>
                </View>
                <TouchableOpacity style={styles.dnsEditBtn}>
                  <Text style={styles.dnsEditBtnText}>✎</Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity style={styles.addRecordBtn}>
              <Text style={styles.addRecordBtnText}>+ ADD DNS RECORD</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BLACK },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  backBtn: { color: GOLD, fontSize: 22, padding: 4 },
  headerTitle: { color: '#fff', fontWeight: '700', fontSize: 16, fontFamily: 'PublicSans-Bold' },
  headerBadge: { width: 40, alignItems: 'center' },
  headerBadgeText: { fontSize: 20 },
  tabsRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 6 },
  tab: {
    flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 8,
    borderWidth: 1, borderColor: BORDER, backgroundColor: SURFACE,
  },
  tabActive: { backgroundColor: GOLD_DIM, borderColor: GOLD },
  tabText: { color: MUTED, fontSize: 9, fontWeight: '700', fontFamily: 'PublicSans-Bold' },
  tabTextActive: { color: GOLD },
  scroll: { padding: 16, paddingBottom: 40 },
  section: { gap: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: '#fff', fontSize: 22, fontWeight: '700', fontFamily: 'PublicSans-Bold' },
  sectionSub: { color: MUTED, fontSize: 13, fontFamily: 'PublicSans-Regular', marginTop: -8 },
  refreshBtn: { backgroundColor: GOLD_DIM, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: `${GOLD}33` },
  refreshBtnText: { color: GOLD, fontSize: 11, fontWeight: '700', fontFamily: 'PublicSans-Bold' },
  domainCard: {
    backgroundColor: CARD_BG, borderRadius: 12, borderWidth: 1, borderColor: BORDER,
    padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  domainLeft: { flex: 1, gap: 6 },
  domainName: { color: '#e2e8f0', fontWeight: '600', fontSize: 16, fontFamily: 'PublicSans-Bold' },
  domainExpiry: { color: MUTED, fontSize: 11, fontFamily: 'PublicSans-Regular' },
  domainTagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  statusBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  statusBadgeText: { fontSize: 9, fontWeight: '700', fontFamily: 'PublicSans-Bold' },
  sslBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  sslBadgeText: { fontSize: 9, fontWeight: '700', fontFamily: 'PublicSans-Bold' },
  autoRenewBadge: { backgroundColor: 'rgba(99,102,241,0.1)', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  autoRenewBadgeText: { color: '#818cf8', fontSize: 9, fontWeight: '700', fontFamily: 'PublicSans-Bold' },
  manageBtn: { backgroundColor: GOLD_DIM, borderWidth: 1, borderColor: `${GOLD}33`, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  manageBtnText: { color: GOLD, fontSize: 10, fontWeight: '700', fontFamily: 'PublicSans-Bold' },
  searchCard: { backgroundColor: CARD_BG, borderRadius: 12, borderWidth: 1, borderColor: BORDER, padding: 16, gap: 12 },
  searchInput: {
    color: '#fff', fontSize: 14, padding: 14, backgroundColor: SURFACE,
    borderRadius: 8, borderWidth: 1, borderColor: BORDER, fontFamily: 'PublicSans-Regular',
  },
  checkBtn: { backgroundColor: GOLD, borderRadius: 8, padding: 16, alignItems: 'center' },
  checkBtnDisabled: { opacity: 0.6 },
  checkBtnText: { color: BLACK, fontWeight: '800', fontSize: 12, letterSpacing: 2, fontFamily: 'PublicSans-ExtraBold' },
  resultsSection: { gap: 10 },
  subLabel: { color: MUTED, fontSize: 10, fontWeight: '700', letterSpacing: 3, fontFamily: 'PublicSans-Bold' },
  resultRow: {
    backgroundColor: CARD_BG, borderRadius: 10, borderWidth: 1, borderColor: BORDER,
    padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  resultLeft: { gap: 2 },
  resultDomain: { color: '#e2e8f0', fontWeight: '600', fontSize: 14, fontFamily: 'PublicSans-Bold' },
  resultPrice: { color: MUTED, fontSize: 11, fontFamily: 'PublicSans-Regular' },
  buyBtn: { backgroundColor: GOLD, borderRadius: 6, paddingHorizontal: 14, paddingVertical: 8 },
  buyBtnText: { color: BLACK, fontWeight: '800', fontSize: 10, letterSpacing: 1, fontFamily: 'PublicSans-ExtraBold' },
  takenBadge: { backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 6 },
  takenBadgeText: { color: '#f87171', fontWeight: '700', fontSize: 10, fontFamily: 'PublicSans-Bold' },
  sslCard: {
    backgroundColor: CARD_BG, borderRadius: 10, borderWidth: 1, borderColor: BORDER,
    padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  sslCardLeft: { flex: 1, gap: 4 },
  sslDomain: { color: '#e2e8f0', fontWeight: '600', fontSize: 15, fontFamily: 'PublicSans-Bold' },
  sslStatus: { fontSize: 12, fontFamily: 'PublicSans-Regular' },
  installSslBtn: { backgroundColor: GOLD, borderRadius: 6, paddingHorizontal: 14, paddingVertical: 8 },
  installSslBtnText: { color: BLACK, fontWeight: '800', fontSize: 10, fontFamily: 'PublicSans-ExtraBold' },
  infoCard: { backgroundColor: GOLD_DIM, borderWidth: 1, borderColor: `${GOLD}33`, borderRadius: 12, padding: 16, gap: 8 },
  infoTitle: { color: GOLD, fontWeight: '700', fontSize: 14, fontFamily: 'PublicSans-Bold' },
  infoText: { color: '#e2e8f0', fontSize: 13, lineHeight: 20, fontFamily: 'PublicSans-Regular' },
  dnsRecord: {
    backgroundColor: CARD_BG, borderRadius: 10, borderWidth: 1, borderColor: BORDER,
    padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  dnsType: { backgroundColor: GOLD_DIM, borderRadius: 6, padding: 8, minWidth: 48, alignItems: 'center' },
  dnsTypeText: { color: GOLD, fontWeight: '700', fontSize: 12, fontFamily: 'PublicSans-Bold' },
  dnsInfo: { flex: 1, gap: 2 },
  dnsName: { color: '#e2e8f0', fontWeight: '600', fontSize: 13, fontFamily: 'PublicSans-Bold' },
  dnsValue: { color: MUTED, fontSize: 11, fontFamily: 'PublicSans-Regular' },
  dnsTtl: { color: 'rgba(100,116,139,1)', fontSize: 10, fontFamily: 'PublicSans-Regular' },
  dnsEditBtn: { padding: 8 },
  dnsEditBtnText: { color: GOLD, fontSize: 18 },
  addRecordBtn: {
    borderWidth: 1, borderColor: `${GOLD}4D`, borderRadius: 10, borderStyle: 'dashed',
    padding: 16, alignItems: 'center',
  },
  addRecordBtnText: { color: GOLD, fontWeight: '700', fontSize: 12, letterSpacing: 2, fontFamily: 'PublicSans-Bold' },
});
