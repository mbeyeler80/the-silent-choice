import {
  resolveEnvironmentalAmbience,
  resolveMusic,
  resolveNarrativeStinger,
  resolveProcessChannel,
  resolveUiTextSound,
} from '../src/assets/registry';
import { fullStory } from '../src/narrative/story';
import { puzzleDefinitions } from '../src/puzzles/registry';

describe('alpha audio registry', () => {
  it('resolves every data-driven music ID', () => {
    const ids = new Set([
      ...fullStory.nodes.map((node) => node.music).filter(Boolean),
      ...puzzleDefinitions.map((puzzle) => puzzle.music),
    ] as string[]);
    for (const id of ids) expect(resolveMusic(id)).toBeDefined();
  });

  it('keeps UI, stinger, process and ambience categories distinct', () => {
    expect(resolveUiTextSound('ui_fragment_open')).toBeDefined();
    expect(resolveNarrativeStinger('stinger_consistency_restored')).toBeDefined();
    expect(resolveProcessChannel('process_reason')).toBeDefined();
    expect(resolveEnvironmentalAmbience('wind_soft')).toBeDefined();
    expect(resolveMusic('process_reason')).toBeUndefined();
  });

  it('does not register waterfall playback', () => {
    expect(resolveEnvironmentalAmbience('waterfall_distant')).toBeUndefined();
    expect(resolveEnvironmentalAmbience('waterfall')).toBeUndefined();
  });
});