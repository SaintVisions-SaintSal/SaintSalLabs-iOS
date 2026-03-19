/* More tab — this screen is never shown directly.
   The "More" tab opens a half-sheet overlay from _layout.js.
   This file exists as a fallback for Expo Router. */
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function MoreFallback() {
  return (
    <SafeAreaView style={s.container}>
      <View style={s.content}>
        <Text style={s.text}>Use the More menu in the tab bar</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { color: 'rgba(255,255,255,0.3)', fontSize: 14 },
});
