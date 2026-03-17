import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { C } from '../../config/theme';

const SUPABASE_URL = 'https://euxrlpuegeiggedqbkiv.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1eHJscHVlZ2VpZ2dlZHFia2l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NTM1MTYsImV4cCI6MjA4MTUyOTUxNn0.KpvXVTIDXeGOBOQOhdPopVbYYfjB-RgPSyJJY3IY474';

const PLATFORMS = [
  {
    id: 'twitter',
    name: 'Twitter / X',
    color: '#FFFFFF',
    bgColor: '#000000',
    icon: 'X',
    status: 'disconnected',
    portal: 'developer.twitter.com',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    color: '#FFFFFF',
    bgColor: '#0077B5',
    icon: 'in',
    status: 'connected',
    syncAgo: '12m ago',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    color: '#FFFFFF',
    bgColor: '#E1306C',
    icon: 'IG',
    status: 'disconnected',
    portal: 'developers.facebook.com',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    color: '#FFFFFF',
    bgColor: '#010101',
    icon: 'TT',
    status: 'disconnected',
    portal: 'developers.tiktok.com',
  },
  {
    id: 'discord',
    name: 'Discord',
    color: '#FFFFFF',
    bgColor: '#5865F2',
    icon: 'DC',
    status: 'disconnected',
    portal: 'discord.com/developers',
  },
  {
    id: 'threads',
    name: 'Threads',
    color: '#FFFFFF',
    bgColor: '#101010',
    icon: '@',
    status: 'disconnected',
    portal: 'developers.facebook.com',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    color: '#FFFFFF',
    bgColor: '#25D366',
    icon: 'WA',
    status: 'disconnected',
    portal: 'developers.facebook.com',
  },
  {
    id: 'webhook',
    name: 'Custom Webhook',
    color: C.gold,
    bgColor: '#1C1C24',
    icon: '+',
    status: 'custom',
    portal: null,
  },
];

const INFRASTRUCTURE = [
  {
    id: 'airbyte',
    name: 'Airbyte Engine',
    subtitle: 'ETL Data Synchronization',
    icon: '⇄',
    status: 'active',
    statusColor: '#22C55E',
    statusText: 'Active',
    hasKey: true,
  },
  {
    id: 'apify',
    name: 'Apify Scrapers',
    subtitle: 'Web Automation & Extraction',
    icon: '⌘',
    status: 'disconnected',
    statusColor: '#6B7280',
    statusText: 'Disconnected',
    hasKey: false,
  },
  {
    id: 'aigateway',
    name: 'AI Gateway',
    subtitle: 'Neural Engine Integration',
    icon: '◈',
    status: 'primary',
    statusColor: C.gold,
    statusText: 'Primary',
    hasKey: false,
    operational: true,
  },
];

