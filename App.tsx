import { useFonts } from 'expo-font';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AppState,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { resolveVisual } from './src/assets/registry';
import { ArchiveScreen } from './src/components/ArchiveScreen';
import { MainMenu } from './src/components/MainMenu';
import { NarrativeScreen } from './src/components/NarrativeScreen';
import { SlotReplacementScreen } from './src/components/SlotReplacementScreen';
import { triggerHaptic } from './src/haptics/service';
import { useNarrativeAudio } from './src/hooks/useNarrativeAudio';
import { resolveNarrativeNode } from './src/narrative/content';
import {
  advance,
  getAvailableChoices,
  getNode,
  isEnding,
  logEnding,
  selectChoice,
  validateStory,
} from './src/narrative/engine';
import { fullStory } from './src/narrative/story';
import type { NarrativeChoice, NarrativeSession } from './src/narrative/types';
import {
  applyAlphaPuzzleAction,
  initializeAlphaPuzzleProgress,
} from './src/puzzles/alphaEngine';
import {
  examinePuzzleFragment,
  getPuzzleProgress,
  isolatePuzzleFragment,
  resetPuzzleAttempt,
} from './src/puzzles/engine';
import { puzzlesById, validatePuzzleRegistry } from './src/puzzles/registry';
import {
  isConsistencyPuzzle,
  type PuzzleAction,
  type PuzzleFragmentId,
} from './src/puzzles/types';
import {
  branchFromCheckpoint,
  createCheckpoint,
  DEFAULT_SETTINGS,
  emptySaveCollection,
  latestSave,
  nextAvailableSlotId,
  replaceWithNewSave,
  sanitizeSaveCollection,
  sessionForResume,
  updateSaveSlot,
  upsertSave,
} from './src/save/model';
import { saveRepository } from './src/save/storage';
import type { GameSave, GameSettings, SaveCollection } from './src/save/types';
import { colors, typography } from './src/theme';

const story = fullStory;
const validationErrors = [
  ...validateStory(story),
  ...validatePuzzleRegistry(),
  ...story.nodes.flatMap((node) =>
    node.puzzle && !puzzlesById[node.puzzle]
      ? [node.id + ' references missing puzzle: ' + node.puzzle]
      : [],
  ),
];
if (validationErrors.length > 0) throw new Error(validationErrors.join('\n'));

const speeds = [
  { label: 'SLOW', ms: 42 },
  { label: 'NORMAL', ms: 25 },
  { label: 'FAST', ms: 12 },
  { label: 'INSTANT', ms: 0 },
] as const;

interface TransientAudioEvent {
  id: number;
  nodeId: string;
  uiSounds?: string[];
  stingers?: string[];
  stingerDelayMs?: number;
}

type MenuView = 'main' | 'archive';
type ReplacementRequest =
  | { kind: 'new' }
  | { kind: 'branch'; sourceSlotId: string; checkpointId: string };

