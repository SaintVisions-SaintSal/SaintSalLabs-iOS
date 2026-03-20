import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Animated, Alert, ActivityIndicator, Linking,
} from 'react-native';
import { C } from '../../config/theme';
import { useRouter } from 'expo-router';
import { SALMark } from '../../components';
import { MCP_BASE, MCP_KEY } from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';

const INFRA_CARDS = [
  { id: 'airbyte', icon: '🔄', name: 'Airbyte Engine', desc: 'ETL Data Synchronization', status: 'Active', statusColor: C.green },
  { id: 'apify', icon: '⌨️', name: 'Apify Scrapers', desc: 'Web Automation & Extraction', status: 'Disconnected', statusColor: C.textDim },
  { id: 'gateway', icon: '🧠', name: 'AI Gateway', desc: 'Neural Engine Integration', status: 'Primary', statusColor: C.amber },
];

const SOCIAL_PLATFORMS = [
  { id: 'twitter', icon: '𝕏', name: 'Twitter / X', color: '#E8E6E1', bgColor: '#F5F5F5', connected: false, status: 'Not connected', followers: null, lastSync: null },
  { id: 'linkedin', icon: '💼', name: 'LinkedIn', color: '#0077B5', bgColor: '#0077B5', connected: true, status: 'Connected', followers: '12.4K', lastSync: '12m ago' },
  { id: 'instagram', icon: '📸', name: 'Instagram', color: '#E1306C', bgColor: '#C13584', connected: false, status: 'Auth Required', followers: null, lastSync: null },
  { id: 'tiktok', icon: '🎵', name: 'TikTok', color: '#E8E6E1', bgColor: '#010101', connected: false, status: 'Inactive', followers: null, lastSync: null },
  { id: 'discord', icon: '🎮', name: 'Discord', color: '#E8E6E1', bgColor: '#5865F2', connected: false, status: 'Webhook Setup', followers: null, lastSync: null },
  { id: 'threads', icon: '🧵', name: 'Threads', color: '#E8E6E1', bgColor: '#000000', connected: false, status: 'Beta Integration', followers: null, lastSync: null },
  { id: 'whatsapp', icon: '💬', name: 'WhatsApp', color: '#E8E6E1', bgColor: '#25D366', connected: false, status: 'Business API', followers: null, lastSync: null },
  { id: 'youtube', icon: '▶️', name: 'YouTube', color: '#E8E6E1', bgColor: '#FF0000', connected: false, status: 'Inactive', followers: null, lastSync: null },
];

