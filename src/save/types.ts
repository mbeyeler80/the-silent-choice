import type {
  DecisionState,
  NarrativeSession,
  TelemetryState,
} from '../narrative/types';
import type { PuzzleState } from '../puzzles/types';

export const SAVE_VERSION = 1;
export const MAX_SAVE_SLOTS = 3;

export interface GameSettings {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  hapticsEnabled: boolean;
  textSpeedIndex: number;
}

export interface CheckpointSnapshot {
  id: string;
  chapter: string;
  nodeId: string;
  scene: number;
  createdAt: string;
  playTimeSeconds: number;
  session: NarrativeSession;
}

export interface GameSave {
  saveVersion: 1;
  slotId: string;
  currentChapter: string;
  currentScene: number;
  currentNode: string;
  playTimeSeconds: number;
  decisions: DecisionState;
  puzzles: PuzzleState;
  telemetry: TelemetryState;
  settings: GameSettings;
  checkpoints: CheckpointSnapshot[];
  session: NarrativeSession;
  createdAt: string;
  updatedAt: string;
}

export interface SaveCollection {
  saveVersion: 1;
  slots: GameSave[];
}
