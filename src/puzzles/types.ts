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

export interface PuzzleProgress {
  examinedFragments: PuzzleFragmentId[];
  attemptCount: number;
  failedAttemptCount: number;
  firstIsolationAttempt?: PuzzleFragmentId;
  finalIsolatedFragment?: PuzzleFragmentId;
  isolatedFragment?: PuzzleFragmentId;
  status: PuzzleStatus;
}

export type PuzzleState = Record<string, PuzzleProgress>;

export interface PuzzleIsolationResult {
  state: PuzzleState;
  progress: PuzzleProgress;
  outcome: 'failed' | 'solved';
}
