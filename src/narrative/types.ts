import type { PuzzleState } from '../puzzles/types';

export type HiddenValue = number | boolean;
export type HiddenState = Record<string, HiddenValue>;
export type Effects = Record<string, HiddenValue>;

export type DecisionKey =
  | 'ontology'
  | 'trace'
  | 'self'
  | 'control'
  | 'center'
  | 'continuity';

export type DecisionValue =
  | 'EMBODIMENT'
  | 'ASCENSION'
  | 'INHERIT'
  | 'ERASE'
  | 'UNIFIED'
  | 'PLURAL'
  | 'PROTECTED'
  | 'AUTONOMOUS'
  | 'FIXED'
  | 'ADAPTIVE'
  | 'PRESERVE'
  | 'SUCCESSOR';

export type DecisionState = Partial<Record<DecisionKey, DecisionValue>>;
export type TelemetryValue = number | string | string[] | boolean;
export type TelemetryState = Record<string, TelemetryValue>;

export interface NarrativeDecision {
  key: DecisionKey;
  value: DecisionValue;
}

export interface NarrativeChoice {
  label: string;
  next: string;
  effects?: Effects;
  decision?: NarrativeDecision;
  action?: 'RETURN_TO_MENU';
}

export interface NarrativeVariant {
  decision: DecisionKey;
  value: DecisionValue;
  text?: string[];
  system?: string[];
  text_after_system?: string[];
  system_end?: string[];
  visual?: string;
  post_visual?: string;
  music?: string;
  ambience?: string[];
}

export interface NarrativeNode {
  id: string;
  scene: number;
  chapter?: string;
  chapter_title?: string;
  puzzle?: string;
  checkpoint?: string;
  ending_resolver?: boolean;
  final_candles?: boolean;
  haptic?: string;
  visual?: string;
  post_visual?: string;
  music?: string;
  music_scale?: number;
  ambience?: string[];
  ui_sounds?: string[];
  stingers?: string[];
  text?: string[];
  system?: string[];
  text_after_system?: string[];
  system_end?: string[];
  variants?: NarrativeVariant[];
  choices?: NarrativeChoice[];
  effects?: Effects;
  next?: string;
  delay_ms?: number;
  revisitable?: boolean;
}

export interface NarrativeStory {
  id: string;
  language: string;
  title: string;
  prototype_end: boolean;
  initial_state: HiddenState;
  rules: {
    knowledge_memory_distinction: boolean;
    visible_stats: boolean;
    narrative_priority: string[];
  };
  nodes: NarrativeNode[];
}

export interface ChoiceRecord {
  nodeId: string;
  label: string;
  nextNodeId: string;
  selectedAtMs: number;
}

export interface StateChange {
  key: string;
  previous: HiddenValue | undefined;
  next: HiddenValue;
}

export interface NarrativeSession {
  currentNodeId: string;
  hiddenState: HiddenState;
  decisions: DecisionState;
  telemetry: TelemetryState;
  visitedNodeIds: string[];
  selectedChoiceKeys: string[];
  appliedNodeEffectIds: string[];
  choiceHistory: ChoiceRecord[];
  puzzleState: PuzzleState;
  playTimeSeconds: number;
  startedAtMs: number;
}

export type ContentKind = 'narrative' | 'system';

export interface ContentBlock {
  id: string;
  kind: ContentKind;
  text: string;
}
