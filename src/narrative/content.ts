import type { PuzzleDefinition } from '../puzzles/types';
import type {
  ContentBlock,
  DecisionState,
  NarrativeNode,
  NarrativeVariant,
} from './types';

function append(
  blocks: ContentBlock[],
  node: NarrativeNode,
  field: 'text' | 'system' | 'text_after_system' | 'system_end',
  kind: ContentBlock['kind'],
): void {
  node[field]?.forEach((text, index) => {
    blocks.push({ id: node.id + '-' + field + '-' + index, kind, text });
  });
}

function matchingVariants(node: NarrativeNode, decisions: DecisionState): NarrativeVariant[] {
  return (node.variants ?? []).filter(
    (variant) => decisions[variant.decision] === variant.value,
  );
}

export function resolveNarrativeNode(
  node: NarrativeNode,
  decisions: DecisionState,
): NarrativeNode {
  const resolved: NarrativeNode = {
    ...node,
    text: [...(node.text ?? [])],
    system: [...(node.system ?? [])],
    text_after_system: [...(node.text_after_system ?? [])],
    system_end: [...(node.system_end ?? [])],
  };

  for (const variant of matchingVariants(node, decisions)) {
    if (variant.text) resolved.text = [...(resolved.text ?? []), ...variant.text];
    if (variant.system) resolved.system = [...(resolved.system ?? []), ...variant.system];
    if (variant.text_after_system) {
      resolved.text_after_system = [
        ...(resolved.text_after_system ?? []),
        ...variant.text_after_system,
      ];
    }
    if (variant.system_end) {
      resolved.system_end = [...(resolved.system_end ?? []), ...variant.system_end];
    }
    if (variant.visual) resolved.visual = variant.visual;
    if (variant.post_visual) resolved.post_visual = variant.post_visual;
    if (variant.music) resolved.music = variant.music;
    if (variant.ambience) resolved.ambience = variant.ambience;
  }
  return resolved;
}

export function getContentBlocks(
  node: NarrativeNode,
  puzzle?: PuzzleDefinition,
): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  append(blocks, node, 'text', 'narrative');
  append(blocks, node, 'system', 'system');
  puzzle?.intro.forEach((text, index) => {
    blocks.push({
      id: node.id + '-puzzle-intro-' + index,
      kind: 'system',
      text,
    });
  });
  append(blocks, node, 'text_after_system', 'narrative');
  append(blocks, node, 'system_end', 'system');
  return blocks;
}
