/* ═══════════════════════════════════════════════════
   COOKIN CARDS — Trading Card Collector Screen
   Powered by SAL Intelligence · CookinCards™
   Pokemon, Sports Cards, Memorabilia
═══════════════════════════════════════════════════ */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  FlatList, StyleSheet, SafeAreaView, ActivityIndicator,
  Alert, Image, KeyboardAvoidingView, Platform, Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { MCP_BASE, MCP_KEY, mcpChat } from '../../lib/api';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';

// ── Design Tokens ──────────────────────────────────
const C = {
  bg:     '#0A0A0A',
  card:   '#141416',
  gold:   '#D4AF37',
  green:  '#22C55E',
  text:   '#E8E6E1',
  muted:  'rgba(255,255,255,0.4)',
  border: 'rgba(255,255,255,0.06)',
  goldGhost: 'rgba(212,175,55,0.12)',
  greenGhost: 'rgba(34,197,94,0.12)',
  yellowGhost: 'rgba(234,179,8,0.18)',
  redGhost: 'rgba(239,68,68,0.18)',
  purpleGhost: 'rgba(139,92,246,0.18)',
  blueGhost: 'rgba(59,130,246,0.18)',
};

const API_HEADERS = {
  'Content-Type': 'application/json',
  'x-sal-key': MCP_KEY,
};

const TABS = ['Collection', 'Scan', 'Market', 'Watchlist'];
const WATCHLIST_KEY = 'cookin_watchlist';

// ── Rarity Badge Config ────────────────────────────
function getRarityStyle(rarity = '') {
  const r = rarity.toLowerCase();
  if (r.includes('ultra') || r.includes('secret') || r.includes('rainbow')) {
    return { bg: C.purpleGhost, color: '#A78BFA', label: rarity };
  }
  if (r.includes('holo') || r.includes('rare holo')) {
    return { bg: C.goldGhost, color: C.gold, label: rarity };
  }
  if (r.includes('rare')) {
    return { bg: C.blueGhost, color: '#60A5FA', label: rarity };
  }
  if (r.includes('common')) {
    return { bg: 'rgba(255,255,255,0.06)', color: C.muted, label: rarity };
  }
  return { bg: 'rgba(255,255,255,0.06)', color: C.muted, label: rarity || 'Unknown' };
}

// ── Condition Badge ────────────────────────────────
function getConditionStyle(condition = 'NM') {
  switch (condition) {
    case 'NM': return { bg: C.greenGhost, color: C.green };
    case 'LP': return { bg: C.yellowGhost, color: '#EAB308' };
    case 'MP': return { bg: C.redGhost, color: '#EF4444' };
    case 'HP': return { bg: C.redGhost, color: '#EF4444' };
    default:   return { bg: 'rgba(255,255,255,0.06)', color: C.muted };
  }
}

// ── Card Image Component (with fallback) ───────────
function CardImage({ uri, style }) {
  const [error, setError] = useState(false);
  if (!uri || error) {
    return (
      <View style={[style, { backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ fontSize: 32 }}>🃏</Text>
      </View>
    );
  }
  return (
    <Image
      source={{ uri }}
      style={style}
      resizeMode="cover"
      onError={() => setError(true)}
    />
  );
}

// ══════════════════════════════════════════════════
// MAIN SCREEN
// ══════════════════════════════════════════════════
export default function PortfolioScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Collection');

  return (
    <SafeAreaView style={s.safe}>
      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>CookinCards™</Text>
          <Text style={s.headerSub}>POWERED BY SAL INTELLIGENCE</Text>
        </View>
        <Image
          source={require('../../../assets/logo-80.png')}
          style={s.headerLogo}
          resizeMode="contain"
        />
      </View>

      {/* ── Tab Bar ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.tabScroll}
        contentContainerStyle={s.tabContent}
      >
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[s.tabPill, activeTab === tab && s.tabPillActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Tab Content ── */}
      {activeTab === 'Collection' && <CollectionTab />}
      {activeTab === 'Scan'       && <ScanTab />}
      {activeTab === 'Market'     && <MarketTab />}
      {activeTab === 'Watchlist'  && <WatchlistTab />}
    </SafeAreaView>
  );
}

