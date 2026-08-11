import memoryIntegrityData from '../game_data/puzzles/memory_integrity_v0_1.json';
import storyData from '../game_data/story/prologue_v0_1.json';
import {
  advance,
  createSession,
  getAvailableChoices,
  getNode,
  selectChoice,
} from '../src/narrative/engine';
import {
  activatePuzzle,
  examinePuzzleFragment,
  getPuzzleProgress,
  isolatePuzzleFragment,
  resetPuzzleAttempt,
  validatePuzzle,
} from '../src/puzzles/engine';
import type { NarrativeSession, NarrativeStory } from '../src/narrative/types';
import type {
  ConsistencyPuzzleDefinition,
  PuzzleFragmentId,
  PuzzleState,
} from '../src/puzzles/types';

const story = storyData as NarrativeStory;
const puzzle = memoryIntegrityData as ConsistencyPuzzleDefinition;

function choose(session: NarrativeSession, label: string): NarrativeSession {
  const node = getNode(story, session.currentNodeId);
  const choice = getAvailableChoices(node, session).find((candidate) => candidate.label === label);
  if (!choice) throw new Error('Missing choice at ' + node.id + ': ' + label);
  return selectChoice(story, session, choice, 1000);
}

function reachPuzzle(): NarrativeSession {
  let session = createSession(story, 0);
  session = choose(session, 'LISTEN TO THE WATER');
  session = advance(story, session);
  session = choose(session, 'ENTER THE HERMITAGE');
  session = choose(session, 'NO');
  return advance(story, session);
}

function examineAll(state: PuzzleState): PuzzleState {
  return puzzle.fragments.reduce(
    (current, fragment) => examinePuzzleFragment(current, puzzle, fragment.id),
    state,
  );
}

describe('memory integrity puzzle', () => {
  it('validates and activates on the narrative node', () => {
    expect(validatePuzzle(puzzle)).toEqual([]);
    const session = reachPuzzle();
    expect(session.currentNodeId).toBe('s2_memory_integrity');
    expect(getPuzzleProgress(session.puzzleState, puzzle.id)).toEqual({
      examinedFragments: [],
      attemptCount: 0,
      failedAttemptCount: 0,
      status: 'active',
    });
  });

  it('stores examined fragments without duplicates', () => {
    let state = activatePuzzle({}, puzzle.id);
    state = examinePuzzleFragment(state, puzzle, 'A');
    state = examinePuzzleFragment(state, puzzle, 'C');
    state = examinePuzzleFragment(state, puzzle, 'A');
    expect(getPuzzleProgress(state, puzzle.id).examinedFragments).toEqual(['A', 'C']);
  });

  it.each<PuzzleFragmentId>(['A', 'B'])(
    'does not allow progression after isolating %s',
    (fragmentId) => {
      let session = reachPuzzle();
      const result = isolatePuzzleFragment(examineAll(session.puzzleState), puzzle, fragmentId);
      session = { ...session, puzzleState: result.state };
      expect(result.outcome).toBe('failed');
      expect(() => advance(story, session)).toThrow(
        'Puzzle must be solved before leaving node: s2_memory_integrity',
      );
    },
  );

  it('increments attempts, preserves the first attempt and resets after failure', () => {
    let state = examineAll(activatePuzzle({}, puzzle.id));

    const first = isolatePuzzleFragment(state, puzzle, 'A');
    expect(first.progress.attemptCount).toBe(1);
    expect(first.progress.failedAttemptCount).toBe(1);
    expect(first.progress.firstIsolationAttempt).toBe('A');
    expect(first.progress.finalIsolatedFragment).toBeUndefined();

    state = resetPuzzleAttempt(first.state, puzzle.id);
    expect(getPuzzleProgress(state, puzzle.id)).toMatchObject({
      examinedFragments: ['A', 'B', 'C'],
      attemptCount: 1,
      failedAttemptCount: 1,
      firstIsolationAttempt: 'A',
      status: 'active',
    });
    expect(getPuzzleProgress(state, puzzle.id).isolatedFragment).toBeUndefined();

    const second = isolatePuzzleFragment(state, puzzle, 'B');
    expect(second.progress.attemptCount).toBe(2);
    expect(second.progress.failedAttemptCount).toBe(2);
    expect(second.progress.firstIsolationAttempt).toBe('A');
  });

  it('allows progression with C and keeps solved state coherent', () => {
    let session = reachPuzzle();
    let state = examineAll(session.puzzleState);
    state = isolatePuzzleFragment(state, puzzle, 'A').state;
    state = resetPuzzleAttempt(state, puzzle.id);
    const solved = isolatePuzzleFragment(state, puzzle, 'C');

    expect(solved.outcome).toBe('solved');
    expect(solved.progress).toMatchObject({
      examinedFragments: ['A', 'B', 'C'],
      attemptCount: 2,
      failedAttemptCount: 1,
      firstIsolationAttempt: 'A',
      finalIsolatedFragment: 'C',
      isolatedFragment: 'C',
      status: 'solved',
    });
    expect(resetPuzzleAttempt(solved.state, puzzle.id)).toBe(solved.state);

    session = { ...session, puzzleState: solved.state };
    const advanced = advance(story, session);
    expect(advanced.currentNodeId).toBe('s3_fragment_detected');
    expect(getPuzzleProgress(advanced.puzzleState, puzzle.id)).toEqual(solved.progress);
  });

  it('requires fragment analysis before any isolation attempt', () => {
    const state = activatePuzzle({}, puzzle.id);
    expect(() => isolatePuzzleFragment(state, puzzle, 'C')).toThrow(
      'requires every fragment to be examined first',
    );
    expect(getPuzzleProgress(state, puzzle.id).attemptCount).toBe(0);
  });
});
