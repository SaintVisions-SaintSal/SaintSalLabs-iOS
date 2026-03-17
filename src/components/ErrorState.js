// src/components/ErrorState.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const GOLD = '#D4AF37';

const ERROR_MESSAGES = {
  network:  { title: 'You\'re offline', sub: 'Some features are limited', action: 'Retry', icon: '📡' },
  api:      { title: 'SAL is thinking...', sub: 'One moment — try again', action: 'Try Again', icon: '⚡' },
  compute:  { title: 'Time to upgrade', sub: 'You\'ve used your compute for this period', action: 'See Plans', icon: '🚀' },
  auth:     { title: 'Sign in required', sub: 'Create a free account to continue', action: 'Sign In', icon: '🔐' },
  default:  { title: 'Something went wrong', sub: 'Please try again', action: 'Retry', icon: '⚠️' },
};

export default function ErrorState({ type = 'default', onAction, customMessage }) {
  const { title, sub, action, icon } = ERROR_MESSAGES[type] || ERROR_MESSAGES.default;
  return (
    <View style={s.container}>
      <Text style={s.icon}>{icon}</Text>
      <Text style={s.title}>{customMessage?.title || title}</Text>
      <Text style={s.sub}>{customMessage?.sub || sub}</Text>
      {onAction && (
        <TouchableOpacity style={s.btn} onPress={onAction}>
          <Text style={s.btnTxt}>{customMessage?.action || action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12 },
  icon: { fontSize: 40, marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '800', color: '#fff', textAlign: 'center' },
  sub: { fontSize: 14, color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 20 },
  btn: { backgroundColor: GOLD, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 8 },
  btnTxt: { fontSize: 13, fontWeight: '800', color: '#0F0F0F', letterSpacing: 1 },
});
