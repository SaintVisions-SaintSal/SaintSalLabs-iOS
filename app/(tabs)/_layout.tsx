/**
 * SaintSal Labs — Tab Navigator
 * Premium charcoal + gold tab bar with SF Symbol-style icons
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Colors, FontSize, Spacing } from '../../src/config/theme';

type TabIconProps = {
  focused: boolean;
  icon: string;
  label: string;
};

function TabIcon({ focused, icon, label }: TabIconProps) {
  return (
    <View style={styles.tabIconContainer}>
      <View style={[styles.iconWrap, focused && styles.iconWrapFocused]}>
        <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>{icon}</Text>
      </View>
      <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>{label}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#08080C',
          borderTopWidth: 0.5,
          borderTopColor: 'rgba(42, 42, 58, 0.6)',
          height: 84,
          paddingBottom: 26,
          paddingTop: 8,
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors.gold,
        tabBarInactiveTintColor: Colors.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="💬" label="Chat" />,
        }}
      />
      <Tabs.Screen
        name="builder"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="⚡" label="Builder" />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="🔍" label="Search" />,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="📊" label="Dashboard" />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="⚙️" label="Settings" />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
  },
  iconWrap: {
    width: 36,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    marginBottom: 2,
  },
  iconWrapFocused: {
    backgroundColor: 'rgba(212, 160, 23, 0.1)',
  },
  tabIcon: {
    fontSize: 20,
    opacity: 0.5,
  },
  tabIconFocused: {
    fontSize: 22,
    opacity: 1,
  },
  tabLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  tabLabelFocused: {
    color: Colors.gold,
    fontWeight: '600',
  },
});
