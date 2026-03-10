/**
 * SaintSal Labs — Vertical Intelligence Card
 * Premium compact card for vertical selection
 */
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, Spacing, BorderRadius } from '@/config/theme';

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
      <TouchableOpacity
        style={[styles.compactCard, { borderColor: `${color}20` }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={[styles.compactIconBg, { backgroundColor: `${color}10` }]}>
          <Text style={styles.compactIcon}>{icon}</Text>
        </View>
        <Text style={[styles.compactName, { color }]}>{name}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.card, { borderColor: `${color}25` }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconBg, { backgroundColor: `${color}12` }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.name, { color }]}>{name}</Text>
        <Text style={styles.description} numberOfLines={1}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Compact variant (for chat screen grid)
  compactCard: {
    width: '30%',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    borderWidth: 0.5,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  compactIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  compactIcon: {
    fontSize: 18,
  },
  compactName: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Full variant
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    borderWidth: 0.5,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  iconBg: {
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
    fontSize: FontSize.md,
    fontWeight: '600',
    marginBottom: 2,
  },
  description: {
    color: Colors.textTertiary,
    fontSize: FontSize.sm,
  },
});
