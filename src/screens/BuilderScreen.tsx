/**
 * SaintSal Labs — Builder Screen
 * v0-style code generation + preview + deploy
 */
import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, FlatList, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '@/config/theme';
import SALHeader from '@/components/SALHeader';
import { salClient } from '@/lib/api';
import { useStore } from '@/lib/store';
import type { BuilderFile, BuilderProject } from '@/types';

// Language color map
const LANG_COLORS: Record<string, string> = {
  tsx: '#3178C6',
  ts: '#3178C6',
  jsx: '#F7DF1E',
  js: '#F7DF1E',
  css: '#1572B6',
  html: '#E34F26',
  json: '#292929',
  py: '#3776AB',
  md: '#083FA1',
};

export default function BuilderScreen() {
  const insets = useSafeAreaInsets();
  const [prompt, setPrompt] = useState('');
  const [framework, setFramework] = useState('nextjs');
  const [isBuilding, setIsBuilding] = useState(false);
  const [files, setFiles] = useState<BuilderFile[]>([]);
  const [activeFileIdx, setActiveFileIdx] = useState(0);
  const [buildMeta, setBuildMeta] = useState<any>(null);
  const [feedback, setFeedback] = useState('');
  const [isIterating, setIsIterating] = useState(false);
  const { addBuilderProject } = useStore();

  const frameworks = [
    { id: 'nextjs', label: 'Next.js', icon: '▲' },
    { id: 'react', label: 'React', icon: '⚛' },
    { id: 'html', label: 'HTML', icon: '◇' },
    { id: 'python', label: 'Python', icon: '🐍' },
    { id: 'node', label: 'Node', icon: '⬢' },
  ];

  const handleBuild = async () => {
    if (!prompt.trim()) return;
    setIsBuilding(true);
    setFiles([]);
    setBuildMeta(null);

    try {
      const result = await salClient.build(prompt, framework);
      setFiles(result.files);
      setBuildMeta(result);
      setActiveFileIdx(0);

      // Save to store
      addBuilderProject({
        id: `proj_${Date.now()}`,
        name: prompt.slice(0, 40),
        prompt,
        files: result.files,
        framework,
        deploy_url: result.deploy_url,
        repo_url: result.repo_url,
        created_at: Date.now(),
        updated_at: Date.now(),
      });
    } catch (err: any) {
      setFiles([{
        path: 'error.txt',
        content: `Build failed: ${err.message}\n\nMake sure the SAL Engine is running on ${__DEV__ ? 'localhost:8000' : 'api.saintsallabs.com'}`,
        language: 'text',
      }]);
    } finally {
      setIsBuilding(false);
    }
  };

  const handleIterate = async () => {
    if (!feedback.trim() || files.length === 0) return;
    setIsIterating(true);
    try {
      const result = await salClient.builderIterate(feedback, files);
      setFiles(result.files);
      setFeedback('');
      setActiveFileIdx(0);
    } catch (err: any) {
      // Show error
    } finally {
      setIsIterating(false);
    }
  };

  const activeFile = files[activeFileIdx];
  const ext = activeFile?.path.split('.').pop() || '';

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
      <SALHeader title="Builder" subtitle="v0-style generation & deploy" />

      {files.length === 0 ? (
        /* ─── BUILD INPUT ─── */
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <View style={styles.heroSection}>
            <View style={styles.builderIcon}>
              <Text style={styles.builderIconText}>{'</>'}</Text>
            </View>
            <Text style={styles.heroTitle}>Build Anything</Text>
            <Text style={styles.heroSub}>
              Describe what you want — SAL generates production code,{'\n'}
              pushes to GitHub, and deploys to Vercel.
            </Text>
          </View>

          {/* Framework selector */}
          <Text style={styles.label}>Framework</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.frameworkRow}>
            {frameworks.map((fw) => (
              <TouchableOpacity
                key={fw.id}
                style={[styles.frameworkBtn, framework === fw.id && styles.frameworkBtnActive]}
                onPress={() => setFramework(fw.id)}
              >
                <Text style={styles.frameworkIcon}>{fw.icon}</Text>
                <Text style={[styles.frameworkLabel, framework === fw.id && styles.frameworkLabelActive]}>
                  {fw.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Prompt input */}
          <Text style={styles.label}>What do you want to build?</Text>
          <TextInput
            style={styles.promptInput}
            value={prompt}
            onChangeText={setPrompt}
            placeholder="Build a SaaS landing page with pricing cards, testimonials, dark mode, and Stripe checkout..."
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {/* Templates */}
          <Text style={styles.label}>Quick Templates</Text>
          <View style={styles.templateGrid}>
            {[
              { icon: '🏠', title: 'SaaS Landing', prompt: 'Modern SaaS landing page with hero, features, pricing, testimonials. Dark theme. Stripe checkout.' },
              { icon: '📊', title: 'Dashboard', prompt: 'Admin dashboard with sidebar nav, data cards, charts, user table. Dark theme.' },
              { icon: '🛒', title: 'E-Commerce', prompt: 'E-commerce store with product grid, cart, checkout flow. Responsive.' },
              { icon: '📝', title: 'Blog', prompt: 'Developer blog with MDX, syntax highlighting, categories, search. Dark theme.' },
            ].map((t, i) => (
              <TouchableOpacity key={i} style={styles.template} onPress={() => setPrompt(t.prompt)}>
                <Text style={styles.templateIcon}>{t.icon}</Text>
                <Text style={styles.templateTitle}>{t.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Build button */}
          <TouchableOpacity
            style={[styles.buildBtn, !prompt.trim() && styles.buildBtnDisabled]}
            onPress={handleBuild}
            disabled={!prompt.trim() || isBuilding}
          >
            {isBuilding ? (
              <ActivityIndicator color="#0A0A0F" />
            ) : (
              <Text style={styles.buildBtnText}>Build with SAL</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      ) : (
        /* ─── CODE VIEWER ─── */
        <View style={styles.codeContainer}>
          {/* File tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fileTabs}>
            {files.map((f, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.fileTab, i === activeFileIdx && styles.fileTabActive]}
                onPress={() => setActiveFileIdx(i)}
              >
                <View style={[styles.langDot, { backgroundColor: LANG_COLORS[f.path.split('.').pop() || ''] || Colors.textTertiary }]} />
                <Text style={[styles.fileTabText, i === activeFileIdx && styles.fileTabTextActive]} numberOfLines={1}>
                  {f.path.split('/').pop()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* File path */}
          <View style={styles.filePathRow}>
            <Text style={styles.filePath}>{activeFile?.path}</Text>
            <Text style={styles.fileLines}>{activeFile?.content.split('\n').length} lines</Text>
          </View>

          {/* Code */}
          <ScrollView style={styles.codeScroll}>
            <Text style={styles.codeText} selectable>{activeFile?.content}</Text>
          </ScrollView>

          {/* Deploy info */}
          {buildMeta?.deploy_url && (
            <View style={styles.deployBar}>
              <Text style={styles.deployLabel}>Deployed</Text>
              <Text style={styles.deployUrl} numberOfLines={1}>{buildMeta.deploy_url}</Text>
            </View>
          )}

          {/* Iterate bar */}
          <View style={styles.iterateBar}>
            <TextInput
              style={styles.iterateInput}
              value={feedback}
              onChangeText={setFeedback}
              placeholder="Describe changes..."
              placeholderTextColor={Colors.textMuted}
            />
            <TouchableOpacity
              style={[styles.iterateBtn, !feedback.trim() && styles.iterateBtnDisabled]}
              onPress={handleIterate}
              disabled={!feedback.trim() || isIterating}
            >
              {isIterating ? (
                <ActivityIndicator color="#0A0A0F" size="small" />
              ) : (
                <Text style={styles.iterateBtnText}>Iterate</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.newBuildBtn} onPress={() => { setFiles([]); setPrompt(''); }}>
              <Text style={styles.newBuildBtnText}>New</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.xxl, paddingBottom: Spacing.huge },
  // Hero
  heroSection: { alignItems: 'center', marginBottom: Spacing.xxl },
  builderIcon: {
    width: 64, height: 64, borderRadius: 18, backgroundColor: Colors.bgTertiary,
    borderWidth: 1.5, borderColor: Colors.gold, alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  builderIconText: { color: Colors.gold, fontSize: 22, fontWeight: '700' },
  heroTitle: { color: Colors.textPrimary, fontSize: FontSize.xxl, fontWeight: '700', marginBottom: 4 },
  heroSub: { color: Colors.textSecondary, fontSize: FontSize.sm, textAlign: 'center', lineHeight: 20 },
  // Framework
  label: { color: Colors.textTertiary, fontSize: FontSize.xs, fontWeight: '700', letterSpacing: 0.5, marginBottom: Spacing.sm, marginTop: Spacing.lg, textTransform: 'uppercase' },
  frameworkRow: { marginBottom: Spacing.sm },
  frameworkBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgCard, borderRadius: BorderRadius.sm,
    borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    marginRight: Spacing.sm, gap: 6,
  },
  frameworkBtnActive: { borderColor: Colors.gold, backgroundColor: `${Colors.gold}10` },
  frameworkIcon: { fontSize: 16 },
  frameworkLabel: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '500' },
  frameworkLabelActive: { color: Colors.gold },
  // Prompt
  promptInput: {
    backgroundColor: Colors.bgInput, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.lg, color: Colors.textPrimary, fontSize: FontSize.md, minHeight: 120,
  },
  // Templates
  templateGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  template: {
    width: '48%', backgroundColor: Colors.bgCard, borderRadius: BorderRadius.sm, borderWidth: 1,
    borderColor: Colors.border, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
  },
  templateIcon: { fontSize: 20 },
  templateTitle: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '500' },
  // Build button
  buildBtn: {
    backgroundColor: Colors.gold, borderRadius: BorderRadius.md, paddingVertical: Spacing.lg,
    alignItems: 'center', marginTop: Spacing.xxl,
  },
  buildBtnDisabled: { opacity: 0.4 },
  buildBtnText: { color: '#0A0A0F', fontSize: FontSize.lg, fontWeight: '700' },
  // Code viewer
  codeContainer: { flex: 1 },
  fileTabs: { backgroundColor: Colors.bgSecondary, borderBottomWidth: 0.5, borderBottomColor: Colors.border, maxHeight: 44 },
  fileTab: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderBottomWidth: 2, borderBottomColor: 'transparent', gap: 6,
  },
  fileTabActive: { borderBottomColor: Colors.gold },
  langDot: { width: 6, height: 6, borderRadius: 3 },
  fileTabText: { color: Colors.textTertiary, fontSize: FontSize.sm, maxWidth: 100 },
  fileTabTextActive: { color: Colors.textPrimary, fontWeight: '600' },
  filePathRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, backgroundColor: Colors.bgSecondary },
  filePath: { color: Colors.textMuted, fontSize: FontSize.xs, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  fileLines: { color: Colors.textMuted, fontSize: FontSize.xs },
  codeScroll: { flex: 1, backgroundColor: Colors.bgCard },
  codeText: {
    color: Colors.textPrimary, fontSize: 13, lineHeight: 20, padding: Spacing.lg,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  // Deploy
  deployBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: `${Colors.green}15`, paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm, gap: Spacing.sm,
  },
  deployLabel: { color: Colors.green, fontSize: FontSize.xs, fontWeight: '700' },
  deployUrl: { color: Colors.green, fontSize: FontSize.xs, flex: 1 },
  // Iterate
  iterateBar: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    backgroundColor: Colors.bgSecondary, borderTopWidth: 0.5, borderTopColor: Colors.border, gap: Spacing.sm,
  },
  iterateInput: {
    flex: 1, backgroundColor: Colors.bgInput, borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm, color: Colors.textPrimary, fontSize: FontSize.sm,
  },
  iterateBtn: { backgroundColor: Colors.gold, borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  iterateBtnDisabled: { opacity: 0.4 },
  iterateBtnText: { color: '#0A0A0F', fontSize: FontSize.sm, fontWeight: '700' },
  newBuildBtn: { backgroundColor: Colors.bgTertiary, borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  newBuildBtnText: { color: Colors.textSecondary, fontSize: FontSize.sm },
});

