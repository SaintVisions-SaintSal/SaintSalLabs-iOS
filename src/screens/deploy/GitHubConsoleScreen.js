import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, Animated, Alert,
} from 'react-native';
import { C } from '../../config/theme';

const REPOS = [
  { id: 'r1', name: 'saintsal-org/builder-core', branch: 'main', lastCommit: '2h ago', status: 'passing', stars: 42, language: 'TypeScript' },
  { id: 'r2', name: 'saintsal-org/api-gateway', branch: 'main', lastCommit: '5h ago', status: 'passing', stars: 18, language: 'Node.js' },
  { id: 'r3', name: 'saintsal-org/mobile-app', branch: 'development', lastCommit: '1d ago', status: 'failing', stars: 7, language: 'React Native' },
  { id: 'r4', name: 'saintsal-org/landing-page', branch: 'main', lastCommit: '3d ago', status: 'passing', stars: 12, language: 'Next.js' },
];

const PIPELINE_STEPS = [
  { id: 1, label: 'Code Push', detail: 'Triggered via GitHub Webhook', icon: '📤', status: 'done' },
  { id: 2, label: 'Build', detail: 'Compiling assets and dependencies', icon: '🔨', status: 'running' },
  { id: 3, label: 'Test', detail: 'Running CI test suite', icon: '🧪', status: 'pending' },
  { id: 4, label: 'Deploy', detail: 'Finalizing production environment', icon: '🚀', status: 'pending' },
];

const COMMITS = [
  { sha: 'a3f8c12', msg: 'feat: add streaming response handler', author: 'sal', time: '2h ago' },
  { sha: 'b92e4d7', msg: 'fix: resolve WebSocket reconnect loop', author: 'sal', time: '5h ago' },
  { sha: 'c1d6f03', msg: 'chore: update dependencies to latest', author: 'bot', time: '1d ago' },
  { sha: 'e47a9b1', msg: 'feat: implement HACP token refresh', author: 'sal', time: '2d ago' },
  { sha: 'f83c2e5', msg: 'refactor: extract middleware pipeline', author: 'sal', time: '3d ago' },
];

const BRANCHES = ['main', 'development', 'staging', 'feature/auth-v2'];

