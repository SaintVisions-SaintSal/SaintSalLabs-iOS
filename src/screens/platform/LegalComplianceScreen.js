/* ═══════════════════════════════════════════════════
   SCREEN 29 — ELITE LEGAL & COMPLIANCE VAULT
   elite_legal_compliance_vault → Contracts + Docs
   Wire: Claude legal drafting + document generation
═══════════════════════════════════════════════════ */
import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Alert, TextInput, Clipboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/AuthContext';
import { streamChat } from '../../lib/api';

const GOLD = '#D4AF37';
const BG   = '#0F0F0F';
const CARD = '#161616';

const DOC_TYPES = [
  { id: 'nda',       label: 'NDA',          icon: '🔒', desc: 'Non-Disclosure Agreement' },
  { id: 'contract',  label: 'CONTRACT',     icon: '📋', desc: 'Service Agreement' },
  { id: 'tos',       label: 'TERMS',        icon: '📜', desc: 'Terms of Service' },
  { id: 'privacy',   label: 'PRIVACY',      icon: '🛡️', desc: 'Privacy Policy' },
  { id: 'operating', label: 'OPERATING',    icon: '🏛️', desc: 'LLC Operating Agreement' },
  { id: 'equity',    label: 'EQUITY',       icon: '💰', desc: 'Equity Agreement' },
];

const COMPLIANCE_ITEMS = [
  { title: 'GDPR Compliance', status: 'review',    icon: '🇪🇺', desc: 'Data privacy regulations' },
  { title: 'SOC 2 Type II',   status: 'pending',   icon: '🔐', desc: 'Security audit certification' },
  { title: 'PCI DSS',         status: 'compliant', icon: '💳', desc: 'Payment card security' },
  { title: 'CCPA',            status: 'compliant', icon: '🌴', desc: 'California privacy law' },
  { title: 'HIPAA',           status: 'na',        icon: '🏥', desc: 'Healthcare data (if applicable)' },
];

const STATUS_CONFIG = {
  compliant: { color: '#22C55E', label: 'COMPLIANT' },
  review:    { color: '#F59E0B', label: 'REVIEW' },
  pending:   { color: '#6B7280', label: 'PENDING' },
  na:        { color: '#4B5563', label: 'N/A' },
};

