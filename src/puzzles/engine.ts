import type {
  ConsistencyPuzzleDefinition,
  PuzzleFragmentId,
  PuzzleIsolationResult,
  PuzzleProgress,
  PuzzleState,
} from './types';

export function createPuzzleProgress(): PuzzleProgress {
  return {
    examinedFragments: [],
    attemptCount: 0,
    failedAttemptCount: 0,
    status: 'active',
  };
}

export function getPuzzleProgress(state: PuzzleState, puzzleId: string): PuzzleProgress {
  return state[puzzleId] ?? createPuzzleProgress();
}

export function activatePuzzle(state: PuzzleState, puzzleId: string): PuzzleState {
  if (state[puzzleId]) return state;
  return { ...state, [puzzleId]: createPuzzleProgress() };
}

function assertFragment(definition: ConsistencyPuzzleDefinition, fragmentId: PuzzleFragmentId): void {
  if (!definition.fragments.some((fragment) => fragment.id === fragmentId)) {
    throw new Error(`Unknown fragment ${fragmentId} for puzzle ${definition.id}`);
  }
}

export function examinePuzzleFragment(
  state: PuzzleState,
  definition: ConsistencyPuzzleDefinition,
  fragmentId: PuzzleFragmentId,
): PuzzleState {
  assertFragment(definition, fragmentId);
  const progress = getPuzzleProgress(state, definition.id);
  if (progress.examinedFragments.includes(fragmentId)) return state;

  return {
    ...state,
    [definition.id]: {
      ...progress,
      examinedFragments: [...progress.examinedFragments, fragmentId],
    },
  };
}

export function hasExaminedAllFragments(
  definition: ConsistencyPuzzleDefinition,
  progress: PuzzleProgress,
): boolean {
  return definition.fragments.every((fragment) =>
    progress.examinedFragments.includes(fragment.id),
  );
}

export function isolatePuzzleFragment(
  state: PuzzleState,
  definition: ConsistencyPuzzleDefinition,
  fragmentId: PuzzleFragmentId,
): PuzzleIsolationResult {
  assertFragment(definition, fragmentId);
  const progress = getPuzzleProgress(state, definition.id);
  if (progress.status === 'solved') {
    return { state, progress, outcome: 'solved' };
  }
  if (
    definition.requireAllFragmentsExamined &&
    !hasExaminedAllFragments(definition, progress)
  ) {
    throw new Error(`Puzzle ${definition.id} requires every fragment to be examined first.`);
  }

  const solved = fragmentId === definition.solution;
  const nextProgress: PuzzleProgress = {
    ...progress,
    attemptCount: progress.attemptCount + 1,
    failedAttemptCount: progress.failedAttemptCount + (solved ? 0 : 1),
    firstIsolationAttempt: progress.firstIsolationAttempt ?? fragmentId,
    finalIsolatedFragment: solved ? fragmentId : progress.finalIsolatedFragment,
    isolatedFragment: fragmentId,
    status: solved ? 'solved' : 'failed',
  };
  const nextState = { ...state, [definition.id]: nextProgress };
  return {
    state: nextState,
    progress: nextProgress,
    outcome: solved ? 'solved' : 'failed',
  };
}

export function resetPuzzleAttempt(state: PuzzleState, puzzleId: string): PuzzleState {
  const progress = getPuzzleProgress(state, puzzleId);
  if (progress.status === 'solved') return state;
  return {
    ...state,
    [puzzleId]: {
      ...progress,
      isolatedFragment: undefined,
      status: 'active',
    },
  };
}

export function validatePuzzle(definition: ConsistencyPuzzleDefinition): string[] {
  const errors: string[] = [];
  const fragmentIds = new Set<string>();
  if (!definition.id) errors.push('Puzzle has no id.');
  if (definition.type !== 'consistency_analysis') {
    errors.push(`${definition.id || 'Puzzle'} has unsupported type: ${definition.type}`);
  }
  if (definition.fragments.length < 2) {
    errors.push(`${definition.id} requires at least two fragments.`);
  }
  for (const fragment of definition.fragments) {
    if (fragmentIds.has(fragment.id)) {
      errors.push(`${definition.id} has duplicate fragment: ${fragment.id}`);
    }
    fragmentIds.add(fragment.id);
  }
  if (!fragmentIds.has(definition.solution)) {
    errors.push(`${definition.id} solution does not reference a fragment: ${definition.solution}`);
  }
  if (definition.hintAfterFailedAttempts < 1) {
    errors.push(`${definition.id} hint threshold must be positive.`);
  }
  return errors;
}
