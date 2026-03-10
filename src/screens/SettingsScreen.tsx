/**
 * SaintSal Labs — Settings Screen
 * Profile, tier, connected services, about — premium charcoal + gold
 */
import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking, Alert, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '@/config/theme';
import { TIERS } from '@/config/api';
import { useStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import SALHeader from '@/components/SALHeader';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user, setUser, setAuthToken } = useStore();
  const tier = user?.tier || 'free';
  const tierInfo = TIERS[tier as keyof typeof TIERS];

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          setUser(null);
          setAuthToken(null);
        },
      },
    ]);
  };

  const sections = [
    {
      title: 'ACCOUNT',
      items: [
        { icon: '👤', label: 'Profile', sub: user?.email || 'Not signed in', action: () => {} },
        {
          icon: '⭐', label: 'Subscription',
          sub: `${tierInfo?.name || 'Free'} Plan`,
          action: () => Linking.openURL('https://saintsallabs.com/#pricing'),
        },
        { icon: '📊', label: 'Usage & Billing', sub: `${user?.credits_remaining || 0} min remaining`, action: () => {} },
      ],
    },
    {
      title: 'AI SETTINGS',
      items: [
        { icon: '🧠', label: 'Default Model', sub: 'SAL Pro (Claude Sonnet)', action: () => {} },
        { icon: '🔗', label: 'Connected Services', sub: '88 connectors', action: () => {} },
        { icon: '🎙️', label: 'Voice Agent', sub: 'ElevenLabs integration', action: () => {} },
      ],
    },
    {
      title: 'ABOUT',
      items: [
        {
          icon: '🏛️', label: 'SaintVision Technologies',
          sub: 'Huntington Beach, CA',
          action: () => Linking.openURL('https://saintsallabs.com'),
        },
        {
          icon: '📜', label: 'US Patent #10,290,222',
          sub: 'HACP Protocol',
          action: () => Linking.openURL('https://patents.google.com/patent/US10290222'),
        },
        {
          icon: '🌐', label: 'SaintSal.ai',
          sub: '175+ countries',
          action: () => Linking.openURL('https://saintsal.ai'),
        },
        { icon: '📄', label: 'Terms of Service', sub: '', action: () => Linking.openURL('https://saintsallabs.com/terms') },
        { icon: '🔒', label: 'Privacy Policy', sub: '', action: () => Linking.openURL('https://saintsallabs.com/privacy') },
      ],
    },
  ];

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
      <SALHeader title="Settings" />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'S'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'SaintSal User'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'Not signed in'}</Text>
          </View>
          <View style={[styles.tierPill, { backgroundColor: `${tierInfo?.color || Colors.textMuted}15` }]}>
            <Text style={[styles.tierPillText, { color: tierInfo?.color || Colors.textMuted }]}>
              {tierInfo?.name || 'Free'}
            </Text>
          </View>
        </View>

        {/* Upgrade CTA for free users */}
        {tier === 'free' && (
          <TouchableOpacity
            style={styles.upgradeCard}
            onPress={() => Linking.openURL('https://saintsallabs.com/#pricing')}
            activeOpacity={0.8}
          >
            <View style={styles.upgradeRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.upgradeTitle}>Upgrade to Pro</Text>
                <Text style={styles.upgradeSub}>
                  Builder, Voice AI, 51 models, 2000 compute minutes.
                </Text>
              </View>
              <View style={styles.upgradePriceBadge}>
                <Text style={styles.upgradePrice}>$97</Text>
                <Text style={styles.upgradePer}>/mo</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Setting sections */}
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.settingItem, i < section.items.length - 1 && styles.settingItemBorder]}
                  onPress={item.action}
                  activeOpacity={0.6}
                >
                  <Text style={styles.settingIcon}>{item.icon}</Text>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingLabel}>{item.label}</Text>
                    {item.sub ? <Text style={styles.settingSub}>{item.sub}</Text> : null}
                  </View>
                  <Text style={styles.settingChevron}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Engine info */}
        <View style={styles.engineInfo}>
          <Image source={require('../../assets/logo-48.png')} style={styles.engineLogo} />
          <Text style={styles.engineTitle}>SAL Engine v4.0</Text>
          <Text style={styles.engineSub}>51 Models · 88 Connectors · Full Spectrum Intelligence</Text>
          <Text style={styles.engineCopyright}>
            {'© 2026 Saint Vision Technologies LLC\nUS Patent #10,290,222 · Responsible Intelligence™'}
          </Text>
        </View>

        {/* Sign out */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: Spacing.huge }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },

  // Profile
  profileCard: {
    flexDirection: 'row', alignItems: 'center', margin: Spacing.lg,
    backgroundColor: Colors.bgCard, borderRadius: BorderRadius.lg, padding: Spacing.lg, gap: Spacing.md,
    borderWidth: 0.5, borderColor: Colors.border,
  },
  avatar: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: Colors.gold, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#0A0A0F', fontSize: FontSize.xl, fontWeight: '800' },
  profileInfo: { flex: 1 },
  profileName: { color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: '700' },
  profileEmail: { color: Colors.textSecondary, fontSize: FontSize.sm, marginTop: 2 },
  tierPill: { borderRadius: BorderRadius.full, paddingHorizontal: Spacing.md, paddingVertical: 5 },
  tierPillText: { fontSize: FontSize.xs, fontWeight: '700' },

  // Upgrade
  upgradeCard: {
    marginHorizontal: Spacing.lg, marginBottom: Spacing.lg,
    backgroundColor: `${Colors.gold}0A`, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: `${Colors.gold}30`, padding: Spacing.lg,
  },
  upgradeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  upgradeTitle: { color: Colors.gold, fontSize: FontSize.lg, fontWeight: '700', marginBottom: 3 },
  upgradeSub: { color: Colors.textSecondary, fontSize: FontSize.sm, lineHeight: 20 },
  upgradePriceBadge: { alignItems: 'center' },
  upgradePrice: { color: Colors.gold, fontSize: FontSize.xxl, fontWeight: '800' },
  upgradePer: { color: Colors.textTertiary, fontSize: FontSize.xs },

  // Sections
  section: { marginBottom: Spacing.lg },
  sectionTitle: {
    color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: '700', letterSpacing: 1.2,
    marginHorizontal: Spacing.lg, marginBottom: Spacing.sm,
  },
  sectionCard: {
    marginHorizontal: Spacing.lg, backgroundColor: Colors.bgCard, borderRadius: BorderRadius.md,
    borderWidth: 0.5, borderColor: Colors.border, overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md + 2, gap: Spacing.md,
  },
  settingItemBorder: { borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  settingIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  settingInfo: { flex: 1 },
  settingLabel: { color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: '500' },
  settingSub: { color: Colors.textTertiary, fontSize: FontSize.sm, marginTop: 1 },
  settingChevron: { color: Colors.textMuted, fontSize: 22, fontWeight: '300' },

  // Engine
  engineInfo: {
    alignItems: 'center', paddingVertical: Spacing.xxl, marginTop: Spacing.md,
    borderTopWidth: 0.5, borderTopColor: Colors.border, marginHorizontal: Spacing.lg,
  },
  engineLogo: { width: 48, height: 48, borderRadius: 14, marginBottom: Spacing.md },
  engineTitle: { color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: '700', marginBottom: 4 },
  engineSub: { color: Colors.textTertiary, fontSize: FontSize.sm, marginBottom: Spacing.sm },
  engineCopyright: { color: Colors.textMuted, fontSize: FontSize.xs, textAlign: 'center', lineHeight: 18 },

  // Logout
  logoutBtn: {
    marginHorizontal: Spacing.lg, marginTop: Spacing.md, paddingVertical: Spacing.lg,
    backgroundColor: Colors.bgCard, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: 'rgba(255, 71, 87, 0.2)', alignItems: 'center',
  },
  logoutText: { color: '#FF4757', fontSize: FontSize.md, fontWeight: '600' },
});
