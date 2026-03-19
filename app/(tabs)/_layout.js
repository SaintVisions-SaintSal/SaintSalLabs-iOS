/* ═══════════════════════════════════════════════════
   TAB LAYOUT — SaintSal™ Labs
   5 visible tabs + collapsible side nav (MENU tap)
   Ghost tabs (dashboard, search, settings) hidden via href: null
═══════════════════════════════════════════════════ */
import React, { useState, useRef } from 'react';
import { Tabs, useRouter } from 'expo-router';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, ScrollView, SafeAreaView,
} from 'react-native';
import { supabase } from '../../src/lib/supabase';

const GOLD = '#D4AF37';
const BG   = '#0A0A0A';

const NAV_ITEMS = [
  { icon: '⚡', label: 'Upgrade Plan',       sub: 'Get more compute',       route: '/(stack)/pricing',               gold: true },
  { icon: '🔗', label: 'Connections',        sub: 'Manage integrations',    route: '/(stack)/connectors-hub' },
  { icon: '🤖', label: 'AI Settings',        sub: 'Models + preferences',   route: '/(stack)/api-settings' },
  { icon: '🏗',  label: 'My Builds',          sub: 'Saved builder projects', route: '/(stack)/home-base-command' },
  { icon: '🧬', label: 'Business DNA',       sub: 'Edit your profile',      route: '/(stack)/business-dna-setup' },
  { icon: '⚖️', label: 'Legal Vault',        sub: 'Contracts & compliance', route: '/(stack)/legal-vault' },
  { icon: '🌐', label: 'Domain & SSL',       sub: 'Manage domains',         route: '/(stack)/domain-ssl-command' },
  { icon: '❓', label: 'Help & Support',     sub: 'Get support',            route: '/(stack)/help-ceo-desk' },
];

function TabIcon({ icon, label, focused }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 4 }}>
      <Text style={{ fontSize: focused ? 22 : 20, color: focused ? GOLD : 'rgba(255,255,255,0.4)' }}>
        {icon}
      </Text>
      <Text style={{ fontSize: 9, fontWeight: '700', letterSpacing: 0.5, marginTop: 2, color: focused ? GOLD : 'rgba(255,255,255,0.4)' }}>
        {label}
      </Text>
      {focused && (
        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: GOLD, marginTop: 2 }} />
      )}
    </View>
  );
}

