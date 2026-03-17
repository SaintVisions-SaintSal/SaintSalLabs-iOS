/* ═══════════════════════════════════════════════════
   STITCH SCREEN — GITHUB INTEGRATION CONSOLE
   Source: stitch_ai_chat_suite/github_integration_console
   Repos list, commits, branches, PRs, push code
═══════════════════════════════════════════════════ */
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, TextInput, Alert, ActivityIndicator, Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '../../config/theme';

const GITHUB_TOKEN = ''; // Set via Labs backend proxy
const GH_API = 'https://api.github.com';

const GH_HEADERS = {
  Authorization: GITHUB_TOKEN ? `token ${GITHUB_TOKEN}` : '',
  Accept: 'application/vnd.github.v3+json',
  'Content-Type': 'application/json',
};

const TABS = ['Repos', 'Commits', 'PRs'];

export default function GitHubConsole() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Repos');
  const [repos, setRepos] = useState([]);
  const [commits, setCommits] = useState([]);
  const [prs, setPRs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('saintsal-org/builder-core');
  const [activeRepo, setActiveRepo] = useState('saintsal-org/builder-core');
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    loadRepos();
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const res = await fetch(`${GH_API}/user`, { headers: GH_HEADERS });
      if (res.ok) {
        const data = await res.json();
        setUserInfo(data);
      }
    } catch {}
  };

  const loadRepos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${GH_API}/user/repos?per_page=20&sort=pushed`, { headers: GH_HEADERS });
      if (res.ok) {
        const data = await res.json();
        setRepos(data);
      } else {
        Alert.alert('GitHub Error', 'Check your access token.');
      }
    } catch {
      Alert.alert('Network Error', 'Could not reach GitHub.');
    } finally {
      setLoading(false);
    }
  };

  const loadCommits = async (repoFullName = activeRepo) => {
    setLoading(true);
    try {
      const res = await fetch(`${GH_API}/repos/${repoFullName}/commits?per_page=15`, { headers: GH_HEADERS });
      if (res.ok) {
        const data = await res.json();
        setCommits(data);
        setActiveTab('Commits');
      } else {
        Alert.alert('Error', `Could not load commits for ${repoFullName}`);
      }
    } catch {
      Alert.alert('Network Error', 'Could not fetch commits.');
    } finally {
      setLoading(false);
    }
  };

  const loadPRs = async (repoFullName = activeRepo) => {
    setLoading(true);
    try {
      const res = await fetch(`${GH_API}/repos/${repoFullName}/pulls?state=all&per_page=15`, { headers: GH_HEADERS });
      if (res.ok) {
        const data = await res.json();
        setPRs(data);
        setActiveTab('PRs');
      } else {
        Alert.alert('Error', `Could not load PRs for ${repoFullName}`);
      }
    } catch {
      Alert.alert('Network Error', 'Could not fetch PRs.');
    } finally {
      setLoading(false);
    }
  };

  const openInGitHub = (url) => {
    if (url) Linking.openURL(url);
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderRepos = () => (
    <View>
      {repos.length === 0 && !loading && (
        <Text style={s.emptyTxt}>No repos loaded. Pull to refresh.</Text>
      )}
      {repos.map(repo => (
        <TouchableOpacity
          key={repo.id}
          style={s.repoCard}
          onPress={() => {
            setActiveRepo(repo.full_name);
            Alert.alert(repo.full_name, `Stars: ${repo.stargazers_count}\nForks: ${repo.forks_count}\nBranch: ${repo.default_branch}`, [
              { text: 'Commits', onPress: () => loadCommits(repo.full_name) },
              { text: 'PRs', onPress: () => loadPRs(repo.full_name) },
              { text: 'Open in GitHub', onPress: () => openInGitHub(repo.html_url) },
              { text: 'Cancel', style: 'cancel' },
            ]);
          }}
          activeOpacity={0.75}
        >
          <View style={s.repoHeader}>
            <Text style={s.repoIcon}>{repo.private ? '🔒' : '🐙'}</Text>
            <View style={s.repoInfo}>
              <Text style={s.repoName}>{repo.name}</Text>
              <Text style={s.repoOrg}>{repo.full_name}</Text>
            </View>
            {repo.language && (
              <View style={s.langBadge}>
                <Text style={s.langTxt}>{repo.language}</Text>
              </View>
            )}
          </View>
          {repo.description ? (
            <Text style={s.repoDesc} numberOfLines={2}>{repo.description}</Text>
          ) : null}
          <View style={s.repoMeta}>
            <Text style={s.metaTxt}>★ {repo.stargazers_count}</Text>
            <Text style={s.metaSep}>·</Text>
            <Text style={s.metaTxt}>⑂ {repo.forks_count}</Text>
            <Text style={s.metaSep}>·</Text>
            <Text style={s.metaTxt}>{formatDate(repo.updated_at)}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderCommits = () => (
    <View>
      <Text style={s.subLabel}>REPO: {activeRepo}</Text>
      {commits.length === 0 && !loading && (
        <Text style={s.emptyTxt}>No commits loaded. Select a repo in Repos tab.</Text>
      )}
      {commits.map((commit, i) => (
        <TouchableOpacity
          key={commit.sha || i}
          style={s.commitCard}
          onPress={() => openInGitHub(commit.html_url)}
          activeOpacity={0.75}
        >
          <View style={s.commitHeader}>
            <Text style={s.shaTag}>{commit.sha?.slice(0, 7)}</Text>
            <Text style={s.commitDate}>{formatDate(commit.commit?.author?.date)}</Text>
          </View>
          <Text style={s.commitMsg} numberOfLines={2}>{commit.commit?.message}</Text>
          <Text style={s.commitAuthor}>{commit.commit?.author?.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPRs = () => (
    <View>
      <Text style={s.subLabel}>REPO: {activeRepo}</Text>
      {prs.length === 0 && !loading && (
        <Text style={s.emptyTxt}>No PRs found for this repo.</Text>
      )}
      {prs.map(pr => (
        <TouchableOpacity
          key={pr.id}
          style={s.prCard}
          onPress={() => openInGitHub(pr.html_url)}
          activeOpacity={0.75}
        >
          <View style={s.prHeader}>
            <View style={[s.prState, { backgroundColor: pr.state === 'open' ? '#22C55E20' : '#EF444420' }]}>
              <Text style={[s.prStateTxt, { color: pr.state === 'open' ? '#22C55E' : '#EF4444' }]}>
                {pr.state?.toUpperCase()}
              </Text>
            </View>
            <Text style={s.prNumber}>#{pr.number}</Text>
          </View>
          <Text style={s.prTitle} numberOfLines={2}>{pr.title}</Text>
          <Text style={s.prMeta}>{pr.user?.login} · {formatDate(pr.created_at)}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backTxt}>←</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>GITHUB INTEGRATION</Text>
          <View style={s.connectedRow}>
            <View style={s.connDot} />
            <Text style={s.connTxt}>CONNECTED{userInfo ? ` · @${userInfo.login}` : ''}</Text>
          </View>
        </View>
        <TouchableOpacity style={s.refreshBtn} onPress={loadRepos}>
          <Text style={s.refreshIcon}>↻</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={s.searchRow}>
        <TextInput
          style={s.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search repositories..."
          placeholderTextColor={C.textGhost}
          autoCapitalize="none"
          onSubmitEditing={() => {
            setActiveRepo(searchQuery);
            loadCommits(searchQuery);
          }}
        />
      </View>

      {/* Tabs */}
      <View style={s.tabRow}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[s.tab, activeTab === tab && s.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[s.tabTxt, activeTab === tab && s.tabTxtActive]}>{tab.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={s.loadingCenter}>
          <ActivityIndicator size="large" color={C.gold} />
          <Text style={s.loadingTxt}>Loading GitHub data...</Text>
        </View>
      ) : (
        <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
          {activeTab === 'Repos' && renderRepos()}
          {activeTab === 'Commits' && renderCommits()}
          {activeTab === 'PRs' && renderPRs()}
          <View style={{ height: 60 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.bgElevated, borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  backTxt: { fontSize: 16, color: C.text },
  headerCenter: { flex: 1, marginLeft: 12 },
  headerTitle: { fontSize: 13, fontWeight: '800', color: C.text, letterSpacing: 1 },
  connectedRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  connDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E' },
  connTxt: { fontSize: 9, fontWeight: '700', color: '#22C55E', letterSpacing: 1 },
  refreshBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.gold + '20', borderWidth: 1, borderColor: C.gold + '40',
    alignItems: 'center', justifyContent: 'center',
  },
  refreshIcon: { fontSize: 18, color: C.gold },
  searchRow: { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  searchInput: {
    backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    color: C.text, fontSize: 13,
  },
  tabRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: C.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: C.gold },
  tabTxt: { fontSize: 10, fontWeight: '700', color: C.textDim, letterSpacing: 1.5 },
  tabTxtActive: { color: C.gold },
  scroll: { flex: 1 },
  subLabel: { fontSize: 9, fontWeight: '800', color: C.textGhost, letterSpacing: 1.5, marginBottom: 12 },
  emptyTxt: { fontSize: 12, color: C.textGhost, textAlign: 'center', paddingVertical: 30 },
  loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  loadingTxt: { fontSize: 13, color: C.textDim },
  repoCard: {
    backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border,
    borderRadius: 14, padding: 14, marginBottom: 10,
  },
  repoHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  repoIcon: { fontSize: 20 },
  repoInfo: { flex: 1 },
  repoName: { fontSize: 14, fontWeight: '700', color: C.text },
  repoOrg: { fontSize: 10, color: C.textDim, marginTop: 1 },
  langBadge: {
    backgroundColor: C.gold + '20', borderWidth: 1, borderColor: C.gold + '40',
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
  },
  langTxt: { fontSize: 9, fontWeight: '700', color: C.gold },
  repoDesc: { fontSize: 12, color: C.textDim, marginBottom: 8, lineHeight: 18 },
  repoMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaTxt: { fontSize: 11, color: C.textGhost },
  metaSep: { fontSize: 11, color: C.border },
  commitCard: {
    backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, padding: 14, marginBottom: 8,
  },
  commitHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  shaTag: { fontSize: 11, fontFamily: 'monospace', color: C.gold, fontWeight: '700' },
  commitDate: { fontSize: 10, color: C.textGhost },
  commitMsg: { fontSize: 13, color: C.text, lineHeight: 18, marginBottom: 6 },
  commitAuthor: { fontSize: 10, color: C.textDim },
  prCard: {
    backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, padding: 14, marginBottom: 8,
  },
  prHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  prState: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  prStateTxt: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  prNumber: { fontSize: 12, color: C.textDim, fontFamily: 'monospace' },
  prTitle: { fontSize: 13, color: C.text, lineHeight: 18, marginBottom: 6 },
  prMeta: { fontSize: 10, color: C.textGhost },
});
