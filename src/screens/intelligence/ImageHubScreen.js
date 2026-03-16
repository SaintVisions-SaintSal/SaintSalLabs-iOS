/* ═══════════════════════════════════════════════════
   SCREEN 14 — ELITE INTELLIGENCE + IMAGE HUB
   elite_intelligence_image_hub → Search + DALL-E 3
   Wire: Tavily search + OpenAI DALL-E 3 image gen
═══════════════════════════════════════════════════ */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Animated, Alert, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/AuthContext';
import { API_BASE, API_KEY } from '../../lib/api';

const GOLD = '#D4AF37';
const BG   = '#0F0F0F';
const CARD = '#161616';

const TABS = ['SEARCH', 'IMAGE GEN', 'VISION'];
const STYLES_OPTS = ['Cinematic', 'Photorealistic', 'Abstract', 'Luxury', 'Minimal', 'Architectural'];
const SIZES_OPTS  = ['1024×1024', '1792×1024', '1024×1792'];

export default function ImageHubScreen() {
  const router = useRouter();
  const { canUseAI } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [query, setQuery]         = useState('');
  const [prompt, setPrompt]       = useState('');
  const [style, setStyle]         = useState('Cinematic');
  const [size, setSize]           = useState('1024×1024');
  const [results, setResults]     = useState([]);
  const [images, setImages]       = useState([]);
  const [loading, setLoading]     = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
    if (!canUseAI) return Alert.alert('Upgrade', 'Compute limit reached.', [
      { text: 'Upgrade', onPress: () => router.push('/(stack)/stripe-pricing') },
      { text: 'Cancel', style: 'cancel' },
    ]);
    setLoading(true);
    setResults([]);
    try {
      const res = await fetch(`${API_BASE}/api/intel/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-sal-key': API_KEY },
        body: JSON.stringify({ query, source: 'tavily', limit: 8 }),
      });
      const data = await res.json();
      setResults(data.results || [{ title: query, snippet: data.answer || 'No results.' }]);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!prompt.trim()) return;
    if (!canUseAI) return Alert.alert('Upgrade', 'Compute limit reached.', [
      { text: 'Upgrade', onPress: () => router.push('/(stack)/stripe-pricing') },
      { text: 'Cancel', style: 'cancel' },
    ]);
    setLoading(true);
    setImages([]);
    try {
      const fullPrompt = `${style} style, ${prompt}, ultra high quality, 8K resolution`;
      const res = await fetch(`${API_BASE}/api/image/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-sal-key': API_KEY },
        body: JSON.stringify({ prompt: fullPrompt, size: size.replace('×', 'x'), model: 'dall-e-3', n: 1 }),
      });
      const data = await res.json();
      if (data.images || data.data) {
        setImages(data.images || data.data.map(d => ({ url: d.url })));
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backTxt}>‹</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Intelligence + Image Hub</Text>
          <Text style={s.headerSub}>TAVILY SEARCH · DALL-E 3</Text>
        </View>
        <View style={s.liveBadge}>
          <Animated.View style={[s.liveDot, { opacity: pulseAnim }]} />
          <Text style={s.liveTxt}>LIVE</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={s.tabsRow}>
        {TABS.map((t, i) => (
          <TouchableOpacity key={t} style={[s.tab, activeTab === i && s.tabActive]} onPress={() => setActiveTab(i)}>
            <Text style={[s.tabTxt, activeTab === i && { color: BG }]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Search Tab */}
        {activeTab === 0 && (
          <View style={s.pad}>
            <View style={s.searchBar}>
              <Text style={s.searchIcon}>🔍</Text>
              <TextInput
                style={s.searchInput}
                value={query}
                onChangeText={setQuery}
                placeholder="Search anything..."
                placeholderTextColor="#444"
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              <TouchableOpacity style={s.goBtn} onPress={handleSearch} disabled={loading}>
                <Text style={s.goBtnTxt}>{loading ? '…' : '→'}</Text>
              </TouchableOpacity>
            </View>
            {results.map((r, i) => (
              <View key={i} style={s.resultCard}>
                <Text style={s.resultTitle}>{r.title}</Text>
                <Text style={s.resultSnippet}>{r.snippet || r.content}</Text>
              </View>
            ))}
            {results.length === 0 && !loading && (
              <View style={s.emptyState}>
                <Text style={s.emptyIcon}>🌐</Text>
                <Text style={s.emptyTxt}>Powered by Tavily AI Search</Text>
                <Text style={s.emptySub}>Real-time web intelligence with source attribution</Text>
              </View>
            )}
          </View>
        )}

        {/* Image Gen Tab */}
        {activeTab === 1 && (
          <View style={s.pad}>
            <Text style={s.fieldLabel}>PROMPT</Text>
            <TextInput
              style={s.promptInput}
              value={prompt}
              onChangeText={setPrompt}
              placeholder="Describe your image in detail..."
              placeholderTextColor="#444"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <Text style={s.fieldLabel}>STYLE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.optionsRow}>
              {STYLES_OPTS.map(o => (
                <TouchableOpacity key={o} style={[s.optChip, style === o && s.optActive]} onPress={() => setStyle(o)}>
                  <Text style={[s.optTxt, style === o && { color: BG }]}>{o}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={s.fieldLabel}>SIZE</Text>
            <View style={s.sizeRow}>
              {SIZES_OPTS.map(o => (
                <TouchableOpacity key={o} style={[s.sizeChip, size === o && s.optActive]} onPress={() => setSize(o)}>
                  <Text style={[s.sizeTxt, size === o && { color: BG }]}>{o}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={[s.generateBtn, loading && { opacity: 0.6 }]} onPress={handleGenerateImage} disabled={loading} activeOpacity={0.85}>
              <Text style={s.generateTxt}>{loading ? '🎨 GENERATING...' : '🎨 GENERATE IMAGE'}</Text>
            </TouchableOpacity>
            {images.map((img, i) => (
              <View key={i} style={s.imageCard}>
                <Image source={{ uri: img.url }} style={s.generatedImage} resizeMode="cover" />
                <View style={s.imageActions}>
                  <Text style={s.imagePromptTxt} numberOfLines={2}>{prompt}</Text>
                  <TouchableOpacity style={s.downloadBtn}>
                    <Text style={s.downloadTxt}>⬇ Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            {images.length === 0 && !loading && (
              <View style={s.emptyState}>
                <Text style={s.emptyIcon}>🎨</Text>
                <Text style={s.emptyTxt}>DALL-E 3 Image Generation</Text>
                <Text style={s.emptySub}>Enter a prompt and style to generate stunning visuals</Text>
              </View>
            )}
          </View>
        )}

        {/* Vision Tab */}
        {activeTab === 2 && (
          <View style={[s.pad, s.emptyState]}>
            <Text style={s.emptyIcon}>👁</Text>
            <Text style={s.emptyTxt}>Vision Analysis</Text>
            <Text style={s.emptySub}>Upload an image for AI analysis</Text>
            <TouchableOpacity style={[s.generateBtn, { marginTop: 20 }]}>
              <Text style={s.generateTxt}>📷 UPLOAD IMAGE</Text>
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
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#22C55E18', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#22C55E40' },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#22C55E' },
  liveTxt: { fontSize: 9, fontWeight: '800', color: '#22C55E', letterSpacing: 1 },
  tabsRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: GOLD + '20', paddingHorizontal: 14, gap: 4, paddingTop: 8 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  tabActive: { backgroundColor: GOLD },
  tabTxt: { fontSize: 10, fontWeight: '800', color: GOLD, letterSpacing: 1.5 },
  scroll: { flex: 1 },
  pad: { padding: 14 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderWidth: 1, borderColor: GOLD + '30', borderRadius: 12, paddingHorizontal: 12, gap: 8, marginBottom: 14 },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, height: 46, fontSize: 14, color: '#E8E6E1' },
  goBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center' },
  goBtnTxt: { fontSize: 18, fontWeight: '700', color: BG },
  resultCard: { backgroundColor: CARD, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: GOLD + '18' },
  resultTitle: { fontSize: 14, fontWeight: '700', color: '#E8E6E1', marginBottom: 6 },
  resultSnippet: { fontSize: 12, color: '#9CA3AF', lineHeight: 18 },
  fieldLabel: { fontSize: 9, fontWeight: '800', color: GOLD, letterSpacing: 2, marginBottom: 8, marginTop: 14 },
  promptInput: { backgroundColor: CARD, borderWidth: 1, borderColor: GOLD + '30', borderRadius: 12, padding: 14, color: '#E8E6E1', fontSize: 14, minHeight: 80 },
  optionsRow: { gap: 8, paddingBottom: 4 },
  optChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: GOLD + '40', backgroundColor: CARD },
  optActive: { backgroundColor: GOLD, borderColor: GOLD },
  optTxt: { fontSize: 12, fontWeight: '700', color: GOLD },
  sizeRow: { flexDirection: 'row', gap: 8 },
  sizeChip: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: GOLD + '40', backgroundColor: CARD, alignItems: 'center' },
  sizeTxt: { fontSize: 10, fontWeight: '700', color: GOLD },
  generateBtn: { backgroundColor: GOLD, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 16, shadowColor: GOLD, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  generateTxt: { fontSize: 13, fontWeight: '800', color: BG, letterSpacing: 2 },
  imageCard: { backgroundColor: CARD, borderRadius: 14, overflow: 'hidden', marginTop: 14, borderWidth: 1, borderColor: GOLD + '20' },
  generatedImage: { width: '100%', aspectRatio: 1, backgroundColor: '#111' },
  imageActions: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
  imagePromptTxt: { flex: 1, fontSize: 11, color: '#9CA3AF', fontStyle: 'italic' },
  downloadBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1, borderColor: GOLD + '40', backgroundColor: GOLD + '15' },
  downloadTxt: { fontSize: 11, fontWeight: '700', color: GOLD },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 14 },
  emptyTxt: { fontSize: 16, fontWeight: '700', color: '#E8E6E1', marginBottom: 6 },
  emptySub: { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
});
