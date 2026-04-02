// src/components/ComputeBar.js
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GOLD = '#D4AF37';
const LABS_API = 'https://www.saintsallabs.com';

export default function ComputeBar({ accessToken, visible = true }) {
  const router = useRouter();
  const [quota, setQuota] = useState({ minutesLeft: 100, limit: 100, tier: 'free' });
  const [showExhausted, setShowExhausted] = useState(false);
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    if (!visible) return;
    loadQuota();
    // Pulse when low
    if (quota.minutesLeft < 20) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.6, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [visible]);

  const loadQuota = async () => {
    try {
      const res = await fetch(`${LABS_API}/api/builder/compute-quota`, {
        headers: { ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
      });
      if (res.ok) {
        const data = await res.json();
        setQuota(data);
        if (data.minutesLeft <= 0) setShowExhausted(true);
      }
    } catch {}
  };

  if (!visible) return null;

  const pct = quota.limit > 0 ? (quota.minutesLeft / quota.limit) : 1;
  const barColor = pct > 0.5 ? '#22C55E' : pct > 0.2 ? '#F59E0B' : '#EF4444';
  const minutesDisplay = Math.round(quota.minutesLeft);

  return (
    <>
      <TouchableOpacity onPress={() => router.push('/(stack)/pricing')} activeOpacity={0.8}>
        <View style={s.container}>
          <View style={s.track}>
            <Animated.View style={[s.fill, { width: `${Math.max(2, pct * 100)}%`, backgroundColor: barColor, opacity: pulseAnim }]} />
          </View>
          <Text style={[s.label, { color: barColor }]}>
            {minutesDisplay > 0 ? `⚡ ${minutesDisplay} min` : '⚡ 0 min — tap to upgrade'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Exhausted modal — not dismissable */}
      {showExhausted && (
        <View style={s.exhaustedOverlay}>
          <View style={s.exhaustedCard}>
            <Text style={s.exhaustedTitle}>Compute Exhausted</Text>
            <Text style={s.exhaustedSub}>You've used all your {quota.tier} compute this month.</Text>
            <TouchableOpacity style={s.upgradeBtn} onPress={() => { setShowExhausted(false); router.push('/(stack)/pricing'); }}>
              <Text style={s.upgradeBtnTxt}>⚡ UPGRADE NOW</Text>
            </TouchableOpacity>
            <Text style={s.exhaustedNote}>Resets on your billing date</Text>
          </View>
        </View>
      )}
    </>
  );
}

const s = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 4, backgroundColor: '#0A0A0A', borderBottomWidth: 1, borderBottomColor: 'rgba(212,175,55,0.08)' },
  track: { flex: 1, height: 3, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden', marginRight: 10 },
  fill: { height: '100%', borderRadius: 2 },
  label: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  exhaustedOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 9999, alignItems: 'center', justifyContent: 'center' },
  exhaustedCard: { backgroundColor: '#111', borderWidth: 1, borderColor: '#D4AF37', borderRadius: 20, padding: 32, alignItems: 'center', width: '85%' },
  exhaustedTitle: { fontSize: 22, fontWeight: '800', color: '#D4AF37', marginBottom: 12 },
  exhaustedSub: { fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  upgradeBtn: { backgroundColor: '#D4AF37', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, marginBottom: 16 },
  upgradeBtnTxt: { fontSize: 14, fontWeight: '800', color: '#0F0F0F', letterSpacing: 1 },
  exhaustedNote: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },
});