export default function App() {
  const [fontsLoaded] = useFonts({
    Raleway_400Regular: require('./assets/fonts/Raleway_400Regular.ttf'),
    Raleway_500Medium: require('./assets/fonts/Raleway_500Medium.ttf'),
    SpaceMono_400Regular: require('./assets/fonts/SpaceMono_400Regular.ttf'),
  });
  const [session, setSessionState] = useState<NarrativeSession | null>(null);
  const [collection, setCollectionState] = useState<SaveCollection>(emptySaveCollection());
  const [settings, setSettingsState] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [currentSlotId, setCurrentSlotIdState] = useState<string>();
  const [menuView, setMenuView] = useState<MenuView>('main');
  const [replacementRequest, setReplacementRequest] = useState<ReplacementRequest>();
  const [loadingSaves, setLoadingSaves] = useState(true);
  const [audioEvent, setAudioEvent] = useState<TransientAudioEvent>();

  const sessionRef = useRef<NarrativeSession | null>(null);
  const collectionRef = useRef(collection);
  const settingsRef = useRef(settings);
  const currentSlotIdRef = useRef<string | undefined>(undefined);
  const audioEventId = useRef(0);
  const lastHapticNode = useRef<string | undefined>(undefined);

  const setSession = useCallback((next: NarrativeSession | null) => {
    sessionRef.current = next;
    setSessionState(next);
  }, []);
  const setCollection = useCallback((next: SaveCollection, persist = true) => {
    collectionRef.current = next;
    setCollectionState(next);
    if (persist) void saveRepository.persist(next);
  }, []);
  const setSettings = useCallback((next: GameSettings) => {
    settingsRef.current = next;
    setSettingsState(next);
  }, []);
  const setCurrentSlotId = useCallback((next: string | undefined) => {
    currentSlotIdRef.current = next;
    setCurrentSlotIdState(next);
  }, []);

  useEffect(() => {
    let active = true;
    void saveRepository.load().then((loaded) => {
      if (!active) return;
      const sanitized = sanitizeSaveCollection(loaded, story);
      setCollection(sanitized, JSON.stringify(sanitized) !== JSON.stringify(loaded));
      const latest = latestSave(sanitized);
      if (latest) setSettings(latest.settings);
      setLoadingSaves(false);
    });
    return () => {
      active = false;
    };
  }, [setCollection, setSettings]);

  const baseNode = session ? getNode(story, session.currentNodeId) : undefined;
  const node = useMemo(
    () => baseNode && session
      ? resolveNarrativeNode(baseNode, session.decisions)
      : undefined,
    [baseNode, session?.decisions],
  );
  const puzzle = node?.puzzle ? puzzlesById[node.puzzle] : undefined;
  const storedPuzzleProgress = puzzle && session
    ? getPuzzleProgress(session.puzzleState, puzzle.id)
    : undefined;
  const puzzleProgress = puzzle && !isConsistencyPuzzle(puzzle)
    ? initializeAlphaPuzzleProgress(storedPuzzleProgress, puzzle)
    : storedPuzzleProgress;
  const activeAudioEvent = audioEvent?.nodeId === node?.id ? audioEvent : undefined;
  const musicVolumeScale = puzzle && isConsistencyPuzzle(puzzle) && puzzleProgress?.status === 'solved'
    ? puzzle.audio.solutionMusicScale
    : puzzle?.musicScale ?? node?.music_scale ?? 1;

  useNarrativeAudio(
    {
      music: puzzle?.music ?? node?.music,
      musicVolumeScale,
      ambience: node?.ambience,
      uiSounds: activeAudioEvent ? activeAudioEvent.uiSounds : node?.ui_sounds,
      stingers: activeAudioEvent ? activeAudioEvent.stingers : node?.stingers,
      eventKey: node?.id + ':' + (activeAudioEvent?.id ?? 'node'),
      stingerDelayMs: activeAudioEvent?.stingerDelayMs,
    },
    {
      musicEnabled: settings.musicEnabled && Boolean(session),
      sfxEnabled: settings.sfxEnabled && Boolean(session),
    },
  );

  useEffect(() => {
    if (!baseNode?.haptic || !session || lastHapticNode.current === baseNode.id) return;
    lastHapticNode.current = baseNode.id;
    void triggerHaptic(baseNode.haptic, settings.hapticsEnabled);
  }, [baseNode?.haptic, baseNode?.id, session, settings.hapticsEnabled]);

  const choices = useMemo(
    () => (node && session ? getAvailableChoices(node, session) : []),
    [node, session],
  );

  const emitAudio = useCallback(
    (nodeId: string, uiSounds?: string[], stingers?: string[], stingerDelayMs?: number) => {
      audioEventId.current += 1;
      setAudioEvent({
        id: audioEventId.current,
        nodeId,
        uiSounds,
        stingers,
        stingerDelayMs,
      });
    },
    [],
  );

  const commitSession = useCallback(
    (current: NarrativeSession, slotId: string, currentSettings: GameSettings) => {
      const existing = collectionRef.current.slots.find((slot) => slot.slotId === slotId);
      if (!existing) return;
      const currentNode = getNode(story, current.currentNodeId);
      let updated = updateSaveSlot(existing, current, currentSettings, currentNode);
      if (currentNode.checkpoint) {
        updated = createCheckpoint(updated, currentNode.checkpoint, current, currentNode);
      }
      setCollection(upsertSave(collectionRef.current, updated));
    },
    [setCollection],
  );

  useEffect(() => {
    if (!session || !currentSlotId) return;
    const timer = setTimeout(() => commitSession(session, currentSlotId, settings), 300);
    return () => clearTimeout(timer);
  }, [commitSession, currentSlotId, session, settings]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') return;
      const current = sessionRef.current;
      const slotId = currentSlotIdRef.current;
      if (current && slotId) commitSession(current, slotId, settingsRef.current);
    });
    return () => subscription.remove();
  }, [commitSession]);

  const openSave = useCallback(
    (save: GameSave) => {
      setAudioEvent(undefined);
      setSettings(save.settings);
      setCurrentSlotId(save.slotId);
      setSession(sessionForResume(save));
      setMenuView('main');
    },
    [setCurrentSlotId, setSession, setSettings],
  );

  const createNewInSlot = useCallback(
    (slotId: string) => {
      const result = replaceWithNewSave(
        collectionRef.current,
        story,
        slotId,
        settingsRef.current,
      );
      setCollection(result.collection);
      openSave(result.save);
    },
    [openSave, setCollection],
  );

  const startNew = useCallback(() => {
    const slotId = nextAvailableSlotId(collectionRef.current);
    if (!slotId) {
      setReplacementRequest({ kind: 'new' });
      return;
    }
    createNewInSlot(slotId);
  }, [createNewInSlot]);

  const continueLatest = useCallback(() => {
    const latest = latestSave(collectionRef.current);
    if (latest) openSave(latest);
  }, [openSave]);

  const restoreCheckpoint = useCallback(
    (sourceSlotId: string, checkpointId: string) => {
      const targetSlotId = nextAvailableSlotId(collectionRef.current);
      if (!targetSlotId) {
        setReplacementRequest({ kind: 'branch', sourceSlotId, checkpointId });
        return;
      }
      const result = branchFromCheckpoint(
        collectionRef.current,
        sourceSlotId,
        checkpointId,
        targetSlotId,
      );
      setCollection(result.collection);
      openSave(result.save);
    },
    [openSave, setCollection],
  );

  const replaceSlot = useCallback(
    (slotId: string) => {
      const request = replacementRequest;
      setReplacementRequest(undefined);
      if (!request) return;
      if (request.kind === 'new') {
        createNewInSlot(slotId);
        return;
      }
      const result = branchFromCheckpoint(
        collectionRef.current,
        request.sourceSlotId,
        request.checkpointId,
        slotId,
      );
      setCollection(result.collection);
      openSave(result.save);
    },
    [createNewInSlot, openSave, replacementRequest, setCollection],
  );

  const returnToMenu = useCallback(() => {
    const current = sessionRef.current;
    const slotId = currentSlotIdRef.current;
    if (current && slotId) commitSession(current, slotId, settingsRef.current);
    setAudioEvent(undefined);
    setSession(null);
    setCurrentSlotId(undefined);
    setMenuView('main');
  }, [commitSession, setCurrentSlotId, setSession]);

  const choose = useCallback(
    (choice: NarrativeChoice) => {
      const current = sessionRef.current;
      if (!current) return;
      if (choice.action === 'RETURN_TO_MENU') {
        returnToMenu();
        return;
      }
      setAudioEvent(undefined);
      setSession(selectChoice(story, current, choice));
    },
    [returnToMenu, setSession],
  );

  const continueStory = useCallback(() => {
    const current = sessionRef.current;
    if (!current) return;
    setAudioEvent(undefined);
    setSession(advance(story, current));
  }, [setSession]);

  const examinePuzzle = useCallback(
    (fragmentId: PuzzleFragmentId) => {
      const current = sessionRef.current;
      if (!current || !node || !puzzle || !isConsistencyPuzzle(puzzle)) return;
      const next = {
        ...current,
        puzzleState: examinePuzzleFragment(current.puzzleState, puzzle, fragmentId),
      };
      setSession(next);
      emitAudio(node.id, [puzzle.audio.fragmentOpen]);
    },
    [emitAudio, node, puzzle, setSession],
  );

  const isolatePuzzle = useCallback(
    (fragmentId: PuzzleFragmentId) => {
      const current = sessionRef.current;
      if (!current || !node || !puzzle || !isConsistencyPuzzle(puzzle)) return;
      const result = isolatePuzzleFragment(current.puzzleState, puzzle, fragmentId);
      setSession({ ...current, puzzleState: result.state });
      emitAudio(
        node.id,
        [puzzle.audio.fragmentIsolate],
        [result.outcome === 'solved' ? puzzle.audio.consistencyRestored : puzzle.audio.consistencyFailed],
        result.outcome === 'solved' ? 240 : 0,
      );
    },
    [emitAudio, node, puzzle, setSession],
  );

  const resetPuzzle = useCallback(() => {
    const current = sessionRef.current;
    if (!current || !puzzle) return;
    setSession({
      ...current,
      puzzleState: resetPuzzleAttempt(current.puzzleState, puzzle.id),
    });
  }, [puzzle, setSession]);

  const alphaPuzzleAction = useCallback(
    (action: PuzzleAction) => {
      const current = sessionRef.current;
      if (!current || !node || !puzzle || isConsistencyPuzzle(puzzle)) return;
      const result = applyAlphaPuzzleAction(current.puzzleState, puzzle, action);
      const next: NarrativeSession = {
        ...current,
        puzzleState: result.state,
        telemetry: { ...current.telemetry, ...result.telemetry },
      };
      setSession(next);
      if (action.type === 'RESET' || action.type === 'RETRY') return;
      emitAudio(
        node.id,
        puzzle.audio?.interact ? [puzzle.audio.interact] : undefined,
        result.outcome === 'solved' && puzzle.audio?.solved
          ? [puzzle.audio.solved]
          : result.outcome === 'failed' && puzzle.audio?.failed
            ? [puzzle.audio.failed]
            : undefined,
      );
    },
    [emitAudio, node, puzzle, setSession],
  );

  const endingRevealed = useCallback(() => {
    const current = sessionRef.current;
    if (current) logEnding(current);
  }, []);

  const updateSetting = useCallback(
    <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
      setSettings({ ...settingsRef.current, [key]: value });
    },
    [setSettings],
  );

  if (!fontsLoaded) {
    return <View style={styles.loading} />;
  }

  if (replacementRequest) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={colors.stone_dark} />
        <SlotReplacementScreen
          slots={collection.slots}
          message={
            replacementRequest.kind === 'new'
              ? 'A NEW INSTANCE REQUIRES AN AVAILABLE CONTINUITY.'
              : 'THE SELECTED CHECKPOINT WILL BRANCH INTO THIS SLOT.'
          }
          onReplace={replaceSlot}
          onCancel={() => setReplacementRequest(undefined)}
        />
      </SafeAreaView>
    );
  }

  if (!session || !node) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={colors.stone_dark} />
        {menuView === 'archive' ? (
          <ArchiveScreen
            slots={collection.slots}
            onRestore={restoreCheckpoint}
            onBack={() => setMenuView('main')}
          />
        ) : (
          <MainMenu
            title={story.title}
            image={resolveVisual('hermitage_exterior_dim', 1)}
            slots={collection.slots}
            loading={loadingSaves}
            onContinue={continueLatest}
            onNew={startNew}
            onArchive={() => setMenuView('archive')}
          />
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.stone_dark} />
      <View style={styles.utilityBar}>
        <Text numberOfLines={1} style={styles.nodeLabel}>
          {node.chapter_title ?? node.chapter ?? 'PROLOGUE'}
        </Text>
        <View style={styles.utilityActions}>
          <Pressable
            accessibilityLabel={'Text speed: ' + speeds[settings.textSpeedIndex]!.label}
            onPress={() =>
              updateSetting('textSpeedIndex', (settings.textSpeedIndex + 1) % speeds.length)
            }
            hitSlop={8}
          >
            <Text style={styles.utilityText}>TXT {speeds[settings.textSpeedIndex]!.label}</Text>
          </Pressable>
          <Toggle
            label="MUS"
            enabled={settings.musicEnabled}
            onPress={() => updateSetting('musicEnabled', !settings.musicEnabled)}
          />
          <Toggle
            label="SFX"
            enabled={settings.sfxEnabled}
            onPress={() => updateSetting('sfxEnabled', !settings.sfxEnabled)}
          />
          <Toggle
            label="HAP"
            enabled={settings.hapticsEnabled}
            onPress={() => updateSetting('hapticsEnabled', !settings.hapticsEnabled)}
          />
        </View>
      </View>
      <NarrativeScreen
        node={node}
        choices={choices}
        decisions={session.decisions}
        puzzle={puzzle}
        puzzleProgress={puzzleProgress}
        speedMs={speeds[settings.textSpeedIndex]!.ms}
        sfxEnabled={settings.sfxEnabled}
        onChoice={choose}
        onPuzzleExamine={examinePuzzle}
        onPuzzleIsolate={isolatePuzzle}
        onPuzzleReset={resetPuzzle}
        onAlphaPuzzleAction={alphaPuzzleAction}
        onAdvance={continueStory}
        onReturnToMenu={returnToMenu}
        onEndingRevealed={endingRevealed}
        isEnding={isEnding(node)}
      />
    </SafeAreaView>
  );
}

function Toggle({
  label,
  enabled,
  onPress,
}: {
  label: string;
  enabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={label + (enabled ? ' enabled' : ' disabled')}
      onPress={onPress}
      hitSlop={8}
    >
      <Text style={[styles.utilityText, !enabled && styles.utilityOff]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.stone_dark },
  loading: { flex: 1, backgroundColor: colors.stone_dark },
  utilityBar: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    backgroundColor: colors.stone_dark,
    borderBottomColor: colors.stone_light,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  utilityActions: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  nodeLabel: {
    flex: 1,
    color: colors.text_secondary,
    fontFamily: typography.system,
    fontSize: 8,
    letterSpacing: 1.1,
    marginRight: 10,
  },
  utilityText: {
    color: colors.text_secondary,
    fontFamily: typography.system,
    fontSize: 8,
    letterSpacing: 0.55,
  },
  utilityOff: { opacity: 0.34 },
});