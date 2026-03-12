import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, Animated, Alert, Clipboard,
} from 'react-native';
import { C } from '../../config/theme';

const DOMAINS = [
  { id: 'd1', name: 'saintsallabs.com', status: 'active', ssl: 'valid', expires: '2027-03-15', provider: 'Cloudflare', records: 4 },
  { id: 'd2', name: 'saintsal.ai', status: 'active', ssl: 'valid', expires: '2026-11-22', provider: 'Cloudflare', records: 3 },
  { id: 'd3', name: 'sal-builder.dev', status: 'pending', ssl: 'provisioning', expires: '—', provider: 'Vercel', records: 2 },
  { id: 'd4', name: 'cookincapital.com', status: 'active', ssl: 'valid', expires: '2027-01-08', provider: 'GoDaddy', records: 5 },
  { id: 'd5', name: 'saintsal.app', status: 'error', ssl: 'expired', expires: '2026-02-01', provider: 'Cloudflare', records: 3 },
];

const DNS_RECORDS = {
  d1: [
    { type: 'A', name: '@', value: '76.76.21.21', ttl: '3600', proxied: true },
    { type: 'CNAME', name: 'www', value: 'cname.saintsal.app', ttl: 'Auto', proxied: true },
    { type: 'TXT', name: '@', value: 'v=spf1 include:_spf.google.com ~all', ttl: '3600', proxied: false },
    { type: 'MX', name: '@', value: 'mail.saintsallabs.com', ttl: '3600', proxied: false },
  ],
  d2: [
    { type: 'A', name: '@', value: '76.76.21.21', ttl: '3600', proxied: true },
    { type: 'CNAME', name: 'api', value: 'saintsallabs-api.onrender.com', ttl: 'Auto', proxied: false },
    { type: 'TXT', name: '@', value: 'google-site-verification=abc123', ttl: '3600', proxied: false },
  ],
  d3: [
    { type: 'A', name: '@', value: '76.76.21.21', ttl: '3600', proxied: false },
    { type: 'CNAME', name: 'www', value: 'cname.vercel-dns.com', ttl: 'Auto', proxied: false },
  ],
  d4: [
    { type: 'A', name: '@', value: '76.76.21.21', ttl: '3600', proxied: true },
    { type: 'CNAME', name: 'www', value: 'cname.saintsal.app', ttl: 'Auto', proxied: true },
    { type: 'CNAME', name: 'app', value: 'cookincapital.vercel.app', ttl: 'Auto', proxied: false },
    { type: 'TXT', name: '_dmarc', value: 'v=DMARC1; p=quarantine', ttl: '3600', proxied: false },
    { type: 'MX', name: '@', value: 'mail.cookincapital.com', ttl: '3600', proxied: false },
  ],
  d5: [
    { type: 'A', name: '@', value: '76.76.21.21', ttl: '3600', proxied: true },
    { type: 'CNAME', name: 'www', value: 'cname.saintsal.app', ttl: 'Auto', proxied: true },
    { type: 'TXT', name: '@', value: 'v=spf1 include:_spf.google.com ~all', ttl: '3600', proxied: false },
  ],
};

