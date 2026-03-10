import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { C } from '../../src/config/theme';

const TabIcon = ({ focused, label, emoji }) => (
  <View style={[s.tabIcon, focused && s.tabIconActive]}>
    <Text style={{ fontSize: 18 }}>{emoji}</Text>
    <Text style={[s.tabLabel, { color: focused ? C.amber : '#444' }]}>{label}</Text>
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
          height: 85,
          paddingTop: 6,
        },
        tabBarShowLabel: false,
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
  tabIcon: { alignItems: 'center', justifyContent: 'center', gap: 2, paddingTop: 2 },
  tabIconActive: {},
  tabLabel: { fontSize: 9.5, fontWeight: '600', marginTop: 1 },
});