export default function SocialConnectionsScreen() {
  const router = useRouter();
  const [platforms, setPlatforms] = useState(SOCIAL_PLATFORMS);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 1400, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1400, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const { session } = useAuth();
  const [connecting, setConnecting] = useState(null);
  const [loadingPlatforms, setLoadingPlatforms] = useState(false);

  /* ── Fetch real connection status from backend ── */
  const fetchConnections = useCallback(async () => {
    try {
      setLoadingPlatforms(true);
      const res = await fetch(`${MCP_BASE}/api/social/connections`, {
        headers: {
          'x-sal-key': MCP_KEY,
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.connections) {
          setPlatforms(prev => prev.map(p => {
            const conn = data.connections.find(c => c.platform === p.id);
            if (conn) {
              return {
                ...p,
                connected: true,
                status: 'Connected',
                followers: conn.followers || null,
                lastSync: conn.last_sync || 'Just now',
              };
            }
            return p;
          }));
        }
      }
    } catch (e) {
      console.warn('[Social] Failed to fetch connections:', e.message);
    } finally {
      setLoadingPlatforms(false);
    }
  }, [session]);

  useEffect(() => { fetchConnections(); }, []);

  /* ── Start OAuth flow for a platform ── */
  const handleConnect = async (id) => {
    const platform = platforms.find(p => p.id === id);
    setConnecting(id);
    try {
      const res = await fetch(`${MCP_BASE}/api/social/auth/${id}`, {
        headers: {
          'x-sal-key': MCP_KEY,
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
        },
      });
      const data = await res.json();

      if (data.auth_url) {
        // Open OAuth URL in system browser
        const canOpen = await Linking.canOpenURL(data.auth_url);
        if (canOpen) {
          await Linking.openURL(data.auth_url);
          // After returning, refresh connection status
          setTimeout(() => fetchConnections(), 3000);
        } else {
          Alert.alert('Error', 'Cannot open authentication URL. Please try again.');
        }
      } else if (data.setup_required) {
        Alert.alert(
          `${platform?.name} Setup`,
          data.message || 'OAuth not configured for this platform yet.',
          [
            { text: 'OK' },
            data.docs_url ? { text: 'View Docs', onPress: () => Linking.openURL(data.docs_url) } : null,
          ].filter(Boolean)
        );
      } else if (data.error) {
        Alert.alert('Connection Error', data.error);
      }
    } catch (e) {
      Alert.alert('Error', `Failed to start ${platform?.name} connection: ${e.message}`);
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = (id) => {
    const platform = platforms.find(p => p.id === id);
    Alert.alert(
      'Disconnect',
      `Remove ${platform?.name} connection?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              await fetch(`${MCP_BASE}/api/social/connections/${id}`, {
                method: 'DELETE',
                headers: {
                  'x-sal-key': MCP_KEY,
                  ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
                },
              });
            } catch (e) {
              console.warn('[Social] Disconnect API error:', e.message);
            }
            setPlatforms(prev =>
              prev.map(p => p.id === id
                ? { ...p, connected: false, status: 'Disconnected', followers: null, lastSync: null }
                : p
              )
            );
          },
        },
      ]
    );
  };

  const connectedCount = platforms.filter(p => p.connected).length;

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <SALMark size={36} />
          <View style={s.headerTitleWrap}>
            <Text style={s.headerTitle}>SaintSal <Text style={s.headerHighlight}>Labs</Text></Text>
            <Text style={s.headerSub}>Elite Studio Hub</Text>
          </View>
        </View>
        <View style={s.headerActions}>
          <TouchableOpacity style={s.bellBtn}>
            <Text style={s.bellIcon}>🔔</Text>
          </TouchableOpacity>
          <View style={s.avatarCircle}>
            <Text style={s.avatarText}>SL</Text>
          </View>
        </View>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Hero */}
        <View style={s.heroSection}>
          <Text style={s.heroTitle}>Social Connection <Text style={s.heroAccent}>Center</Text></Text>
          <Text style={s.heroDesc}>
            Seamlessly bridge your digital presence. Orchestrate high-fidelity content distribution across all elite platforms from a single neural point.
          </Text>
        </View>

        {/* Stats Banner */}
        <View style={s.statsBanner}>
          <View style={s.statItem}>
            <Text style={s.statValue}>{connectedCount}</Text>
            <Text style={s.statLabel}>Connected</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={s.statValue}>{platforms.length}</Text>
            <Text style={s.statLabel}>Available</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={s.statValue}>12.4K</Text>
            <Text style={s.statLabel}>Total Reach</Text>
          </View>
        </View>

        {/* Core Infrastructure */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Core Infrastructure</Text>
          {INFRA_CARDS.map(card => (
            <View key={card.id} style={s.infraCard}>
              <View style={s.infraTop}>
                <View style={s.infraIconWrap}>
                  <Text style={s.infraIcon}>{card.icon}</Text>
                </View>
                <View style={[s.infraBadge, { backgroundColor: card.statusColor + '18', borderColor: card.statusColor + '30' }]}>
                  <Text style={[s.infraBadgeText, { color: card.statusColor }]}>{card.status}</Text>
                </View>
              </View>
              <Text style={s.infraName}>{card.name}</Text>
              <Text style={s.infraDesc}>{card.desc}</Text>
              {card.id === 'gateway' && (
                <View style={s.operationalRow}>
                  <Animated.View style={[s.opDot, { opacity: pulseAnim }]} />
                  <Text style={s.opText}>System Operational</Text>
                </View>
              )}
              {card.id === 'airbyte' && (
                <View style={s.maskedKeyRow}>
                  <View style={s.maskedKey}>
                    <Text style={s.maskedKeyText}>••••••••••••••••</Text>
                  </View>
                  <TouchableOpacity style={s.editKeyBtn}>
                    <Text style={s.editKeyIcon}>✏️</Text>
                  </TouchableOpacity>
                </View>
              )}
              {card.id === 'apify' && (
                <TouchableOpacity style={s.configureBtn} activeOpacity={0.8}>
                  <Text style={s.configureBtnText}>Configure API Key</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Social Platforms */}
        <View style={s.section}>
          <View style={s.sectionHeaderRow}>
            <Text style={s.sectionLabel}>Social Platforms</Text>
          </View>
          <View style={s.platformGrid}>
            {platforms.map(p => (
              <View key={p.id} style={[s.platformCard, p.connected && s.platformCardConnected]}>
                <View style={s.platformTop}>
                  <View style={[s.platformIconWrap, { backgroundColor: p.bgColor + '22' }]}>
                    <Text style={s.platformIconText}>{p.icon}</Text>
                  </View>
                  <View style={s.platformInfo}>
                    <Text style={s.platformName}>{p.name}</Text>
                    <Text style={[s.platformStatus, p.connected && { color: C.green }]}>
                      {p.status}
                    </Text>
                  </View>
                </View>

                {p.connected && (
                  <View style={s.connectedMeta}>
                    <View style={s.metaRow}>
                      <Text style={s.metaLabel}>Followers</Text>
                      <Text style={s.metaValue}>{p.followers}</Text>
                    </View>
                    <View style={s.metaRow}>
                      <Text style={s.metaLabel}>Last Sync</Text>
                      <Text style={s.metaValue}>{p.lastSync}</Text>
                    </View>
                  </View>
                )}

                <View style={s.platformActions}>
                  {p.connected ? (
                    <TouchableOpacity
                      style={s.disconnectBtn}
                      onPress={() => handleDisconnect(p.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={s.disconnectBtnText}>Disconnect</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={s.connectBtn}
                      onPress={() => handleConnect(p.id)}
                      activeOpacity={0.8}
                      disabled={connecting === p.id}
                    >
                      {connecting === p.id ? (
                        <ActivityIndicator size="small" color={C.bg} />
                      ) : (
                        <Text style={s.connectBtnText}>Connect</Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>

                {!p.connected && p.id !== 'youtube' && (
                  <Text style={s.portalLink}>
                    {p.id === 'instagram' ? 'Meta Console' :
                     p.id === 'discord' ? 'Portal' :
                     p.id === 'threads' ? 'Beta Console' :
                     p.id === 'whatsapp' ? 'Meta Dev' :
                     'Get API Key'}
                  </Text>
                )}
              </View>
            ))}

            {/* Add Custom Webhook */}
            <View style={s.addCard}>
              <View style={s.addIconWrap}>
                <Text style={s.addIcon}>＋</Text>
              </View>
              <Text style={s.addTitle}>Custom Webhook</Text>
              <Text style={s.addDesc}>New Integration</Text>
              <TouchableOpacity style={s.addConfigBtn} activeOpacity={0.7}>
                <Text style={s.addConfigText}>Configure</Text>
              </TouchableOpacity>
              <Text style={s.addEnterprise}>Enterprise Feature</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Nav */}
      <View style={s.bottomNav}>
        {[
          { icon: '📊', label: 'Studio', active: true },
          { icon: '📁', label: 'Library', active: false },
          { icon: '📈', label: 'Analytics', active: false },
          { icon: '⚙️', label: 'Settings', active: false },
        ].map(tab => (
          <TouchableOpacity key={tab.label} style={s.navItem}>
            <View style={[s.navIconWrap, tab.active && s.navIconWrapActive]}>
              <Text style={s.navIconText}>{tab.icon}</Text>
            </View>
            <Text style={[s.navLabel, tab.active && s.navLabelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: C.borderGlow,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitleWrap: {},
  headerTitle: { fontSize: 18, fontWeight: '800', color: C.text, fontStyle: 'italic', textTransform: 'uppercase' },
  headerHighlight: { color: C.amber, fontStyle: 'normal' },
  headerSub: { fontSize: 9, color: C.amberDim, letterSpacing: 2, textTransform: 'uppercase', fontWeight: '500' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bellBtn: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.borderGlow,
    alignItems: 'center', justifyContent: 'center',
  },
  bellIcon: { fontSize: 18 },
  avatarCircle: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 2, borderColor: C.amber,
    alignItems: 'center', justifyContent: 'center', backgroundColor: C.bgElevated,
  },
  avatarText: { fontSize: 12, fontWeight: '700', color: C.amber },

  scroll: { flex: 1 },

  heroSection: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 8 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: C.text, letterSpacing: -0.5, marginBottom: 8 },
  heroAccent: { color: C.amber },
  heroDesc: { fontSize: 14, lineHeight: 22, color: C.textDim },

  statsBanner: {
    flexDirection: 'row', marginHorizontal: 16, marginTop: 20,
    backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', color: C.amber, marginBottom: 2 },
  statLabel: { fontSize: 10, fontWeight: '600', color: C.textDim, textTransform: 'uppercase', letterSpacing: 0.5 },
  statDivider: { width: 1, height: 30, backgroundColor: C.border },

  section: { paddingHorizontal: 16, marginTop: 28 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: C.amber,
    letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16,
  },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  infraCard: {
    backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.borderGlow,
    borderRadius: 14, padding: 18, marginBottom: 12,
  },
  infraTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  infraIconWrap: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: C.amberGhost, alignItems: 'center', justifyContent: 'center',
  },
  infraIcon: { fontSize: 22 },
  infraBadge: {
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4,
    borderWidth: 1,
  },
  infraBadgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  infraName: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 2 },
  infraDesc: { fontSize: 12, color: C.textDim },
  operationalRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 },
  opDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.amber },
  opText: { fontSize: 9, fontWeight: '700', color: C.amber, letterSpacing: 1.5, textTransform: 'uppercase' },
  maskedKeyRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 },
  maskedKey: {
    flex: 1, backgroundColor: '#00000044', borderWidth: 1, borderColor: C.borderGlow,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
  },
  maskedKeyText: { fontSize: 12, color: C.textDim, letterSpacing: 1 },
  editKeyBtn: { padding: 8 },
  editKeyIcon: { fontSize: 16 },
  configureBtn: {
    backgroundColor: C.amber, borderRadius: 10,
    paddingVertical: 10, alignItems: 'center', marginTop: 14,
  },
  configureBtnText: { fontSize: 11, fontWeight: '700', color: C.bg, letterSpacing: 0.8, textTransform: 'uppercase' },

  platformGrid: { gap: 12 },
  platformCard: {
    backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.borderGlow,
    borderRadius: 14, padding: 16,
  },
  platformCardConnected: { borderColor: C.amber + '44', backgroundColor: C.amberGhost },
  platformTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  platformIconWrap: {
    width: 48, height: 48, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  platformIconText: { fontSize: 24 },
  platformInfo: {},
  platformName: { fontSize: 15, fontWeight: '700', color: C.text },
  platformStatus: { fontSize: 11, color: C.textDim, marginTop: 2 },

  connectedMeta: {
    backgroundColor: C.bgElevated, borderRadius: 10, padding: 12, marginBottom: 12,
  },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  metaLabel: { fontSize: 11, color: C.textDim },
  metaValue: { fontSize: 11, fontWeight: '600', color: C.text },

  platformActions: { marginBottom: 4 },
  connectBtn: {
    backgroundColor: C.amber, borderRadius: 10,
    paddingVertical: 10, alignItems: 'center',
  },
  connectBtnText: { fontSize: 11, fontWeight: '700', color: C.bg, letterSpacing: 0.8, textTransform: 'uppercase' },
  disconnectBtn: {
    backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.borderGlow,
    borderRadius: 10, paddingVertical: 10, alignItems: 'center',
  },
  disconnectBtnText: { fontSize: 11, fontWeight: '700', color: C.textMuted, letterSpacing: 0.8, textTransform: 'uppercase' },
  portalLink: {
    fontSize: 9, color: C.amberDim, textAlign: 'center', marginTop: 8,
    letterSpacing: 1.5, textTransform: 'uppercase', textDecorationLine: 'underline',
  },

  addCard: {
    borderWidth: 1, borderColor: C.border, borderStyle: 'dashed',
    borderRadius: 14, padding: 16, alignItems: 'center',
  },
  addIconWrap: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: C.bgCard, alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  addIcon: { fontSize: 24, color: C.amber },
  addTitle: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 2 },
  addDesc: { fontSize: 12, color: C.textDim, marginBottom: 12 },
  addConfigBtn: {
    width: '100%', borderWidth: 1, borderColor: C.amber + '44',
    backgroundColor: C.amberGhost, borderRadius: 10,
    paddingVertical: 10, alignItems: 'center',
  },
  addConfigText: { fontSize: 11, fontWeight: '700', color: C.amber, letterSpacing: 0.8, textTransform: 'uppercase' },
  addEnterprise: { fontSize: 9, color: C.textGhost, letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 8 },

  bottomNav: {
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    paddingVertical: 10, paddingBottom: 6,
    borderTopWidth: 1, borderTopColor: C.borderGlow, backgroundColor: C.bg,
  },
  navItem: { alignItems: 'center', gap: 4 },
  navIconWrap: { padding: 6, borderRadius: 999 },
  navIconWrapActive: { backgroundColor: C.amberGhost },
  navIconText: { fontSize: 20 },
  navLabel: { fontSize: 9, fontWeight: '700', color: C.textGhost, textTransform: 'uppercase', letterSpacing: 1 },
  navLabelActive: { color: C.amber },
});
