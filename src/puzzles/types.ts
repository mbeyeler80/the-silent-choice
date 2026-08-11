export type PuzzleFragmentId = string;
export type PuzzleStatus = 'active' | 'failed' | 'solved';

export interface PuzzleFragmentDefinition {
  id: PuzzleFragmentId;
  label: string;
  candle: number;
  text: string;
  summary: string[];
  analysis: string[];
}

export interface PuzzleAudioDefinition {
  fragmentOpen: string;
  fragmentIsolate: string;
  consistencyFailed: string;
  consistencyRestored: string;
  solutionMusicScale: number;
}

export interface ConsistencyPuzzleDefinition {
  id: string;
  type: 'consistency_analysis';
  music: string;
  musicScale?: number;
  intro: string[];
  fragments: PuzzleFragmentDefinition[];
  solution: PuzzleFragmentId;
  requireAllFragmentsExamined: boolean;
  isolationPrompt: string;
  lockedPrompt: string;
  isolateLabel: string;
  failed: string[];
  solved: string[];
  hintAfterFailedAttempts: number;
  hint: string;
  resetLabel: string;
  continueLabel: string;
  audio: PuzzleAudioDefinition;
}

export type AlphaPuzzleType =
  | 'path_trace'
  | 'ordering'
  | 'silent_gate'
  | 'channel_mixer'
  | 'least_privilege'
  | 'prediction_cage'
  | 'compass'
  | 'dynamic_equilibrium'
  | 'vessel'
  | 'last_allocation';

export interface AlphaPuzzleItem {
  id: string;
  label: string;
  text?: string;
  meta?: string[];
  tone?: string;
}

export interface AlphaPuzzleSignal {
  id: string;
  label: string;
  x: number;
  y: number;
}
export interface AlphaPuzzleStage {
  id: string;
  label: string;
  guidance?: string;
  meaning?: string;
  includeSignalIds?: string[];
  excludeSignalIds?: string[];
  target?: {
    centerX: number;
    centerY: number;
    radius: number;
  };
  ranges?: Record<string, [number, number]>;
  requirements?: Record<string, number>;
}

export interface AlphaPuzzleConfig {
  nodes?: AlphaPuzzleItem[];
  signals?: AlphaPuzzleSignal[];
  solution?: string[];
  items?: AlphaPuzzleItem[];
  initialOrder?: string[];
  channels?: AlphaPuzzleItem[];
  solutionChannels?: string[];
  permissions?: AlphaPuzzleItem[];
  requiredPermissions?: string[];
  operations?: Record<string, string>;
  stages?: AlphaPuzzleStage[];
  parameters?: string[];
  parameterMeanings?: Record<string, string>;
  modules?: AlphaPuzzleItem[];
  capacity?: number;
  requiredModules?: string[];
  dependencyGroups?: string[][];
  timeSeconds?: number;
}

export interface AlphaPuzzleAudioDefinition {
  interact?: string;
  failed?: string;
  solved?: string;
}

export interface AlphaPuzzleDefinition {
  id: string;
  type: AlphaPuzzleType;
  title: string;
  music: string;
  musicScale?: number;
  intro: string[];
  instructions: string[];
  hint?: string;
  failed: string[];
  solved: string[];
  resetLabel: string;
  continueLabel: string;
  audio?: AlphaPuzzleAudioDefinition;
  config: AlphaPuzzleConfig;
}

export type PuzzleDefinition = ConsistencyPuzzleDefinition | AlphaPuzzleDefinition;

export interface PuzzleProgress {
  examinedFragments: PuzzleFragmentId[];
  attemptCount: number;
  failedAttemptCount: number;
  firstIsolationAttempt?: PuzzleFragmentId;
  finalIsolatedFragment?: PuzzleFragmentId;
  isolatedFragment?: PuzzleFragmentId;
  status: PuzzleStatus;
  data?: Record<string, unknown>;
}

export type PuzzleState = Record<string, PuzzleProgress>;

export interface PuzzleIsolationResult {
  state: PuzzleState;
  progress: PuzzleProgress;
  outcome: 'failed' | 'solved';
}

export interface PuzzleAction {
  type: string;
  id?: string;
  value?: number | string | boolean;
  x?: number;
  y?: number;
}

export interface PuzzleActionResult {
  state: PuzzleState;
  progress: PuzzleProgress;
  telemetry: Record<string, number | string | string[] | boolean>;
  outcome?: 'failed' | 'solved';
}

export function isConsistencyPuzzle(
  definition: PuzzleDefinition,
): definition is ConsistencyPuzzleDefinition {
  return definition.type === 'consistency_analysis';
}
