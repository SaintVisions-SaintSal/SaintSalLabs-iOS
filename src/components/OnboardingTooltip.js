// src/components/OnboardingTooltip.js
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GOLD = '#D4AF37';

export default function OnboardingTooltip({ id, message, position = 'bottom' }) {
  const [visible, setVisible] = useState(false);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    AsyncStorage.getItem(`sal_tooltip_${id}`).then(seen => {
      if (!seen) {
        setVisible(true);
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      }
    });
  }, [id]);

  const dismiss = async () => {
    await AsyncStorage.setItem(`sal_tooltip_${id}`, 'seen');
    Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setVisible(false));
  };

  if (!visible) return null;

  return (
    <Animated.View style={[s.tooltip, { opacity: fadeAnim }]}>
      <Text style={s.message}>{message}</Text>
      <TouchableOpacity onPress={dismiss} style={s.dismissBtn}>
        <Text style={s.dismissTxt}>Got it ✓</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  tooltip: { backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: GOLD, borderRadius: 12, padding: 14, marginHorizontal: 16, marginVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  message: { flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 18 },
  dismissBtn: { backgroundColor: 'rgba(212,175,55,0.15)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  dismissTxt: { fontSize: 11, fontWeight: '700', color: GOLD },
});
