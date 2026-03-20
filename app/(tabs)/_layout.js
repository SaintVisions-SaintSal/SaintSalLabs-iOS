/* ═══════════════════════════════════════════════════
   TAB LAYOUT — SaintSal™ Labs  (Build #68)
   5 tabs: Search | Builder | SAL™ (gold center) | Social | More
   "More" opens a half-screen slide-up sheet
   "Search" label MUST fit one line (fontSize 9)
═══════════════════════════════════════════════════ */
import React, { useState, useRef, useCallback } from 'react';
import { Tabs, useRouter } from 'expo-router';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, ScrollView, SafeAreaView, Dimensions, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../src/lib/supabase';

const GOLD = '#D4AF37';
const BG   = '#0A0A0A';
const { height: SCREEN_H } = Dimensions.get('window');

/* ── More Sheet Items (full spec list) ── */
const MORE_ITEMS = [
  { icon: '🏀', label: 'Sports',             route: '/(stack)/elite-intelligence' },
  { icon: '📰', label: 'News',               route: '/(stack)/full-spectrum-intel' },
  { icon: '💻', label: 'Tech',               route: '/(stack)/elite-intel-hub' },
  { icon: '📈', label: 'Finance',            route: '/(stack)/finance-chat' },
  { icon: '🏠', label: 'Real Estate',        route: '/(stack)/elite-real-estate' },
  { icon: '🏥', label: 'Medical',            route: '/(stack)/full-spectrum-v2' },
  { icon: '🃏', label: 'CookinCards',        route: '/(stack)/portfolio' },
  { icon: '💼', label: 'Career Suite',       route: '/(stack)/business-formation' },
  { icon: '🎤', label: 'Voice AI',           route: '/(stack)/sal-chat' },
  { icon: '📋', label: 'Business Plan',      route: '/(stack)/business-formation-v2' },
  { icon: '🧠', label: 'SuperGrok',          route: '/(stack)/supergrok' },
  { icon: '⚡', label: 'Builder IDE',        route: '/(stack)/high-fidelity-ide' },
  { icon: '📁', label: 'File Explorer',      route: '/(stack)/file-explorer' },
  { icon: '👁', label: 'Builder Preview',    route: '/(stack)/builder-preview' },
  { icon: '🔧', label: 'Builder Settings',   route: '/(stack)/builder-settings' },
  { icon: '🌐', label: 'Domains',            route: '/(stack)/domain-ssl-command' },
  { icon: '🏢', label: 'Business Center',    route: '/(stack)/home-base-command' },
  { icon: '🔗', label: 'GHL Command',        route: '/(stack)/ghl-command' },
  { icon: '🧩', label: 'Integrations',       route: '/(stack)/connectors-hub' },
  { icon: '💰', label: 'Pricing',            route: '/(stack)/pricing' },
  { icon: '👤', label: 'Account',            route: '/(stack)/business-dna-setup' },
  { icon: '⚙️', label: 'Settings',           route: '/(stack)/api-settings' },
];

/* ── Tab Icon (single-line label) ── */
function TabIcon({ icon, label, focused }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 4 }}>
      <Text style={{ fontSize: focused ? 22 : 20, color: focused ? GOLD : 'rgba(255,255,255,0.4)' }}>
        {icon}
      </Text>
      <Text
        numberOfLines={1}
        style={{
          fontSize: 9,
          fontWeight: '700',
          letterSpacing: 0.5,
          marginTop: 2,
          color: focused ? GOLD : 'rgba(255,255,255,0.4)',
        }}
      >
        {label}
      </Text>
      {focused && (
        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: GOLD, marginTop: 2 }} />
      )}
    </View>
  );
}

