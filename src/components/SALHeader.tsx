/**
 * SaintSal Labs — App Header
 * Gold gradient bar with SAL branding
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
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.row}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
        )}
        <View style={styles.titleContainer}>
          {showLogo ? (
            <View style={styles.logoRow}>
              <Image source={require('../../assets/logo-48.png')} style={{ width: 40, height: 40, borderRadius: 12 }} />
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
    borderBottomColor: Colors.border,
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
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  brandName: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  brandTag: {
    color: Colors.gold,
    fontSize: FontSize.xs,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  rightAction: {
    marginLeft: Spacing.md,
  },
});
