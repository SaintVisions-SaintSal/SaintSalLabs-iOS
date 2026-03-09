/**
 * SaintSal Labs — Vertical Card Component
 * Cards for Finance, Sports, Real Estate, News, Medical, Tech
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '@/config/theme';

interface Props {
  icon: string;
  name: string;
  description: string;
  color: string;
  onPress: () => void;
  compact?: boolean;
}

export default function VerticalCard({ icon, name, description, color, onPress, compact }: Props) {
  if (compact) {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={onPress} activeOpacity={0.7}>
        <View style={[styles.compactIconBg, { backgroundColor: `${color}15` }]}>
          <Text style={styles.compactIcon}>{icon}</Text>
        </View>
        <Text style={styles.compactName}>{name}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.card, { borderColor: `${color}30` }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.name, { color }]}>{name}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <Text style={[styles.arrow, { color: `${color}80` }]}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadow.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
  description: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  arrow: {
    fontSize: 24,
    fontWeight: '300',
  },
  // Compact variant
  compactCard: {
    alignItems: 'center',
    width: 72,
    gap: 6,
  },
  compactIconBg: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactIcon: {
    fontSize: 26,
  },
  compactName: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    fontWeight: '500',
    textAlign: 'center',
  },
});
