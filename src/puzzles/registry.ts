import alphaPuzzleData from '../../game_data/puzzles/alpha_puzzles_v0_3.json';
import memoryIntegrityData from '../../game_data/puzzles/memory_integrity_v0_1.json';

import { validateAlphaPuzzle } from './alphaEngine';
import { validatePuzzle } from './engine';
import {
  isConsistencyPuzzle,
  type AlphaPuzzleDefinition,
  type ConsistencyPuzzleDefinition,
  type PuzzleDefinition,
} from './types';

const memoryIntegrityPuzzle =
  memoryIntegrityData as ConsistencyPuzzleDefinition;
const alphaPuzzles = (
  alphaPuzzleData as unknown as { puzzles: AlphaPuzzleDefinition[] }
).puzzles;

export const puzzleDefinitions: PuzzleDefinition[] = [
  memoryIntegrityPuzzle,
  ...alphaPuzzles,
];

export const puzzlesById: Record<string, PuzzleDefinition> = Object.fromEntries(
  puzzleDefinitions.map((definition) => [definition.id, definition]),
);

export function validatePuzzleRegistry(): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const definition of puzzleDefinitions) {
    if (ids.has(definition.id)) errors.push('Duplicate puzzle ID: ' + definition.id);
    ids.add(definition.id);
    errors.push(
      ...(isConsistencyPuzzle(definition)
        ? validatePuzzle(definition)
        : validateAlphaPuzzle(definition)),
    );
  }
  return errors;
}
