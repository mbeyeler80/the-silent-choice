import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { GameSave } from '../save/types';
import { colors, typography } from '../theme';

interface Props {
  slots: GameSave[];
  message: string;
  onReplace: (slotId: string) => void;
  onCancel: () => void;
}

export function SlotReplacementScreen({
  slots,
  message,
  onReplace,
  onCancel,
}: Props) {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>CONTINUITY CAPACITY REACHED.</Text>
      <Text style={styles.message}>{message}</Text>
      <Text style={styles.warning}>SELECT A CONTINUITY TO REPLACE. NOTHING WILL BE REMOVED WITHOUT THIS SELECTION.</Text>
      <View style={styles.slots}>
        {slots.map((slot) => (
          <Pressable
            accessibilityRole="button"
            key={slot.slotId}
            onPress={() => onReplace(slot.slotId)}
            style={({ pressed }) => [styles.slot, pressed && styles.pressed]}
          >
            <Text style={styles.slotTitle}>{slot.slotId.toUpperCase()}</Text>
            <Text style={styles.meta}>{slot.currentChapter}</Text>
            <Text style={styles.meta}>{Math.round(slot.playTimeSeconds / 60)} MIN</Text>
          </Pressable>
        ))}
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={onCancel}
        style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}
      >
        <Text style={styles.cancelText}>CANCEL</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
    padding: 24,
    backgroundColor: colors.stone_dark,
  },
  title: {
    color: colors.accent_warm,
    fontFamily: typography.system,
    fontSize: 13,
    lineHeight: 20,
    letterSpacing: 1,
    textAlign: 'center',
  },
  message: {
    color: colors.text_primary,
    fontFamily: typography.narrative,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  warning: {
    color: colors.text_secondary,
    fontFamily: typography.system,
    fontSize: 8,
    lineHeight: 14,
    letterSpacing: 0.55,
    textAlign: 'center',
  },
  slots: { gap: 9 },
  slot: {
    minHeight: 62,
    borderColor: colors.stone_light,
    borderWidth: 1,
    padding: 10,
    justifyContent: 'center',
    gap: 3,
  },
  slotTitle: {
    color: colors.text_primary,
    fontFamily: typography.system,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  meta: {
    color: colors.text_secondary,
    fontFamily: typography.system,
    fontSize: 8,
  },
  cancel: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.accent_warm,
    borderWidth: 1,
  },
  cancelText: {
    color: colors.text_primary,
    fontFamily: typography.narrativeMedium,
    fontSize: 11,
    letterSpacing: 2,
  },
  pressed: { opacity: 0.62 },
});
