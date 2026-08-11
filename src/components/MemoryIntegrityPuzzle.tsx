import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { hasExaminedAllFragments } from '../puzzles/engine';
import type {
  ConsistencyPuzzleDefinition,
  PuzzleFragmentId,
  PuzzleProgress,
} from '../puzzles/types';
import { colors, typography } from '../theme';

interface Props {
  definition: ConsistencyPuzzleDefinition;
  progress: PuzzleProgress;
  onExamine: (fragmentId: PuzzleFragmentId) => void;
  onIsolate: (fragmentId: PuzzleFragmentId) => void;
  onReset: () => void;
  onContinue: () => void;
}

export function MemoryIntegrityPuzzle({
  definition,
  progress,
  onExamine,
  onIsolate,
  onReset,
  onContinue,
}: Props) {
  const [expandedFragment, setExpandedFragment] = useState<PuzzleFragmentId>();
  const candleOpacity = useRef(
    Object.fromEntries(
      definition.fragments.map((fragment) => [fragment.id, new Animated.Value(1)]),
    ) as Record<PuzzleFragmentId, Animated.Value>,
  ).current;

  useEffect(() => {
    for (const fragment of definition.fragments) {
      Animated.timing(candleOpacity[fragment.id]!, {
        toValue: progress.isolatedFragment === fragment.id ? 0.12 : 1,
        duration: progress.isolatedFragment === fragment.id ? 320 : 900,
        useNativeDriver: true,
      }).start();
    }
  }, [candleOpacity, definition.fragments, progress.isolatedFragment]);

  const examinedAll = hasExaminedAllFragments(definition, progress);
  const isolationUnlocked = !definition.requireAllFragmentsExamined || examinedAll;
  const showHint = progress.failedAttemptCount >= definition.hintAfterFailedAttempts;

  const openFragment = (fragmentId: PuzzleFragmentId) => {
    setExpandedFragment((current) => (current === fragmentId ? undefined : fragmentId));
    onExamine(fragmentId);
  };

  return (
    <View style={styles.container} accessibilityLabel="Memory integrity analysis">
      {definition.fragments.map((fragment) => {
        const expanded = expandedFragment === fragment.id;
        const examined = progress.examinedFragments.includes(fragment.id);
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded }}
            key={fragment.id}
            onPress={() => openFragment(fragment.id)}
            style={({ pressed }) => [
              styles.fragment,
              expanded && styles.fragmentExpanded,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.fragmentHeader}>
              <View style={styles.fragmentIdentity}>
                <Text style={styles.fragmentLabel}>{fragment.label}</Text>
                <Text style={styles.examinedMarker}>{examined ? 'ANALYZED' : 'OPEN ANALYSIS'}</Text>
              </View>
              <Animated.View
                accessibilityLabel={`Candle ${fragment.candle}`}
                style={[styles.candle, { opacity: candleOpacity[fragment.id] }]}
              >
                <View style={styles.flame} />
                <View style={styles.wick} />
              </Animated.View>
            </View>

            <Text style={styles.fragmentText}>{fragment.text}</Text>
            {fragment.summary.map((line) => (
              <Text key={line} style={styles.metadata}>{line}</Text>
            ))}

            {expanded && (
              <View style={styles.analysis}>
                {fragment.analysis.map((line) => (
                  <Text key={line} style={styles.analysisText}>{line}</Text>
                ))}
              </View>
            )}
          </Pressable>
        );
      })}

      {!isolationUnlocked && (
        <Text style={styles.lockedPrompt}>{definition.lockedPrompt}</Text>
      )}

      {isolationUnlocked && progress.status === 'active' && (
        <View style={styles.isolationSection}>
          <Text style={styles.isolationPrompt}>{definition.isolationPrompt}</Text>
          {definition.fragments.map((fragment) => (
            <Pressable
              accessibilityRole="button"
              key={`isolate-${fragment.id}`}
              onPress={() => onIsolate(fragment.id)}
              style={({ pressed }) => [styles.isolateButton, pressed && styles.pressed]}
            >
              <Text style={styles.isolateMarker}>{'—'}</Text>
              <Text style={styles.isolateLabel}>
                {definition.isolateLabel.replace('{id}', fragment.id)}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {progress.status === 'failed' && (
        <View style={styles.resultPanel}>
          {definition.failed.map((line) => (
            <Text key={line} style={styles.resultText}>{line}</Text>
          ))}
          {showHint && <Text style={styles.hint}>{definition.hint}</Text>}
          <Pressable
            accessibilityRole="button"
            onPress={onReset}
            style={({ pressed }) => [styles.resetButton, pressed && styles.pressed]}
          >
            <Text style={styles.resetLabel}>{definition.resetLabel}</Text>
          </Pressable>
        </View>
      )}

      {progress.status === 'solved' && (
        <View style={[styles.resultPanel, styles.solvedPanel]}>
          {definition.solved.map((line) => (
            <Text key={line} style={styles.resultText}>{line}</Text>
          ))}
          <Pressable
            accessibilityRole="button"
            onPress={onContinue}
            style={({ pressed }) => [styles.continueButton, pressed && styles.pressed]}
          >
            <Text style={styles.continueLabel}>{definition.continueLabel}</Text>
            <Text style={styles.continueArrow}>{'↓'}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 18, gap: 10, paddingBottom: 20 },
  fragment: {
    borderColor: colors.stone_light,
    borderWidth: 1,
    backgroundColor: 'rgba(14,17,22,0.9)',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  fragmentExpanded: { borderColor: colors.accent_cold },
  pressed: { opacity: 0.65 },
  fragmentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  fragmentIdentity: { gap: 3 },
  fragmentLabel: {
    color: colors.accent_cold,
    fontFamily: typography.system,
    fontSize: 12,
    letterSpacing: 1.2,
  },
  examinedMarker: {
    color: colors.text_secondary,
    fontFamily: typography.system,
    fontSize: 8,
    letterSpacing: 0.8,
  },
  candle: { width: 18, height: 29, alignItems: 'center', justifyContent: 'flex-end' },
  flame: {
    width: 8,
    height: 11,
    borderRadius: 6,
    backgroundColor: colors.accent_warm,
    shadowColor: colors.accent_warm,
    shadowOpacity: 0.65,
    shadowRadius: 5,
  },
  wick: { width: 2, height: 12, backgroundColor: colors.text_secondary },
  fragmentText: {
    color: colors.text_primary,
    fontFamily: typography.narrative,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
  },
  metadata: {
    color: colors.text_secondary,
    fontFamily: typography.system,
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 0.45,
  },
  analysis: {
    borderTopColor: colors.stone_light,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 12,
    paddingTop: 11,
  },
  analysisText: {
    color: colors.text_primary,
    fontFamily: typography.system,
    fontSize: 10,
    lineHeight: 17,
    letterSpacing: 0.45,
  },
  lockedPrompt: {
    color: colors.text_secondary,
    fontFamily: typography.system,
    fontSize: 9,
    lineHeight: 16,
    letterSpacing: 0.7,
    marginTop: 7,
  },
  isolationSection: { gap: 7, marginTop: 8 },
  isolationPrompt: {
    color: colors.text_primary,
    fontFamily: typography.system,
    fontSize: 11,
    lineHeight: 18,
    letterSpacing: 0.7,
    marginBottom: 3,
  },
  isolateButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: colors.stone_light,
    borderWidth: 1,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(14,17,22,0.82)',
  },
  isolateMarker: { color: colors.accent_warm, fontFamily: typography.system, marginRight: 11 },
  isolateLabel: {
    color: colors.text_primary,
    fontFamily: typography.narrativeMedium,
    fontSize: 13,
    letterSpacing: 1,
  },
  resultPanel: {
    borderLeftColor: colors.accent_cold,
    borderLeftWidth: 2,
    backgroundColor: 'rgba(26,31,36,0.82)',
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 5,
  },
  solvedPanel: { borderLeftColor: colors.accent_warm },
  resultText: {
    color: colors.text_primary,
    fontFamily: typography.system,
    fontSize: 11,
    lineHeight: 18,
    letterSpacing: 0.6,
  },
  hint: {
    color: colors.accent_warm,
    fontFamily: typography.system,
    fontSize: 10,
    lineHeight: 17,
    letterSpacing: 0.55,
    marginTop: 7,
  },
  resetButton: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.stone_light,
    borderWidth: 1,
    marginTop: 10,
  },
  resetLabel: {
    color: colors.text_primary,
    fontFamily: typography.narrativeMedium,
    fontSize: 12,
    letterSpacing: 1.1,
  },
  continueButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopColor: colors.stone_light,
    borderTopWidth: 1,
    marginTop: 10,
    paddingHorizontal: 3,
  },
  continueLabel: {
    color: colors.text_primary,
    fontFamily: typography.narrativeMedium,
    fontSize: 12,
    letterSpacing: 1.2,
  },
  continueArrow: { color: colors.accent_warm, fontSize: 17 },
});
