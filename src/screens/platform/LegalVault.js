/* ═══════════════════════════════════════════════════
   SAINTSAL LABS — LEGAL COMPLIANCE VAULT
   elite_legal_compliance_vault — HIPAA + Contracts + Claude
═══════════════════════════════════════════════════ */
import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { streamSalChat } from '../../lib/api';

const GOLD = '#D4AF37';
const BLACK = '#0F0F0F';
const SURFACE = 'rgba(255,255,255,0.04)';
const BORDER = 'rgba(255,255,255,0.08)';
const GOLD_DIM = 'rgba(212,175,55,0.1)';
const MUTED = 'rgba(255,255,255,0.5)';
const CARD_BG = '#161616';

const CONTRACT_TEMPLATES = [
  { id: 'nda', name: 'Non-Disclosure Agreement', icon: '🔒', category: 'Confidentiality' },
  { id: 'service', name: 'Service Agreement', icon: '🤝', category: 'Services' },
  { id: 'employment', name: 'Employment Contract', icon: '👔', category: 'Employment' },
  { id: 'consulting', name: 'Consulting Agreement', icon: '💼', category: 'Services' },
  { id: 'ip-assignment', name: 'IP Assignment Agreement', icon: '💡', category: 'Intellectual Property' },
  { id: 'operating', name: 'LLC Operating Agreement', icon: '🏢', category: 'Formation' },
  { id: 'partnership', name: 'Partnership Agreement', icon: '🤝', category: 'Formation' },
  { id: 'privacy-policy', name: 'Privacy Policy', icon: '🛡️', category: 'Compliance' },
];

const COMPLIANCE_ITEMS = [
  { name: 'HIPAA Data Security', status: 'compliant', score: 94 },
  { name: 'GDPR Privacy', status: 'review', score: 78 },
  { name: 'SOC 2 Type II', status: 'pending', score: 65 },
  { name: 'PCI DSS', status: 'compliant', score: 98 },
  { name: 'CCPA Compliance', status: 'compliant', score: 91 },
];

