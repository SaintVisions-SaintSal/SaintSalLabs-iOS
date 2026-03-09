/**
 * SaintSal Labs — Dashboard Screen
 * Saved items, favorites, watchlists, recent conversations, usage
 */
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, Spacing, BorderRadius, Shadow, TierColors } from '@/config/theme';
import { VERTICALS, TIERS } from '@/config/api';
import { useStore } from '@/lib/store';
import SALHeader from '@/components/SALHeader';
import VerticalCard from '@/components/VerticalCard';

type Tab = 'overview' | 'chats' | 'projects' | 'saved';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const { user, conversations, builderProjects, setActiveConversation } = useStore();

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'chats', label: 'Chats' },
    { id: 'projects', label: 'Projects' },
    { id: 'saved', label: 'Saved' },
  ];

  const tier = user?.tier || 'free';
  const tierInfo = TIERS[tier as keyof typeof TIERS];

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
      <SALHeader title="Dashboard" subtitle={`${conversations.length} chats · ${builderProjects.length} projects`} />

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {activeTab === 'overview' && (
          <>
            {/* Usage Card */}
            <View style={[styles.usageCard, { borderColor: `${tierInfo.color}40` }]}>
              <View style={styles.usageHeader}>
                <Text style={styles.usageTitle}>Compute Usage</Text>
                <View style={[styles.tierBadge, { backgroundColor: `${tierInfo.color}20` }]}>
                  <Text style={[styles.tierBadgeText, { color: tierInfo.color }]}>{tierInfo.name}</Text>
                </View>
              </View>
              <View style={styles.usageBar}>
                <View
                  style={[styles.usageFill, {
                    width: `${Math.min(((user?.credits_total || 100) - (user?.credits_remaining || 80)) / (user?.credits_total || 100) * 100, 100)}%`,
                    backgroundColor: tierInfo.color,
                  }]}
                />
              </View>
              <View style={styles.usageLabels}>
                <Text style={styles.usageLabel}>
                  {user?.credits_remaining || 80} / {user?.credits_total || 100} min remaining
                </Text>
                <Text style={styles.usageLabel}>
                  {tierInfo.price === 0 ? 'Free' : `$${tierInfo.price}/mo`}
                </Text>
              </View>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              {[
                { label: 'Conversations', value: String(conversations.length), icon: '💬', color: Colors.blue },
                { label: 'Projects', value: String(builderProjects.length), icon: '🏗️', color: Colors.gold },
                { label: 'Searches', value: '—', icon: '🔍', color: Colors.purple },
                { label: 'API Calls', value: '—', icon: '⚡', color: Colors.green },
              ].map((stat, i) => (
                <View key={i} style={styles.statCard}>
                  <Text style={styles.statIcon}>{stat.icon}</Text>
                  <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>

            {/* Model Usage */}
            <Text style={styles.sectionLabel}>MODEL DISTRIBUTION</Text>
            <View style={styles.modelGrid}>
              {[
                { tier: 'SAL Mini', color: TierColors.mini, pct: 40 },
                { tier: 'SAL Pro', color: TierColors.pro, pct: 35 },
                { tier: 'SAL Max', color: TierColors.max, pct: 20 },
                { tier: 'Max Fast', color: TierColors.max_fast, pct: 5 },
              ].map((m, i) => (
                <View key={i} style={styles.modelRow}>
                  <View style={[styles.modelDot, { backgroundColor: m.color }]} />
                  <Text style={styles.modelName}>{m.tier}</Text>
                  <View style={styles.modelBarBg}>
                    <View style={[styles.modelBarFill, { width: `${m.pct}%`, backgroundColor: m.color }]} />
                  </View>
                  <Text style={[styles.modelPct, { color: m.color }]}>{m.pct}%</Text>
                </View>
              ))}
            </View>

            {/* Recent Conversations */}
            <Text style={styles.sectionLabel}>RECENT CHATS</Text>
            {conversations.slice(0, 5).map((c) => {
              const v = VERTICALS.find((v) => v.id === c.vertical);
              return (
                <TouchableOpacity
                  key={c.id}
                  style={styles.chatItem}
                  onPress={() => setActiveConversation(c.id)}
                >
                  <View style={styles.chatIcon}>
                    <Text style={styles.chatIconText}>{v?.icon || '💬'}</Text>
                  </View>
                  <View style={styles.chatInfo}>
                    <Text style={styles.chatTitle} numberOfLines={1}>{c.title}</Text>
                    <Text style={styles.chatMeta}>
                      {c.messages.length} messages · {new Date(c.updated_at).toLocaleDateString()}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
            {conversations.length === 0 && (
              <Text style={styles.emptyText}>No conversations yet. Start chatting with SAL.</Text>
            )}
          </>
        )}

        {activeTab === 'chats' && (
          <View style={styles.listContainer}>
            {conversations.map((c) => {
              const v = VERTICALS.find((v) => v.id === c.vertical);
              return (
                <TouchableOpacity
                  key={c.id}
                  style={styles.chatItem}
                  onPress={() => setActiveConversation(c.id)}
                >
                  <View style={styles.chatIcon}>
                    <Text style={styles.chatIconText}>{v?.icon || '💬'}</Text>
                  </View>
                  <View style={styles.chatInfo}>
                    <Text style={styles.chatTitle} numberOfLines={1}>{c.title}</Text>
                    <Text style={styles.chatMeta}>
                      {c.messages.length} messages · {c.model.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.chatTime}>
                    {new Date(c.updated_at).toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
              );
            })}
            {conversations.length === 0 && (
              <View style={styles.emptyCenter}>
                <Text style={styles.emptyIcon}>💬</Text>
                <Text style={styles.emptyTitle}>No Conversations</Text>
                <Text style={styles.emptyDesc}>Your chat history will appear here.</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'projects' && (
          <View style={styles.listContainer}>
            {builderProjects.map((p) => (
              <View key={p.id} style={styles.projectCard}>
                <View style={styles.projectIcon}>
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
                    <Text style={styles.liveBadgeText}>LIVE</Text>
                  </View>
                )}
              </View>
            ))}
            {builderProjects.length === 0 && (
              <View style={styles.emptyCenter}>
                <Text style={styles.emptyIcon}>🏗️</Text>
                <Text style={styles.emptyTitle}>No Projects</Text>
                <Text style={styles.emptyDesc}>Build something in the Builder tab.</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'saved' && (
          <View style={styles.emptyCenter}>
            <Text style={styles.emptyIcon}>📌</Text>
            <Text style={styles.emptyTitle}>Saved Items</Text>
            <Text style={styles.emptyDesc}>
              Your saved tickers, teams, properties, articles,{'\n'}and medical codes will appear here.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  tabBar: { borderBottomWidth: 0.5, borderBottomColor: Colors.border, maxHeight: 44, paddingHorizontal: Spacing.lg },
  tab: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: Colors.gold },
  tabText: { color: Colors.textTertiary, fontSize: FontSize.md, fontWeight: '500' },
  tabTextActive: { color: Colors.textPrimary, fontWeight: '600' },
  // Usage
  usageCard: {
    margin: Spacing.lg, backgroundColor: Colors.bgCard, borderRadius: BorderRadius.lg,
    borderWidth: 1, padding: Spacing.lg,
  },
  usageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  usageTitle: { color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: '600' },
  tierBadge: { borderRadius: BorderRadius.full, paddingHorizontal: Spacing.md, paddingVertical: 4 },
  tierBadgeText: { fontSize: FontSize.xs, fontWeight: '700' },
  usageBar: { height: 6, backgroundColor: Colors.bgTertiary, borderRadius: 3, overflow: 'hidden', marginBottom: Spacing.sm },
  usageFill: { height: 6, borderRadius: 3 },
  usageLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  usageLabel: { color: Colors.textTertiary, fontSize: FontSize.xs },
  // Stats
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  statCard: {
    width: '48%', backgroundColor: Colors.bgCard, borderRadius: BorderRadius.md,
    borderWidth: 0.5, borderColor: Colors.border, padding: Spacing.lg, alignItems: 'center',
  },
  statIcon: { fontSize: 28, marginBottom: Spacing.sm },
  statValue: { fontSize: FontSize.xxl, fontWeight: '700' },
  statLabel: { color: Colors.textTertiary, fontSize: FontSize.xs, marginTop: 4 },
  // Models
  sectionLabel: { color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: '700', letterSpacing: 1, marginHorizontal: Spacing.lg, marginTop: Spacing.xxl, marginBottom: Spacing.md },
  modelGrid: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  modelRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  modelDot: { width: 8, height: 8, borderRadius: 4 },
  modelName: { color: Colors.textSecondary, fontSize: FontSize.sm, width: 80 },
  modelBarBg: { flex: 1, height: 6, backgroundColor: Colors.bgTertiary, borderRadius: 3, overflow: 'hidden' },
  modelBarFill: { height: 6, borderRadius: 3 },
  modelPct: { fontSize: FontSize.sm, fontWeight: '600', width: 36, textAlign: 'right' },
  // Chat list
  listContainer: { padding: Spacing.lg },
  chatItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md, padding: Spacing.lg, marginBottom: Spacing.sm, gap: Spacing.md,
  },
  chatIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.bgTertiary, alignItems: 'center', justifyContent: 'center' },
  chatIconText: { fontSize: 18 },
  chatInfo: { flex: 1 },
  chatTitle: { color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: '600' },
  chatMeta: { color: Colors.textTertiary, fontSize: FontSize.xs, marginTop: 2 },
  chatTime: { color: Colors.textMuted, fontSize: FontSize.xs },
  // Projects
  projectCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md, padding: Spacing.lg, marginBottom: Spacing.sm, gap: Spacing.md,
  },
  projectIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: `${Colors.gold}15`, alignItems: 'center', justifyContent: 'center' },
  projectIconText: { color: Colors.gold, fontSize: 14, fontWeight: '700' },
  projectInfo: { flex: 1 },
  projectName: { color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: '600' },
  projectMeta: { color: Colors.textTertiary, fontSize: FontSize.xs, marginTop: 2 },
  liveBadge: { backgroundColor: `${Colors.green}20`, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  liveBadgeText: { color: Colors.green, fontSize: 10, fontWeight: '700' },
  // Empty
  emptyCenter: { alignItems: 'center', paddingVertical: Spacing.huge },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: '600' },
  emptyDesc: { color: Colors.textSecondary, fontSize: FontSize.sm, textAlign: 'center', marginTop: 6, lineHeight: 20 },
  emptyText: { color: Colors.textTertiary, fontSize: FontSize.sm, marginHorizontal: Spacing.lg, marginTop: Spacing.md },
});
