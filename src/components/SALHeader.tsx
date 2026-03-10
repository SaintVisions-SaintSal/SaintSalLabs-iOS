/**
 * SaintSal Labs — Premium App Header
 * Deep charcoal with gold accent branding
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, Spacing } from '@/config/theme';

interface Props {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  rightAction?: React.ReactNode;
  onBack?: () => void;
}

export default function SALHeader({ title, subtitle, showLogo = false, rightAction, onBack }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 6 }]}>
      <View style={styles.row}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.6}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
        )}
        <View style={styles.titleContainer}>
          {showLogo ? (
            <View style={styles.logoRow}>
              <Image source={require('../../assets/logo-48.png')} style={styles.logoImg} />
              <View>
                <Text style={styles.brandName}>SaintSal™ Labs</Text>
                <Text style={styles.brandTag}>Full Spectrum Intelligence</Text>
              </View>
            </View>
          ) : (
            <>
              <Text style={styles.title} numberOfLines={1}>{title}</Text>
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </>
          )}
        </View>
        {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bg,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(42, 42, 58, 0.5)',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    marginRight: Spacing.sm,
    padding: Spacing.xs,
  },
  backText: {
    color: Colors.gold,
    fontSize: 28,
    fontWeight: '300',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: Colors.textTertiary,
    fontSize: FontSize.sm,
    marginTop: 1,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  logoImg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(212, 160, 23, 0.3)',
  },
  brandName: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  brandTag: {
    color: Colors.gold,
    fontSize: FontSize.xs,
    fontWeight: '500',
    letterSpacing: 0.3,
    marginTop: 1,
  },
  rightAction: {
    marginLeft: Spacing.md,
  },
});
