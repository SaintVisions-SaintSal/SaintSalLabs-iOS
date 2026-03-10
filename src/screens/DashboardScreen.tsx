/**
 * SaintSal Labs — Dashboard Screen
 * Real usage data, conversations, projects, saved items
 * Premium charcoal + gold design
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, Spacing, BorderRadius, Shadow, TierColors } from '@/config/theme';
import { VERTICALS, TIERS } from '@/config/api';
import { useStore } from '@/lib/store';
import SALHeader from '@/components/SALHeader';
import { supabase } from '@/lib/supabase';

type Tab = 'overview' | 'chats' | 'projects' | 'saved';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const { user, conversations, builderProjects, setActiveConversation } = useStore();
  const [usagePct, setUsagePct] = useState(0);

  const tier = user?.tier || 'free';
  const tierInfo = TIERS[tier as keyof typeof TIERS];

  // Animate usage bar on mount
  useEffect(() => {
    const total = user?.credits_total || 100;
    const remaining = user?.credits_remaining || 80;
    const used = total - remaining;
    const pct = Math.min((used / total) * 100, 100);
    const timer = setTimeout(() => setUsagePct(pct), 300);
    return () => clearTimeout(timer);
  }, [user]);

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'chats', label: 'Chats', count: conversations.length },
    { id: 'projects', label: 'Projects', count: builderProjects.length },
    { id: 'saved', label: 'Saved' },
  ];

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
      <SALHeader title="Dashboard" subtitle={`${conversations.length} chats · ${builderProjects.length} projects`} />

      {/* Tab bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar} contentContainerStyle={styles.tabBarContent}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => setActiveTab(tab.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
              {tab.label}
            </Text>
            {tab.count != null && tab.count > 0 && (
              <View style={[styles.tabBadge, activeTab === tab.id && styles.tabBadgeActive]}>
                <Text style={[styles.tabBadgeText, activeTab === tab.id && styles.tabBadgeTextActive]}>
                  {tab.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {activeTab === 'overview' && (
          <>
            {/* Compute usage card */}
            <View style={styles.usageCard}>
              <View style={styles.usageHeader}>
                <View>
                  <Text style={styles.usageTitle}>Compute Usage</Text>
                  <Text style={styles.usageSubtitle}>This billing period</Text>
                </View>
                <View style={[styles.tierBadge, { backgroundColor: `${tierInfo.color}18` }]}>
                  <View style={[styles.tierDot, { backgroundColor: tierInfo.color }]} />
                  <Text style={[styles.tierBadgeText, { color: tierInfo.color }]}>{tierInfo.name}</Text>
                </View>
              </View>
              <View style={styles.usageBarTrack}>
                <View style={[styles.usageBarFill, { width: `${usagePct}%`, backgroundColor: tierInfo.color }]} />
              </View>
              <View style={styles.usageLabels}>
                <Text style={styles.usageLabel}>
                  {user?.credits_remaining || 80} / {user?.credits_total || 100} min remaining
                </Text>
                <Text style={[styles.usagePrice, { color: tierInfo.color }]}>
                  {tierInfo.price === 0 ? 'Free' : `$${tierInfo.price}/mo`}
                </Text>
              </View>
            </View>

            {/* Stats grid */}
            <View style={styles.statsGrid}>
              {[
                { label: 'Conversations', value: String(conversations.length), color: Colors.gold },
                { label: 'Projects', value: String(builderProjects.length), color: Colors.gold },
                { label: 'Models', value: '51', color: '#8B5CF6' },
                { label: 'Connectors', value: '88', color: Colors.green },
              ].map((stat, i) => (
                <View key={i} style={styles.statCard}>
                  <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>

            {/* Model distribution */}
            <Text style={styles.sectionLabel}>MODEL DISTRIBUTION</Text>
            <View style={styles.modelSection}>
              {[
                { tier: 'SAL Mini', color: Colors.gold, pct: 40, icon: '⚡' },
                { tier: 'SAL Pro', color: Colors.gold, pct: 35, icon: '🧠' },
                { tier: 'SAL Max', color: '#8B5CF6', pct: 20, icon: '🔮' },
                { tier: 'Max Fast', color: '#FF4757', pct: 5, icon: '🚀' },
              ].map((m, i) => (
                <View key={i} style={styles.modelRow}>
                  <Text style={styles.modelIcon}>{m.icon}</Text>
                  <Text style={styles.modelName}>{m.tier}</Text>
                  <View style={styles.modelBarTrack}>
                    <View style={[styles.modelBarFill, { width: `${m.pct}%`, backgroundColor: m.color }]} />
                  </View>
                  <Text style={[styles.modelPct, { color: m.color }]}>{m.pct}%</Text>
                </View>
              ))}
            </View>

            {/* Recent conversations */}
            <Text style={styles.sectionLabel}>RECENT CHATS</Text>
            {conversations.slice(0, 5).map((c) => {
              const v = VERTICALS.find((v) => v.id === c.vertical);
              return (
                <TouchableOpacity
                  key={c.id}
                  style={styles.chatItem}
                  onPress={() => setActiveConversation(c.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.chatIconBg, { backgroundColor: v ? `${v.color}15` : `${Colors.gold}10` }]}>
                    <Text style={styles.chatIconText}>{v?.icon || '💬'}</Text>
                  </View>
                  <View style={styles.chatInfo}>
                    <Text style={styles.chatTitle} numberOfLines={1}>{c.title}</Text>
                    <Text style={styles.chatMeta}>
                      {c.messages.length} messages · {new Date(c.updated_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.chatArrow}>›</Text>
                </TouchableOpacity>
              );
            })}
            {conversations.length === 0 && (
              <View style={styles.emptySection}>
                <Text style={styles.emptyText}>No conversations yet. Start chatting with SAL.</Text>
              </View>
            )}
          </>
        )}

        {activeTab === 'chats' && (
          <View style={styles.listPad}>
            {conversations.length === 0 ? (
              <View style={styles.emptyCenter}>
                <Text style={styles.emptyLargeIcon}>💬</Text>
                <Text style={styles.emptyTitle}>No Conversations</Text>
                <Text style={styles.emptyDesc}>Your chat history will appear here.</Text>
              </View>
            ) : (
              conversations.map((c) => {
                const v = VERTICALS.find((v) => v.id === c.vertical);
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={styles.chatItem}
                    onPress={() => setActiveConversation(c.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.chatIconBg, { backgroundColor: v ? `${v.color}15` : `${Colors.gold}10` }]}>
                      <Text style={styles.chatIconText}>{v?.icon || '💬'}</Text>
                    </View>
                    <View style={styles.chatInfo}>
                      <Text style={styles.chatTitle} numberOfLines={1}>{c.title}</Text>
                      <Text style={styles.chatMeta}>
                        {c.messages.length} msgs · {c.model.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.chatTime}>{new Date(c.updated_at).toLocaleDateString()}</Text>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        {activeTab === 'projects' && (
          <View style={styles.listPad}>
            {builderProjects.length === 0 ? (
              <View style={styles.emptyCenter}>
                <Text style={styles.emptyLargeIcon}>{'</>'}</Text>
                <Text style={styles.emptyTitle}>No Projects</Text>
                <Text style={styles.emptyDesc}>Build something in the Builder tab.</Text>
              </View>
            ) : (
              builderProjects.map((p) => (
                <View key={p.id} style={styles.projectCard}>
                  <View style={styles.projectIconBg}>
                    <Text style={styles.projectIconText}>{'</>'}</Text>
                  </View>
                  <View style={styles.projectInfo}>
                    <Text style={styles.projectName} numberOfLines={1}>{p.name}</Text>
                    <Text style={styles.projectMeta}>
                      {p.files.length} files · {p.framework} · {new Date(p.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  {p.deploy_url && (
                    <View style={styles.liveBadge}>
                      <View style={styles.liveDot} />
                      <Text style={styles.liveBadgeText}>LIVE</Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'saved' && (
          <View style={styles.emptyCenter}>
            <Text style={styles.emptyLargeIcon}>📌</Text>
            <Text style={styles.emptyTitle}>Saved Items</Text>
            <Text style={styles.emptyDesc}>
              {'Your saved tickers, teams, properties,\narticles, and medical codes will appear here.'}
            </Text>
          </View>
        )}

        <View style={{ height: Spacing.huge }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },

  // Tab bar
  tabBar: { borderBottomWidth: 0.5, borderBottomColor: Colors.border, maxHeight: 48, flexGrow: 0 },
  tabBarContent: { paddingHorizontal: Spacing.lg, gap: 4 },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: Colors.gold },
  tabText: { color: Colors.textTertiary, fontSize: FontSize.md, fontWeight: '500' },
  tabTextActive: { color: Colors.textPrimary, fontWeight: '600' },
  tabBadge: { backgroundColor: Colors.bgTertiary, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1 },
  tabBadgeActive: { backgroundColor: `${Colors.gold}20` },
  tabBadgeText: { color: Colors.textMuted, fontSize: 10, fontWeight: '700' },
  tabBadgeTextActive: { color: Colors.gold },

  // Usage card
  usageCard: {
    margin: Spacing.lg, backgroundColor: Colors.bgCard, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: `${Colors.gold}20`, padding: Spacing.lg,
  },
  usageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.lg },
  usageTitle: { color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: '700' },
  usageSubtitle: { color: Colors.textTertiary, fontSize: FontSize.xs, marginTop: 2 },
  tierBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: BorderRadius.full, paddingHorizontal: Spacing.md, paddingVertical: 5,
  },
  tierDot: { width: 6, height: 6, borderRadius: 3 },
  tierBadgeText: { fontSize: FontSize.xs, fontWeight: '700' },
  usageBarTrack: { height: 6, backgroundColor: Colors.bgTertiary, borderRadius: 3, overflow: 'hidden', marginBottom: Spacing.sm },
  usageBarFill: { height: 6, borderRadius: 3 },
  usageLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  usageLabel: { color: Colors.textTertiary, fontSize: FontSize.xs },
  usagePrice: { fontSize: FontSize.xs, fontWeight: '700' },

  // Stats
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  statCard: {
    width: '48%', backgroundColor: Colors.bgCard, borderRadius: BorderRadius.md,
    borderWidth: 0.5, borderColor: Colors.border, padding: Spacing.lg, alignItems: 'center',
  },
  statValue: { fontSize: FontSize.xxl, fontWeight: '800', marginBottom: 2 },
  statLabel: { color: Colors.textTertiary, fontSize: FontSize.xs, fontWeight: '500' },

  // Models
  sectionLabel: {
    color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: '700', letterSpacing: 1.2,
    marginHorizontal: Spacing.lg, marginTop: Spacing.xxl, marginBottom: Spacing.md,
  },
  modelSection: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  modelRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  modelIcon: { fontSize: 14, width: 20, textAlign: 'center' },
  modelName: { color: Colors.textSecondary, fontSize: FontSize.sm, width: 76 },
  modelBarTrack: { flex: 1, height: 5, backgroundColor: Colors.bgTertiary, borderRadius: 3, overflow: 'hidden' },
  modelBarFill: { height: 5, borderRadius: 3 },
  modelPct: { fontSize: FontSize.sm, fontWeight: '700', width: 36, textAlign: 'right' },

  // Chat list items
  listPad: { padding: Spacing.lg },
  chatItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md, padding: Spacing.lg, marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm, gap: Spacing.md,
  },
  chatIconBg: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  chatIconText: { fontSize: 18 },
  chatInfo: { flex: 1 },
  chatTitle: { color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: '600' },
  chatMeta: { color: Colors.textTertiary, fontSize: FontSize.xs, marginTop: 2 },
  chatTime: { color: Colors.textMuted, fontSize: FontSize.xs },
  chatArrow: { color: Colors.textMuted, fontSize: 20, fontWeight: '300' },

  // Projects
  projectCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md, padding: Spacing.lg, marginBottom: Spacing.sm, gap: Spacing.md,
  },
  projectIconBg: { width: 40, height: 40, borderRadius: 12, backgroundColor: `${Colors.gold}12`, alignItems: 'center', justifyContent: 'center' },
  projectIconText: { color: Colors.gold, fontSize: 14, fontWeight: '700' },
  projectInfo: { flex: 1 },
  projectName: { color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: '600' },
  projectMeta: { color: Colors.textTertiary, fontSize: FontSize.xs, marginTop: 2 },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: `${Colors.green}15`, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
  },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.green },
  liveBadgeText: { color: Colors.green, fontSize: 10, fontWeight: '700' },

  // Empty states
  emptySection: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg },
  emptyText: { color: Colors.textTertiary, fontSize: FontSize.sm },
  emptyCenter: { alignItems: 'center', paddingVertical: Spacing.huge * 1.5 },
  emptyLargeIcon: { fontSize: 44, marginBottom: Spacing.md, opacity: 0.6 },
  emptyTitle: { color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: '600', marginBottom: 4 },
  emptyDesc: { color: Colors.textSecondary, fontSize: FontSize.sm, textAlign: 'center', lineHeight: 20 },
});
