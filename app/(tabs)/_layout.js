import { Tabs } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';

const GOLD = '#D4AF37';
const BG = '#0F0F0F';

function TabIcon({ icon, label, focused }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 4 }}>
      <Text style={{ fontSize: focused ? 22 : 20, color: focused ? GOLD : 'rgba(255,255,255,0.4)' }}>
        {icon}
      </Text>
      <Text style={{
        fontSize: 9, fontWeight: '700', letterSpacing: 0.5, marginTop: 2,
        color: focused ? GOLD : 'rgba(255,255,255,0.4)'
      }}>
        {label}
      </Text>
      {focused && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: GOLD, marginTop: 2 }} />}
    </View>
  );
}

export default function TabLayout() {
  return (
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
            <View style={{
              width: 52, height: 52, borderRadius: 26,
              backgroundColor: focused ? GOLD : 'rgba(212,175,55,0.15)',
              borderWidth: 2, borderColor: GOLD,
              alignItems: 'center', justifyContent: 'center',
              marginBottom: 16,
              shadowColor: GOLD, shadowOffset: { width: 0, height: 0 },
              shadowOpacity: focused ? 0.6 : 0.2, shadowRadius: 12,
            }}>
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
          tabBarIcon: ({ focused }) => <TabIcon icon="☰" label="MORE" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
