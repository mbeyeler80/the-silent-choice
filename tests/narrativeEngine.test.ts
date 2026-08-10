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

  it('maps music by scene and data-drives the requested narrative stingers', () => {
    const expectedMusic = {
      1: 'music_01_hermitage_prog70',
      2: 'music_01_hermitage_prog70',
      3: 'music_02_fragment_prog70',
      4: 'music_03_silent_room_prog70',
      5: 'music_04_continuity_terminal_prog70',
      6: 'music_05_choice_prog70',
    } as const;

    for (const node of story.nodes) {
      expect(node.music).toBe(expectedMusic[node.scene as keyof typeof expectedMusic]);
      expect(node.ambience?.some((cue) => cue.includes('waterfall')) ?? false).toBe(false);
    }

    expect(getNode(story, 's3_fragment_verify').stingers).toEqual([
      'stinger_memory_verified_prog70',
    ]);
    expect(getNode(story, 's6_embodiment_end').stingers).toEqual([
      'stinger_embodiment_prog70',
    ]);
    expect(getNode(story, 's6_ascension_end').stingers).toEqual([
      'stinger_ascension_prog70',
    ]);
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