export default function LegalComplianceScreen() {
  const router = useRouter();
  const { canUseAI } = useAuth();
  const [docType, setDocType]   = useState('nda');
  const [context, setContext]   = useState('');
  const [document, setDocument] = useState('');
  const [loading, setLoading]   = useState(false);
  const [activeTab, setActiveTab] = useState('docs');
  const xhrRef = useRef(null);

  const handleGenerate = async () => {
    if (!context.trim()) return Alert.alert('Error', 'Describe the parties and purpose.');
    if (!canUseAI) return Alert.alert('Upgrade', 'Compute limit reached.', [
      { text: 'Upgrade', onPress: () => router.push('/(stack)/stripe-pricing') },
      { text: 'Cancel', style: 'cancel' },
    ]);
    setLoading(true);
    setDocument('');
    const doc = DOC_TYPES.find(d => d.id === docType);

    xhrRef.current = streamChat({
      provider: 'anthropic',
      model: 'claude-sonnet-4-6',
      system: `You are SAL Legal Vault — an expert legal document drafting AI. Generate professional, comprehensive legal documents. Add appropriate placeholder fields in [BRACKETS]. Include a disclaimer that this is a template and should be reviewed by a licensed attorney.`,
      messages: [{
        role: 'user',
        content: `Draft a ${doc?.label} (${doc?.desc}).\n\nContext: ${context}\n\nGenerate a complete, professional document with all standard clauses.`
      }],
      onChunk: (chunk) => setDocument(prev => prev + chunk),
      onDone: () => setLoading(false),
      onError: (err) => { Alert.alert('Error', err); setLoading(false); },
    });
  };

  const handleStop = () => { xhrRef.current?.abort(); setLoading(false); };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backTxt}>‹</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Legal & Compliance Vault</Text>
          <Text style={s.headerSub}>CONTRACTS · PRIVACY · COMPLIANCE</Text>
        </View>
        <Text style={s.vaultIcon}>⚖️</Text>
      </View>

      {/* Tab Bar */}
      <View style={s.tabBar}>
        {['docs', 'compliance', 'vault'].map(t => (
          <TouchableOpacity key={t} style={[s.tab, activeTab === t && s.tabActive]} onPress={() => setActiveTab(t)}>
            <Text style={[s.tabTxt, activeTab === t && { color: BG }]}>{t.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Docs Tab */}
        {activeTab === 'docs' && (
          <View style={s.pad}>
            <Text style={s.fieldLabel}>DOCUMENT TYPE</Text>
            <View style={s.docGrid}>
              {DOC_TYPES.map(d => (
                <TouchableOpacity
                  key={d.id}
                  style={[s.docChip, docType === d.id && s.docActive]}
                  onPress={() => setDocType(d.id)}
                >
                  <Text style={s.docIcon}>{d.icon}</Text>
                  <Text style={[s.docLabel, docType === d.id && { color: BG }]}>{d.label}</Text>
                  <Text style={[s.docDesc, docType === d.id && { color: BG + 'AA' }]}>{d.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.fieldLabel}>CONTEXT & PARTIES</Text>
            <TextInput
              style={[s.input, { minHeight: 80, textAlignVertical: 'top' }]}
              value={context}
              onChangeText={setContext}
              placeholder="Describe the parties involved, purpose, jurisdiction, and key terms..."
              placeholderTextColor="#444"
              multiline
            />

            <TouchableOpacity
              style={[s.generateBtn, loading && { opacity: 0.7 }]}
              onPress={loading ? handleStop : handleGenerate}
            >
              <Text style={s.generateTxt}>{loading ? '⏹ STOP' : '⚖️ GENERATE DOCUMENT'}</Text>
            </TouchableOpacity>

            {document.length > 0 && (
              <View style={s.docCard}>
                <View style={s.docCardHeader}>
                  <Text style={s.docCardTitle}>{DOC_TYPES.find(d => d.id === docType)?.label}</Text>
                  <TouchableOpacity onPress={() => { Clipboard.setString(document); Alert.alert('Copied!', 'Document copied to clipboard.'); }}>
                    <Text style={s.copyBtn}>⧉ COPY</Text>
                  </TouchableOpacity>
                </View>
                <Text style={s.docText}>{document}</Text>
                {loading && <Text style={s.cursor}>▋</Text>}
                <View style={s.disclaimer}>
                  <Text style={s.disclaimerTxt}>⚠️ Template only. Consult a licensed attorney before use.</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Compliance Tab */}
        {activeTab === 'compliance' && (
          <View style={s.pad}>
            <Text style={s.sectionLabel}>COMPLIANCE STATUS</Text>
            {COMPLIANCE_ITEMS.map((item, i) => {
              const config = STATUS_CONFIG[item.status];
              return (
                <View key={i} style={s.complianceCard}>
                  <Text style={s.complianceIcon}>{item.icon}</Text>
                  <View style={s.complianceInfo}>
                    <Text style={s.complianceName}>{item.title}</Text>
                    <Text style={s.complianceDesc}>{item.desc}</Text>
                  </View>
                  <View style={[s.complianceBadge, { backgroundColor: config.color + '18', borderColor: config.color + '40' }]}>
                    <Text style={[s.complianceBadgeTxt, { color: config.color }]}>{config.label}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Vault Tab */}
        {activeTab === 'vault' && (
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>🔐</Text>
            <Text style={s.emptyTxt}>Document Vault</Text>
            <Text style={s.emptySub}>Signed and stored legal documents will appear here securely</Text>
            <TouchableOpacity style={[s.generateBtn, { marginTop: 20, width: '80%' }]}>
              <Text style={s.generateTxt}>+ UPLOAD DOCUMENT</Text>
            </TouchableOpacity>
          </View>
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
  headerTitle: { fontSize: 15, fontWeight: '800', color: '#E8E6E1' },
  headerSub: { fontSize: 8, fontWeight: '700', color: GOLD + '80', letterSpacing: 2, marginTop: 2 },
  vaultIcon: { fontSize: 24 },
  tabBar: { flexDirection: 'row', paddingHorizontal: 14, gap: 8, paddingVertical: 10 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: GOLD + '30', alignItems: 'center', backgroundColor: CARD },
  tabActive: { backgroundColor: GOLD, borderColor: GOLD },
  tabTxt: { fontSize: 9, fontWeight: '800', color: GOLD, letterSpacing: 1 },
  scroll: { flex: 1 },
  pad: { padding: 14 },
  fieldLabel: { fontSize: 9, fontWeight: '800', color: GOLD, letterSpacing: 2, marginBottom: 10, marginTop: 10 },
  docGrid: { gap: 8, marginBottom: 4 },
  docChip: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: CARD, borderWidth: 1, borderColor: GOLD + '20', borderRadius: 12, padding: 12 },
  docActive: { backgroundColor: GOLD, borderColor: GOLD },
  docIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  docLabel: { fontSize: 12, fontWeight: '800', color: GOLD, letterSpacing: 1, width: 80 },
  docDesc: { flex: 1, fontSize: 11, color: '#6B7280' },
  input: { backgroundColor: CARD, borderWidth: 1, borderColor: GOLD + '30', borderRadius: 12, padding: 14, color: '#E8E6E1', fontSize: 14 },
  generateBtn: { backgroundColor: GOLD, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 16, shadowColor: GOLD, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  generateTxt: { fontSize: 13, fontWeight: '800', color: BG, letterSpacing: 2 },
  docCard: { backgroundColor: CARD, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: GOLD + '20', marginTop: 16 },
  docCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: GOLD + '20', paddingBottom: 10 },
  docCardTitle: { fontSize: 12, fontWeight: '800', color: GOLD, letterSpacing: 2 },
  copyBtn: { fontSize: 11, fontWeight: '800', color: GOLD },
  docText: { fontSize: 12, color: '#E8E6E1', lineHeight: 20 },
  cursor: { color: GOLD, fontSize: 16 },
  disclaimer: { marginTop: 12, backgroundColor: '#F59E0B10', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#F59E0B20' },
  disclaimerTxt: { fontSize: 11, color: '#F59E0B', lineHeight: 16 },
  sectionLabel: { fontSize: 9, fontWeight: '800', color: '#6B7280', letterSpacing: 2, marginBottom: 12 },
  complianceCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: CARD, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: GOLD + '18', marginBottom: 10 },
  complianceIcon: { fontSize: 22 },
  complianceInfo: { flex: 1 },
  complianceName: { fontSize: 13, fontWeight: '700', color: '#E8E6E1', marginBottom: 3 },
  complianceDesc: { fontSize: 11, color: '#6B7280' },
  complianceBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  complianceBadgeTxt: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 20 },
  emptyIcon: { fontSize: 48, marginBottom: 14 },
  emptyTxt: { fontSize: 16, fontWeight: '700', color: '#E8E6E1', marginBottom: 8 },
  emptySub: { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
});