export default function GitHubConsoleScreen() {
  const [selectedRepo, setSelectedRepo] = useState('r1');
  const [selectedBranch, setSelectedBranch] = useState('main');
  const [searchQuery, setSearchQuery] = useState('');
  const [deploying, setDeploying] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
    ])).start();
    Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
    ).start();
  }, []);

  const filteredRepos = REPOS.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeploy = () => {
    Alert.alert('Deploy', `Trigger manual deploy from ${selectedBranch}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Deploy', onPress: () => {
        setDeploying(true);
        setTimeout(() => setDeploying(false), 3000);
      }},
    ]);
  };

  const getStepColor = (status) => {
    if (status === 'done') return C.green;
    if (status === 'running') return C.amber;
    return C.textGhost;
  };

  const getStepIcon = (status) => {
    if (status === 'done') return '✓';
    if (status === 'running') return '⟳';
    return '·';
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <View style={s.headerTop}>
          <View>
            <Text style={s.headerTitle}>GitHub Integration</Text>
            <View style={s.connectedRow}>
              <Animated.View style={[s.statusDot, { backgroundColor: C.green, opacity: pulseAnim }]} />
              <Text style={s.connectedLabel}>CONNECTED</Text>
            </View>
          </View>
          <View style={s.ghBadge}>
            <Text style={{ fontSize: 18 }}>🐙</Text>
          </View>
        </View>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Active Repo */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>ACTIVE REPOSITORY</Text>
          <View style={s.searchRow}>
            <Text style={s.searchIcon}>🔍</Text>
            <TextInput
              style={s.searchInput}
              placeholder="Search repositories..."
              placeholderTextColor={C.textGhost}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          {filteredRepos.map(repo => (
            <TouchableOpacity
              key={repo.id}
              style={[s.repoCard, selectedRepo === repo.id && s.repoCardActive]}
              onPress={() => setSelectedRepo(repo.id)}
            >
              <View style={s.repoIcon}>
                <Text style={{ fontSize: 16 }}>🌿</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.repoName}>{repo.name}</Text>
                <View style={s.repoMeta}>
                  <Text style={s.repoDetail}>{repo.branch}</Text>
                  <Text style={s.repoDot}>·</Text>
                  <Text style={s.repoDetail}>{repo.lastCommit}</Text>
                  <Text style={s.repoDot}>·</Text>
                  <Text style={s.repoDetail}>{repo.language}</Text>
                </View>
              </View>
              <View style={[s.statusBadge, { backgroundColor: repo.status === 'passing' ? C.greenGhost : C.redGhost }]}>
                <Text style={{ color: repo.status === 'passing' ? C.green : C.red, fontSize: 10, fontWeight: '700' }}>
                  {repo.status === 'passing' ? '✓ Passing' : '✕ Failing'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Branch Selection */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>DEPLOYMENT BRANCH</Text>
          <View style={s.branchRow}>
            {BRANCHES.map(b => (
              <TouchableOpacity
                key={b}
                style={[s.branchChip, selectedBranch === b && s.branchChipActive]}
                onPress={() => setSelectedBranch(b)}
              >
                <Text style={[s.branchText, selectedBranch === b && s.branchTextActive]}>{b}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={s.branchHint}>Auto-deploy triggers on every push to <Text style={{ color: C.text, fontFamily: 'monospace' }}>{selectedBranch}</Text></Text>
        </View>

        {/* Pipeline */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>DEPLOYMENT PIPELINE</Text>
          <View style={s.pipelineCard}>
            {PIPELINE_STEPS.map((step, i) => (
              <View key={step.id}>
                <View style={s.stepRow}>
                  <View style={[s.stepCircle, { backgroundColor: getStepColor(step.status) }]}>
                    <Text style={s.stepNum}>{step.status === 'done' ? '✓' : step.id}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.stepLabel, step.status === 'pending' && { color: C.textDim }]}>{step.label}</Text>
                    <Text style={s.stepDetail}>{step.detail}</Text>
                  </View>
                  <Text style={{ fontSize: 16 }}>{step.status === 'done' ? '✅' : step.status === 'running' ? '🔄' : '⏳'}</Text>
                </View>
                {i < PIPELINE_STEPS.length - 1 && <View style={s.stepConnector} />}
              </View>
            ))}
          </View>
        </View>

        {/* Recent Commits */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>RECENT COMMITS</Text>
          {COMMITS.map((c, i) => (
            <View key={c.sha} style={[s.commitRow, i < COMMITS.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.border }]}>
              <View style={s.commitSha}>
                <Text style={s.shaText}>{c.sha}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.commitMsg} numberOfLines={1}>{c.msg}</Text>
                <Text style={s.commitMeta}>{c.author} · {c.time}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Security */}
        <View style={s.securityCard}>
          <Text style={{ fontSize: 16 }}>🔒</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.secTitle}>SECURITY PROTOCOL</Text>
            <Text style={s.secBody}>
              Your GitHub PAT is encrypted via the <Text style={{ color: C.amber, fontFamily: 'monospace' }}>HACP protocol</Text>. SaintSal Labs never stores raw credentials.
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={s.section}>
          <TouchableOpacity style={s.deployBtn} onPress={handleDeploy} disabled={deploying}>
            <Text style={{ fontSize: 16 }}>{deploying ? '⏳' : '🚀'}</Text>
            <Text style={s.deployBtnText}>{deploying ? 'Deploying...' : 'Trigger Manual Deploy'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.disconnectBtn}>
            <Text style={s.disconnectText}>Disconnect Repository</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: C.text, letterSpacing: -0.3 },
  connectedRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  connectedLabel: { fontSize: 10, fontWeight: '700', color: C.textDim, letterSpacing: 1.5 },
  ghBadge: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.bgCard, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  scroll: { flex: 1 },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionLabel: { fontSize: 10, fontWeight: '700', color: C.amber, letterSpacing: 1.5, marginBottom: 12 },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bgInput, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 12, marginBottom: 12 },
  searchIcon: { fontSize: 14, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, color: C.text, fontSize: 14 },
  repoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 14, marginBottom: 8, gap: 12 },
  repoCardActive: { borderColor: C.amber + '40', backgroundColor: C.amber + '08' },
  repoIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.amber + '15', alignItems: 'center', justifyContent: 'center' },
  repoName: { fontSize: 13, fontWeight: '600', color: C.text },
  repoMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  repoDetail: { fontSize: 11, color: C.textDim },
  repoDot: { fontSize: 11, color: C.textGhost, marginHorizontal: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  branchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  branchChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border },
  branchChipActive: { backgroundColor: C.amber + '15', borderColor: C.amber + '40' },
  branchText: { fontSize: 12, fontWeight: '600', color: C.textMuted, fontFamily: 'monospace' },
  branchTextActive: { color: C.amber },
  branchHint: { fontSize: 11, color: C.textDim, marginTop: 10 },
  pipelineCard: { backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 18 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  stepNum: { fontSize: 13, fontWeight: '800', color: C.bg },
  stepLabel: { fontSize: 14, fontWeight: '700', color: C.text },
  stepDetail: { fontSize: 11, color: C.textDim, marginTop: 2 },
  stepConnector: { width: 2, height: 20, backgroundColor: C.border, marginLeft: 15, marginVertical: 4 },
  commitRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  commitSha: { backgroundColor: C.bgElevated, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  shaText: { fontSize: 11, fontFamily: 'monospace', color: C.amber },
  commitMsg: { fontSize: 13, color: C.text, fontWeight: '500' },
  commitMeta: { fontSize: 11, color: C.textDim, marginTop: 2 },
  securityCard: { flexDirection: 'row', gap: 12, marginHorizontal: 20, marginTop: 24, backgroundColor: C.amber + '08', borderWidth: 1, borderColor: C.amber + '18', borderRadius: 14, padding: 16 },
  secTitle: { fontSize: 10, fontWeight: '700', color: C.amber, letterSpacing: 1 },
  secBody: { fontSize: 12, color: C.textMuted, lineHeight: 18, marginTop: 4 },
  deployBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: C.amber, paddingVertical: 16, borderRadius: 14, marginTop: 4 },
  deployBtnText: { fontSize: 15, fontWeight: '800', color: C.bg },
  disconnectBtn: { alignItems: 'center', paddingVertical: 16, borderRadius: 14, borderWidth: 1, borderColor: C.amber + '40', marginTop: 10 },
  disconnectText: { fontSize: 14, fontWeight: '600', color: C.amber },
});