export default function SocialStudio({ navigation }) {
  const [platforms, setPlatforms] = useState(PLATFORMS);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [apiKeyModal, setApiKeyModal] = useState(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [connectedCount, setConnectedCount] = useState(1);

  useEffect(() => {
    fetchConnectionStatus();
  }, []);

  const fetchConnectionStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/social_connections?select=platform,connected,synced_at&order=platform`,
        {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const updated = platforms.map((p) => {
            const found = data.find((d) => d.platform === p.id);
            if (found) {
              return {
                ...p,
                status: found.connected ? 'connected' : 'disconnected',
                syncAgo: found.synced_at
                  ? new Date(found.synced_at).toLocaleTimeString()
                  : null,
              };
            }
            return p;
          });
          setPlatforms(updated);
          setConnectedCount(updated.filter((p) => p.status === 'connected').length);
        }
      }
    } catch {
      // use default state
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = useCallback(
    async (platform) => {
      if (platform.status === 'connected') {
        Alert.alert(
          'Disconnect Platform',
          `Remove ${platform.name} from your Social Studio?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Disconnect',
              style: 'destructive',
              onPress: async () => {
                const updated = platforms.map((p) =>
                  p.id === platform.id ? { ...p, status: 'disconnected', syncAgo: null } : p
                );
                setPlatforms(updated);
                setConnectedCount(updated.filter((p) => p.status === 'connected').length);
                try {
                  await fetch(`${SUPABASE_URL}/rest/v1/social_connections`, {
                    method: 'POST',
                    headers: {
                      apikey: SUPABASE_ANON_KEY,
                      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                      'Content-Type': 'application/json',
                      Prefer: 'resolution=merge-duplicates',
                    },
                    body: JSON.stringify({ platform: platform.id, connected: false }),
                  });
                } catch {}
              },
            },
          ]
        );
      } else if (platform.id === 'webhook') {
        setApiKeyModal(platform);
      } else {
        const updated = platforms.map((p) =>
          p.id === platform.id
            ? { ...p, status: 'connected', syncAgo: 'just now' }
            : p
        );
        setPlatforms(updated);
        setConnectedCount(updated.filter((p) => p.status === 'connected').length);
        try {
          await fetch(`${SUPABASE_URL}/rest/v1/social_connections`, {
            method: 'POST',
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
              Prefer: 'resolution=merge-duplicates',
            },
            body: JSON.stringify({
              platform: platform.id,
              connected: true,
              synced_at: new Date().toISOString(),
            }),
          });
        } catch {}
      }
    },
    [platforms]
  );

  const handleSaveApiKey = async () => {
    if (!apiKeyInput.trim()) return;
    setSaving(true);
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/api_keys`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify({ service: apiKeyModal?.id, key: apiKeyInput }),
      });
      Alert.alert('Saved', 'API key configured successfully.');
    } catch {
      Alert.alert('Error', 'Failed to save API key.');
    } finally {
      setSaving(false);
      setApiKeyModal(null);
      setApiKeyInput('');
    }
  };

  const filteredPlatforms =
    filter === 'connected'
      ? platforms.filter((p) => p.status === 'connected')
      : platforms;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLogoBox}>
          <Text style={styles.headerLogoText}>SS</Text>
        </View>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>
            SaintSal <Text style={styles.headerTitleGold}>Labs</Text>
          </Text>
          <Text style={styles.headerSubtitle}>ELITE STUDIO HUB</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.connectedBadge}>
            <View style={styles.pulseDot} />
            <Text style={styles.connectedText}>{connectedCount} LIVE</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>
            Social Connection <Text style={styles.heroTitleGold}>Center</Text>
          </Text>
          <Text style={styles.heroSub}>
            Orchestrate high-fidelity content distribution across all elite platforms from a single neural point.
          </Text>
        </View>

        {/* Core Infrastructure */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CORE INFRASTRUCTURE</Text>
          <View style={styles.infraGrid}>
            {INFRASTRUCTURE.map((infra) => (
              <View key={infra.id} style={styles.infraCard}>
                <View style={styles.infraCardTop}>
                  <View style={styles.infraIconBox}>
                    <Text style={styles.infraIcon}>{infra.icon}</Text>
                  </View>
                  <View style={[styles.infraBadge, { borderColor: infra.statusColor + '40' }]}>
                    <Text style={[styles.infraBadgeText, { color: infra.statusColor }]}>
                      {infra.statusText.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <View>
                  <Text style={styles.infraName}>{infra.name}</Text>
                  <Text style={styles.infraSub}>{infra.subtitle}</Text>
                </View>
                {infra.hasKey ? (
                  <View style={styles.infraKeyRow}>
                    <Text style={styles.infraKey}>••••••••••••••••</Text>
                    <TouchableOpacity style={styles.infraEditBtn}>
                      <Text style={styles.infraEditIcon}>✎</Text>
                    </TouchableOpacity>
                  </View>
                ) : infra.operational ? (
                  <View style={styles.infraOpRow}>
                    <View style={styles.infraOpDot} />
                    <Text style={styles.infraOpText}>SYSTEM OPERATIONAL</Text>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.infraConnectBtn}>
                    <Text style={styles.infraConnectBtnText}>CONFIGURE API KEY</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Social Platforms */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>SOCIAL PLATFORMS</Text>
            <View style={styles.filterRow}>
              <TouchableOpacity
                style={[styles.filterBtn, filter === 'all' && styles.filterBtnActive]}
                onPress={() => setFilter('all')}
              >
                <Text style={[styles.filterBtnText, filter === 'all' && styles.filterBtnTextActive]}>All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterBtn, filter === 'connected' && styles.filterBtnActive]}
                onPress={() => setFilter('connected')}
              >
                <Text style={[styles.filterBtnText, filter === 'connected' && styles.filterBtnTextActive]}>Connected</Text>
              </TouchableOpacity>
            </View>
          </View>

          {loading ? (
            <ActivityIndicator color={C.gold} style={{ marginVertical: 20 }} />
          ) : (
            <View style={styles.platformGrid}>
              {filteredPlatforms.map((platform) => (
                <View
                  key={platform.id}
                  style={[
                    styles.platformCard,
                    platform.status === 'connected' && styles.platformCardConnected,
                    platform.id === 'webhook' && styles.platformCardDashed,
                  ]}
                >
                  <View style={styles.platformCardTop}>
                    <View style={[styles.platformIconBox, { backgroundColor: platform.bgColor }]}>
                      <Text style={[styles.platformIconText, { color: platform.color }]}>
                        {platform.icon}
                      </Text>
                    </View>
                    <View style={styles.platformInfo}>
                      <Text style={styles.platformName}>{platform.name}</Text>
                      <Text
                        style={[
                          styles.platformStatus,
                          platform.status === 'connected' && styles.platformStatusConnected,
                        ]}
                      >
                        {platform.status === 'connected'
                          ? 'Connected'
                          : platform.status === 'custom'
                          ? 'New Integration'
                          : 'Not connected'}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.platformBtn,
                      platform.status === 'connected' && styles.platformBtnDisconnect,
                      platform.id === 'webhook' && styles.platformBtnCustom,
                    ]}
                    onPress={() => handleConnect(platform)}
                  >
                    <Text
                      style={[
                        styles.platformBtnText,
                        platform.status === 'connected' && styles.platformBtnTextDisconnect,
                        platform.id === 'webhook' && styles.platformBtnTextCustom,
                      ]}
                    >
                      {platform.status === 'connected'
                        ? 'DISCONNECT'
                        : platform.id === 'webhook'
                        ? 'CONFIGURE'
                        : 'AUTH PLATFORM'}
                    </Text>
                  </TouchableOpacity>

                  {platform.status === 'connected' && platform.syncAgo ? (
                    <Text style={styles.syncText}>Sync: {platform.syncAgo}</Text>
                  ) : platform.portal ? (
                    <Text style={styles.portalText}>{platform.portal}</Text>
                  ) : platform.id === 'webhook' ? (
                    <Text style={styles.enterpriseText}>ENTERPRISE FEATURE</Text>
                  ) : null}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Account Health Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACCOUNT HEALTH</Text>
          <View style={styles.healthGrid}>
            {[
              { label: 'Connected', value: connectedCount.toString(), color: '#22C55E' },
              { label: 'Pending', value: (platforms.length - connectedCount - 1).toString(), color: C.gold },
              { label: 'Sync Rate', value: '98%', color: '#60A5FA' },
              { label: 'Uptime', value: '99.9%', color: '#A78BFA' },
            ].map((stat) => (
              <View key={stat.label} style={styles.healthCard}>
                <Text style={[styles.healthValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={styles.healthLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Posting Schedule */}
        <View style={[styles.section, { marginBottom: 40 }]}>
          <Text style={styles.sectionLabel}>POSTING SCHEDULE</Text>
          <View style={styles.scheduleCard}>
            {[
              { day: 'Mon', times: ['9:00 AM', '6:00 PM'] },
              { day: 'Wed', times: ['12:00 PM'] },
              { day: 'Fri', times: ['10:00 AM', '3:00 PM', '8:00 PM'] },
              { day: 'Sat', times: ['11:00 AM'] },
            ].map((item) => (
              <View key={item.day} style={styles.scheduleRow}>
                <Text style={styles.scheduleDay}>{item.day}</Text>
                <View style={styles.scheduleTimesRow}>
                  {item.times.map((t) => (
                    <View key={t} style={styles.scheduleTimeBadge}>
                      <Text style={styles.scheduleTimeText}>{t}</Text>
                    </View>
                  ))}
                </View>
                <TouchableOpacity>
                  <Text style={styles.scheduleEditIcon}>+</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* API Key Modal */}
      <Modal visible={!!apiKeyModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Configure {apiKeyModal?.name}</Text>
            <Text style={styles.modalSub}>Enter your webhook URL or API key</Text>
            <TextInput
              style={styles.modalInput}
              value={apiKeyInput}
              onChangeText={setApiKeyInput}
              placeholder="https://hooks.example.com/..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => {
                  setApiKeyModal(null);
                  setApiKeyInput('');
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={handleSaveApiKey}>
                {saving ? (
                  <ActivityIndicator color="#000" size="small" />
                ) : (
                  <Text style={styles.modalSaveText}>SAVE</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.gold + '18',
    backgroundColor: C.bg,
  },
  headerLogoBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.gold + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLogoText: {
    color: C.gold,
    fontWeight: '900',
    fontSize: 14,
  },
  headerTitleBox: {
    marginLeft: 10,
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 18,
    fontStyle: 'italic',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headerTitleGold: {
    color: C.gold,
    fontStyle: 'normal',
  },
  headerSubtitle: {
    color: C.gold + '99',
    fontSize: 9,
    letterSpacing: 3,
    fontWeight: '700',
    marginTop: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.gold + '15',
    borderWidth: 1,
    borderColor: C.gold + '30',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 5,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.gold,
  },
  connectedText: {
    color: C.gold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  hero: {
    paddingVertical: 20,
    gap: 6,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  heroTitleGold: {
    color: C.gold,
  },
  heroSub: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
    lineHeight: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionLabel: {
    color: C.gold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 4,
    marginBottom: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
  },
  filterBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  filterBtnActive: {
    backgroundColor: C.gold + '20',
    borderColor: C.gold + '40',
  },
  filterBtnText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 10,
    fontWeight: '700',
  },
  filterBtnTextActive: {
    color: C.gold,
  },
  infraGrid: {
    gap: 12,
  },
  infraCard: {
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.gold + '18',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  infraCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infraIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: C.gold + '18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infraIcon: {
    color: C.gold,
    fontSize: 20,
    fontWeight: '700',
  },
  infraBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  infraBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  infraName: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  infraSub: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    marginTop: 2,
  },
  infraKeyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.gold + '18',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  infraKey: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    flex: 1,
    letterSpacing: 2,
  },
  infraEditBtn: {
    padding: 4,
  },
  infraEditIcon: {
    color: C.gold,
    fontSize: 16,
  },
  infraOpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infraOpDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.gold,
  },
  infraOpText: {
    color: C.gold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },
  infraConnectBtn: {
    backgroundColor: C.gold,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  infraConnectBtnText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  platformGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  platformCard: {
    width: '47%',
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  platformCardConnected: {
    borderColor: C.gold + '50',
    backgroundColor: C.gold + '08',
  },
  platformCardDashed: {
    borderStyle: 'dashed',
  },
  platformCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  platformIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  platformIconText: {
    fontSize: 13,
    fontWeight: '900',
  },
  platformInfo: {
    flex: 1,
  },
  platformName: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  platformStatus: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    marginTop: 2,
  },
  platformStatusConnected: {
    color: '#22C55E',
    fontWeight: '600',
  },
  platformBtn: {
    backgroundColor: C.gold,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  platformBtnDisconnect: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  platformBtnCustom: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: C.gold + '50',
  },
  platformBtnText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  platformBtnTextDisconnect: {
    color: 'rgba(255,255,255,0.6)',
  },
  platformBtnTextCustom: {
    color: C.gold,
  },
  syncText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 9,
    textAlign: 'center',
    letterSpacing: 1.5,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  portalText: {
    color: C.gold + '99',
    fontSize: 9,
    textAlign: 'center',
    letterSpacing: 1,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  enterpriseText: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 9,
    textAlign: 'center',
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  healthGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  healthCard: {
    flex: 1,
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  healthValue: {
    fontSize: 22,
    fontWeight: '900',
  },
  healthLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scheduleCard: {
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    overflow: 'hidden',
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 12,
  },
  scheduleDay: {
    color: C.gold,
    fontSize: 12,
    fontWeight: '800',
    width: 30,
  },
  scheduleTimesRow: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  scheduleTimeBadge: {
    backgroundColor: C.gold + '18',
    borderWidth: 1,
    borderColor: C.gold + '30',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  scheduleTimeText: {
    color: C.gold,
    fontSize: 10,
    fontWeight: '700',
  },
  scheduleEditIcon: {
    color: C.gold,
    fontSize: 20,
    fontWeight: '300',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: C.bgCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: C.gold + '30',
    padding: 24,
    gap: 16,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  modalSub: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
    marginTop: -8,
  },
  modalInput: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: C.gold + '30',
    borderRadius: 12,
    padding: 14,
    color: '#FFFFFF',
    fontSize: 13,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  modalCancelText: {
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '700',
    fontSize: 14,
  },
  modalSave: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: C.gold,
    alignItems: 'center',
  },
  modalSaveText: {
    color: '#000000',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 1.5,
  },
});
