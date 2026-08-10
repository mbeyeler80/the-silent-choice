import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { NarrativeChoice } from '../narrative/types';
import { colors, typography } from '../theme';

interface Props {
  choices: NarrativeChoice[];
  onSelect: (choice: NarrativeChoice) => void;
}

export function ChoiceList({ choices, onSelect }: Props) {
  return (
    <View style={styles.list} accessibilityRole="menu">
      {choices.map((choice) => (
        <Pressable
          accessibilityRole="button"
          key={`${choice.label}-${choice.next}`}
          onPress={() => onSelect(choice)}
          style={({ pressed }) => [styles.choice, pressed && styles.choicePressed]}
        >
          <Text style={styles.marker}>—</Text>
          <Text style={styles.label}>{choice.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 8, marginTop: 20, paddingBottom: 18 },
  choice: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: colors.stone_light,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(14,17,22,0.82)',
  },
  choicePressed: { borderColor: colors.accent_warm, backgroundColor: colors.stone_medium },
  marker: { color: colors.accent_warm, fontFamily: typography.system, marginRight: 12 },
  label: {
    flex: 1,
    color: colors.text_primary,
    fontFamily: typography.narrativeMedium,
    fontSize: 14,
    letterSpacing: 1.2,
  },
});
