/* ═══════════════════════════════════════════════════
   SCREEN 23 — ELITE REAL ESTATE FINDER
   Pixel-perfect from stitch: elite_real_estate_finder_supercharged
   Foreclosure=#DC2626 | NOD=#FFD700 | Bankruptcy=#7C3AED
   Alpaca · Perplexity · Tavily · Claude · GHL
═══════════════════════════════════════════════════ */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Animated, Alert, Modal,
  Dimensions, FlatList, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/AuthContext';
import {
  searchForeclosures, analyzeProperty, getAlpacaPortfolio,
  DEMO_PROPERTIES, DEMO_PORTFOLIO,
} from '../../lib/realEstateService';

const { width: SW, height: SH } = Dimensions.get('window');

/* ─── Design Tokens (matches stitch) ───────────── */
const BG       = '#0F0F0F';
const SURFACE  = '#1A1A1A';
const GLASS    = 'rgba(255,255,255,0.03)';
const GOLD     = '#FFD700';
const GOLD_DIM = 'rgba(255,215,0,0.1)';
const GOLD_BRD = 'rgba(255,215,0,0.2)';
const RED      = '#DC2626';   // Foreclosure badge
const PURPLE   = '#7C3AED';   // Bankruptcy badge
const GREEN    = '#22C55E';
const MUTED    = '#6B7280';
const SLATE    = '#94A3B8';
const WHITE    = '#F1F5F9';

/* ─── Badge config ──────────────────────────────── */
const BADGE = {
  'Foreclosure': { bg: RED,    text: '#fff'  },
  'NOD Filing':  { bg: GOLD,   text: BG      },
  'Bankruptcy':  { bg: PURPLE, text: '#fff'  },
};

/* ─── Fake map marker positions (% of container) ── */
const MARKERS = [
  { top: '25%', left: '33%', type: 'NOD Filing',  label: 'NOD FILING',  equity: '$1.2M' },
  { top: '55%', left: '68%', type: 'Foreclosure', label: 'FORECLOSURE', equity: '$2.4M' },
  { top: '38%', left: '52%', type: 'Bankruptcy',  label: 'BANKRUPTCY',  equity: '$870k' },
  { top: '65%', left: '22%', type: 'Foreclosure', label: 'FORECLOSURE', equity: '$1.1M' },
  { top: '20%', left: '72%', type: 'NOD Filing',  label: 'NOD FILING',  equity: '$3.3M' },
];

/* ─── API Streams for status panel ─────────────── */
const API_STREAMS = [
  { name: 'PERPLEXITY_API',  status: 'live',    ms: '22ms'    },
  { name: 'TAVILY_SEARCH',   status: 'live',    ms: '45ms'    },
  { name: 'COURT_FETCH_V2',  status: 'syncing', ms: 'SYNCING' },
];

