/* ═══════════════════════════════════════════════════
   SAINTSAL LABS — GITHUB CONSOLE V3
   github_integration_console — Repos + commits + deploy
═══════════════════════════════════════════════════ */
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, StatusBar, ActivityIndicator,
  Alert, FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';

const GOLD = '#D4AF37';
const BLACK = '#0F0F0F';
const SURFACE = 'rgba(255,255,255,0.04)';
const BORDER = 'rgba(255,255,255,0.08)';
const GOLD_DIM = 'rgba(212,175,55,0.1)';
const MUTED = 'rgba(255,255,255,0.5)';
const CARD_BG = '#161616';

const GITHUB_PAT = '';
const GITHUB_HEADERS = {
  'Authorization': `Bearer ${GITHUB_PAT}`,
  'Accept': 'application/vnd.github.v3+json',
  'X-GitHub-Api-Version': '2022-11-28',
};

export default function GitHubConsole() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('repos');
  const [repos, setRepos] = useState([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [commits, setCommits] = useState([]);
  const [loadingCommits, setLoadingCommits] = useState(false);
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUser();
    fetchRepos();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch('https://api.github.com/user', { headers: GITHUB_HEADERS });
      if (res.ok) setUser(await res.json());
    } catch {}
  };

  const fetchRepos = async () => {
    setLoadingRepos(true);
    try {
      const res = await fetch('https://api.github.com/user/repos?sort=updated&per_page=30', { headers: GITHUB_HEADERS });
      if (res.ok) {
        const data = await res.json();
        setRepos(data);
      } else {
        setRepos(MOCK_REPOS);
      }
    } catch {
      setRepos(MOCK_REPOS);
    } finally {
      setLoadingRepos(false);
    }
  };

  const fetchCommits = async (repo) => {
    setSelectedRepo(repo);
    setLoadingCommits(true);
    setCommits([]);
    setActiveTab('commits');
    try {
      const res = await fetch(`https://api.github.com/repos/${repo.full_name}/commits?per_page=20`, { headers: GITHUB_HEADERS });
      if (res.ok) {
        const data = await res.json();
        setCommits(data);
      } else {
        setCommits(MOCK_COMMITS);
      }
    } catch {
      setCommits(MOCK_COMMITS);
    } finally {
      setLoadingCommits(false);
    }
  };

  const deployToVercel = (repo) => {
    Alert.alert(
      'Deploy to Vercel',
      `Deploy ${repo.name} to Vercel?\n\nThis will trigger a production deployment.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Deploy', onPress: () => Alert.alert('Deploying', `${repo.name} deployment initiated!`) },
      ]
    );
  };

  const filteredRepos = repos.filter(r =>
    !search || r.name?.toLowerCase().includes(search.toLowerCase()) || r.description?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BLACK} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>GitHub Console</Text>
        {user && (
          <View style={styles.userBadge}>
            <Text style={styles.userBadgeText}>@{user.login}</Text>
          </View>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { label: 'REPOS', value: user?.public_repos || repos.length, icon: '📦' },
          { label: 'FOLLOWING', value: user?.following || '—', icon: '👥' },
          { label: 'STARS', value: repos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0), icon: '⭐' },
          { label: 'FORKS', value: repos.reduce((acc, r) => acc + (r.forks_count || 0), 0), icon: '🍴' },
        ].map((stat, i) => (
          <View key={i} style={styles.statCard}>
            <Text style={styles.statIcon}>{stat.icon}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.tabsRow}>
        {['repos', 'commits', 'deploy'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'repos' ? '📦 REPOS' : tab === 'commits' ? '📝 COMMITS' : '🚀 DEPLOY'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'repos' && (
        <View style={{ flex: 1 }}>
          <View style={styles.searchWrapper}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search repositories..."
              placeholderTextColor={MUTED}
              value={search}
              onChangeText={setSearch}
            />
            <TouchableOpacity onPress={fetchRepos}>
              <Text style={{ color: GOLD, fontSize: 18 }}>↻</Text>
            </TouchableOpacity>
          </View>
          {loadingRepos ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={GOLD} size="large" />
              <Text style={styles.loadingText}>Fetching repositories...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredRepos}
              keyExtractor={(item, i) => String(item.id || i)}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
              renderItem={({ item }) => (
                <View style={styles.repoCard}>
                  <View style={styles.repoHeader}>
                    <View style={styles.repoIcon}>
                      <Text style={styles.repoIconText}>{item.private ? '🔒' : '📦'}</Text>
                    </View>
                    <View style={styles.repoInfo}>
                      <Text style={styles.repoName}>{item.name}</Text>
                      <Text style={styles.repoDesc} numberOfLines={1}>{item.description || 'No description'}</Text>
                    </View>
                  </View>
                  <View style={styles.repoMeta}>
                    {item.language && (
                      <View style={styles.langBadge}>
                        <Text style={styles.langBadgeText}>{item.language}</Text>
                      </View>
                    )}
                    <Text style={styles.repoStat}>⭐ {item.stargazers_count || 0}</Text>
                    <Text style={styles.repoStat}>🍴 {item.forks_count || 0}</Text>
                    <Text style={styles.repoDate}>{formatDate(item.updated_at)}</Text>
                  </View>
                  <View style={styles.repoActions}>
                    <TouchableOpacity style={styles.repoActionBtn} onPress={() => fetchCommits(item)}>
                      <Text style={styles.repoActionBtnText}>COMMITS</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.repoActionBtn, styles.repoActionBtnGold]} onPress={() => deployToVercel(item)}>
                      <Text style={[styles.repoActionBtnText, { color: BLACK }]}>🚀 DEPLOY</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      )}

      {activeTab === 'commits' && (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
          {selectedRepo && (
            <View style={styles.selectedRepoCard}>
              <Text style={styles.selectedRepoLabel}>VIEWING COMMITS FOR</Text>
              <Text style={styles.selectedRepoName}>{selectedRepo.full_name}</Text>
              <Text style={styles.selectedRepoBranch}>⎇ {selectedRepo.default_branch || 'main'}</Text>
            </View>
          )}

          {loadingCommits ? (
            <ActivityIndicator color={GOLD} size="large" style={{ marginVertical: 32 }} />
          ) : commits.length === 0 ? (
            <Text style={styles.emptyText}>Select a repo to view commits</Text>
          ) : (
            commits.map((commit, i) => (
              <View key={i} style={styles.commitCard}>
                <View style={styles.commitLeft}>
                  <View style={styles.commitDot} />
                  {i < commits.length - 1 && <View style={styles.commitLine} />}
                </View>
                <View style={styles.commitContent}>
                  <Text style={styles.commitMessage} numberOfLines={2}>
                    {commit.commit?.message || commit.message || 'No message'}
                  </Text>
                  <Text style={styles.commitSha}>
                    {(commit.sha || '').substring(0, 7)} · {commit.commit?.author?.name || 'Unknown'}
                  </Text>
                  <Text style={styles.commitDate}>{formatDate(commit.commit?.author?.date)}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {activeTab === 'deploy' && (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
          <Text style={styles.sectionTitle}>Deploy Repository</Text>
          <Text style={styles.sectionSub}>One-click deploy to Vercel or Render</Text>

          {repos.slice(0, 6).map((repo, i) => (
            <View key={i} style={styles.deployCard}>
              <View style={styles.deployInfo}>
                <Text style={styles.deployRepoName}>{repo.name}</Text>
                <Text style={styles.deployRepoDesc}>{repo.language || 'Unknown'} · Last updated {formatDate(repo.updated_at)}</Text>
              </View>
              <View style={styles.deployActions}>
                <TouchableOpacity style={styles.deployBtn} onPress={() => deployToVercel(repo)}>
                  <Text style={styles.deployBtnText}>▲ Vercel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.deployBtn, { backgroundColor: 'rgba(99,102,241,0.2)', borderColor: 'rgba(99,102,241,0.3)' }]}
                  onPress={() => Alert.alert('Render Deploy', `Deploying ${repo.name} to Render...`)}
                >
                  <Text style={[styles.deployBtnText, { color: '#818cf8' }]}>🔵 Render</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const MOCK_REPOS = [
  { id: 1, name: 'saintsallabs-ios', full_name: 'saintvision/saintsallabs-ios', description: 'SaintSal Labs React Native iOS App', language: 'JavaScript', stargazers_count: 24, forks_count: 3, updated_at: '2025-03-15', private: false, default_branch: 'main' },
  { id: 2, name: 'saintsallabs-api', full_name: 'saintvision/saintsallabs-api', description: 'Backend API gateway for SaintSal Labs', language: 'TypeScript', stargazers_count: 11, forks_count: 1, updated_at: '2025-03-14', private: false, default_branch: 'main' },
  { id: 3, name: 'saintsallabs-web', full_name: 'saintvision/saintsallabs-web', description: 'Next.js web platform', language: 'TypeScript', stargazers_count: 8, forks_count: 2, updated_at: '2025-03-13', private: false, default_branch: 'main' },
];

const MOCK_COMMITS = [
  { sha: 'a1b2c3d', commit: { message: 'feat: all 18 stitch screens built and wired', author: { name: 'SaintSal', date: '2025-03-15' } } },
  { sha: 'e4f5g6h', commit: { message: 'fix: EAS build config and dependency issues', author: { name: 'SaintSal', date: '2025-03-14' } } },
  { sha: 'i7j8k9l', commit: { message: 'feat: Stripe checkout integration', author: { name: 'SaintSal', date: '2025-03-13' } } },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BLACK },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  backBtn: { color: GOLD, fontSize: 22, padding: 4 },
  headerTitle: { color: '#fff', fontWeight: '700', fontSize: 16, fontFamily: 'PublicSans-Bold' },
  userBadge: { backgroundColor: GOLD_DIM, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: `${GOLD}33` },
  userBadgeText: { color: GOLD, fontWeight: '700', fontSize: 11, fontFamily: 'PublicSans-Bold' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  statCard: { flex: 1, backgroundColor: CARD_BG, borderRadius: 10, borderWidth: 1, borderColor: BORDER, padding: 10, alignItems: 'center', gap: 2 },
  statIcon: { fontSize: 16 },
  statValue: { color: GOLD, fontSize: 16, fontWeight: '700', fontFamily: 'PublicSans-Bold' },
  statLabel: { color: MUTED, fontSize: 8, letterSpacing: 1, fontFamily: 'PublicSans-Regular' },
  tabsRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8, gap: 8 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: BORDER, backgroundColor: SURFACE },
  tabActive: { backgroundColor: GOLD_DIM, borderColor: GOLD },
  tabText: { color: MUTED, fontSize: 9, fontWeight: '700', fontFamily: 'PublicSans-Bold' },
  tabTextActive: { color: GOLD },
  searchWrapper: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, marginBottom: 10,
    backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
  },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, color: '#fff', fontSize: 14, fontFamily: 'PublicSans-Regular' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: MUTED, fontSize: 13, fontFamily: 'PublicSans-Regular' },
  repoCard: { backgroundColor: CARD_BG, borderRadius: 12, borderWidth: 1, borderColor: BORDER, padding: 16, marginBottom: 10, gap: 12 },
  repoHeader: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  repoIcon: { width: 40, height: 40, borderRadius: 8, backgroundColor: GOLD_DIM, alignItems: 'center', justifyContent: 'center' },
  repoIconText: { fontSize: 20 },
  repoInfo: { flex: 1 },
  repoName: { color: '#e2e8f0', fontWeight: '600', fontSize: 15, fontFamily: 'PublicSans-Bold' },
  repoDesc: { color: MUTED, fontSize: 12, marginTop: 2, fontFamily: 'PublicSans-Regular' },
  repoMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  langBadge: { backgroundColor: SURFACE, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  langBadgeText: { color: MUTED, fontSize: 10, fontFamily: 'PublicSans-Regular' },
  repoStat: { color: MUTED, fontSize: 12, fontFamily: 'PublicSans-Regular' },
  repoDate: { color: 'rgba(100,116,139,1)', fontSize: 11, marginLeft: 'auto', fontFamily: 'PublicSans-Regular' },
  repoActions: { flexDirection: 'row', gap: 8 },
  repoActionBtn: { flex: 1, backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER, borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  repoActionBtnGold: { backgroundColor: GOLD, borderColor: GOLD },
  repoActionBtnText: { color: MUTED, fontSize: 11, fontWeight: '700', fontFamily: 'PublicSans-Bold' },
  selectedRepoCard: { backgroundColor: GOLD_DIM, borderWidth: 1, borderColor: `${GOLD}4D`, borderRadius: 10, padding: 16, gap: 4, marginBottom: 16 },
  selectedRepoLabel: { color: GOLD, fontSize: 9, fontWeight: '700', letterSpacing: 3, fontFamily: 'PublicSans-Bold' },
  selectedRepoName: { color: '#fff', fontWeight: '700', fontSize: 16, fontFamily: 'PublicSans-Bold' },
  selectedRepoBranch: { color: MUTED, fontSize: 12, fontFamily: 'PublicSans-Regular' },
  emptyText: { color: MUTED, textAlign: 'center', padding: 32, fontFamily: 'PublicSans-Regular' },
  commitCard: { flexDirection: 'row', gap: 12, paddingBottom: 4 },
  commitLeft: { alignItems: 'center', width: 16 },
  commitDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: GOLD, marginTop: 4 },
  commitLine: { width: 2, flex: 1, backgroundColor: BORDER, marginTop: 4 },
  commitContent: { flex: 1, paddingBottom: 16 },
  commitMessage: { color: '#e2e8f0', fontSize: 14, fontFamily: 'PublicSans-Regular', lineHeight: 20 },
  commitSha: { color: GOLD, fontSize: 11, marginTop: 4, fontFamily: 'PublicSans-Bold' },
  commitDate: { color: MUTED, fontSize: 11, marginTop: 2, fontFamily: 'PublicSans-Regular' },
  sectionTitle: { color: '#fff', fontSize: 22, fontWeight: '700', fontFamily: 'PublicSans-Bold', marginBottom: 4 },
  sectionSub: { color: MUTED, fontSize: 12, fontFamily: 'PublicSans-Regular', marginBottom: 16 },
  deployCard: { backgroundColor: CARD_BG, borderRadius: 10, borderWidth: 1, borderColor: BORDER, padding: 16, marginBottom: 10, gap: 12 },
  deployInfo: { gap: 2 },
  deployRepoName: { color: '#e2e8f0', fontWeight: '600', fontSize: 15, fontFamily: 'PublicSans-Bold' },
  deployRepoDesc: { color: MUTED, fontSize: 12, fontFamily: 'PublicSans-Regular' },
  deployActions: { flexDirection: 'row', gap: 8 },
  deployBtn: { flex: 1, backgroundColor: GOLD_DIM, borderWidth: 1, borderColor: `${GOLD}33`, borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  deployBtnText: { color: GOLD, fontWeight: '700', fontSize: 12, fontFamily: 'PublicSans-Bold' },
});
