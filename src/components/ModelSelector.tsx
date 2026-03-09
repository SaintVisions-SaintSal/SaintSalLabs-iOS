/**
 * SaintSal Labs — Model Selector Pill
 * SAL Mini / Pro / Max / Max Fast toggle
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { Colors, FontSize, Spacing, BorderRadius, TierColors } from '@/config/theme';
import { SAL_MODELS } from '@/config/api';
import { useStore } from '@/lib/store';
import type { SALModelTier } from '@/types';

export default function ModelSelector() {
  const [showPicker, setShowPicker] = useState(false);
  const { selectedModel, setSelectedModel } = useStore();
  const model = SAL_MODELS[selectedModel];
  const color = TierColors[selectedModel];

  return (
    <>
      <TouchableOpacity
        style={[styles.pill, { borderColor: color }]}
        onPress={() => setShowPicker(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.pillIcon}>{model.icon}</Text>
        <Text style={[styles.pillLabel, { color }]}>{model.label}</Text>
        <Text style={styles.chevron}>▾</Text>
      </TouchableOpacity>

      <Modal visible={showPicker} transparent animationType="fade">
        <Pressable style={styles.backdrop} onPress={() => setShowPicker(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Select Model</Text>
            <Text style={styles.sheetSub}>Choose your intelligence tier</Text>
            {(Object.keys(SAL_MODELS) as SALModelTier[]).map((key) => {
              const m = SAL_MODELS[key];
              const c = TierColors[key];
              const isActive = key === selectedModel;
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.option, isActive && { borderColor: c, backgroundColor: `${c}10` }]}
                  onPress={() => {
                    setSelectedModel(key);
                    setShowPicker(false);
                  }}
                >
                  <Text style={styles.optionIcon}>{m.icon}</Text>
                  <View style={styles.optionText}>
                    <Text style={[styles.optionLabel, { color: c }]}>{m.label}</Text>
                    <Text style={styles.optionDesc}>{m.description}</Text>
                  </View>
                  {isActive && <View style={[styles.dot, { backgroundColor: c }]} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    backgroundColor: Colors.bgTertiary,
    gap: 6,
  },
  pillIcon: { fontSize: 14 },
  pillLabel: { fontSize: FontSize.sm, fontWeight: '600' },
  chevron: { color: Colors.textTertiary, fontSize: 10 },
  backdrop: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.bgSecondary,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    paddingBottom: Spacing.huge,
  },
  sheetTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: '700',
    marginBottom: 4,
  },
  sheetSub: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginBottom: Spacing.xl,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  optionIcon: { fontSize: 24 },
  optionText: { flex: 1 },
  optionLabel: { fontSize: FontSize.lg, fontWeight: '600' },
  optionDesc: { color: Colors.textSecondary, fontSize: FontSize.sm, marginTop: 2 },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