export default function LegalVault() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('vault');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [contractPrompt, setContractPrompt] = useState('');
  const [generatedContract, setGeneratedContract] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const xhrRef = useRef(null);

  useEffect(() => {
    return () => xhrRef.current?.abort?.();
  }, []);

  const generateContract = (template) => {
    const tpl = template || selectedTemplate;
    if (!tpl) { Alert.alert('Select a template first'); return; }
    setLoading(true);
    setGeneratedContract('');
    const prompt = contractPrompt.trim()
      ? `Generate a ${tpl.name} with these specifics: ${contractPrompt}`
      : `Generate a professional ${tpl.name} template for SaintSal Labs. Include all standard clauses, proper legal language, and placeholder fields in [BRACKETS] for customization.`;

    xhrRef.current = streamSalChat({
      mode: 'creative',
      messages: [{ role: 'user', content: prompt }],
      system: 'You are SaintSal™ Legal Intelligence — expert contract attorney specializing in business law, compliance, and contract drafting. Generate comprehensive, legally-sound documents with proper formatting. Include all necessary clauses. Note: These are templates for review by licensed counsel.',
      onChunk: (chunk) => setGeneratedContract(prev => prev + chunk),
      onDone: () => setLoading(false),
      onError: (err) => { setLoading(false); Alert.alert('Error', err); },
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'compliant': return '#4ade80';
      case 'review': return GOLD;
      case 'pending': return '#f87171';
      default: return MUTED;
    }
  };

  const filteredTemplates = CONTRACT_TEMPLATES.filter(t =>
    !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BLACK} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Legal Compliance Vault</Text>
        <View style={styles.lockIcon}>
          <Text style={styles.lockIconText}>🔒</Text>
        </View>
      </View>

      <View style={styles.tabsRow}>
        {['vault', 'contracts', 'compliance'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'vault' ? '📁 VAULT' : tab === 'contracts' ? '📝 CONTRACTS' : '✅ COMPLIANCE'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {activeTab === 'vault' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Document Vault</Text>
            <View style={styles.vaultStats}>
              {[
                { label: 'Total Documents', value: '47', icon: '📄' },
                { label: 'Active Contracts', value: '12', icon: '📋' },
                { label: 'Expiring Soon', value: '3', icon: '⏰' },
                { label: 'Compliance Score', value: '94%', icon: '✅' },
              ].map((stat, i) => (
                <View key={i} style={styles.statCard}>
                  <Text style={styles.statIcon}>{stat.icon}</Text>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.subLabel}>RECENT DOCUMENTS</Text>
            {[
              { name: 'Service Agreement — Nexus Corp', date: '2024-01-15', status: 'Active', type: 'Contract' },
              { name: 'NDA — TechCo Partnership', date: '2024-01-10', status: 'Signed', type: 'NDA' },
              { name: 'LLC Operating Agreement', date: '2024-01-05', status: 'Active', type: 'Formation' },
              { name: 'Privacy Policy v2.1', date: '2023-12-20', status: 'Active', type: 'Compliance' },
            ].map((doc, i) => (
              <View key={i} style={styles.docCard}>
                <View style={styles.docIcon}>
                  <Text style={styles.docIconText}>📄</Text>
                </View>
                <View style={styles.docInfo}>
                  <Text style={styles.docName}>{doc.name}</Text>
                  <Text style={styles.docDate}>{doc.date} · {doc.type}</Text>
                </View>
                <View style={[styles.docStatusBadge, { backgroundColor: doc.status === 'Active' || doc.status === 'Signed' ? 'rgba(74,222,128,0.1)' : SURFACE }]}>
                  <Text style={[styles.docStatusText, { color: doc.status === 'Active' || doc.status === 'Signed' ? '#4ade80' : MUTED }]}>{doc.status}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'contracts' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Contract Generator</Text>
            <Text style={styles.sectionSub}>Generate professional contracts with Claude AI</Text>

            <View style={styles.searchWrapper}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search templates..."
                placeholderTextColor={MUTED}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <Text style={styles.subLabel}>CONTRACT TEMPLATES</Text>
            <View style={styles.templatesGrid}>
              {filteredTemplates.map((template) => (
                <TouchableOpacity
                  key={template.id}
                  style={[styles.templateCard, selectedTemplate?.id === template.id && styles.templateCardSelected]}
                  onPress={() => setSelectedTemplate(template)}
                >
                  <Text style={styles.templateIcon}>{template.icon}</Text>
                  <Text style={styles.templateName}>{template.name}</Text>
                  <Text style={styles.templateCategory}>{template.category}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedTemplate && (
              <View style={styles.generateCard}>
                <Text style={styles.subLabel}>CUSTOMIZATION (OPTIONAL)</Text>
                <TextInput
                  style={styles.customInput}
                  placeholder={`Specific terms for your ${selectedTemplate.name}...`}
                  placeholderTextColor={MUTED}
                  value={contractPrompt}
                  onChangeText={setContractPrompt}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
                <TouchableOpacity
                  style={[styles.generateBtn, loading && styles.generateBtnDisabled]}
                  onPress={() => generateContract()}
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator color={BLACK} size="small" /> : <Text style={styles.generateBtnText}>🤖 GENERATE CONTRACT</Text>}
                </TouchableOpacity>
              </View>
            )}

            {(generatedContract || loading) && (
              <View style={styles.contractResult}>
                <View style={styles.contractResultHeader}>
                  <Text style={styles.contractResultTitle}>📝 GENERATED CONTRACT</Text>
                  {loading && <ActivityIndicator color={GOLD} size="small" />}
                </View>
                <Text style={styles.contractText}>{generatedContract || 'Drafting...'}</Text>
                <Text style={styles.contractDisclaimer}>⚠️ Template only. Review with licensed attorney before execution.</Text>
                {!loading && generatedContract && (
                  <TouchableOpacity style={styles.saveBtn}>
                    <Text style={styles.saveBtnText}>💾 SAVE TO VAULT</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}

        {activeTab === 'compliance' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Compliance Dashboard</Text>

            <View style={styles.overallScore}>
              <Text style={styles.overallScoreLabel}>OVERALL COMPLIANCE SCORE</Text>
              <Text style={styles.overallScoreValue}>94%</Text>
              <View style={styles.overallBar}>
                <View style={[styles.overallBarFill, { width: '94%' }]} />
              </View>
            </View>

            {COMPLIANCE_ITEMS.map((item, i) => (
              <View key={i} style={styles.complianceCard}>
                <View style={styles.complianceLeft}>
                  <Text style={styles.complianceName}>{item.name}</Text>
                  <View style={[styles.complianceStatusBadge, { backgroundColor: `${getStatusColor(item.status)}1A` }]}>
                    <Text style={[styles.complianceStatusText, { color: getStatusColor(item.status) }]}>
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <View style={styles.complianceRight}>
                  <Text style={[styles.complianceScore, { color: getStatusColor(item.status) }]}>{item.score}%</Text>
                  <View style={styles.complianceBar}>
                    <View style={[styles.complianceBarFill, { width: `${item.score}%`, backgroundColor: getStatusColor(item.status) }]} />
                  </View>
                </View>
              </View>
            ))}

            <View style={styles.hipaaCard}>
              <Text style={styles.hipaaTitle}>🏥 HIPAA Compliance Status</Text>
              {[
                { check: 'Data Encryption at Rest', pass: true },
                { check: 'Access Controls & Audit Logs', pass: true },
                { check: 'Business Associate Agreements', pass: true },
                { check: 'Risk Assessment (Annual)', pass: false },
                { check: 'Employee Training Records', pass: true },
              ].map((item, i) => (
                <View key={i} style={styles.hipaaCheck}>
                  <Text style={[styles.hipaaCheckIcon, { color: item.pass ? '#4ade80' : '#f87171' }]}>
                    {item.pass ? '✓' : '✕'}
                  </Text>
                  <Text style={[styles.hipaaCheckText, { color: item.pass ? '#e2e8f0' : MUTED }]}>{item.check}</Text>
                </View>
              ))}
            </View>
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
  lockIcon: { width: 40, alignItems: 'center' },
  lockIconText: { fontSize: 22 },
  tabsRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: BORDER, backgroundColor: SURFACE },
  tabActive: { backgroundColor: GOLD_DIM, borderColor: GOLD },
  tabText: { color: MUTED, fontSize: 9, fontWeight: '700', fontFamily: 'PublicSans-Bold' },
  tabTextActive: { color: GOLD },
  scroll: { padding: 16, paddingBottom: 40 },
  section: { gap: 16 },
  sectionTitle: { color: '#fff', fontSize: 22, fontWeight: '700', fontFamily: 'PublicSans-Bold' },
  sectionSub: { color: MUTED, fontSize: 12, fontFamily: 'PublicSans-Regular', marginTop: -8 },
  vaultStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: {
    flex: 1, minWidth: '45%', backgroundColor: CARD_BG, borderRadius: 10,
    borderWidth: 1, borderColor: BORDER, padding: 16, alignItems: 'center', gap: 4,
  },
  statIcon: { fontSize: 24 },
  statValue: { color: GOLD, fontWeight: '900', fontSize: 22, fontFamily: 'PublicSans-ExtraBold' },
  statLabel: { color: MUTED, fontSize: 10, letterSpacing: 1, textAlign: 'center', fontFamily: 'PublicSans-Regular' },
  subLabel: { color: MUTED, fontSize: 10, fontWeight: '700', letterSpacing: 3, fontFamily: 'PublicSans-Bold' },
  docCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: CARD_BG,
    borderRadius: 10, borderWidth: 1, borderColor: BORDER, padding: 14,
  },
  docIcon: { width: 44, height: 44, borderRadius: 10, backgroundColor: GOLD_DIM, alignItems: 'center', justifyContent: 'center' },
  docIconText: { fontSize: 22 },
  docInfo: { flex: 1, gap: 2 },
  docName: { color: '#e2e8f0', fontWeight: '600', fontSize: 13, fontFamily: 'PublicSans-Bold' },
  docDate: { color: MUTED, fontSize: 11, fontFamily: 'PublicSans-Regular' },
  docStatusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  docStatusText: { fontSize: 10, fontWeight: '700', fontFamily: 'PublicSans-Bold' },
  searchWrapper: { backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  searchInput: { color: '#fff', fontSize: 14, fontFamily: 'PublicSans-Regular' },
  templatesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  templateCard: {
    width: '47%', backgroundColor: CARD_BG, borderRadius: 12, borderWidth: 1, borderColor: BORDER,
    padding: 16, gap: 6, alignItems: 'center',
  },
  templateCardSelected: { borderColor: GOLD, backgroundColor: GOLD_DIM },
  templateIcon: { fontSize: 28 },
  templateName: { color: '#e2e8f0', fontWeight: '600', fontSize: 13, textAlign: 'center', fontFamily: 'PublicSans-Bold' },
  templateCategory: { color: MUTED, fontSize: 10, fontFamily: 'PublicSans-Regular' },
  generateCard: { backgroundColor: CARD_BG, borderRadius: 12, borderWidth: 1, borderColor: `${GOLD}33`, padding: 16, gap: 12 },
  customInput: { color: '#fff', fontSize: 14, minHeight: 80, fontFamily: 'PublicSans-Regular', backgroundColor: SURFACE, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: BORDER },
  generateBtn: { backgroundColor: GOLD, borderRadius: 8, padding: 16, alignItems: 'center' },
  generateBtnDisabled: { opacity: 0.6 },
  generateBtnText: { color: BLACK, fontWeight: '800', fontSize: 13, letterSpacing: 2, fontFamily: 'PublicSans-ExtraBold' },
  contractResult: { backgroundColor: CARD_BG, borderRadius: 12, borderWidth: 1, borderColor: `${GOLD}33`, padding: 16, gap: 12 },
  contractResultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  contractResultTitle: { color: GOLD, fontWeight: '700', fontSize: 12, letterSpacing: 2, fontFamily: 'PublicSans-Bold' },
  contractText: { color: '#e2e8f0', fontSize: 13, lineHeight: 20, fontFamily: 'PublicSans-Regular' },
  contractDisclaimer: { color: 'rgba(100,116,139,1)', fontSize: 11, fontStyle: 'italic', fontFamily: 'PublicSans-Regular' },
  saveBtn: { backgroundColor: SURFACE, borderWidth: 1, borderColor: GOLD, borderRadius: 8, padding: 14, alignItems: 'center' },
  saveBtnText: { color: GOLD, fontWeight: '700', fontSize: 12, letterSpacing: 2, fontFamily: 'PublicSans-Bold' },
  overallScore: { backgroundColor: CARD_BG, borderRadius: 12, borderWidth: 1, borderColor: `${GOLD}33`, padding: 20, gap: 12, alignItems: 'center' },
  overallScoreLabel: { color: MUTED, fontSize: 10, fontWeight: '700', letterSpacing: 3, fontFamily: 'PublicSans-Bold' },
  overallScoreValue: { color: GOLD, fontSize: 56, fontWeight: '900', fontFamily: 'PublicSans-ExtraBold' },
  overallBar: { width: '100%', height: 8, backgroundColor: BORDER, borderRadius: 4, overflow: 'hidden' },
  overallBarFill: { height: '100%', backgroundColor: GOLD, borderRadius: 4 },
  complianceCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: CARD_BG, borderRadius: 10, borderWidth: 1, borderColor: BORDER, padding: 16,
  },
  complianceLeft: { flex: 1, gap: 6 },
  complianceName: { color: '#e2e8f0', fontWeight: '600', fontSize: 14, fontFamily: 'PublicSans-Bold' },
  complianceStatusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  complianceStatusText: { fontSize: 10, fontWeight: '700', fontFamily: 'PublicSans-Bold' },
  complianceRight: { alignItems: 'flex-end', gap: 8, minWidth: 60 },
  complianceScore: { fontWeight: '800', fontSize: 20, fontFamily: 'PublicSans-ExtraBold' },
  complianceBar: { width: 60, height: 4, backgroundColor: BORDER, borderRadius: 2, overflow: 'hidden' },
  complianceBarFill: { height: '100%', borderRadius: 2 },
  hipaaCard: { backgroundColor: CARD_BG, borderRadius: 12, borderWidth: 1, borderColor: BORDER, padding: 16, gap: 12 },
  hipaaTitle: { color: GOLD, fontWeight: '700', fontSize: 14, fontFamily: 'PublicSans-Bold' },
  hipaaCheck: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  hipaaCheckIcon: { fontSize: 16, fontWeight: '800', width: 20 },
  hipaaCheckText: { fontSize: 13, fontFamily: 'PublicSans-Regular', flex: 1 },
});
