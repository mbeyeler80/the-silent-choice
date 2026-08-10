import type {
  Effects,
  HiddenState,
  NarrativeChoice,
  NarrativeNode,
  NarrativeSession,
  NarrativeStory,
  StateChange,
} from './types';

const choiceKey = (nodeId: string, label: string) => `${nodeId}::${label}`;

export function getNode(story: NarrativeStory, nodeId: string): NarrativeNode {
  const node = story.nodes.find((candidate) => candidate.id === nodeId);
  if (!node) {
    throw new Error(`Narrative node not found: ${nodeId}`);
  }
  return node;
}

export function validateStory(story: NarrativeStory): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();

  for (const node of story.nodes) {
    if (ids.has(node.id)) errors.push(`Duplicate node id: ${node.id}`);
    ids.add(node.id);
  }

  for (const node of story.nodes) {
    const targets = [node.next, ...(node.choices?.map((choice) => choice.next) ?? [])];
    for (const target of targets) {
      if (target && !ids.has(target)) errors.push(`${node.id} references missing node: ${target}`);
    }
  }

  if (story.nodes.length === 0) errors.push('Story has no nodes.');
  return errors;
}

export function applyEffects(
  state: HiddenState,
  effects: Effects | undefined,
): { state: HiddenState; changes: StateChange[] } {
  if (!effects) return { state, changes: [] };

  const nextState = { ...state };
  const changes: StateChange[] = [];
  for (const [key, effect] of Object.entries(effects)) {
    const previous = nextState[key];
    const next =
      typeof effect === 'number' && typeof previous === 'number' ? previous + effect : effect;
    nextState[key] = next;
    changes.push({ key, previous, next });
  }
  return { state: nextState, changes };
}

function logDevelopment(event: string, payload: unknown): void {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.info(`[narrative] ${event}`, payload);
  }
}

export function createSession(story: NarrativeStory, startedAtMs = Date.now()): NarrativeSession {
  const firstNode = story.nodes[0];
  if (!firstNode) throw new Error('Cannot start an empty story.');

  const session: NarrativeSession = {
    currentNodeId: firstNode.id,
    hiddenState: { ...story.initial_state },
    visitedNodeIds: [],
    selectedChoiceKeys: [],
    appliedNodeEffectIds: [],
    choiceHistory: [],
    startedAtMs,
  };
  return enterNode(story, session, firstNode.id);
}

export function enterNode(
  story: NarrativeStory,
  session: NarrativeSession,
  nodeId: string,
): NarrativeSession {
  const node = getNode(story, nodeId);
  const shouldApplyNodeEffects = Boolean(
    node.effects && !session.appliedNodeEffectIds.includes(node.id),
  );
  const result = shouldApplyNodeEffects
    ? applyEffects(session.hiddenState, node.effects)
    : { state: session.hiddenState, changes: [] };

  const nextSession: NarrativeSession = {
    ...session,
    currentNodeId: node.id,
    hiddenState: result.state,
    visitedNodeIds: [...session.visitedNodeIds, node.id],
    appliedNodeEffectIds: shouldApplyNodeEffects
      ? [...session.appliedNodeEffectIds, node.id]
      : session.appliedNodeEffectIds,
  };

  logDevelopment('node', { id: node.id, scene: node.scene });
  if (result.changes.length) logDevelopment('state', result.changes);
  return nextSession;
}

export function getAvailableChoices(
  node: NarrativeNode,
  session: NarrativeSession,
): NarrativeChoice[] {
  const choices = node.choices ?? [];
  if (!node.revisitable) return choices;
  return choices.filter(
    (choice) => !session.selectedChoiceKeys.includes(choiceKey(node.id, choice.label)),
  );
}

export function selectChoice(
  story: NarrativeStory,
  session: NarrativeSession,
  choice: NarrativeChoice,
  selectedAtMs = Date.now(),
): NarrativeSession {
  const node = getNode(story, session.currentNodeId);
  const available = getAvailableChoices(node, session);
  if (!available.some((candidate) => candidate.label === choice.label && candidate.next === choice.next)) {
    throw new Error(`Choice is not available at ${node.id}: ${choice.label}`);
  }

  const result = applyEffects(session.hiddenState, choice.effects);
  const selectedKey = choiceKey(node.id, choice.label);
  const updated: NarrativeSession = {
    ...session,
    hiddenState: result.state,
    selectedChoiceKeys: session.selectedChoiceKeys.includes(selectedKey)
      ? session.selectedChoiceKeys
      : [...session.selectedChoiceKeys, selectedKey],
    choiceHistory: [
      ...session.choiceHistory,
      { nodeId: node.id, label: choice.label, nextNodeId: choice.next, selectedAtMs },
    ],
  };

  logDevelopment('choice', { node: node.id, label: choice.label, next: choice.next });
  if (result.changes.length) logDevelopment('state', result.changes);
  return enterNode(story, updated, choice.next);
}

export function advance(story: NarrativeStory, session: NarrativeSession): NarrativeSession {
  const node = getNode(story, session.currentNodeId);
  if (!node.next) throw new Error(`Node has no automatic next target: ${node.id}`);
  return enterNode(story, session, node.next);
}

export function isEnding(node: NarrativeNode): boolean {
  return !node.next && (node.choices?.length ?? 0) === 0;
}

export function logEnding(session: NarrativeSession): void {
  logDevelopment('ending', {
    node: session.currentNodeId,
    path: session.choiceHistory.map((choice) => choice.label),
    hiddenState: session.hiddenState,
    elapsedMs: Date.now() - session.startedAtMs,
  });
}
