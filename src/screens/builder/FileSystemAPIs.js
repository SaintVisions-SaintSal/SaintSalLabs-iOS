/* ═══════════════════════════════════════════════════
   STITCH SCREEN — FILE SYSTEM APIs
   Source: stitch_ai_chat_suite/builder_file_system_apis
   File browser, GitHub API, CRUD files, project settings
═══════════════════════════════════════════════════ */
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '../../config/theme';

const GITHUB_TOKEN = ''; // Proxied via Labs backend
const GITHUB_REPO = 'saintsal-org/builder-core';
const LABS_API = 'https://www.saintsallabs.com';

const DEFAULT_FILES = [
  { name: 'app.js', type: 'js', size: '12.4 KB', modified: '2 min ago', active: true },
  { name: 'package.json', type: 'json', size: '3.1 KB', modified: '1 hr ago', active: false },
  { name: 'styles.css', type: 'css', size: '8.7 KB', modified: '3 hr ago', active: false },
  { name: 'README.md', type: 'md', size: '2.2 KB', modified: '1 day ago', active: false },
  { name: 'index.html', type: 'html', size: '1.8 KB', modified: '2 days ago', active: false },
  { name: '.env.example', type: 'env', size: '0.4 KB', modified: '3 days ago', active: false },
];

const FILE_TYPE_COLOR = {
  js: '#F59E0B',
  json: '#22C55E',
  css: '#3B82F6',
  md: '#EC4899',
  html: '#EF4444',
  env: '#818CF8',
};

const API_INTEGRATIONS = [
  { id: 'claude', name: 'Claude 3.5 Sonnet', status: 'active', tag: 'STITCHED' },
  { id: 'github', name: 'GitHub API', status: 'active', tag: 'CONNECTED' },
  { id: 'supabase', name: 'Supabase DB', status: 'active', tag: 'LIVE' },
  { id: 'stripe', name: 'Stripe Payments', status: 'active', tag: 'LIVE' },
];

