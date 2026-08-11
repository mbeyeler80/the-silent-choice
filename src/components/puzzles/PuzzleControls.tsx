import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '../../theme';

interface TerminalButtonProps {
  label: string;
  onPress: () => void;
  selected?: boolean;
  disabled?: boolean;
  onLongPress?: () => void;
  delayLongPress?: number;
}

export function TerminalButton({
  label,
  onPress,
  selected,
  disabled,
  onLongPress,
  delayLongPress,
}: TerminalButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={delayLongPress}
      style={({ pressed }) => [
        styles.button,
        selected && styles.buttonSelected,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.buttonText, selected && styles.buttonTextSelected]}>{label}</Text>
    </Pressable>
  );
}

interface ValueBarProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
}

export function ValueBar({
  label,
  value,
  min = 0,
  max = 100,
  step = 10,
  onChange,
}: ValueBarProps) {
  const segments = Math.round((max - min) / step);
  return (
    <View style={styles.valueControl}>
      <View style={styles.valueHeading}>
        <Text style={styles.valueLabel}>{label}</Text>
        <Text style={styles.valueNumber}>{value}</Text>
      </View>
      <View style={styles.valueRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={'Decrease ' + label}
          onPress={() => onChange(Math.max(min, value - step))}
          style={styles.stepButton}
        >
          <Text style={styles.stepText}>-</Text>
        </Pressable>
        <View style={styles.segments}>
          {Array.from({ length: segments + 1 }, (_, index) => {
            const segmentValue = min + index * step;
            return (
              <Pressable
                accessibilityRole="adjustable"
                accessibilityLabel={label + ' ' + segmentValue}
                key={segmentValue}
                onPress={() => onChange(segmentValue)}
                style={[
                  styles.segment,
                  segmentValue <= value && styles.segmentActive,
                ]}
              />
            );
          })}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={'Increase ' + label}
          onPress={() => onChange(Math.min(max, value + step))}
          style={styles.stepButton}
        >
          <Text style={styles.stepText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function SystemLines({ lines }: { lines: string[] }) {
  return (
    <View style={styles.systemLines}>
      {lines.map((line, index) => (
        <Text key={line + index} style={styles.systemText}>{line}</Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 46,
    justifyContent: 'center',
    borderColor: colors.stone_light,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: 'rgba(14,17,22,0.82)',
  },
  buttonSelected: {
    borderColor: colors.accent_warm,
    backgroundColor: 'rgba(181,138,88,0.13)',
  },
  buttonText: {
    color: colors.text_primary,
    fontFamily: typography.system,
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 0.7,
    textAlign: 'center',
  },
  buttonTextSelected: { color: colors.accent_warm },
  pressed: { opacity: 0.6 },
  disabled: { opacity: 0.35 },
  valueControl: { gap: 6 },
  valueHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  valueLabel: {
    color: colors.text_secondary,
    fontFamily: typography.system,
    fontSize: 9,
    letterSpacing: 0.6,
  },
  valueNumber: {
    color: colors.accent_warm,
    fontFamily: typography.system,
    fontSize: 9,
  },
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  stepButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.stone_light,
    borderWidth: 1,
  },
  stepText: { color: colors.text_primary, fontFamily: typography.system, fontSize: 17 },
  segments: { flex: 1, flexDirection: 'row', gap: 3, alignItems: 'center' },
  segment: {
    flex: 1,
    height: 11,
    backgroundColor: colors.stone_medium,
    borderColor: colors.stone_light,
    borderWidth: StyleSheet.hairlineWidth,
  },
  segmentActive: { backgroundColor: colors.accent_cold },
  systemLines: {
    borderLeftColor: colors.accent_cold,
    borderLeftWidth: 2,
    paddingLeft: 11,
    gap: 3,
  },
  systemText: {
    color: colors.text_primary,
    fontFamily: typography.system,
    fontSize: 10,
    lineHeight: 17,
    letterSpacing: 0.55,
  },
});