/* ── SAL Center Button (gold drip style) ── */
function SALCenterIcon({ focused }) {
  return (
    <View style={tabStyles.salBtn(focused)}>
      <Text style={{ fontSize: 24, color: focused ? BG : '#fff' }}>🤖</Text>
      <Text style={{
        fontSize: 7,
        fontWeight: '900',
        letterSpacing: 1.5,
        color: focused ? BG : GOLD,
        marginTop: 1,
      }}>
        SAL™
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [sheetOpen, setSheetOpen] = useState(false);
  const slideY = useRef(new Animated.Value(SCREEN_H)).current;
  const backdrop = useRef(new Animated.Value(0)).current;

  const openSheet = useCallback(() => {
    setSheetOpen(true);
    Animated.parallel([
      Animated.spring(slideY,  { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }),
      Animated.timing(backdrop, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }, []);

  const closeSheet = useCallback((cb) => {
    Animated.parallel([
      Animated.timing(slideY,  { toValue: SCREEN_H, duration: 250, useNativeDriver: true }),
      Animated.timing(backdrop, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => {
      setSheetOpen(false);
      cb?.();
    });
  }, []);

  const handleMore = (route) => {
    // Navigate FIRST, then close sheet — avoids race condition
    // where animation callback doesn't fire on iOS
    setSheetOpen(false);
    slideY.setValue(SCREEN_H);
    backdrop.setValue(0);
    router.push(route);
  };

  const handleSignOut = () => {
    closeSheet(async () => {
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
            backgroundColor: BG,
            borderTopWidth: 1,
            borderTopColor: 'rgba(212,175,55,0.15)',
            height: 84,
            paddingBottom: Platform.OS === 'ios' ? 24 : 12,
            paddingTop: 8,
          },
          tabBarShowLabel: false,
          tabBarActiveTintColor: GOLD,
          tabBarInactiveTintColor: 'rgba(255,255,255,0.4)',
        }}
      >
        {/* Tab 1: Search */}
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ focused }) => <TabIcon icon="🔍" label="Search" focused={focused} />,
          }}
        />

        {/* Tab 2: Builder */}
        <Tabs.Screen
          name="builder"
          options={{
            tabBarIcon: ({ focused }) => <TabIcon icon="🧱" label="Builder" focused={focused} />,
          }}
        />

        {/* Tab 3: SAL™ (center, gold, larger) */}
        <Tabs.Screen
          name="sal"
          options={{
            tabBarIcon: ({ focused }) => <SALCenterIcon focused={focused} />,
          }}
        />

        {/* Tab 4: Social */}
        <Tabs.Screen
          name="social"
          options={{
            tabBarIcon: ({ focused }) => <TabIcon icon="𝕏" label="Social" focused={focused} />,
          }}
        />

        {/* Tab 5: More (opens half-sheet) */}
        <Tabs.Screen
          name="more"
          options={{
            tabBarIcon: () => <TabIcon icon="•••" label="More" focused={false} />,
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              openSheet();
            },
          }}
        />

        {/* Ghost tabs — hidden from bar */}
        <Tabs.Screen name="home"      options={{ href: null }} />
        <Tabs.Screen name="chat"      options={{ href: null }} />
        <Tabs.Screen name="dashboard" options={{ href: null }} />
        <Tabs.Screen name="search"    options={{ href: null }} />
        <Tabs.Screen name="settings"  options={{ href: null }} />
      </Tabs>

      {/* ═══ Half-Screen Slide-Up Sheet ═══ */}
      {sheetOpen && (
        <>
          {/* Backdrop */}
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 99, opacity: backdrop },
            ]}
          >
            <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => closeSheet()} activeOpacity={1} />
          </Animated.View>

          {/* Sheet */}
          <Animated.View style={[sheet.container, { transform: [{ translateY: slideY }], paddingBottom: insets.bottom }]}>
            {/* Handle bar */}
            <View style={sheet.handleRow}>
              <View style={sheet.handle} />
            </View>

            {/* Header */}
            <View style={sheet.header}>
              <Text style={sheet.title}>More</Text>
              <TouchableOpacity onPress={() => closeSheet()}>
                <Text style={sheet.closeTxt}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Items grid */}
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
              <View style={sheet.grid}>
                {MORE_ITEMS.map((item) => (
                  <TouchableOpacity
                    key={item.label}
                    style={sheet.gridItem}
                    onPress={() => handleMore(item.route)}
                    activeOpacity={0.7}
                  >
                    <View style={sheet.iconCircle}>
                      <Text style={{ fontSize: 22 }}>{item.icon}</Text>
                    </View>
                    <Text style={sheet.gridLabel} numberOfLines={1}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Sign out */}
              <TouchableOpacity style={sheet.signOut} onPress={handleSignOut}>
                <Text style={sheet.signOutTxt}>Sign Out</Text>
              </TouchableOpacity>
              <View style={{ height: 24 }} />
            </ScrollView>
          </Animated.View>
        </>
      )}
    </View>
  );
}

const tabStyles = {
  salBtn: (focused) => ({
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: focused ? GOLD : 'rgba(212,175,55,0.12)',
    borderWidth: 2,
    borderColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: focused ? 0.7 : 0.25,
    shadowRadius: 14,
  }),
};

const sheet = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: SCREEN_H * 0.6,
    backgroundColor: '#111111',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  handleRow: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  closeTxt: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.4)',
    padding: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingTop: 16,
  },
  gridItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  gridLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  signOut: {
    marginHorizontal: 20,
    marginTop: 8,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  signOutTxt: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
  },
});
