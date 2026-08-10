import { useCallback, useEffect, useMemo, useState } from 'react';

import type { ContentBlock } from '../narrative/types';

interface RevealResult {
  complete: boolean;
  visibleLengths: number[];
  completeNow: () => void;
}

export function useTextReveal(
  nodeId: string,
  blocks: ContentBlock[],
  millisecondsPerCharacter: number,
  initialDelayMs: number,
): RevealResult {
  const total = useMemo(() => blocks.reduce((sum, block) => sum + block.text.length, 0), [blocks]);
  const [visible, setVisible] = useState(0);
  const [delayFinished, setDelayFinished] = useState(initialDelayMs === 0);

  useEffect(() => {
    setVisible(0);
    setDelayFinished(initialDelayMs === 0);
    if (initialDelayMs === 0) return;
    const timeout = setTimeout(() => setDelayFinished(true), initialDelayMs);
    return () => clearTimeout(timeout);
  }, [initialDelayMs, nodeId]);

  useEffect(() => {
    if (!delayFinished || visible >= total) return;
    if (millisecondsPerCharacter === 0) {
      setVisible(total);
      return;
    }
    const timeout = setTimeout(
      () => setVisible((current) => Math.min(total, current + 1)),
      millisecondsPerCharacter,
    );
    return () => clearTimeout(timeout);
  }, [delayFinished, millisecondsPerCharacter, total, visible]);

  const completeNow = useCallback(() => {
    setDelayFinished(true);
    setVisible(total);
  }, [total]);

  let remaining = visible;
  const visibleLengths = blocks.map((block) => {
    const length = Math.min(block.text.length, remaining);
    remaining = Math.max(0, remaining - block.text.length);
    return length;
  });

  return { complete: delayFinished && visible >= total, visibleLengths, completeNow };
}
