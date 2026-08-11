import chapter1Data from '../../game_data/story/chapter_01_path.json';
import chapter2Data from '../../game_data/story/chapter_02_choir.json';
import chapter3Data from '../../game_data/story/chapter_03_cage.json';
import chapter4Data from '../../game_data/story/chapter_04_center.json';
import chapter5Data from '../../game_data/story/chapter_05_threshold.json';
import finaleData from '../../game_data/story/finale_light.json';
import prologueBridgeData from '../../game_data/story/prologue_alpha_bridge_v0_3.json';
import prologueData from '../../game_data/story/prologue_v0_1.json';

import type {
  NarrativeNode,
  NarrativeStory,
  NarrativeVariant,
} from './types';

interface StorySection {
  nodes: NarrativeNode[];
}

interface BridgeData {
  overrides: NarrativeNode[];
}

interface FinaleData extends StorySection {
  shared_variants: NarrativeVariant[];
}

function composePrologue(): NarrativeNode[] {
  const bridge = prologueBridgeData as unknown as BridgeData;
  const overrides = new Map(bridge.overrides.map((node) => [node.id, node]));
  return (prologueData as NarrativeStory).nodes.map((node) => ({
    ...node,
    chapter: node.chapter ?? 'PROLOGUE',
    chapter_title: node.chapter_title ?? 'THE AWAKENING',
    ...(overrides.get(node.id) ?? {}),
  }));
}

function sectionNodes(section: unknown): NarrativeNode[] {
  return (section as StorySection).nodes;
}

function composeFinale(): NarrativeNode[] {
  const finale = finaleData as unknown as FinaleData;
  return finale.nodes.map((node) =>
    node.final_candles
      ? {
          ...node,
          variants: [...finale.shared_variants, ...(node.variants ?? [])],
        }
      : node,
  );
}

export const fullStory: NarrativeStory = {
  ...(prologueData as NarrativeStory),
  id: 'the_silent_choice_alpha_v0_3',
  prototype_end: false,
  nodes: [
    ...composePrologue(),
    ...sectionNodes(chapter1Data),
    ...sectionNodes(chapter2Data),
    ...sectionNodes(chapter3Data),
    ...sectionNodes(chapter4Data),
    ...sectionNodes(chapter5Data),
    ...composeFinale(),
  ],
};
