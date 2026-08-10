export type HiddenValue = number | boolean;
export type HiddenState = Record<string, HiddenValue>;
export type Effects = Record<string, HiddenValue>;

export interface NarrativeChoice {
  label: string;
  next: string;
  effects?: Effects;
}

export interface NarrativeNode {
  id: string;
  scene: number;
  visual?: string;
  post_visual?: string;
  audio?: string[];
  text?: string[];
  system?: string[];
  text_after_system?: string[];
  system_end?: string[];
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
  visitedNodeIds: string[];
  selectedChoiceKeys: string[];
  appliedNodeEffectIds: string[];
  choiceHistory: ChoiceRecord[];
  startedAtMs: number;
}

export type ContentKind = 'narrative' | 'system';

export interface ContentBlock {
  id: string;
  kind: ContentKind;
  text: string;
}
