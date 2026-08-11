import { useEffect, useRef } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { getContentBlocks } from '../narrative/content';
import type {
  DecisionState,
  NarrativeChoice,
  NarrativeNode,
} from '../narrative/types';
import {
  isConsistencyPuzzle,
  type PuzzleAction,
  type PuzzleDefinition,
  type PuzzleFragmentId,
  type PuzzleProgress,
} from '../puzzles/types';
import { colors, typography } from '../theme';
import { useTextReveal } from '../hooks/useTextReveal';
import { ChoiceList } from './ChoiceList';
import { ContentFeed } from './ContentFeed';
import { FinalCandles } from './FinalCandles';
import { MemoryIntegrityPuzzle } from './MemoryIntegrityPuzzle';
import { AlphaPuzzle } from './puzzles/AlphaPuzzle';
import { SceneImage } from './SceneImage';

interface Props {
  node: NarrativeNode;
  choices: NarrativeChoice[];
  decisions: DecisionState;
  puzzle?: PuzzleDefinition;
  puzzleProgress?: PuzzleProgress;
  speedMs: number;
  sfxEnabled: boolean;
  onChoice: (choice: NarrativeChoice) => void;
  onPuzzleExamine: (fragmentId: PuzzleFragmentId) => void;
  onPuzzleIsolate: (fragmentId: PuzzleFragmentId) => void;
  onPuzzleReset: () => void;
  onAlphaPuzzleAction: (action: PuzzleAction) => void;
  onAdvance: () => void;
  onReturnToMenu: () => void;
  onEndingRevealed: () => void;
  isEnding: boolean;
}

export function NarrativeScreen({
  node,
  choices,
  decisions,
  puzzle,
  puzzleProgress,
  speedMs,
  sfxEnabled,
  onChoice,
  onPuzzleExamine,
  onPuzzleIsolate,
  onPuzzleReset,
  onAlphaPuzzleAction,
  onAdvance,
  onReturnToMenu,
  onEndingRevealed,
  isEnding,
}: Props) {
  const blocks = getContentBlocks(node, puzzle);
  const reveal = useTextReveal(node.id, blocks, speedMs, node.delay_ms ?? 0);
  const scrollRef = useRef<ScrollView>(null);
  const effectiveVisual = reveal.complete && node.post_visual ? node.post_visual : node.visual;

  useEffect(() => {
    if (reveal.complete) {
      const timeout = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
      return () => clearTimeout(timeout);
    }
  }, [node.id, reveal.complete]);

  useEffect(() => {
    if (reveal.complete && isEnding) onEndingRevealed();
  }, [isEnding, onEndingRevealed, reveal.complete]);

  const preventBubble = (event: NativeSyntheticEvent<NativeScrollEvent>) => event.stopPropagation();

  return (
    <View style={styles.screen}>
      <SceneImage scene={node.scene} visualId={effectiveVisual} />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        onScrollBeginDrag={preventBubble}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          accessibilityHint={reveal.complete ? undefined : 'Completes the current text'}
          onPress={reveal.completeNow}
          style={styles.revealArea}
        >
          <ContentFeed blocks={blocks} visibleLengths={reveal.visibleLengths} />
          {!reveal.complete && <Text style={styles.tapHint}>TAP TO REVEAL</Text>}
        </Pressable>

        {reveal.complete &&
          puzzle &&
          puzzleProgress &&
          (isConsistencyPuzzle(puzzle) ? (
            <MemoryIntegrityPuzzle
              definition={puzzle}
              progress={puzzleProgress}
              onExamine={onPuzzleExamine}
              onIsolate={onPuzzleIsolate}
              onReset={onPuzzleReset}
              onContinue={onAdvance}
            />
          ) : (
            <AlphaPuzzle
              definition={puzzle}
              progress={puzzleProgress}
              sfxEnabled={sfxEnabled}
              onAction={onAlphaPuzzleAction}
              onContinue={onAdvance}
            />
          ))}

        {reveal.complete && node.final_candles && <FinalCandles decisions={decisions} />}

        {reveal.complete && !puzzle && choices.length > 0 && (
          <ChoiceList choices={choices} onSelect={onChoice} />
        )}

        {reveal.complete && !puzzle && choices.length === 0 && node.next && (
          <Pressable
            accessibilityRole="button"
            onPress={onAdvance}
            style={({ pressed }) => [styles.continueButton, pressed && styles.pressed]}
          >
            <Text style={styles.continueText}>CONTINUE</Text>
            <Text style={styles.arrow}>{'\u2193'}</Text>
          </Pressable>
        )}

        {reveal.complete && isEnding && (
          <Pressable
            accessibilityRole="button"
            onPress={onReturnToMenu}
            style={({ pressed }) => [styles.restartButton, pressed && styles.pressed]}
          >
            <Text style={styles.continueText}>RETURN TO MENU</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.stone_dark },
  scrollContent: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 44 },
  revealArea: { minHeight: 140 },
  tapHint: {
    color: colors.text_secondary,
    fontFamily: typography.system,
    fontSize: 9,
    letterSpacing: 1.6,
    marginTop: 12,
    opacity: 0.72,
  },
  continueButton: {
    minHeight: 56,
    marginTop: 18,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopColor: colors.stone_light,
    borderTopWidth: 1,
  },
  restartButton: {
    minHeight: 52,
    marginTop: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.accent_warm,
    borderWidth: 1,
  },
  pressed: { opacity: 0.64 },
  continueText: {
    color: colors.text_secondary,
    fontFamily: typography.narrativeMedium,
    fontSize: 12,
    letterSpacing: 2.2,
  },
  arrow: { color: colors.accent_warm, fontSize: 17 },
});
