import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { GameSave } from '../save/types';
import { colors, typography } from '../theme';

interface Props {
  slots: GameSave[];
  onRestore: (slotId: string, checkpointId: string) => void;
  onBack: () => void;
}

export function ArchiveScreen({ slots, onRestore, onBack }: Props) {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>ARCHIVE</Text>
      <Text style={styles.subtitle}>RESTORING A STATE CREATES A NEW CONTINUITY.</Text>
      <ScrollView contentContainerStyle={styles.content}>
        {slots.map((slot) => (
          <View key={slot.slotId} style={styles.slot}>
            <Text style={styles.slotTitle}>{slot.slotId.toUpperCase()}</Text>
            <Text style={styles.meta}>
              {slot.currentChapter} / {Math.round(slot.playTimeSeconds / 60)} MIN
            </Text>
            {slot.checkpoints.length === 0 ? (
              <Text style={styles.empty}>NO CONTINUITY POINTS.</Text>
            ) : (
              slot.checkpoints.map((checkpoint) => (
                <Pressable
                  accessibilityRole="button"
                  key={checkpoint.id}
                  onPress={() => onRestore(slot.slotId, checkpoint.id)}
                  style={({ pressed }) => [styles.checkpoint, pressed && styles.pressed]}
                >
                  <Text style={styles.checkpointTitle}>{checkpoint.id}</Text>
                  <Text style={styles.meta}>{checkpoint.chapter}</Text>
                </Pressable>
              ))
            )}
          </View>
        ))}
      </ScrollView>
      <Pressable
        accessibilityRole="button"
        onPress={onBack}
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
      >
        <Text style={styles.backText}>BACK</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.stone_dark, paddingTop: 34 },
  title: {
    color: colors.text_primary,
    fontFamily: typography.narrativeMedium,
    fontSize: 24,
    letterSpacing: 2,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.text_secondary,
    fontFamily: typography.system,
    fontSize: 8,
    lineHeight: 14,
    letterSpacing: 0.7,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 25,
  },
  content: { padding: 20, gap: 14, paddingBottom: 90 },
  slot: {
    borderColor: colors.stone_light,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  slotTitle: {
    color: colors.accent_warm,
    fontFamily: typography.system,
    fontSize: 11,
    letterSpacing: 1,
  },
  meta: {
    color: colors.text_secondary,
    fontFamily: typography.system,
    fontSize: 8,
    letterSpacing: 0.45,
  },
  empty: {
    color: colors.text_secondary,
    fontFamily: typography.narrative,
    fontSize: 11,
  },
  checkpoint: {
    minHeight: 48,
    justifyContent: 'center',
    borderLeftColor: colors.accent_cold,
    borderLeftWidth: 2,
    backgroundColor: 'rgba(26,31,36,0.72)',
    paddingHorizontal: 10,
    gap: 3,
  },
  checkpointTitle: {
    color: colors.text_primary,
    fontFamily: typography.system,
    fontSize: 9,
    letterSpacing: 0.6,
  },
  back: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 20,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.accent_warm,
    borderWidth: 1,
    backgroundColor: colors.stone_dark,
  },
  backText: {
    color: colors.text_primary,
    fontFamily: typography.narrativeMedium,
    fontSize: 11,
    letterSpacing: 2,
  },
  pressed: { opacity: 0.62 },
});
