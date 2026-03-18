/* ═══════════════════════════════════════════════════
   SAINTSALLABS — PAYMENT CANCEL HANDLER
   Deep link: saintsallabs://payment/cancel
═══════════════════════════════════════════════════ */
import { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function PaymentCancel() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={s.container}>
      <View style={s.iconWrap}>
        <Text style={s.iconX}>✕</Text>
      </View>
      <Text style={s.title}>Payment Cancelled</Text>
      <Text style={s.subtitle}>No charges were made. You can upgrade whenever you're ready.</Text>

      <TouchableOpacity
        style={s.retryBtn}
        onPress={() => router.replace('/(stack)/stripe-pricing')}
        activeOpacity={0.85}
      >
        <Text style={s.retryBtnText}>Try Again</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={s.dismissBtn}
        onPress={() => router.replace('/(tabs)')}
        activeOpacity={0.7}
      >
        <Text style={s.dismissBtnText}>Go to Dashboard</Text>
      </TouchableOpacity>

      <Text style={s.redirectNote}>Returning to dashboard in 3 seconds…</Text>
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
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F59E0B15',
    borderWidth: 2,
    borderColor: '#F59E0B30',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconX: {
    fontSize: 30,
    color: '#F59E0B',
    fontWeight: '800',
  },
  title: {
    fontSize: 26,
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
    maxWidth: 280,
    marginBottom: 36,
  },
  retryBtn: {
    height: 52,
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  retryBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F0F0F',
    letterSpacing: 0.5,
  },
  dismissBtn: {
    height: 52,
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  redirectNote: {
    fontSize: 11,
    color: '#4B5563',
    textAlign: 'center',
    marginTop: 28,
    letterSpacing: 0.3,
  },
});
