# Prototype architecture

## Separation of responsibilities

- game_data/story/: narrative nodes, prose, choices, effects and references to optional puzzles.
- game_data/puzzles/: reusable puzzle definitions, fragment content, solution rules, UI labels and audio asset IDs.
- src/narrative/: narrative graph traversal and hidden narrative state.
- src/puzzles/: pure puzzle state transformations and validation.
- src/components/: rendering only; puzzle components interpret definitions rather than embedding narrative content.
- src/hooks/useNarrativeAudio.ts: music, ambience, UI/text sounds and narrative stingers.
- src/assets/registry.ts: asset-ID resolution, category separation and mix levels.

NarrativeSession.puzzleState is intentionally separate from hiddenState. Transient audio events remain outside both state machines in the application layer.

## Memory integrity flow

The story node s2_memory_integrity references memory_integrity_01. Entering the node activates its state. Each fragment examination and isolation is applied through pure functions. The narrative engine rejects automatic advancement until the puzzle status is solved; the UI mirrors that rule by exposing continuation only after the configured solution.

This format supports additional consistency-analysis puzzles without hard-coding their prose or solution in React.