export default function DomainHubScreen() {
  const [selectedDomain, setSelectedDomain] = useState('d1');
  const [showAddDomain, setShowAddDomain] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [deployMode, setDeployMode] = useState('subdomain');
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 0.3, duration: 900, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
    ])).start();
  }, []);

  const domain = DOMAINS.find(d => d.id === selectedDomain);
  const records = DNS_RECORDS[selectedDomain] || [];

  const statusColor = (s) => {
    if (s === 'active' || s === 'valid') return C.green;
    if (s === 'pending' || s === 'provisioning') return C.amber;
    return C.red;
  };

  const statusLabel = (s) => {
    if (s === 'active') return '● Active';
    if (s === 'pending') return '◐ Pending';
    return '✕ Error';
  };

  const handleCopy = (val) => {
    Clipboard.setString(val);
    Alert.alert('Copied', val);
  };

  const handleAddDomain = () => {
    if (!newDomain.trim()) return;
    Alert.alert('Domain Added', `${newDomain} has been queued for verification.`);
    setNewDomain('');
    setShowAddDomain(false);
  };

  const typeColor = (type) => {
    const map = { A: C.amber, CNAME: C.blue, TXT: C.purple, MX: C.green };
    return map[type] || C.textDim;
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Domain Hub</Text>
          <Text style={s.headerSub}>{DOMAINS.filter(d => d.status === 'active').length} active · {DOMAINS.length} total</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => setShowAddDomain(!showAddDomain)}>
          <Text style={s.addBtnText}>{showAddDomain ? '✕' : '＋'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Add Domain */}
        {showAddDomain && (
          <View style={s.addCard}>
            <Text style={s.addCardTitle}>Add New Domain</Text>
            <View style={s.modeRow}>
              {['subdomain', 'custom'].map(m => (
                <TouchableOpacity key={m} style={[s.modeChip, deployMode === m && s.modeChipActive]} onPress={() => setDeployMode(m)}>
                  <Text style={[s.modeChipText, deployMode === m && s.modeChipTextActive]}>
                    {m === 'subdomain' ? 'SaintSal Subdomain' : 'Custom Domain'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={s.addInputRow}>
              <TextInput
                style={s.addInput}
                placeholder={deployMode === 'subdomain' ? 'yourapp.saintsal.app' : 'yourdomain.com'}
                placeholderTextColor={C.textGhost}
                value={newDomain}
                onChangeText={setNewDomain}
              />
              <TouchableOpacity style={s.verifyBtn} onPress={handleAddDomain}>
                <Text style={s.verifyBtnText}>VERIFY</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Domain List */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>YOUR DOMAINS</Text>
          {DOMAINS.map(d => (
            <TouchableOpacity
              key={d.id}
              style={[s.domainCard, selectedDomain === d.id && s.domainCardActive]}
              onPress={() => setSelectedDomain(d.id)}
            >
              <View style={s.domainTop}>
                <View style={{ flex: 1 }}>
                  <Text style={s.domainName}>{d.name}</Text>
                  <Text style={s.domainProvider}>{d.provider} · {d.records} records</Text>
                </View>
                <View style={[s.statusPill, { backgroundColor: statusColor(d.status) + '18' }]}>
                  <Text style={{ color: statusColor(d.status), fontSize: 11, fontWeight: '700' }}>{statusLabel(d.status)}</Text>
                </View>
              </View>
              <View style={s.domainBottom}>
                <View style={s.sslRow}>
                  <Text style={{ fontSize: 12 }}>🔒</Text>
                  <Text style={[s.sslText, { color: statusColor(d.ssl) }]}>SSL: {d.ssl}</Text>
                </View>
                <Text style={s.expiresText}>Expires: {d.expires}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* DNS Records */}
        {domain && (
          <View style={s.section}>
            <View style={s.dnsHeader}>
              <Text style={s.sectionLabel}>DNS RECORDS — {domain.name}</Text>
              <Text style={s.recordCount}>{records.length} records</Text>
            </View>
            {records.map((r, i) => (
              <View key={i} style={s.dnsRow}>
                <View style={[s.typeBadge, { backgroundColor: typeColor(r.type) + '18' }]}>
                  <Text style={[s.typeText, { color: typeColor(r.type) }]}>{r.type}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.dnsName}>{r.name}</Text>
                  <Text style={s.dnsValue} numberOfLines={1}>{r.value}</Text>
                </View>
                <View style={s.dnsRight}>
                  {r.proxied && (
                    <View style={s.proxiedBadge}>
                      <Text style={s.proxiedText}>☁ CF</Text>
                    </View>
                  )}
                  <TouchableOpacity onPress={() => handleCopy(r.value)} style={s.copyBtn}>
                    <Text style={{ fontSize: 14 }}>📋</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* SSL Certificate */}
        {domain && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>SSL CERTIFICATE</Text>
            <View style={[s.sslCard, { borderColor: statusColor(domain.ssl) + '30' }]}>
              <View style={s.sslCardTop}>
                <Text style={{ fontSize: 22 }}>{domain.ssl === 'valid' ? '🛡' : domain.ssl === 'provisioning' ? '⏳' : '⚠'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.sslCardTitle}>{domain.ssl === 'valid' ? 'Certificate Valid' : domain.ssl === 'provisioning' ? 'Provisioning...' : 'Certificate Expired'}</Text>
                  <Text style={s.sslCardSub}>{domain.name} · Let's Encrypt</Text>
                </View>
                {domain.ssl === 'expired' && (
                  <TouchableOpacity style={s.renewBtn}>
                    <Text style={s.renewBtnText}>Renew</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={s.sslMeta}>
                <View style={s.sslMetaItem}>
                  <Text style={s.sslMetaLabel}>Issuer</Text>
                  <Text style={s.sslMetaValue}>Let's Encrypt R3</Text>
                </View>
                <View style={s.sslMetaItem}>
                  <Text style={s.sslMetaLabel}>Expires</Text>
                  <Text style={s.sslMetaValue}>{domain.expires}</Text>
                </View>
                <View style={s.sslMetaItem}>
                  <Text style={s.sslMetaLabel}>Auto-Renew</Text>
                  <Text style={[s.sslMetaValue, { color: C.green }]}>Enabled</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Cloudflare Status */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>INTEGRATION STATUS</Text>
          <View style={s.integrationCard}>
            <View style={s.intRow}>
              <Text style={{ fontSize: 18 }}>☁</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.intName}>Cloudflare</Text>
                <Text style={s.intDetail}>DNS proxy, SSL, DDoS protection</Text>
              </View>
              <Animated.View style={[s.intDot, { backgroundColor: C.green, opacity: pulseAnim }]} />
            </View>
            <View style={s.intDivider} />
            <View style={s.intRow}>
              <Text style={{ fontSize: 18 }}>▲</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.intName}>Vercel</Text>
                <Text style={s.intDetail}>Edge deployment, serverless functions</Text>
              </View>
              <Animated.View style={[s.intDot, { backgroundColor: C.green, opacity: pulseAnim }]} />
            </View>
            <View style={s.intDivider} />
            <View style={s.intRow}>
              <Text style={{ fontSize: 18 }}>🖥</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.intName}>Render</Text>
                <Text style={s.intDetail}>API hosting, WebSocket support</Text>
              </View>
              <Animated.View style={[s.intDot, { backgroundColor: C.amber, opacity: pulseAnim }]} />
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  headerTitle: { fontSize: 22, fontWeight: '700', color: C.text, letterSpacing: -0.3 },
  headerSub: { fontSize: 12, color: C.textDim, marginTop: 2 },
  addBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.amber, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { fontSize: 18, fontWeight: '700', color: C.bg },
  scroll: { flex: 1 },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionLabel: { fontSize: 10, fontWeight: '700', color: C.amber, letterSpacing: 1.5, marginBottom: 12 },
  addCard: { marginHorizontal: 20, marginTop: 20, backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.amber + '30', borderRadius: 14, padding: 16 },
  addCardTitle: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 12 },
  modeRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  modeChip: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: C.bgElevated, borderWidth: 1, borderColor: C.border, alignItems: 'center' },
  modeChipActive: { backgroundColor: C.amber + '15', borderColor: C.amber + '40' },
  modeChipText: { fontSize: 12, fontWeight: '600', color: C.textMuted },
  modeChipTextActive: { color: C.amber },
  addInputRow: { flexDirection: 'row', gap: 8 },
  addInput: { flex: 1, backgroundColor: C.bgInput, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: C.text, fontSize: 14 },
  verifyBtn: { backgroundColor: C.amber + '18', paddingHorizontal: 16, borderRadius: 10, justifyContent: 'center' },
  verifyBtnText: { fontSize: 11, fontWeight: '800', color: C.amber, letterSpacing: 1 },
  domainCard: { backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 14, marginBottom: 8 },
  domainCardActive: { borderColor: C.amber + '40', backgroundColor: C.amber + '06' },
  domainTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  domainName: { fontSize: 14, fontWeight: '700', color: C.text },
  domainProvider: { fontSize: 11, color: C.textDim, marginTop: 2 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  domainBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTopWidth: 1, borderTopColor: C.border },
  sslRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sslText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  expiresText: { fontSize: 11, color: C.textDim },
  dnsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  recordCount: { fontSize: 11, color: C.textDim },
  dnsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 12, marginBottom: 6 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, minWidth: 52, alignItems: 'center' },
  typeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  dnsName: { fontSize: 12, fontWeight: '600', color: C.textSub },
  dnsValue: { fontSize: 11, fontFamily: 'monospace', color: C.textDim, marginTop: 2 },
  dnsRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  proxiedBadge: { backgroundColor: C.blue + '18', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  proxiedText: { fontSize: 9, fontWeight: '700', color: C.blue },
  copyBtn: { padding: 4 },
  sslCard: { backgroundColor: C.bgCard, borderWidth: 1, borderRadius: 14, padding: 16 },
  sslCardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sslCardTitle: { fontSize: 15, fontWeight: '700', color: C.text },
  sslCardSub: { fontSize: 12, color: C.textDim, marginTop: 2 },
  renewBtn: { backgroundColor: C.red + '18', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  renewBtnText: { fontSize: 12, fontWeight: '700', color: C.red },
  sslMeta: { flexDirection: 'row', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.border, gap: 12 },
  sslMetaItem: { flex: 1 },
  sslMetaLabel: { fontSize: 10, fontWeight: '700', color: C.textGhost, letterSpacing: 0.5, textTransform: 'uppercase' },
  sslMetaValue: { fontSize: 12, fontWeight: '600', color: C.textSub, marginTop: 4 },
  integrationCard: { backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 16 },
  intRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  intName: { fontSize: 14, fontWeight: '700', color: C.text },
  intDetail: { fontSize: 11, color: C.textDim, marginTop: 1 },
  intDot: { width: 8, height: 8, borderRadius: 4 },
  intDivider: { height: 1, backgroundColor: C.border, marginVertical: 10 },
});