export default function FileSystemAPIs() {
  const router = useRouter();
  const [files, setFiles] = useState(DEFAULT_FILES);
  const [activeFile, setActiveFile] = useState('app.js');
  const [fileContent, setFileContent] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [repos, setRepos] = useState([]);
  const [loadingRepos, setLoadingRepos] = useState(false);

  const fetchGitHubRepos = async () => {
    setLoadingRepos(true);
    try {
      const res = await fetch('https://api.github.com/user/repos?per_page=10&sort=pushed', {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setRepos(data.map(r => r.full_name));
      } else {
        Alert.alert('GitHub Error', 'Could not fetch repos. Check token.');
      }
    } catch {
      Alert.alert('Network Error', 'Could not reach GitHub API.');
    } finally {
      setLoadingRepos(false);
    }
  };

  const openFile = (file) => {
    setActiveFile(file.name);
    setFiles(prev => prev.map(f => ({ ...f, active: f.name === file.name })));
    setFileContent(`// ${file.name}\n// Last modified: ${file.modified}\n// Size: ${file.size}\n\n// File content loaded from: ${LABS_API}\n// Repo: ${GITHUB_REPO}\n`);
  };

  const addFile = () => {
    if (!newFileName.trim()) {
      Alert.alert('Name Required', 'Enter a file name.');
      return;
    }
    const ext = newFileName.split('.').pop() || 'js';
    const newFile = {
      name: newFileName,
      type: ext,
      size: '0 B',
      modified: 'just now',
      active: false,
    };
    setFiles(prev => [newFile, ...prev]);
    setNewFileName('');
    Alert.alert('File Created', `${newFileName} has been added.`);
  };

  const saveFile = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      Alert.alert('Saved', `${activeFile} saved successfully.`);
    }, 800);
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backTxt}>←</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>SAINTSAL™ LABS</Text>
          <Text style={s.headerSub}>ELITE BUILDER: FILE SYSTEM</Text>
        </View>
        <View style={s.headerActions}>
          <TouchableOpacity style={s.headerActionBtn} onPress={addFile}>
            <Text style={s.headerActionTxt}>+ FILE</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* API Integrations */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionLabel}>PROJECT SETTINGS & API</Text>
            <Text style={s.versionTxt}>v1.2.4-stable</Text>
          </View>
          <View style={s.apiCard}>
            {API_INTEGRATIONS.map(api => (
              <View key={api.id} style={s.apiRow}>
                <View style={s.apiStatusDot} />
                <Text style={s.apiName}>{api.name}</Text>
                <View style={s.apiTag}>
                  <Text style={s.apiTagTxt}>{api.tag}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Add New File */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>NEW FILE</Text>
          <View style={s.addRow}>
            <TextInput
              style={s.addInput}
              value={newFileName}
              onChangeText={setNewFileName}
              placeholder="filename.js"
              placeholderTextColor={C.textGhost}
              autoCapitalize="none"
            />
            <TouchableOpacity style={s.addBtn} onPress={addFile}>
              <Text style={s.addBtnTxt}>CREATE</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* File Browser */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>PROJECT FILES</Text>
          {files.map(file => (
            <TouchableOpacity
              key={file.name}
              style={[s.fileRow, file.name === activeFile && s.fileRowActive]}
              onPress={() => openFile(file)}
              activeOpacity={0.7}
            >
              <View style={[s.fileTypeDot, { backgroundColor: FILE_TYPE_COLOR[file.type] || C.textDim }]} />
              <View style={s.fileInfo}>
                <Text style={[s.fileName, file.name === activeFile && s.fileNameActive]}>{file.name}</Text>
                <Text style={s.fileMeta}>{file.size} · {file.modified}</Text>
              </View>
              <Text style={s.fileExt}>.{file.type}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Active File Editor */}
        {activeFile && (
          <View style={s.section}>
            <View style={s.editorHeader}>
              <Text style={s.sectionLabel}>ACTIVE: {activeFile}</Text>
              <TouchableOpacity style={s.saveBtn} onPress={saveFile} disabled={saving}>
                {saving ? <ActivityIndicator size="small" color={C.bg} /> : <Text style={s.saveBtnTxt}>SAVE</Text>}
              </TouchableOpacity>
            </View>
            <TextInput
              style={s.codeEditor}
              value={fileContent}
              onChangeText={setFileContent}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              placeholder={`// Edit ${activeFile} here`}
              placeholderTextColor={C.textGhost}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
            />
          </View>
        )}

        {/* GitHub Repos */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionLabel}>GITHUB REPOS</Text>
            <TouchableOpacity style={s.fetchBtn} onPress={fetchGitHubRepos} disabled={loadingRepos}>
              {loadingRepos ? <ActivityIndicator size="small" color={C.gold} /> : <Text style={s.fetchBtnTxt}>FETCH</Text>}
            </TouchableOpacity>
          </View>
          {repos.length === 0 ? (
            <Text style={s.emptyTxt}>Tap FETCH to load your GitHub repos</Text>
          ) : (
            repos.map(repo => (
              <View key={repo} style={s.repoRow}>
                <Text style={s.repoIcon}>🐙</Text>
                <Text style={s.repoName}>{repo}</Text>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
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
  headerTitle: { fontSize: 11, fontWeight: '800', color: C.gold, letterSpacing: 3 },
  headerSub: { fontSize: 9, color: C.textDim, letterSpacing: 1.5, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 6 },
  headerActionBtn: {
    backgroundColor: C.gold + '20', borderWidth: 1, borderColor: C.gold + '50',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7,
  },
  headerActionTxt: { fontSize: 9, fontWeight: '800', color: C.gold, letterSpacing: 1 },
  scroll: { flex: 1 },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionLabel: { fontSize: 9, fontWeight: '800', color: C.textDim, letterSpacing: 2.5 },
  versionTxt: { fontSize: 9, color: C.textGhost },
  apiCard: {
    backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border,
    borderRadius: 14, padding: 14, gap: 10,
  },
  apiRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  apiStatusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E' },
  apiName: { flex: 1, fontSize: 12, fontWeight: '600', color: C.text },
  apiTag: {
    backgroundColor: C.gold + '18', borderWidth: 1, borderColor: C.gold + '40',
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
  },
  apiTagTxt: { fontSize: 8, fontWeight: '800', color: C.gold, letterSpacing: 1 },
  addRow: { flexDirection: 'row', gap: 8 },
  addInput: {
    flex: 1, backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
    color: C.text, fontSize: 13, fontFamily: 'monospace',
  },
  addBtn: {
    backgroundColor: C.gold, borderRadius: 10, paddingHorizontal: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  addBtnTxt: { fontSize: 9, fontWeight: '800', color: C.bg, letterSpacing: 1 },
  fileRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 6,
  },
  fileRowActive: {
    borderColor: C.gold,
    backgroundColor: C.gold + '10',
    borderLeftWidth: 3,
  },
  fileTypeDot: { width: 8, height: 8, borderRadius: 4 },
  fileInfo: { flex: 1 },
  fileName: { fontSize: 13, fontWeight: '600', color: C.text, fontFamily: 'monospace' },
  fileNameActive: { color: C.gold },
  fileMeta: { fontSize: 10, color: C.textDim, marginTop: 2 },
  fileExt: { fontSize: 10, fontWeight: '700', color: C.textGhost, fontFamily: 'monospace' },
  editorHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  saveBtn: {
    backgroundColor: C.gold, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7,
    alignItems: 'center', justifyContent: 'center', minWidth: 60,
  },
  saveBtnTxt: { fontSize: 9, fontWeight: '800', color: C.bg, letterSpacing: 1 },
  codeEditor: {
    backgroundColor: '#0A0A0E', borderWidth: 1, borderColor: C.gold + '30',
    borderRadius: 12, padding: 14, color: '#C8D3F5',
    fontSize: 12, fontFamily: 'monospace', minHeight: 160,
  },
  fetchBtn: {
    backgroundColor: C.gold + '20', borderWidth: 1, borderColor: C.gold + '40',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
    alignItems: 'center', justifyContent: 'center',
  },
  fetchBtnTxt: { fontSize: 9, fontWeight: '800', color: C.gold, letterSpacing: 1 },
  emptyTxt: { fontSize: 12, color: C.textGhost, textAlign: 'center', paddingVertical: 20 },
  repoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 6,
  },
  repoIcon: { fontSize: 16 },
  repoName: { fontSize: 13, fontWeight: '600', color: C.text, fontFamily: 'monospace' },
});
