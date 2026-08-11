import { createSession } from '../narrative/engine';
import type { NarrativeNode, NarrativeSession, NarrativeStory } from '../narrative/types';
import {
  MAX_SAVE_SLOTS,
  SAVE_VERSION,
  type CheckpointSnapshot,
  type GameSave,
  type GameSettings,
  type SaveCollection,
} from './types';

export const DEFAULT_SETTINGS: GameSettings = {
  musicEnabled: true,
  sfxEnabled: true,
  hapticsEnabled: true,
  textSpeedIndex: 1,
};

export function emptySaveCollection(): SaveCollection {
  return { saveVersion: SAVE_VERSION, slots: [] };
}

function iso(nowMs: number): string {
  return new Date(nowMs).toISOString();
}

function cloneSession(session: NarrativeSession): NarrativeSession {
  return JSON.parse(JSON.stringify(session)) as NarrativeSession;
}

export function elapsedPlayTime(session: NarrativeSession, nowMs = Date.now()): number {
  return Math.max(
    0,
    Math.round(session.playTimeSeconds + (nowMs - session.startedAtMs) / 1000),
  );
}

export function sessionForResume(save: GameSave, nowMs = Date.now()): NarrativeSession {
  return {
    ...cloneSession(save.session),
    playTimeSeconds: save.playTimeSeconds,
    startedAtMs: nowMs,
  };
}

export function createSaveSlot(
  story: NarrativeStory,
  slotId: string,
  settings: GameSettings = DEFAULT_SETTINGS,
  nowMs = Date.now(),
): GameSave {
  const session = createSession(story, nowMs);
  const node = story.nodes[0];
  if (!node) throw new Error('Cannot create save for an empty story.');
  return {
    saveVersion: SAVE_VERSION,
    slotId,
    currentChapter: node.chapter ?? 'PROLOGUE',
    currentScene: node.scene,
    currentNode: node.id,
    playTimeSeconds: 0,
    decisions: session.decisions,
    puzzles: session.puzzleState,
    telemetry: session.telemetry,
    settings: { ...settings },
    checkpoints: [],
    session: cloneSession(session),
    createdAt: iso(nowMs),
    updatedAt: iso(nowMs),
  };
}

export function updateSaveSlot(
  save: GameSave,
  session: NarrativeSession,
  settings: GameSettings,
  node: NarrativeNode,
  nowMs = Date.now(),
): GameSave {
  const playTimeSeconds = elapsedPlayTime(session, nowMs);
  const savedSession: NarrativeSession = {
    ...cloneSession(session),
    playTimeSeconds,
    startedAtMs: nowMs,
  };
  return {
    ...save,
    currentChapter: node.chapter ?? 'PROLOGUE',
    currentScene: node.scene,
    currentNode: node.id,
    playTimeSeconds,
    decisions: { ...session.decisions },
    puzzles: JSON.parse(JSON.stringify(session.puzzleState)) as NarrativeSession['puzzleState'],
    telemetry: { ...session.telemetry },
    settings: { ...settings },
    session: savedSession,
    updatedAt: iso(nowMs),
  };
}

export function createCheckpoint(
  save: GameSave,
  checkpointId: string,
  session: NarrativeSession,
  node: NarrativeNode,
  nowMs = Date.now(),
): GameSave {
  if (save.checkpoints.some((checkpoint) => checkpoint.id === checkpointId)) return save;
  const playTimeSeconds = elapsedPlayTime(session, nowMs);
  const snapshot: CheckpointSnapshot = {
    id: checkpointId,
    chapter: node.chapter ?? 'PROLOGUE',
    nodeId: node.id,
    scene: node.scene,
    createdAt: iso(nowMs),
    playTimeSeconds,
    session: {
      ...cloneSession(session),
      playTimeSeconds,
      startedAtMs: nowMs,
    },
  };
  return {
    ...save,
    checkpoints: [...save.checkpoints, snapshot],
    updatedAt: iso(nowMs),
  };
}

export function upsertSave(collection: SaveCollection, save: GameSave): SaveCollection {
  const existing = collection.slots.findIndex((slot) => slot.slotId === save.slotId);
  const slots = [...collection.slots];
  if (existing >= 0) slots[existing] = save;
  else slots.push(save);
  return { saveVersion: SAVE_VERSION, slots };
}

export function latestSave(collection: SaveCollection): GameSave | undefined {
  return [...collection.slots].sort(
    (left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt),
  )[0];
}

export function nextAvailableSlotId(collection: SaveCollection): string | undefined {
  for (let index = 1; index <= MAX_SAVE_SLOTS; index += 1) {
    const id = 'continuity-' + index;
    if (!collection.slots.some((slot) => slot.slotId === id)) return id;
  }
  return undefined;
}

export function replaceWithNewSave(
  collection: SaveCollection,
  story: NarrativeStory,
  slotId: string,
  settings: GameSettings = DEFAULT_SETTINGS,
  nowMs = Date.now(),
): { collection: SaveCollection; save: GameSave } {
  const save = createSaveSlot(story, slotId, settings, nowMs);
  return {
    save,
    collection: upsertSave(
      {
        ...collection,
        slots: collection.slots.filter((slot) => slot.slotId !== slotId),
      },
      save,
    ),
  };
}

