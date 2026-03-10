/**
 * SaintSal Labs — Settings Screen
 * Profile, tier management, account, about
 */
import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking, Alert, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '@/config/theme';
import { TIERS } from '@/config/api';
import { useStore } from '@/lib/store';
import SALHeader from '@/components/SALHeader';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user, setUser, setAuthToken } = useStore();
  const tier = user?.tier || 'free';

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          setUser(null);
          setAuthToken(null);
        },
      },
    ]);
  };

  const settingsSections = [
    {
      title: 'ACCOUNT',
      items: [
        { icon: '👤', label: 'Profile', sub: user?.email || 'Not signed in', onPress: () => {} },
        {
          icon: '⭐', label: 'Subscription',
          sub: `${TIERS[tier as keyof typeof TIERS]?.name || 'Free'} Plan`,
          onPress: () => Linking.openURL('https://saintsallabs.com/#pricing'),
        },
        { icon: '📊', label: 'Usage & Billing', sub: 'View compute usage', onPress: () => {} },
      ],
    },
    {
      title: 'PREFERENCES',
      items: [
        { icon: '🤖', label: 'Default Model', sub: 'SAL Pro', onPress: () => {} },
        { icon: '🔔', label: 'Notifications', sub: 'Alerts & updates', onPress: () => {} },
        { icon: '🎨', label: 'Appearance', sub: 'Dark mode (default)', onPress: () => {} },
        { icon: '🔗', label: 'Connected Services', sub: '88 connectors available', onPress: () => {} },
      ],
    },
    {
      title: 'ABOUT',
      items: [
        {
          icon: '🏢', label: 'SaintVision Technologies',
          sub: 'Huntington Beach, CA',
          onPress: () => Linking.openURL('https://saintsallabs.com'),
        },
        {
          icon: '📜', label: 'US Patent #10,290,222',
          sub: 'HACP — Human-AI Connection Protocol',
          onPress: () => Linking.openURL('https://patents.google.com/patent/US10290222'),
        },
        {
          icon: '🌐', label: 'SaintSal.ai',
          sub: 'Consumer AI — 175+ countries',
          onPress: () => Linking.openURL('https://saintsal.ai'),
        },
        { icon: '📄', label: 'Terms of Service', sub: '', onPress: () => {} },
        { icon: '🔒', label: 'Privacy Policy', sub: '', onPress: () => {} },
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
          <View style={[styles.tierPill, { backgroundColor: `${TIERS[tier as keyof typeof TIERS]?.color || Colors.textMuted}20` }]}>
            <Text style={[styles.tierPillText, { color: TIERS[tier as keyof typeof TIERS]?.color || Colors.textMuted }]}>
              {TIERS[tier as keyof typeof TIERS]?.name || 'Free'}
            </Text>
          </View>
        </View>

        {/* Upgrade CTA */}
        {tier === 'free' && (
          <TouchableOpacity
            style={styles.upgradeCard}
            onPress={() => Linking.openURL('https://saintsallabs.com/#pricing')}
          >
            <Text style={styles.upgradeTitle}>Upgrade to Pro</Text>
            <Text style={styles.upgradeSub}>
              Unlock Builder, Voice AI, image/video generation, and 2,000 compute minutes.
            </Text>
            <View style={styles.upgradePriceRow}>
              <Text style={styles.upgradePrice}>$97/mo</Text>
              <Text style={styles.upgradeArrow}>→</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Settings sections */}
        {settingsSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, i) => (
              <TouchableOpacity key={i} style={styles.settingItem} onPress={item.onPress}>
                <Text style={styles.settingIcon}>{item.icon}</Text>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>{item.label}</Text>
                  {item.sub ? <Text style={styles.settingSub}>{item.sub}</Text> : null}
                </View>
                <Text style={styles.settingArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Engine info */}
        <View style={styles.engineInfo}>
          <Image source={require('../../assets/logo-48.png')} style={{ width: 48, height: 48, borderRadius: 14, marginBottom: 12 }} />
          <Text style={styles.engineTitle}>SAL Engine v4.0</Text>
          <Text style={styles.engineSub}>53 Models · 88 Connectors · Full Spectrum Intelligence</Text>
          <Text style={styles.engineCopyright}>
            © 2026 Saint Vision Technologies LLC{'\n'}
            US Patent #10,290,222 · Responsible Intelligence™
          </Text>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
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
    ...Shadow.sm,
  },
  avatar: {
    width: 52, height: 52, borderRadius: 16, backgroundColor: Colors.gold,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#0A0A0F', fontSize: FontSize.xl, fontWeight: '700' },
  profileInfo: { flex: 1 },
  profileName: { color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: '600' },
  profileEmail: { color: Colors.textSecondary, fontSize: FontSize.sm, marginTop: 2 },
  tierPill: { borderRadius: BorderRadius.full, paddingHorizontal: Spacing.md, paddingVertical: 4 },
  tierPillText: { fontSize: FontSize.xs, fontWeight: '700' },
  // Upgrade
  upgradeCard: {
    marginHorizontal: Spacing.lg, marginBottom: Spacing.lg, backgroundColor: `${Colors.gold}10`,
    borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: `${Colors.gold}40`, padding: Spacing.lg,
  },
  upgradeTitle: { color: Colors.gold, fontSize: FontSize.lg, fontWeight: '700', marginBottom: 4 },
  upgradeSub: { color: Colors.textSecondary, fontSize: FontSize.sm, lineHeight: 20, marginBottom: Spacing.md },
  upgradePriceRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  upgradePrice: { color: Colors.gold, fontSize: FontSize.xl, fontWeight: '700' },
  upgradeArrow: { color: Colors.gold, fontSize: FontSize.xl },
  // Sections
  section: { marginBottom: Spacing.lg },
  sectionTitle: {
    color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: '700', letterSpacing: 1,
    marginHorizontal: Spacing.lg, marginBottom: Spacing.sm,
  },
  settingItem: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md, gap: Spacing.md,
  },
  settingIcon: { fontSize: 22 },
  settingInfo: { flex: 1 },
  settingLabel: { color: Colors.textPrimary, fontSize: FontSize.md },
  settingSub: { color: Colors.textTertiary, fontSize: FontSize.sm, marginTop: 1 },
  settingArrow: { color: Colors.textMuted, fontSize: 22, fontWeight: '300' },
  // Engine
  engineInfo: {
    alignItems: 'center', paddingVertical: Spacing.xxl, marginTop: Spacing.lg,
    borderTopWidth: 0.5, borderTopColor: Colors.border, marginHorizontal: Spacing.lg,
  },
  engineTitle: { color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: '600', marginBottom: 4 },
  engineSub: { color: Colors.textTertiary, fontSize: FontSize.sm, marginBottom: Spacing.sm },
  engineCopyright: { color: Colors.textMuted, fontSize: FontSize.xs, textAlign: 'center', lineHeight: 18 },
  // Logout
  logoutBtn: {
    marginHorizontal: Spacing.lg, marginTop: Spacing.lg, paddingVertical: Spacing.lg,
    backgroundColor: Colors.bgCard, borderRadius: BorderRadius.md, borderWidth: 1,
    borderColor: `${Colors.red}30`, alignItems: 'center',
  },
  logoutText: { color: Colors.red, fontSize: FontSize.md, fontWeight: '600' },
});
