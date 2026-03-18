/* ═══════════════════════════════════════════════════
   SAINTSALLABS — PAYMENT SUCCESS HANDLER
   Deep link: saintsallabs://payment/success?upgraded=1
═══════════════════════════════════════════════════ */
import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function PaymentSuccess() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const upgraded = params.upgraded === '1';

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={s.container}>
      <View style={s.iconWrap}>
        <Text style={s.iconCheck}>✓</Text>
      </View>
      <Text style={s.title}>You're upgraded! 🎉</Text>
      {upgraded && (
        <Text style={s.subtitle}>Your new plan is active and credits have been applied.</Text>
      )}
      <Text style={s.redirectNote}>Taking you back to the app…</Text>
      <View style={s.dotsRow}>
        <View style={[s.dot, s.dotActive]} />
        <View style={s.dot} />
        <View style={s.dot} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#16A34A20',
    borderWidth: 2,
    borderColor: '#22C55E40',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconCheck: {
    fontSize: 36,
    color: '#22C55E',
    fontWeight: '800',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F5F5F5',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
    maxWidth: 280,
  },
  redirectNote: {
    fontSize: 12,
    color: '#F59E0B',
    textAlign: 'center',
    marginTop: 32,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2A2A2A',
  },
  dotActive: {
    backgroundColor: '#F59E0B',
  },
});
