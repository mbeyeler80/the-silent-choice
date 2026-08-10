import type { ContentBlock, NarrativeNode } from './types';

function append(
  blocks: ContentBlock[],
  node: NarrativeNode,
  field: 'text' | 'system' | 'text_after_system' | 'system_end',
  kind: ContentBlock['kind'],
): void {
  node[field]?.forEach((text, index) => {
    blocks.push({ id: `${node.id}-${field}-${index}`, kind, text });
  });
}

export function getContentBlocks(node: NarrativeNode): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  append(blocks, node, 'text', 'narrative');
  append(blocks, node, 'system', 'system');
  append(blocks, node, 'text_after_system', 'narrative');
  append(blocks, node, 'system_end', 'system');
  return blocks;
}