export function branchFromCheckpoint(
  collection: SaveCollection,
  sourceSlotId: string,
  checkpointId: string,
  targetSlotId: string,
  nowMs = Date.now(),
): { collection: SaveCollection; save: GameSave } {
  const source = collection.slots.find((slot) => slot.slotId === sourceSlotId);
  if (!source) throw new Error('Source continuity not found: ' + sourceSlotId);
  const checkpoint = source.checkpoints.find((candidate) => candidate.id === checkpointId);
  if (!checkpoint) throw new Error('Checkpoint not found: ' + checkpointId);

  const session = cloneSession(checkpoint.session);
  const timestamp = iso(nowMs);
  const save: GameSave = {
    ...JSON.parse(JSON.stringify(source)) as GameSave,
    slotId: targetSlotId,
    currentChapter: checkpoint.chapter,
    currentNode: checkpoint.nodeId,
    currentScene: checkpoint.scene,
    playTimeSeconds: checkpoint.playTimeSeconds,
    decisions: { ...session.decisions },
    puzzles: session.puzzleState,
    telemetry: session.telemetry,
    session: { ...session, startedAtMs: nowMs },
    checkpoints: source.checkpoints.filter(
      (candidate) => Date.parse(candidate.createdAt) <= Date.parse(checkpoint.createdAt),
    ),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const withoutTarget = {
    ...collection,
    slots: collection.slots.filter((slot) => slot.slotId !== targetSlotId),
  };
  return { save, collection: upsertSave(withoutTarget, save) };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isSettings(value: unknown): value is GameSettings {
  if (!isRecord(value)) return false;
  return (
    typeof value.musicEnabled === 'boolean' &&
    typeof value.sfxEnabled === 'boolean' &&
    typeof value.hapticsEnabled === 'boolean' &&
    Number.isInteger(value.textSpeedIndex) &&
    Number(value.textSpeedIndex) >= 0 &&
    Number(value.textSpeedIndex) <= 3
  );
}

function isSession(value: unknown): value is NarrativeSession {
  if (!isRecord(value)) return false;
  return (
    typeof value.currentNodeId === 'string' &&
    isRecord(value.hiddenState) &&
    isRecord(value.decisions) &&
    isRecord(value.telemetry) &&
    isRecord(value.puzzleState) &&
    Array.isArray(value.visitedNodeIds) &&
    Array.isArray(value.selectedChoiceKeys) &&
    Array.isArray(value.appliedNodeEffectIds) &&
    Array.isArray(value.choiceHistory) &&
    typeof value.playTimeSeconds === 'number' &&
    typeof value.startedAtMs === 'number'
  );
}

function isCheckpoint(value: unknown): value is CheckpointSnapshot {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.chapter === 'string' &&
    typeof value.nodeId === 'string' &&
    typeof value.scene === 'number' &&
    typeof value.createdAt === 'string' &&
    typeof value.playTimeSeconds === 'number' &&
    isSession(value.session)
  );
}

function isGameSave(value: unknown): value is GameSave {
  if (!isRecord(value)) return false;
  return (
    value.saveVersion === SAVE_VERSION &&
    typeof value.slotId === 'string' &&
    typeof value.currentChapter === 'string' &&
    typeof value.currentScene === 'number' &&
    typeof value.currentNode === 'string' &&
    typeof value.playTimeSeconds === 'number' &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string' &&
    isRecord(value.decisions) &&
    isRecord(value.puzzles) &&
    isRecord(value.telemetry) &&
    isSettings(value.settings) &&
    isSession(value.session) &&
    Array.isArray(value.checkpoints) &&
    value.checkpoints.every(isCheckpoint)
  );
}

export function migrateSaveCollection(value: unknown): SaveCollection {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return emptySaveCollection();
  }
  const candidate = value as Partial<SaveCollection>;
  if (candidate.saveVersion !== SAVE_VERSION || !Array.isArray(candidate.slots)) {
    return emptySaveCollection();
  }
  return {
    saveVersion: SAVE_VERSION,
    slots: candidate.slots.filter(isGameSave).slice(0, MAX_SAVE_SLOTS),
  };
}

export function sanitizeSaveCollection(
  collection: SaveCollection,
  story: NarrativeStory,
): SaveCollection {
  const nodeIds = new Set(story.nodes.map((node) => node.id));
  return {
    saveVersion: SAVE_VERSION,
    slots: collection.slots
      .filter(
        (save) =>
          save.currentNode === save.session.currentNodeId &&
          nodeIds.has(save.currentNode),
      )
      .map((save) => ({
        ...save,
        checkpoints: save.checkpoints.filter(
          (checkpoint) =>
            checkpoint.nodeId === checkpoint.session.currentNodeId &&
            nodeIds.has(checkpoint.nodeId),
        ),
      })),
  };
}
export function parseSaveCollection(serialized: string | null): SaveCollection {
  if (!serialized) return emptySaveCollection();
  try {
    return migrateSaveCollection(JSON.parse(serialized));
  } catch {
    return emptySaveCollection();
  }
}
