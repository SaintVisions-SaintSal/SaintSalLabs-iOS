/* ═══════════════════════════════════════════════════
   SAINTSALLABS — TAB NAVIGATION
   5 tabs: Chat · Builder · Search · Dashboard · Settings
   Deep charcoal + gold accents
═══════════════════════════════════════════════════ */
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

const AMBER = '#F59E0B';

const TabIcon = ({ focused, label, glyph }) => (
  <View style={s.tabIcon}>
    <View style={[s.tabGlyphWrap, focused && s.tabGlyphWrapActive]}>
      <Text style={[s.tabGlyph, { color: focused ? '#000' : '#6B7280' }]}>{glyph}</Text>
    </View>
    <Text style={[s.tabLabel, { color: focused ? '#F5E6C6' : '#5B616E' }]}>{label}</Text>
  </View>
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#070709',
          borderTopColor: '#141420',
          borderTopWidth: 1,
          height: 84,
          paddingTop: 8,
          paddingBottom: 8,
          shadowColor: '#000',
          shadowOpacity: 0.22,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: -4 },
          elevation: 18,
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: AMBER,
        tabBarInactiveTintColor: '#444',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="Chat" glyph="✦" />,
        }}
      />
      <Tabs.Screen
        name="builder"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="Builder" glyph="⌘" />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="Search" glyph="◌" />,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="Dashboard" glyph="◫" />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="Settings" glyph="⋯" />,
        }}
      />
    </Tabs>
  );
}

const s = StyleSheet.create({
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: 2,
  },
  tabGlyphWrap: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#101118',
    borderWidth: 1,
    borderColor: '#191B24',
  },
  tabGlyphWrapActive: {
    backgroundColor: AMBER,
    borderColor: '#F8C15A',
  },
  tabGlyph: {
    fontSize: 14,
    fontWeight: '800',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
    letterSpacing: 0.4,
  },
});
