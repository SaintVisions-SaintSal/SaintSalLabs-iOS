/* ═══════════════════════════════════════════════════
   REUSABLE SCREEN HEADER — Back button + title
   Used by stack screens to enable navigation back
   Does NOT include SafeAreaView — screens handle that
═══════════════════════════════════════════════════ */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const GOLD = '#D4AF37';

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
    <View style={styles.header}>
      <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
        <Text style={styles.backIcon}>‹</Text>
      </TouchableOpacity>
      <View style={styles.titleArea}>
        <Text style={styles.title} numberOfLines={1}>{title || 'SaintSal™ Labs'}</Text>
        {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
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
  spacer: {
    width: 40,
  },
});
