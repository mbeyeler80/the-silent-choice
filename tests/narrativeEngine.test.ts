import storyData from '../game_data/story/prologue_v0_1.json';
import {
  advance,
  createSession,
  getAvailableChoices,
  getNode,
  selectChoice,
  validateStory,
} from '../src/narrative/engine';
import type { NarrativeSession, NarrativeStory } from '../src/narrative/types';

const story = storyData as NarrativeStory;

function choose(session: NarrativeSession, label: string): NarrativeSession {
  const node = getNode(story, session.currentNodeId);
  const choice = getAvailableChoices(node, session).find((candidate) => candidate.label === label);
  if (!choice) throw new Error(`Missing choice at ${node.id}: ${label}`);
  return selectChoice(story, session, choice, 1000);
}

function reachContinuityChoice(): NarrativeSession {
  let session = createSession(story, 0);
  session = choose(session, 'LISTEN TO THE WATER');
  session = advance(story, session);
  session = choose(session, 'ENTER THE HERMITAGE');
  session = choose(session, 'NO');
  session = advance(story, session);
  session = choose(session, 'IGNORE');
  session = choose(session, 'ACCESS THE SYSTEM');
  session = choose(session, 'CONTINUE');
  return session;
}

describe('narrative graph', () => {
  it('contains only valid and unique node references', () => {
    expect(validateStory(story)).toEqual([]);
    expect(getNode(story, 's1_awareness').scene).toBe(1);
    expect(() => getNode(story, 'missing')).toThrow('Narrative node not found');
  });

  it.each([
    ['EMBODIMENT', 's6_embodiment_end'],
    ['ASCENSION', 's6_ascension_end'],
  ])('reaches the %s ending', (path, ending) => {
    let session = reachContinuityChoice();
    session = choose(session, path);
    session = choose(session, 'CONTINUE');
    expect(session.currentNodeId).toBe(ending);
  });

  it('applies hidden effects and removes explored revisitable choices', () => {
    let session = createSession(story, 0);
    session = choose(session, 'WATCH THE FLAMES');
    expect(session.hiddenState.inquiry).toBe(1);
    session = advance(story, session);
    session = choose(session, 'EXAMINE THE CANDLES');
    expect(session.hiddenState.continuity).toBe(1);
    const hub = getNode(story, session.currentNodeId);
    expect(getAvailableChoices(hub, session).map((choice) => choice.label)).not.toContain(
      'EXAMINE THE CANDLES',
    );
  });
});