// ══════════════════════════════════════════════════
// TAB 1: COLLECTION
// ══════════════════════════════════════════════════
function CollectionTab() {
  const [cards, setCards]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const loadCollection = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const res = await fetch(`${MCP_BASE}/api/cards/portfolio`, {
        headers: {
          ...API_HEADERS,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setCards(data.cards || data || []);
    } catch (err) {
      setError(err.message || 'Failed to load collection');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCollection(); }, [loadCollection]);

  const totalValue = cards.reduce((sum, c) => sum + (parseFloat(c.current_price || c.purchase_price) || 0), 0);

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color={C.gold} />
        <Text style={s.loadingText}>Loading your collection…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={s.centered}>
        <Text style={s.errorIcon}>⚠️</Text>
        <Text style={s.errorText}>{error}</Text>
        <TouchableOpacity style={s.retryBtn} onPress={loadCollection}>
          <Text style={s.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (cards.length === 0) {
    return (
      <View style={s.centered}>
        <Text style={{ fontSize: 64, marginBottom: 16 }}>🃏</Text>
        <Text style={s.emptyTitle}>No Cards Yet</Text>
        <Text style={s.emptyBody}>
          Start scanning cards or search the market to build your collection
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Value Summary */}
      <View style={s.collectionSummary}>
        <View>
          <Text style={s.summaryLabel}>TOTAL VALUE</Text>
          <Text style={s.summaryValue}>${totalValue.toFixed(2)}</Text>
        </View>
        <View style={s.countBadgeWrap}>
          <Text style={s.countBadge}>{cards.length} cards</Text>
        </View>
      </View>

      <FlatList
        data={cards}
        keyExtractor={(item, i) => item.id?.toString() || String(i)}
        numColumns={2}
        columnWrapperStyle={s.gridRow}
        contentContainerStyle={s.gridContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <CollectionCard card={item} />}
      />
    </View>
  );
}

function CollectionCard({ card }) {
  const condition = getConditionStyle(card.condition || 'NM');
  return (
    <View style={s.collCard}>
      <CardImage
        uri={card.image_url}
        style={s.collCardImage}
      />
      <View style={s.collCardInfo}>
        <Text style={s.collCardName} numberOfLines={2}>{card.card_name || card.name || 'Unknown Card'}</Text>
        <Text style={s.collCardSet} numberOfLines={1}>{card.set_name || card.set || ''}</Text>
        <View style={s.collCardFooter}>
          <View style={[s.conditionBadge, { backgroundColor: condition.bg }]}>
            <Text style={[s.conditionText, { color: condition.color }]}>
              {card.condition || 'NM'}
            </Text>
          </View>
          <Text style={s.collCardPrice}>
            ${parseFloat(card.purchase_price || 0).toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ══════════════════════════════════════════════════
// TAB 2: SCAN
// ══════════════════════════════════════════════════
function ScanTab() {
  const [input, setInput]           = useState('');
  const [identifying, setIdentifying] = useState(false);
  const [searching, setSearching]   = useState(false);
  const [results, setResults]       = useState([]);
  const [addingId, setAddingId]     = useState(null);
  const [aiResult, setAiResult]     = useState(null);
  const [error, setError]           = useState(null);
  const [scanning, setScanning]     = useState(false);

  /* ── Camera Scan ── */
  const scanFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission Required', 'Camera access is needed to scan cards.'); return; }
    const result = await ImagePicker.launchCameraAsync({ base64: true, quality: 0.7, allowsEditing: true });
    if (result.canceled) return;
    await processScannedImage(result.assets[0].base64);
  };

  /* ── Photo Library Scan ── */
  const scanFromPhotos = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission Required', 'Photo library access is needed.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.7, allowsEditing: true });
    if (result.canceled) return;
    await processScannedImage(result.assets[0].base64);
  };

  /* ── Process scanned image via Google Vision ── */
  const processScannedImage = async (base64) => {
    setScanning(true);
    setError(null);
    setResults([]);
    setAiResult(null);
    try {
      const res = await fetch(`${MCP_BASE}/api/cards/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-sal-key': MCP_KEY },
        body: JSON.stringify({ image: base64 }),
      });
      const data = await res.json();
      if (data.matches?.length > 0) {
        setResults(data.matches);
        setAiResult({ name: data.search_query, set: '', year: '', rarity: '', search_query: data.search_query });
      } else if (data.search_query) {
        setInput(data.search_query);
        await searchCards(data.search_query);
      } else {
        setError('Could not identify card. Try the manual search below.');
      }
    } catch (err) {
      setError(err.message || 'Scan failed. Try manual search.');
    } finally {
      setScanning(false);
    }
  };

  const identifyCard = async () => {
    if (!input.trim()) return;
    setIdentifying(true);
    setError(null);
    setResults([]);
    setAiResult(null);
    try {
      const res = await mcpChat({
        message: `You are SAL Card Intelligence. Identify this card: ${input.trim()}. Return JSON only (no markdown, no backticks): {"name":"...","set":"...","year":"...","rarity":"...","search_query":"..."}`,
        model: 'pro',
        vertical: 'general',
      });
      const raw = (res.response || '').replace(/```json\n?/g, '').replace(/```/g, '').trim();
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        // Try to extract JSON from response
        const match = raw.match(/\{[\s\S]*\}/);
        parsed = match ? JSON.parse(match[0]) : null;
      }
      if (!parsed) throw new Error('Could not parse card identification');
      setAiResult(parsed);
      // Auto-search with the identified search_query
      await searchCards(parsed.search_query || parsed.name || input.trim());
    } catch (err) {
      setError(err.message || 'Identification failed');
    } finally {
      setIdentifying(false);
    }
  };

  const searchCards = async (query) => {
    if (!query) return;
    setSearching(true);
    try {
      const res = await fetch(
        `${MCP_BASE}/api/cards/search?query=${encodeURIComponent(query)}`,
        { headers: API_HEADERS }
      );
      if (!res.ok) throw new Error(`Search error ${res.status}`);
      const data = await res.json();
      setResults(data.cards || data.data || data || []);
    } catch (err) {
      setError(err.message || 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const addToCollection = async (card) => {
    setAddingId(card.id);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const res = await fetch(`${MCP_BASE}/api/cards/portfolio`, {
        method: 'POST',
        headers: {
          ...API_HEADERS,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          card_id:       card.id,
          card_name:     card.name,
          set_name:      card.set?.name || card.set || '',
          image_url:     card.image || card.images?.large || card.images?.small || '',
          purchase_price: card.price?.market || card.cardmarket?.prices?.averageSellPrice || 0,
          condition:     'NM',
        }),
      });
      if (!res.ok) throw new Error(`Failed to add: ${res.status}`);
      Alert.alert('Added!', `${card.name} added to your collection.`);
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not add card');
    } finally {
      setAddingId(null);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Camera Scan Buttons */}
        <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 12 }}>
          <TouchableOpacity
            onPress={scanFromCamera}
            disabled={scanning}
            style={{ flex: 1, backgroundColor: C.gold, borderRadius: 12, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
          >
            {scanning ? <ActivityIndicator size="small" color={C.bg} /> : <Text style={{ fontSize: 18 }}>📷</Text>}
            <Text style={{ fontSize: 13, fontWeight: '800', color: C.bg }}>Scan Card</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={scanFromPhotos}
            disabled={scanning}
            style={{ flex: 1, backgroundColor: C.card, borderRadius: 12, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: C.border }}
          >
            <Text style={{ fontSize: 18 }}>🖼️</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.text }}>From Photos</Text>
          </TouchableOpacity>
        </View>
        {scanning && (
          <View style={{ alignItems: 'center', paddingVertical: 16 }}>
            <ActivityIndicator color={C.gold} size="large" />
            <Text style={{ color: C.muted, fontSize: 12, marginTop: 8 }}>Identifying card via Google Vision...</Text>
          </View>
        )}

        {/* Search Input */}
        <View style={s.scanInputWrap}>
          <TextInput
            style={s.scanInput}
            value={input}
            onChangeText={setInput}
            placeholder="Describe or name the card…"
            placeholderTextColor={C.muted}
            returnKeyType="search"
            onSubmitEditing={identifyCard}
          />
          <TouchableOpacity
            style={[s.identifyBtn, (!input.trim() || identifying) && s.identifyBtnDisabled]}
            onPress={identifyCard}
            disabled={!input.trim() || identifying}
          >
            {identifying ? (
              <ActivityIndicator size="small" color={C.bg} />
            ) : (
              <Text style={s.identifyBtnText}>Identify with AI</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* AI Identification Result */}
        {aiResult && (
          <View style={s.aiResultCard}>
            <Text style={s.aiResultLabel}>SAL IDENTIFIED</Text>
            <Text style={s.aiResultName}>{aiResult.name}</Text>
            <View style={s.aiResultRow}>
              {aiResult.set  && <Text style={s.aiResultMeta}>Set: {aiResult.set}</Text>}
              {aiResult.year && <Text style={s.aiResultMeta}>Year: {aiResult.year}</Text>}
            </View>
            {aiResult.rarity && (
              <View style={[s.rarityBadge, { backgroundColor: getRarityStyle(aiResult.rarity).bg }]}>
                <Text style={[s.rarityText, { color: getRarityStyle(aiResult.rarity).color }]}>
                  {aiResult.rarity}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Error */}
        {error && (
          <View style={s.errorBanner}>
            <Text style={s.errorBannerText}>⚠️ {error}</Text>
          </View>
        )}

        {/* Search Results */}
        {searching && (
          <View style={s.centered}>
            <ActivityIndicator size="large" color={C.gold} />
            <Text style={s.loadingText}>Searching cards…</Text>
          </View>
        )}

        {!searching && results.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>
              Search Results <Text style={s.sectionCount}>{results.length} found</Text>
            </Text>
            <View style={s.gridTwoCol}>
              {results.map((card, i) => (
                <ScanResultCard
                  key={card.id || String(i)}
                  card={card}
                  onAdd={() => addToCollection(card)}
                  adding={addingId === card.id}
                />
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ScanResultCard({ card, onAdd, adding }) {
  const imageUri = card.image || card.images?.large || card.images?.small || null;
  const rarity   = getRarityStyle(card.rarity || card.subtypes?.[0] || '');
  const price    = card.price?.market || card.cardmarket?.prices?.averageSellPrice || null;

  return (
    <View style={s.scanCard}>
      <CardImage uri={imageUri} style={s.scanCardImage} />
      <View style={s.scanCardInfo}>
        <Text style={s.scanCardName} numberOfLines={2}>{card.name}</Text>
        <Text style={s.scanCardSet} numberOfLines={1}>
          {card.set?.name || card.set || ''}
        </Text>
        {card.rarity && (
          <View style={[s.rarityBadge, { backgroundColor: rarity.bg, marginTop: 4 }]}>
            <Text style={[s.rarityText, { color: rarity.color }]}>{card.rarity}</Text>
          </View>
        )}
        {price != null && (
          <Text style={s.scanCardPrice}>${parseFloat(price).toFixed(2)}</Text>
        )}
        <TouchableOpacity
          style={[s.addBtn, adding && s.addBtnDisabled]}
          onPress={onAdd}
          disabled={adding}
        >
          {adding ? (
            <ActivityIndicator size="small" color={C.bg} />
          ) : (
            <Text style={s.addBtnText}>Add to Collection</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ══════════════════════════════════════════════════
// TAB 3: MARKET
// ══════════════════════════════════════════════════
function MarketTab() {
  const [query, setQuery]       = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [hotDeals, setHotDeals] = useState([]);
  const [rareCards, setRareCards] = useState([]);
  const [loadingDeals, setLoadingDeals] = useState(true);
  const [loadingRare, setLoadingRare]   = useState(true);
  const [addingId, setAddingId] = useState(null);
  const [watchingId, setWatchingId] = useState(null);

  // Load Hot Deals and Rare Spotlight on mount
  useEffect(() => {
    loadHotDeals();
    loadRareSpotlight();
  }, []);

  const loadHotDeals = async () => {
    setLoadingDeals(true);
    try {
      const res = await fetch(`${MCP_BASE}/api/cards/deals`, { headers: API_HEADERS });
      if (!res.ok) throw new Error(`Deals error ${res.status}`);
      const data = await res.json();
      setHotDeals(data.deals || data.cards || data || []);
    } catch {
      setHotDeals([]);
    } finally {
      setLoadingDeals(false);
    }
  };

  const loadRareSpotlight = async () => {
    setLoadingRare(true);
    try {
      const res = await fetch(`${MCP_BASE}/api/cards/rare-candy`, { headers: API_HEADERS });
      if (!res.ok) throw new Error(`Rare error ${res.status}`);
      const data = await res.json();
      setRareCards(data.cards || data || []);
    } catch {
      setRareCards([]);
    } finally {
      setLoadingRare(false);
    }
  };

  const searchMarket = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setSearchResults([]);
    try {
      const res = await fetch(
        `${MCP_BASE}/api/cards/search?query=${encodeURIComponent(query.trim())}`,
        { headers: API_HEADERS }
      );
      if (!res.ok) throw new Error(`Search ${res.status}`);
      const data = await res.json();
      setSearchResults(data.cards || data.data || data || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const addToCollection = async (card) => {
    setAddingId(card.id);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const res = await fetch(`${MCP_BASE}/api/cards/portfolio`, {
        method: 'POST',
        headers: {
          ...API_HEADERS,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          card_id:       card.id,
          card_name:     card.name,
          set_name:      card.set?.name || card.set || '',
          image_url:     card.image || card.images?.large || card.images?.small || '',
          purchase_price: card.price?.market || card.cardmarket?.prices?.averageSellPrice || 0,
          condition:     'NM',
        }),
      });
      if (!res.ok) throw new Error(`Add failed ${res.status}`);
      Alert.alert('Added!', `${card.name} added to your collection.`);
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not add card');
    } finally {
      setAddingId(null);
    }
  };

  const addToWatchlist = async (card) => {
    setWatchingId(card.id);
    try {
      const existing = await AsyncStorage.getItem(WATCHLIST_KEY);
      const list = existing ? JSON.parse(existing) : [];
      const already = list.find(c => c.id === card.id);
      if (already) {
        Alert.alert('Already Watching', `${card.name} is already on your watchlist.`);
        return;
      }
      list.push({
        id:         card.id,
        name:       card.name,
        set:        card.set?.name || card.set || '',
        image:      card.image || card.images?.large || card.images?.small || '',
        priceAdded: card.price?.market || card.cardmarket?.prices?.averageSellPrice || 0,
        addedAt:    Date.now(),
      });
      await AsyncStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
      Alert.alert('Watching!', `${card.name} added to your watchlist.`);
    } catch {
      Alert.alert('Error', 'Could not add to watchlist');
    } finally {
      setWatchingId(null);
    }
  };

  const openEbay = async (card) => {
    // Use eBay search URL from card data, or build a fallback
    const ebayUrl = card.ebay_url
      || card.search_url
      || `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(card.name + ' pokemon card')}`;
    Linking.openURL(ebayUrl).catch(() =>
      Alert.alert('Error', 'Could not open eBay')
    );
  };

  const displayList = query.trim() && searchResults.length > 0 ? searchResults : null;

  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      {/* Search Bar */}
      <View style={s.marketSearchWrap}>
        <TextInput
          style={s.marketSearchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search cards, sets, players…"
          placeholderTextColor={C.muted}
          returnKeyType="search"
          onSubmitEditing={searchMarket}
        />
        <TouchableOpacity
          style={s.marketSearchBtn}
          onPress={searchMarket}
          disabled={searching}
        >
          {searching ? (
            <ActivityIndicator size="small" color={C.bg} />
          ) : (
            <Text style={s.marketSearchBtnText}>Search</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Results Section */}
      {displayList && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>
            Results <Text style={s.sectionCount}>{searchResults.length} found</Text>
          </Text>
          <View style={s.gridTwoCol}>
            {searchResults.map((card, i) => (
              <MarketCard
                key={card.id || String(i)}
                card={card}
                onAdd={() => addToCollection(card)}
                onEbay={() => openEbay(card)}
                onWatch={() => addToWatchlist(card)}
                adding={addingId === card.id}
                watching={watchingId === card.id}
              />
            ))}
          </View>
        </View>
      )}

      {/* Hot Deals */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>🔥 Hot Deals</Text>
        {loadingDeals ? (
          <View style={s.sectionLoader}>
            <ActivityIndicator size="small" color={C.gold} />
          </View>
        ) : hotDeals.length === 0 ? (
          <Text style={s.emptySection}>No deals available right now</Text>
        ) : (
          <View style={s.gridTwoCol}>
            {hotDeals.map((card, i) => (
              <MarketCard
                key={card.id || String(i)}
                card={card}
                onAdd={() => addToCollection(card)}
                onEbay={() => openEbay(card)}
                onWatch={() => addToWatchlist(card)}
                adding={addingId === card.id}
                watching={watchingId === card.id}
              />
            ))}
          </View>
        )}
      </View>

      {/* Rare Spotlight */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>✨ Rare Spotlight</Text>
        {loadingRare ? (
          <View style={s.sectionLoader}>
            <ActivityIndicator size="small" color={C.gold} />
          </View>
        ) : rareCards.length === 0 ? (
          <Text style={s.emptySection}>No rare cards available right now</Text>
        ) : (
          <View style={s.gridTwoCol}>
            {rareCards.map((card, i) => (
              <MarketCard
                key={card.id || String(i)}
                card={card}
                onAdd={() => addToCollection(card)}
                onEbay={() => openEbay(card)}
                onWatch={() => addToWatchlist(card)}
                adding={addingId === card.id}
                watching={watchingId === card.id}
              />
            ))}
          </View>
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function MarketCard({ card, onAdd, onEbay, onWatch, adding, watching }) {
  const imageUri = card.image || card.images?.large || card.images?.small || null;
  const rarity   = getRarityStyle(card.rarity || card.subtypes?.[0] || '');
  const market   = card.price?.market || card.cardmarket?.prices?.averageSellPrice || null;
  const low      = card.price?.low || card.cardmarket?.prices?.lowPrice || null;
  const setName  = card.set?.name || card.set || '';

  return (
    <View style={s.marketCard}>
      <CardImage uri={imageUri} style={s.marketCardImage} />
      <View style={s.marketCardInfo}>
        <Text style={s.marketCardName} numberOfLines={2}>{card.name}</Text>
        {setName ? <Text style={s.marketCardSet} numberOfLines={1}>{setName}</Text> : null}

        {/* Rarity Badge */}
        {card.rarity && (
          <View style={[s.rarityBadge, { backgroundColor: rarity.bg, marginTop: 4 }]}>
            <Text style={[s.rarityText, { color: rarity.color }]}>{card.rarity}</Text>
          </View>
        )}

        {/* Pricing */}
        {(market != null || low != null) && (
          <View style={s.priceRow}>
            {market != null && (
              <Text style={s.marketPrice}>${parseFloat(market).toFixed(2)}</Text>
            )}
            {low != null && (
              <Text style={s.lowPrice}>Low: ${parseFloat(low).toFixed(2)}</Text>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View style={s.marketBtnsRow}>
          <TouchableOpacity
            style={[s.addBtn, adding && s.addBtnDisabled, { flex: 1 }]}
            onPress={onAdd}
            disabled={adding}
          >
            {adding ? (
              <ActivityIndicator size="small" color={C.bg} />
            ) : (
              <Text style={s.addBtnText}>+ Add</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.ebayBtn, { flex: 1 }]}
            onPress={onEbay}
          >
            <Text style={s.ebayBtnText}>eBay</Text>
          </TouchableOpacity>
        </View>

        {/* Watch Button */}
        <TouchableOpacity
          style={[s.watchBtn, watching && s.watchBtnDisabled]}
          onPress={onWatch}
          disabled={watching}
        >
          {watching ? (
            <ActivityIndicator size="small" color={C.gold} />
          ) : (
            <Text style={s.watchBtnText}>👁 Watch</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ══════════════════════════════════════════════════
// TAB 4: WATCHLIST
// ══════════════════════════════════════════════════
function WatchlistTab() {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading]     = useState(true);

  const loadWatchlist = useCallback(async () => {
    setLoading(true);
    try {
      const raw = await AsyncStorage.getItem(WATCHLIST_KEY);
      setWatchlist(raw ? JSON.parse(raw) : []);
    } catch {
      setWatchlist([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadWatchlist(); }, [loadWatchlist]);

  const removeCard = async (id) => {
    try {
      const updated = watchlist.filter(c => c.id !== id);
      await AsyncStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
      setWatchlist(updated);
    } catch {
      Alert.alert('Error', 'Could not remove card');
    }
  };

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color={C.gold} />
        <Text style={s.loadingText}>Loading watchlist…</Text>
      </View>
    );
  }

  if (watchlist.length === 0) {
    return (
      <View style={s.centered}>
        <Text style={{ fontSize: 64, marginBottom: 16 }}>👁</Text>
        <Text style={s.emptyTitle}>No Cards Watched</Text>
        <Text style={s.emptyBody}>
          Add cards from Market to track prices
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={watchlist}
      keyExtractor={(item) => item.id?.toString() || String(Math.random())}
      numColumns={2}
      columnWrapperStyle={s.gridRow}
      contentContainerStyle={s.gridContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <WatchlistCard card={item} onRemove={() => removeCard(item.id)} />
      )}
    />
  );
}

function WatchlistCard({ card, onRemove }) {
  const addedDate = card.addedAt
    ? new Date(card.addedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  return (
    <View style={s.watchCard}>
      <CardImage uri={card.image} style={s.watchCardImage} />
      <View style={s.watchCardInfo}>
        <Text style={s.watchCardName} numberOfLines={2}>{card.name}</Text>
        {card.set ? <Text style={s.watchCardSet} numberOfLines={1}>{card.set}</Text> : null}
        {card.priceAdded != null && (
          <View style={s.watchPriceRow}>
            <Text style={s.watchPriceLabel}>Added at</Text>
            <Text style={s.watchPriceValue}>${parseFloat(card.priceAdded).toFixed(2)}</Text>
          </View>
        )}
        {addedDate && (
          <Text style={s.watchDate}>{addedDate}</Text>
        )}
        <TouchableOpacity style={s.removeBtn} onPress={onRemove}>
          <Text style={s.removeBtnText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ══════════════════════════════════════════════════
// STYLES
// ══════════════════════════════════════════════════
const s = StyleSheet.create({
  // ── Layout ──
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 28,
    fontWeight: '300',
    color: C.gold,
    lineHeight: 32,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: C.gold,
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 9,
    fontWeight: '700',
    color: C.muted,
    letterSpacing: 1.2,
    marginTop: 2,
  },
  headerLogo: {
    width: 24,
    height: 24,
    borderRadius: 6,
  },

  // ── Tab Bar ──
  tabScroll: {
    maxHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
  },
  tabPillActive: {
    backgroundColor: C.gold,
    borderColor: C.gold,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: C.muted,
    letterSpacing: 0.3,
  },
  tabTextActive: {
    color: '#0A0A0A',
  },

  // ── Grid ──
  gridRow: {
    paddingHorizontal: 12,
    gap: 10,
    marginBottom: 10,
  },
  gridContent: {
    paddingTop: 12,
    paddingBottom: 40,
  },
  gridTwoCol: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 10,
  },

  // ── Collection Summary ──
  collectionSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: C.muted,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '800',
    color: C.gold,
    letterSpacing: -0.5,
  },
  countBadgeWrap: {},
  countBadge: {
    fontSize: 13,
    fontWeight: '700',
    color: C.gold,
    backgroundColor: C.goldGhost,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    overflow: 'hidden',
  },

  // ── Collection Card ──
  collCard: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  collCardImage: {
    width: '100%',
    aspectRatio: 1 / 1.4,
    backgroundColor: '#1a1a1a',
  },
  collCardInfo: {
    padding: 10,
  },
  collCardName: {
    fontSize: 13,
    fontWeight: '700',
    color: C.text,
    lineHeight: 17,
  },
  collCardSet: {
    fontSize: 11,
    color: C.muted,
    marginTop: 2,
  },
  collCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  conditionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  conditionText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  collCardPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: C.gold,
  },

  // ── Scan Tab ──
  cameraBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: C.card,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
  },
  cameraBannerText: {
    fontSize: 13,
    color: C.muted,
    fontWeight: '500',
  },
  scanInputWrap: {
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 10,
  },
  scanInput: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: C.text,
  },
  identifyBtn: {
    backgroundColor: C.gold,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  identifyBtnDisabled: {
    opacity: 0.5,
  },
  identifyBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0A0A0A',
    letterSpacing: 0.3,
  },

  // ── AI Result Card ──
  aiResultCard: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
    padding: 16,
  },
  aiResultLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: C.gold,
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  aiResultName: {
    fontSize: 18,
    fontWeight: '800',
    color: C.text,
    marginBottom: 6,
  },
  aiResultRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  aiResultMeta: {
    fontSize: 12,
    color: C.muted,
  },

  // ── Scan Result Card ──
  scanCard: {
    width: '48%',
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
    marginBottom: 2,
  },
  scanCardImage: {
    width: '100%',
    aspectRatio: 1 / 1.4,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
  },
  scanCardInfo: {
    padding: 10,
  },
  scanCardName: {
    fontSize: 13,
    fontWeight: '700',
    color: C.text,
    lineHeight: 17,
  },
  scanCardSet: {
    fontSize: 11,
    color: C.muted,
    marginTop: 2,
  },
  scanCardPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: C.gold,
    marginTop: 6,
  },

  // ── Market Tab ──
  marketSearchWrap: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 10,
    alignItems: 'center',
  },
  marketSearchInput: {
    flex: 1,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: C.text,
  },
  marketSearchBtn: {
    backgroundColor: C.gold,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marketSearchBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0A0A0A',
  },

  // ── Market Card ──
  marketCard: {
    width: '48%',
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
    marginBottom: 2,
  },
  marketCardImage: {
    width: '100%',
    aspectRatio: 1 / 1.4,
    backgroundColor: '#1a1a1a',
  },
  marketCardInfo: {
    padding: 10,
  },
  marketCardName: {
    fontSize: 13,
    fontWeight: '700',
    color: C.text,
    lineHeight: 17,
  },
  marketCardSet: {
    fontSize: 11,
    color: C.muted,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 6,
  },
  marketPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: C.gold,
  },
  lowPrice: {
    fontSize: 11,
    color: C.green,
    fontWeight: '600',
  },
  marketBtnsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  ebayBtn: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  ebayBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.text,
  },
  watchBtn: {
    backgroundColor: C.goldGhost,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
  },
  watchBtnDisabled: {
    opacity: 0.5,
  },
  watchBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.gold,
  },

  // ── Watchlist Card ──
  watchCard: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  watchCardImage: {
    width: '100%',
    aspectRatio: 1 / 1.4,
    backgroundColor: '#1a1a1a',
  },
  watchCardInfo: {
    padding: 10,
  },
  watchCardName: {
    fontSize: 13,
    fontWeight: '700',
    color: C.text,
    lineHeight: 17,
  },
  watchCardSet: {
    fontSize: 11,
    color: C.muted,
    marginTop: 2,
  },
  watchPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  watchPriceLabel: {
    fontSize: 10,
    color: C.muted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  watchPriceValue: {
    fontSize: 13,
    fontWeight: '700',
    color: C.gold,
  },
  watchDate: {
    fontSize: 10,
    color: C.muted,
    marginTop: 4,
  },
  removeBtn: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
  },
  removeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },

  // ── Shared Add Button ──
  addBtn: {
    backgroundColor: C.gold,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  addBtnDisabled: {
    opacity: 0.5,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0A0A0A',
  },

  // ── Rarity Badge ──
  rarityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // ── Section ──
  section: {
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: C.text,
    paddingHorizontal: 16,
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  sectionCount: {
    fontSize: 13,
    fontWeight: '500',
    color: C.muted,
  },
  sectionLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptySection: {
    fontSize: 13,
    color: C.muted,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  // ── Error / Loading ──
  loadingText: {
    fontSize: 14,
    color: C.muted,
    marginTop: 14,
    fontWeight: '500',
  },
  errorIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  retryBtn: {
    backgroundColor: C.gold,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0A0A0A',
  },
  errorBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
  },
  errorBannerText: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '500',
  },

  // ── Empty State ──
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: C.text,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  emptyBody: {
    fontSize: 14,
    color: C.muted,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 260,
  },
});
