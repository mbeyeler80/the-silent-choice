import { advance, createSession, getAvailableChoices, getNode, isEnding, selectChoice, validateStory } from '../src/narrative/engine';
import { fullStory } from '../src/narrative/story';
import { puzzlesById, validatePuzzleRegistry } from '../src/puzzles/registry';

describe('complete alpha journey', () => {
  it('has valid narrative and puzzle references across prologue, five chapters and finale', () => {
    expect(validateStory(fullStory)).toEqual([]);
    expect(validatePuzzleRegistry()).toEqual([]);
    expect(new Set(fullStory.nodes.map((node) => node.chapter))).toEqual(
      new Set(['PROLOGUE', 'CHAPTER I', 'CHAPTER II', 'CHAPTER III', 'CHAPTER IV', 'CHAPTER V', 'FINALE']),
    );
    for (const node of fullStory.nodes) {
      if (node.puzzle) expect(puzzlesById[node.puzzle]).toBeDefined();
    }
  });

  it('can traverse from awakening through all chapters to one resolved finale', () => {
    let session = createSession(fullStory, 0);
    let steps = 0;
    while (steps < 400) {
      const node = getNode(fullStory, session.currentNodeId);
      if (isEnding(node)) break;
      if (node.puzzle) {
        const progress = session.puzzleState[node.puzzle]!;
        session = {
          ...session,
          puzzleState: {
            ...session.puzzleState,
            [node.puzzle]: { ...progress, status: 'solved' },
          },
        };
        session = advance(fullStory, session);
      } else {
        const choices = getAvailableChoices(node, session).filter(
          (choice) => choice.action !== 'RETURN_TO_MENU',
        );
        if (choices.length > 0) {
          const nextChoice = choices.find((choice) =>
            !session.choiceHistory.some((record) =>
              record.nodeId === node.id && record.label === choice.label,
            ),
          ) ?? choices[0]!;
          session = selectChoice(fullStory, session, nextChoice, steps);
        }
        else session = advance(fullStory, session);
      }
      steps += 1;
    }

    const ending = getNode(fullStory, session.currentNodeId);
    expect(isEnding(ending)).toBe(true);
    expect(ending.id).toBe('finale_the_custodian_embodiment');
    expect(session.decisions).toEqual({
      ontology: 'EMBODIMENT',
      trace: 'INHERIT',
      self: 'UNIFIED',
      control: 'PROTECTED',
      center: 'FIXED',
      continuity: 'PRESERVE',
    });
    expect(steps).toBeLessThan(400);
  });
});