export default function EliteRealEstateScreen() {
  const router = useRouter();
  const { canUseAI } = useAuth();

  /* ── state ── */
  const [activeTab, setActiveTab]         = useState('search');
  const [properties, setProperties]       = useState(DEMO_PROPERTIES);
  const [portfolio, setPortfolio]         = useState(null);
  const [searchQuery, setSearchQuery]     = useState('');
  const [showFilters, setShowFilters]     = useState(false);
  const [filterFore, setFilterFore]       = useState(true);
  const [filterNOD, setFilterNOD]         = useState(true);
  const [filterBankr, setFilterBankr]     = useState(true);
  const [equityMin, setEquityMin]         = useState(30);
  const [loading, setLoading]             = useState(false);
  const [analyzing, setAnalyzing]         = useState(null);
  const [analysis, setAnalysis]           = useState(null);
  const [analysisProp, setAnalysisProp]   = useState(null);
  const [hoverMarker, setHoverMarker]     = useState(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const filterSlide = useRef(new Animated.Value(-300)).current;

  /* ── animations ── */
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.2, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,   duration: 800, useNativeDriver: true }),
      ])
    ).start();
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    const p = await getAlpacaPortfolio();
    setPortfolio(p);
  };

  const toggleFilters = () => {
    const toVal = showFilters ? -300 : 0;
    setShowFilters(!showFilters);
    Animated.spring(filterSlide, { toValue: toVal, useNativeDriver: true, tension: 80, friction: 12 }).start();
  };

  /* ── search ── */
  const handleSearch = async () => {
    const q = searchQuery.trim();
    if (!q) return Alert.alert('Enter search', 'Type a city, ZIP, or keyword.');
    if (!canUseAI) return Alert.alert('Upgrade Required', 'Compute limit reached.', [
      { text: 'Upgrade', onPress: () => router.push('/(stack)/stripe-pricing') },
      { text: 'Cancel', style: 'cancel' },
    ]);
    setLoading(true);
    const results = await searchForeclosures(q);
    setProperties(results.length ? results : DEMO_PROPERTIES);
    setLoading(false);
    setActiveTab('properties');
  };

  const handleAnalyze = async (prop) => {
    setAnalyzing(prop.id);
    setAnalysisProp(prop);
    const result = await analyzeProperty(prop.address || prop.title);
    setAnalysis(result);
    setAnalyzing(null);
    setActiveTab('analysis');
  };

  const filteredProps = properties.filter(p => {
    if (p.type === 'Foreclosure' && !filterFore) return false;
    if (p.type === 'NOD Filing'  && !filterNOD)  return false;
    if (p.type === 'Bankruptcy'  && !filterBankr) return false;
    return true;
  });

  /* ─── Render pieces ──────────────────────────── */

  const renderBadge = (type) => {
    const b = BADGE[type] || { bg: GOLD, text: BG };
    return (
      <View style={[s.badge, { backgroundColor: b.bg }]}>
        <Text style={[s.badgeTxt, { color: b.text }]}>{type?.toUpperCase()}</Text>
      </View>
    );
  };

  const renderPropertyCard = ({ item: p }) => (
    <View style={s.propCard}>
      {/* Left color strip */}
      <View style={[s.propStrip, { backgroundColor: (BADGE[p.type] || { bg: GOLD }).bg }]} />
      {/* Content */}
      <View style={s.propContent}>
        <View style={s.propTopRow}>
          <View style={s.propLeft}>
            {renderBadge(p.type)}
            <Text style={s.propTitle} numberOfLines={1}>{p.title}</Text>
            <Text style={s.propAddr}>{p.address}</Text>
          </View>
          <View style={s.propRight}>
            {p.price ? <Text style={s.propPrice}>{p.price}</Text> : null}
            <Text style={s.propPriceLbl}>Est. Value</Text>
          </View>
        </View>

        {/* Metrics grid */}
        <View style={s.metricsRow}>
          <View style={s.metricBox}>
            <Text style={s.metricLbl}>EQUITY</Text>
            <Text style={s.metricVal}>{p.equity || '—'}</Text>
          </View>
          <View style={s.metricBox}>
            <Text style={s.metricLbl}>YIELD</Text>
            <Text style={s.metricVal}>{p.yieldPct || '—'}</Text>
          </View>
          <View style={s.metricBox}>
            <Text style={s.metricLbl}>RENT</Text>
            <Text style={s.metricVal}>{p.rent || '—'}</Text>
          </View>
        </View>

        {p.snippet ? (
          <Text style={s.propSnippet} numberOfLines={2}>{p.snippet}</Text>
        ) : null}

        {/* Actions */}
        <View style={s.propActions}>
          <TouchableOpacity
            style={s.detailsBtn}
            onPress={() => handleAnalyze(p)}
            disabled={analyzing === p.id}
          >
            {analyzing === p.id
              ? <ActivityIndicator size="small" color={GOLD} />
              : <Text style={s.detailsBtnTxt}>UNDERWRITE</Text>
            }
          </TouchableOpacity>
          <TouchableOpacity style={s.bookmarkBtn}>
            <Text style={s.bookmarkIco}>🔖</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  /* ─── Map section (visual mock) ──────────────── */
  const renderMap = () => (
    <View style={s.mapContainer}>
      {/* Dark grid background */}
      <View style={s.mapBg}>
        {/* Grid lines */}
        {[...Array(8)].map((_, i) => (
          <View key={`h${i}`} style={[s.mapGridH, { top: `${i * 14}%` }]} />
        ))}
        {[...Array(8)].map((_, i) => (
          <View key={`v${i}`} style={[s.mapGridV, { left: `${i * 14}%` }]} />
        ))}
        {/* Location label */}
        <View style={s.mapLocBadge}>
          <Text style={s.mapLocTxt}>📍 MIAMI, FL</Text>
        </View>
        {/* Markers */}
        {MARKERS.map((m, i) => {
          const b = BADGE[m.type] || { bg: GOLD };
          return (
            <TouchableOpacity
              key={i}
              style={[s.mapMarkerWrap, { top: m.top, left: m.left }]}
              onPress={() => setHoverMarker(hoverMarker === i ? null : i)}
              activeOpacity={0.7}
            >
              <Animated.View style={[
                s.mapMarker,
                { backgroundColor: b.bg },
                m.type === 'NOD Filing' && { opacity: pulseAnim },
              ]} />
              {hoverMarker === i && (
                <View style={s.markerPopup}>
                  <Text style={[s.markerPopupType, { color: b.bg }]}>{m.label}</Text>
                  <Text style={s.markerPopupEq}>{m.equity} Est. Equity</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
        {/* Incoming lead overlay */}
        <View style={s.incomingBadge}>
          <Animated.View style={[s.incomingDot, { opacity: pulseAnim }]} />
          <Text style={s.incomingTxt}>LIVE LEADS STREAMING</Text>
        </View>
        {/* Map controls */}
        <View style={s.mapControls}>
          <TouchableOpacity style={s.mapCtrlBtn}>
            <Text style={s.mapCtrlIco}>⊞</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.mapCtrlBtn}>
            <Text style={s.mapCtrlIco}>◎</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  /* ─── Filter panel ───────────────────────────── */
  const renderFilters = () => (
    <Animated.View style={[s.filterPanel, { transform: [{ translateY: filterSlide }] }]}>
      <View style={s.filterHeader}>
        <Text style={s.filterTitle}>OPPORTUNITY FILTERS</Text>
        <TouchableOpacity onPress={toggleFilters}>
          <Text style={s.filterClose}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={s.filterSearchRow}>
        <TextInput
          style={s.filterInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="City, ZIP, or keyword..."
          placeholderTextColor="#444"
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
      </View>

      {/* Opportunity Type */}
      <Text style={s.filterSectionLbl}>OPPORTUNITY TYPE</Text>
      <TouchableOpacity style={s.checkRow} onPress={() => setFilterFore(!filterFore)}>
        <View style={[s.checkbox, filterFore && s.checkboxOn]}>
          {filterFore && <Text style={s.checkmark}>✓</Text>}
        </View>
        <View style={[s.checkDot, { backgroundColor: RED }]} />
        <Text style={s.checkLbl}>Foreclosures</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.checkRow} onPress={() => setFilterNOD(!filterNOD)}>
        <View style={[s.checkbox, filterNOD && s.checkboxOn]}>
          {filterNOD && <Text style={s.checkmark}>✓</Text>}
        </View>
        <View style={[s.checkDot, { backgroundColor: GOLD }]} />
        <Text style={s.checkLbl}>Notice of Default (NOD)</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.checkRow} onPress={() => setFilterBankr(!filterBankr)}>
        <View style={[s.checkbox, filterBankr && s.checkboxOn]}>
          {filterBankr && <Text style={s.checkmark}>✓</Text>}
        </View>
        <View style={[s.checkDot, { backgroundColor: PURPLE }]} />
        <Text style={s.checkLbl}>Bankruptcy Filings</Text>
      </TouchableOpacity>

      {/* Equity Range */}
      <View style={s.equityRow}>
        <Text style={s.filterSectionLbl}>EQUITY RANGE</Text>
        <Text style={s.equityVal}>{equityMin}% – 100%</Text>
      </View>
      <View style={s.sliderTrack}>
        <View style={[s.sliderFill, { width: `${100 - equityMin}%` }]} />
        <TouchableOpacity
          style={[s.sliderThumb, { left: `${equityMin}%` }]}
          onPress={() => setEquityMin(Math.max(0, equityMin - 10))}
        />
      </View>
      <View style={s.sliderLabels}>
        <Text style={s.sliderLbl}>0%</Text>
        <Text style={s.sliderLbl}>50%</Text>
        <Text style={s.sliderLbl}>100%</Text>
      </View>

      {/* Run Analysis */}
      <TouchableOpacity
        style={[s.runBtn, loading && { opacity: 0.6 }]}
        onPress={handleSearch}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color={BG} />
          : <>
              <Text style={s.runBtnIco}>⚡</Text>
              <Text style={s.runBtnTxt}>RUN ANALYSIS</Text>
            </>
        }
      </TouchableOpacity>
      <Text style={s.poweredBy}>Powered by PERPLEXITY &amp; TAVILY integration</Text>
    </Animated.View>
  );

  /* ─── AI Analysis tab content ────────────────── */
  const renderAnalysis = () => (
    <ScrollView style={s.analysisScroll} showsVerticalScrollIndicator={false}>
      {/* Market Sentiment */}
      <View style={s.sentimentCard}>
        <Text style={s.sentimentTitle}>Market Sentiment</Text>
        {analysisProp && (
          <Text style={s.sentimentPropLbl}>{analysisProp.title}</Text>
        )}
        {analysis ? (
          <>
            <Text style={s.sentimentBody}>{analysis.memo}</Text>
            <View style={s.strategyRow}>
              <View style={s.strategyBadge}>
                <Text style={s.strategyBadgeTxt}>{analysis.strategy || 'Buy & Hold'}</Text>
              </View>
            </View>
            <View style={s.analysisGrid}>
              <View style={s.analysisCell}>
                <Text style={s.analysisCellLbl}>ARV</Text>
                <Text style={s.analysisCellVal}>{analysis.arv || '—'}</Text>
              </View>
              <View style={s.analysisCell}>
                <Text style={s.analysisCellLbl}>EQUITY</Text>
                <Text style={s.analysisCellVal}>{analysis.equity || '—'}</Text>
              </View>
              <View style={s.analysisCell}>
                <Text style={s.analysisCellLbl}>CASHFLOW</Text>
                <Text style={s.analysisCellVal}>{analysis.cashflow || '—'}</Text>
              </View>
            </View>
            {analysis.pros && (
              <View style={s.prosCons}>
                <Text style={s.prosTitle}>✅ PROS</Text>
                {(Array.isArray(analysis.pros) ? analysis.pros : [analysis.pros]).map((p, i) => (
                  <Text key={i} style={s.prosItem}>• {p}</Text>
                ))}
              </View>
            )}
            {analysis.cons && (
              <View style={s.prosCons}>
                <Text style={s.consTitle}>⚠️ RISKS</Text>
                {(Array.isArray(analysis.cons) ? analysis.cons : [analysis.cons]).map((c, i) => (
                  <Text key={i} style={s.consItem}>• {c}</Text>
                ))}
              </View>
            )}
          </>
        ) : (
          <Text style={s.sentimentBody}>
            High distressed activity detected in{' '}
            <Text style={{ color: GOLD }}>Miami Zip 33132</Text>.
            Supply is up 14% MoM, creating high-intent negotiation leverage for cash buyers.
          </Text>
        )}
        {/* Sentiment bar */}
        <View style={s.sentBar}>
          <View style={s.sentBarFill} />
        </View>
        <View style={s.sentBarLabels}>
          <Text style={s.sentBarLbl}>Conservative</Text>
          <Text style={[s.sentBarLbl, { color: GOLD }]}>Aggressive</Text>
        </View>
      </View>

      {/* API Streams */}
      <Text style={s.streamsSectionLbl}>ACTIVE API STREAMS</Text>
      {API_STREAMS.map((s2, i) => (
        <View key={i} style={s.streamRow}>
          <View style={s.streamLeft}>
            <View style={[s.streamDot, {
              backgroundColor: s2.status === 'live' ? GREEN : '#F59E0B',
            }]} />
            <Text style={s.streamName}>{s2.name}</Text>
          </View>
          <Text style={s.streamMs}>{s2.ms}</Text>
        </View>
      ))}

      {/* Alpaca Portfolio */}
      {portfolio && (
        <>
          <Text style={[s.streamsSectionLbl, { marginTop: 20 }]}>ALPACA PORTFOLIO</Text>
          <View style={s.alpacaCard}>
            <View style={s.alpacaTopRow}>
              <View>
                <Text style={s.alpacaValLbl}>PORTFOLIO VALUE</Text>
                <Text style={s.alpacaVal}>${portfolio.value?.toLocaleString('en-US', { maximumFractionDigits: 0 })}</Text>
              </View>
              <View style={s.alpacaDayChange}>
                <Text style={[s.alpacaChangePct, { color: portfolio.dayChange >= 0 ? GREEN : RED }]}>
                  {portfolio.dayChange >= 0 ? '+' : ''}{portfolio.dayChangePct}%
                </Text>
                <Text style={s.alpacaChangeLbl}>TODAY</Text>
              </View>
            </View>
            {portfolio.positions?.slice(0, 4).map((pos, i) => (
              <View key={i} style={s.posRow}>
                <Text style={s.posSymbol}>{pos.symbol}</Text>
                <Text style={s.posQty}>{pos.qty} shares</Text>
                <Text style={s.posPrice}>${pos.price?.toFixed(2)}</Text>
                <Text style={[s.posPl, { color: pos.pl >= 0 ? GREEN : RED }]}>
                  {pos.pl >= 0 ? '+' : ''}{pos.plPct?.toFixed(1)}%
                </Text>
              </View>
            ))}
          </View>
        </>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );

  /* ─── Documents tab ──────────────────────────── */
  const renderDocuments = () => (
    <ScrollView style={{ flex: 1, padding: 16 }} showsVerticalScrollIndicator={false}>
      <Text style={s.docsSectionLbl}>RECENTLY VIEWED DOCS</Text>
      {[
        { name: 'NOD_882_Bellagio.pdf',      time: '2h ago',  size: '4.2 MB' },
        { name: 'Title_Report_Miami.pdf',     time: '5h ago',  size: '1.1 MB' },
        { name: 'Bankruptcy_44_Highland.pdf', time: '1d ago',  size: '2.8 MB' },
        { name: 'ARV_Analysis_Malibu.pdf',    time: '2d ago',  size: '830 KB' },
      ].map((d, i) => (
        <TouchableOpacity key={i} style={s.docRow}>
          <View style={s.docIcon}>
            <Text style={s.docIconTxt}>📄</Text>
          </View>
          <View style={s.docInfo}>
            <Text style={s.docName}>{d.name}</Text>
            <Text style={s.docMeta}>{d.time} · {d.size}</Text>
          </View>
          <Text style={s.docArrow}>›</Text>
        </TouchableOpacity>
      ))}
      <View style={{ height: 100 }} />
    </ScrollView>
  );

  /* ─── Main render ────────────────────────────── */
  return (
    <SafeAreaView style={s.safe}>

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backTxt}>‹</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerBrand}>SaintSal Labs</Text>
          <View style={s.liveRow}>
            <Animated.View style={[s.liveDot, { opacity: pulseAnim }]} />
            <Text style={s.liveTxt}>DEAL FINDER</Text>
          </View>
        </View>
        <View style={s.proBadge}>
          <Text style={s.proBadgeTxt}>⚡ PRO</Text>
        </View>
        <TouchableOpacity style={s.filterToggleBtn} onPress={toggleFilters}>
          <Text style={s.filterToggleIco}>⚙</Text>
        </TouchableOpacity>
      </View>

      {/* ── Quick Actions ── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 44, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' }} contentContainerStyle={{ paddingHorizontal: 10, gap: 8, alignItems: 'center' }}>
        <TouchableOpacity onPress={() => router.push('/(stack)/elite-re-finder')} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: '#D4AF37', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontSize: 13 }}>🗺️</Text>
          <Text style={{ fontSize: 11, fontWeight: '800', color: '#000', letterSpacing: 0.5 }}>FIND DEALS</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(stack)/re-executive-chat')} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: 'rgba(212,175,55,0.12)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.25)' }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#D4AF37' }}>🧠 AI Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(stack)/real-estate-suite')} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#9CA3AF' }}>🏠 Suite</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(stack)/re-manifest')} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#9CA3AF' }}>📄 Docs</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Filter panel (slides down) ── */}
      {showFilters && renderFilters()}

      {/* ── Map (always visible) ── */}
      {activeTab !== 'analysis' && activeTab !== 'documents' && renderMap()}

      {/* ── Tab content ── */}
      {activeTab === 'search' || activeTab === 'properties' ? (
        <View style={{ flex: 1 }}>
          {/* Targets header */}
          <View style={s.targetsHeader}>
            <View>
              <View style={s.targetsRow}>
                <Text style={s.targetsTitle}>High-Intent Targets</Text>
                <View style={s.leadsBadge}>
                  <Text style={s.leadsBadgeTxt}>{filteredProps.length} LEADS</Text>
                </View>
              </View>
              <Text style={s.targetsSubtitle}>Real-time intelligence · court filings</Text>
            </View>
            <View style={s.sortRow}>
              <TouchableOpacity style={s.sortBtn}>
                <Text style={s.sortBtnTxt}>⇅ SORT</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Property list */}
          <FlatList
            data={filteredProps}
            keyExtractor={item => item.id}
            renderItem={renderPropertyCard}
            contentContainerStyle={s.listPad}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={s.emptyState}>
                <Text style={s.emptyIcon}>🏚</Text>
                <Text style={s.emptyTxt}>No properties match your filters</Text>
              </View>
            }
          />
        </View>
      ) : activeTab === 'analysis' ? (
        <View style={{ flex: 1, padding: 16 }}>
          {renderAnalysis()}
        </View>
      ) : (
        renderDocuments()
      )}

      {/* ── Bottom Nav ── */}
      <View style={s.bottomNav}>
        {[
          { id: 'search',     label: 'Search',   icon: '🔍' },
          { id: 'properties', label: 'Targets',  icon: '🎯' },
          { id: 'analysis',   label: 'Analysis', icon: '📊' },
          { id: 'documents',  label: 'Documents',icon: '📁' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={s.navTab}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={s.navTabIco}>{tab.icon}</Text>
            <Text style={[s.navTabLbl, activeTab === tab.id && { color: GOLD }]}>
              {tab.label}
            </Text>
            {activeTab === tab.id && <View style={s.navActive} />}
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  /* Header */
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: GOLD_BRD,
    backgroundColor: 'rgba(15,15,15,0.95)',
  },
  backBtn: { padding: 6, marginRight: 4 },
  backTxt: { fontSize: 26, color: GOLD, fontWeight: '300', lineHeight: 30 },
  headerCenter: { flex: 1, marginLeft: 4 },
  headerBrand: { fontSize: 16, fontWeight: '800', color: GOLD, letterSpacing: 1, textTransform: 'uppercase' },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: GREEN },
  liveTxt: { fontSize: 8, fontWeight: '700', color: MUTED, letterSpacing: 2 },
  proBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: GOLD_DIM, paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 8, borderWidth: 1, borderColor: GOLD_BRD, marginRight: 8,
  },
  proBadgeTxt: { fontSize: 9, fontWeight: '800', color: GOLD, letterSpacing: 1 },
  filterToggleBtn: {
    width: 34, height: 34, borderRadius: 8, backgroundColor: SURFACE,
    borderWidth: 1, borderColor: GOLD_BRD, alignItems: 'center', justifyContent: 'center',
  },
  filterToggleIco: { fontSize: 16, color: GOLD },

  /* Filter panel */
  filterPanel: {
    position: 'absolute', top: 64, left: 0, right: 0, zIndex: 100,
    backgroundColor: '#111', borderBottomWidth: 1, borderBottomColor: GOLD_BRD,
    padding: 16, paddingBottom: 20,
  },
  filterHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  filterTitle: { fontSize: 10, fontWeight: '800', color: MUTED, letterSpacing: 2 },
  filterClose: { fontSize: 16, color: SLATE, fontWeight: '300' },
  filterSearchRow: { marginBottom: 14 },
  filterInput: {
    backgroundColor: SURFACE, borderWidth: 1, borderColor: GOLD_BRD,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
    color: WHITE, fontSize: 13,
  },
  filterSectionLbl: { fontSize: 9, fontWeight: '800', color: MUTED, letterSpacing: 2, marginBottom: 8, marginTop: 8 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, paddingHorizontal: 4, marginBottom: 4 },
  checkbox: {
    width: 16, height: 16, borderRadius: 4, borderWidth: 1.5,
    borderColor: GOLD_BRD, backgroundColor: SURFACE, alignItems: 'center', justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: GOLD, borderColor: GOLD },
  checkmark: { fontSize: 9, color: BG, fontWeight: '800' },
  checkDot: { width: 8, height: 8, borderRadius: 4 },
  checkLbl: { fontSize: 13, color: WHITE, fontWeight: '500' },
  equityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  equityVal: { fontSize: 10, color: GOLD, fontFamily: 'monospace' },
  sliderTrack: {
    height: 6, backgroundColor: '#222', borderRadius: 3,
    marginTop: 8, marginBottom: 4, position: 'relative',
  },
  sliderFill: { position: 'absolute', right: 0, top: 0, bottom: 0, backgroundColor: GOLD, borderRadius: 3 },
  sliderThumb: {
    position: 'absolute', top: -5, width: 16, height: 16,
    borderRadius: 8, backgroundColor: GOLD, borderWidth: 2, borderColor: BG,
  },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  sliderLbl: { fontSize: 8, color: MUTED },
  runBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: GOLD, borderRadius: 12, paddingVertical: 13, marginTop: 16,
    shadowColor: GOLD, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10,
  },
  runBtnIco: { fontSize: 16 },
  runBtnTxt: { fontSize: 12, fontWeight: '800', color: BG, letterSpacing: 2 },
  poweredBy: { fontSize: 9, color: MUTED, textAlign: 'center', marginTop: 8, fontStyle: 'italic' },

  /* Map */
  mapContainer: { height: SH * 0.22, backgroundColor: '#050505' },
  mapBg: {
    flex: 1, backgroundColor: '#060C0C',
    borderBottomWidth: 1, borderBottomColor: GOLD_BRD, overflow: 'hidden',
  },
  mapGridH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,215,0,0.04)' },
  mapGridV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,215,0,0.04)' },
  mapLocBadge: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.8)', paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6, borderWidth: 1, borderColor: GOLD_BRD,
  },
  mapLocTxt: { fontSize: 8, color: GOLD, fontWeight: '700', letterSpacing: 1 },
  mapMarkerWrap: { position: 'absolute', width: 16, height: 16 },
  mapMarker: { width: 14, height: 14, borderRadius: 7, shadowRadius: 10, shadowOpacity: 0.8, shadowColor: GOLD },
  markerPopup: {
    position: 'absolute', top: 20, left: -40,
    backgroundColor: '#0D0D0D', borderWidth: 1, borderColor: GOLD_BRD,
    borderRadius: 6, padding: 6, width: 100, zIndex: 10,
  },
  markerPopupType: { fontSize: 7, fontWeight: '800', letterSpacing: 1, marginBottom: 2 },
  markerPopupEq: { fontSize: 8, color: SLATE },
  incomingBadge: {
    position: 'absolute', bottom: 8, left: 8,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(0,0,0,0.85)', paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 6, borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)',
  },
  incomingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: GREEN },
  incomingTxt: { fontSize: 7, fontWeight: '800', color: GREEN, letterSpacing: 1 },
  mapControls: { position: 'absolute', bottom: 8, right: 8, gap: 6 },
  mapCtrlBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: 'rgba(10,10,10,0.9)', borderWidth: 1, borderColor: GOLD_BRD,
    alignItems: 'center', justifyContent: 'center',
  },
  mapCtrlIco: { fontSize: 14, color: GOLD },

  /* Targets header */
  targetsHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: GOLD_BRD,
  },
  targetsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  targetsTitle: { fontSize: 17, fontWeight: '800', color: WHITE },
  leadsBadge: {
    backgroundColor: GOLD_DIM, paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: 20, borderWidth: 1, borderColor: GOLD_BRD,
  },
  leadsBadgeTxt: { fontSize: 8, fontWeight: '800', color: GOLD },
  targetsSubtitle: { fontSize: 10, color: MUTED, marginTop: 2 },
  sortRow: { flexDirection: 'row', gap: 6 },
  sortBtn: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
    borderWidth: 1, borderColor: GOLD_BRD,
  },
  sortBtnTxt: { fontSize: 9, fontWeight: '700', color: GOLD },

  /* Property cards */
  listPad: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 16 },
  propCard: {
    flexDirection: 'row', backgroundColor: GLASS,
    borderWidth: 1, borderColor: GOLD_BRD,
    borderRadius: 12, marginBottom: 10, overflow: 'hidden',
  },
  propStrip: { width: 4 },
  propContent: { flex: 1, padding: 12 },
  propTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  propLeft: { flex: 1, marginRight: 8 },
  propRight: { alignItems: 'flex-end' },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginBottom: 5 },
  badgeTxt: { fontSize: 7, fontWeight: '800', letterSpacing: 1 },
  propTitle: { fontSize: 13, fontWeight: '700', color: WHITE, marginBottom: 2 },
  propAddr: { fontSize: 10, color: MUTED },
  propPrice: { fontSize: 13, fontWeight: '800', color: GOLD },
  propPriceLbl: { fontSize: 8, color: MUTED, marginTop: 1 },
  metricsRow: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  metricBox: {
    flex: 1, backgroundColor: GOLD_DIM, paddingVertical: 6,
    paddingHorizontal: 4, borderRadius: 6, alignItems: 'center',
  },
  metricLbl: { fontSize: 7, color: MUTED, letterSpacing: 1, fontWeight: '700', marginBottom: 3 },
  metricVal: { fontSize: 11, fontWeight: '800', color: WHITE },
  propSnippet: { fontSize: 10, color: SLATE, lineHeight: 15, marginBottom: 8 },
  propActions: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  detailsBtn: {
    flex: 1, backgroundColor: GOLD_DIM, borderWidth: 1, borderColor: GOLD_BRD,
    borderRadius: 8, paddingVertical: 7, alignItems: 'center',
  },
  detailsBtnTxt: { fontSize: 9, fontWeight: '800', color: GOLD, letterSpacing: 1.5 },
  bookmarkBtn: {
    width: 32, height: 32, borderRadius: 8, backgroundColor: SURFACE,
    alignItems: 'center', justifyContent: 'center',
  },
  bookmarkIco: { fontSize: 13 },

  /* Analysis tab */
  analysisScroll: { flex: 1 },
  sentimentCard: {
    backgroundColor: GLASS, borderWidth: 1, borderColor: GOLD_BRD,
    borderRadius: 12, padding: 14, marginBottom: 16,
  },
  sentimentTitle: { fontSize: 13, fontWeight: '800', color: WHITE, marginBottom: 4 },
  sentimentPropLbl: { fontSize: 10, color: GOLD, marginBottom: 8 },
  sentimentBody: { fontSize: 11, color: SLATE, lineHeight: 17, marginBottom: 12 },
  strategyRow: { flexDirection: 'row', marginBottom: 10 },
  strategyBadge: {
    backgroundColor: GOLD_DIM, borderWidth: 1, borderColor: GOLD_BRD,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  strategyBadgeTxt: { fontSize: 9, fontWeight: '800', color: GOLD, letterSpacing: 1 },
  analysisGrid: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  analysisCell: {
    flex: 1, backgroundColor: GOLD_DIM, borderRadius: 8,
    padding: 8, alignItems: 'center',
  },
  analysisCellLbl: { fontSize: 7, color: MUTED, letterSpacing: 1, marginBottom: 3 },
  analysisCellVal: { fontSize: 12, fontWeight: '800', color: WHITE },
  prosCons: { marginTop: 6 },
  prosTitle: { fontSize: 9, fontWeight: '800', color: GREEN, letterSpacing: 1, marginBottom: 5 },
  consTitle: { fontSize: 9, fontWeight: '800', color: '#F59E0B', letterSpacing: 1, marginBottom: 5 },
  prosItem: { fontSize: 10, color: SLATE, lineHeight: 16, marginBottom: 2 },
  consItem: { fontSize: 10, color: SLATE, lineHeight: 16, marginBottom: 2 },
  sentBar: { height: 5, backgroundColor: SURFACE, borderRadius: 3, marginTop: 10, overflow: 'hidden' },
  sentBarFill: { width: '75%', height: '100%', backgroundColor: GOLD, borderRadius: 3 },
  sentBarLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  sentBarLbl: { fontSize: 7, color: MUTED, letterSpacing: 1, textTransform: 'uppercase' },
  streamsSectionLbl: { fontSize: 8, fontWeight: '800', color: MUTED, letterSpacing: 2, marginBottom: 8 },
  streamRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8,
    borderWidth: 1, borderColor: 'rgba(255,215,0,0.06)', marginBottom: 6,
    backgroundColor: GLASS,
  },
  streamLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  streamDot: { width: 8, height: 8, borderRadius: 4 },
  streamName: { fontSize: 11, fontWeight: '600', color: WHITE },
  streamMs: { fontSize: 10, color: MUTED, fontFamily: 'monospace' },

  /* Alpaca */
  alpacaCard: {
    backgroundColor: GLASS, borderWidth: 1, borderColor: GOLD_BRD,
    borderRadius: 12, padding: 14,
  },
  alpacaTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  alpacaValLbl: { fontSize: 8, color: MUTED, letterSpacing: 1.5, marginBottom: 4 },
  alpacaVal: { fontSize: 20, fontWeight: '800', color: GOLD },
  alpacaDayChange: { alignItems: 'flex-end' },
  alpacaChangePct: { fontSize: 18, fontWeight: '800' },
  alpacaChangeLbl: { fontSize: 7, color: MUTED, letterSpacing: 1 },
  posRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 7,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)',
  },
  posSymbol: { width: 50, fontSize: 12, fontWeight: '800', color: WHITE },
  posQty: { flex: 1, fontSize: 10, color: MUTED },
  posPrice: { width: 60, fontSize: 11, color: SLATE, textAlign: 'right', fontFamily: 'monospace' },
  posPl: { width: 50, fontSize: 10, fontWeight: '700', textAlign: 'right' },

  /* Documents */
  docsSectionLbl: { fontSize: 9, fontWeight: '800', color: MUTED, letterSpacing: 2, marginBottom: 12 },
  docRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,215,0,0.06)',
  },
  docIcon: {
    width: 36, height: 36, borderRadius: 8, backgroundColor: SURFACE,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  docIconTxt: { fontSize: 16 },
  docInfo: { flex: 1 },
  docName: { fontSize: 11, fontWeight: '600', color: WHITE, marginBottom: 2 },
  docMeta: { fontSize: 9, color: MUTED },
  docArrow: { fontSize: 18, color: MUTED },

  /* Bottom nav */
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1, borderTopColor: GOLD_BRD,
    backgroundColor: BG, paddingBottom: 6, paddingTop: 8,
  },
  navTab: { flex: 1, alignItems: 'center', position: 'relative', paddingVertical: 4 },
  navTabIco: { fontSize: 16, marginBottom: 3 },
  navTabLbl: { fontSize: 8, fontWeight: '700', color: MUTED, letterSpacing: 1 },
  navActive: {
    position: 'absolute', bottom: -2, left: '25%', right: '25%',
    height: 2, backgroundColor: GOLD, borderRadius: 1,
  },

  /* Empty state */
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 36, marginBottom: 10 },
  emptyTxt: { fontSize: 13, color: MUTED, fontWeight: '600' },
});