export default function TabLayout() {
  const router = useRouter();
  const [navOpen, setNavOpen] = useState(false);
  const slideX         = useRef(new Animated.Value(-300)).current;
  const backdropAnim   = useRef(new Animated.Value(0)).current;

  const openNav = () => {
    setNavOpen(true);
    Animated.parallel([
      Animated.spring(slideX,       { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }),
      Animated.timing(backdropAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const closeNav = (callback) => {
    Animated.parallel([
      Animated.timing(slideX,       { toValue: -300, duration: 220, useNativeDriver: true }),
      Animated.timing(backdropAnim, { toValue: 0,    duration: 220, useNativeDriver: true }),
    ]).start(() => {
      setNavOpen(false);
      callback?.();
    });
  };

  const handleNavItem = (route) => {
    closeNav(() => router.push(route));
  };

  const handleSignOut = async () => {
    closeNav(async () => {
      await supabase.auth.signOut();
      router.replace('/(auth)/elite-auth');
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#0A0A0A',
            borderTopWidth: 1,
            borderTopColor: 'rgba(212,175,55,0.15)',
            height: 80,
            paddingBottom: 16,
            paddingTop: 8,
          },
          tabBarShowLabel: false,
          tabBarActiveTintColor: GOLD,
          tabBarInactiveTintColor: 'rgba(255,255,255,0.4)',
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ focused }) => <TabIcon icon="🔍" label="SEARCH" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            tabBarIcon: ({ focused }) => <TabIcon icon="💬" label="CHAT" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="builder"
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={s.builderBtn(focused)}>
                <Text style={{ fontSize: 22, color: focused ? BG : GOLD }}>⚡</Text>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="home"
          options={{
            tabBarIcon: ({ focused }) => <TabIcon icon="🏠" label="HOME" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="more"
          options={{
            tabBarIcon: () => <TabIcon icon="☰" label="MENU" focused={false} />,
            listeners: {
              tabPress: (e) => {
                e.preventDefault();
                openNav();
              },
            },
          }}
        />

        {/* ── Hide ghost screens from tab bar ── */}
        <Tabs.Screen name="dashboard" options={{ href: null }} />
        <Tabs.Screen name="search"    options={{ href: null }} />
        <Tabs.Screen name="settings"  options={{ href: null }} />
      </Tabs>

      {/* ── Side Nav Overlay ── */}
      {navOpen && (
        <>
          {/* Backdrop */}
          <Animated.View
            style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.72)', zIndex: 99, opacity: backdropAnim }]}
          >
            <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => closeNav()} activeOpacity={1} />
          </Animated.View>

          {/* Sliding panel */}
          <Animated.View style={[nav.panel, { transform: [{ translateX: slideX }] }]}>
            <SafeAreaView style={{ flex: 1 }}>

              {/* Header */}
              <View style={nav.header}>
                <View>
                  <Text style={nav.logo}>SaintSal™ Labs</Text>
                  <Text style={nav.logoSub}>RESPONSIBLE INTELLIGENCE™</Text>
                </View>
                <TouchableOpacity onPress={() => closeNav()} style={nav.closeBtn}>
                  <Text style={nav.closeTxt}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Nav items */}
              <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                {NAV_ITEMS.map((item) => (
                  <TouchableOpacity
                    key={item.label}
                    style={[nav.item, item.gold && nav.itemGold]}
                    onPress={() => handleNavItem(item.route)}
                    activeOpacity={0.75}
                  >
                    <Text style={nav.itemIcon}>{item.icon}</Text>
                    <View style={nav.itemText}>
                      <Text style={[nav.itemLabel, item.gold && { color: GOLD }]}>{item.label}</Text>
                      <Text style={nav.itemSub}>{item.sub}</Text>
                    </View>
                    <Text style={nav.chevron}>›</Text>
                  </TouchableOpacity>
                ))}
                <View style={{ height: 16 }} />
              </ScrollView>

              {/* Sign out */}
              <TouchableOpacity style={nav.signOut} onPress={handleSignOut}>
                <Text style={nav.signOutTxt}>Sign Out</Text>
              </TouchableOpacity>
            </SafeAreaView>
          </Animated.View>
        </>
      )}
    </View>
  );
}

const s = {
  builderBtn: (focused) => ({
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: focused ? GOLD : 'rgba(212,175,55,0.15)',
    borderWidth: 2, borderColor: GOLD,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
    shadowColor: GOLD, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: focused ? 0.6 : 0.2, shadowRadius: 12,
  }),
};

const nav = StyleSheet.create({
  panel: {
    position: 'absolute', left: 0, top: 0, bottom: 0, width: 280,
    backgroundColor: '#0A0A0A',
    borderRightWidth: 1, borderRightColor: 'rgba(212,175,55,0.2)',
    zIndex: 100,
    shadowColor: '#000', shadowOffset: { width: 6, height: 0 },
    shadowOpacity: 0.6, shadowRadius: 24,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: 'rgba(212,175,55,0.15)',
  },
  logo:      { fontSize: 16, fontWeight: '800', color: GOLD, letterSpacing: 1 },
  logoSub:   { fontSize: 8, fontWeight: '700', color: 'rgba(212,175,55,0.5)', letterSpacing: 2, marginTop: 2 },
  closeBtn:  { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  closeTxt:  { fontSize: 16, color: 'rgba(255,255,255,0.4)' },
  item:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  itemGold:  { backgroundColor: 'rgba(212,175,55,0.06)' },
  itemIcon:  { fontSize: 20, width: 32 },
  itemText:  { flex: 1 },
  itemLabel: { fontSize: 14, fontWeight: '700', color: '#fff', marginBottom: 2 },
  itemSub:   { fontSize: 11, color: 'rgba(255,255,255,0.35)' },
  chevron:   { fontSize: 20, color: 'rgba(255,255,255,0.25)' },
  signOut:   { margin: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 10, marginBottom: 8 },
  signOutTxt:{ fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.45)' },
});
