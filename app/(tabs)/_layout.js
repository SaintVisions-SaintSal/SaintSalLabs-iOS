/* ═══════════════════════════════════════════════════
   SAINTSALLABS — TAB NAVIGATION
   5 tabs: Chat · Builder · Search · Dashboard · Settings
   Deep charcoal + gold accents
═══════════════════════════════════════════════════ */
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

const AMBER = '#F59E0B';

const TabIcon = ({ focused, label, emoji }) => (
  <View style={[s.tabIcon, focused && s.tabIconActive]}>
    <Text style={{ fontSize: 20 }}>{emoji}</Text>
    <Text style={[s.tabLabel, { color: focused ? AMBER : '#444' }]}>{label}</Text>
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
          height: 88,
          paddingTop: 8,
          paddingBottom: 4,
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: AMBER,
        tabBarInactiveTintColor: '#444',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="Chat" emoji="💬" />,
        }}
      />
      <Tabs.Screen
        name="builder"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="Builder" emoji="⚡" />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="Search" emoji="🔍" />,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="Dashboard" emoji="📊" />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="Settings" emoji="⚙️" />,
        }}
      />
    </Tabs>
  );
}

const s = StyleSheet.create({
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingTop: 2,
  },
  tabIconActive: {},
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.5,
  },
});
