/* ═══════════════════════════════════════════════════
   REUSABLE SCREEN HEADER — Back button + title
   Used by stack screens to enable navigation back
═══════════════════════════════════════════════════ */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

const GOLD = '#D4AF37';
const BG = '#0F0F0F';

export default function ScreenHeader({ title, subtitle, onBack }) {
  const router = useRouter();
  const handleBack = onBack || (() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={styles.titleArea}>
          <Text style={styles.title} numberOfLines={1}>{title || 'SaintSal™ Labs'}</Text>
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        <View style={styles.backBtn} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212,175,55,0.15)',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  backIcon: {
    fontSize: 28,
    color: GOLD,
    marginTop: -2,
    fontWeight: '300',
  },
  titleArea: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 10,
    color: 'rgba(212,175,55,0.6)',
    letterSpacing: 2,
    marginTop: 2,
    textTransform: 'uppercase',
  },
});
