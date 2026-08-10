# Codex Task — Build Prototype v0.1

Implement the first playable mobile vertical slice of this project.

## Read first
- `AGENTS.md`
- `docs/vision.md`
- `docs/design/game_design.md`
- `docs/design/story.md`
- `docs/design/philosophical_framework.md`
- `docs/development/prototype_v0_1.md`
- `game_data/story/prologue_v0_1.json`

## Task
Create a React Native + Expo + TypeScript application in this repository that plays the complete `prologue_v0_1.json` narrative from start through both possible endings.

Do not redesign the story. Do not add new plot content. If a technical ambiguity exists, choose the simplest maintainable implementation consistent with the documentation.

## Requirements
- initialize the Expo/TypeScript project if not already initialized;
- keep narrative data outside React components;
- implement a small data-driven narrative engine supporting `text`, `system`, `text_after_system`, `system_end`, `choices`, `effects`, `next`, `delay_ms`, `visual`, `audio`, and `revisitable`;
- implement hidden state and choice effects;
- implement slow text reveal with tap-to-complete;
- show choices only after the current node has finished revealing;
- visually distinguish narrative text from terminal/system output;
- support placeholder visuals/audio gracefully when assets are absent;
- support portrait mobile layout;
- implement both EMBODIMENT and ASCENSION endings and restart;
- add development-only logging of nodes, choices, hidden-state changes, final path and elapsed time;
- avoid external analytics and unnecessary dependencies;
- add basic tests for narrative traversal / node lookup if practical;
- run TypeScript/lint/tests available in the project and fix errors caused by the implementation.

## UI direction
Dark, minimal, contemplative. The project is a text adventure, not a visual novel. Prioritize readable typography, spacing, pacing and terminal contrast over decorative UI.

## Assets
Do not block on final assets. Use neutral placeholders tied to the visual/audio IDs in the JSON. Never import arbitrary stock artwork as a substitute.

## Completion
When complete:
1. update `docs/development/architecture.md` with the implemented structure;
2. update `docs/development/decisions.md` with important implementation decisions;
3. update `CHANGELOG.md`;
4. add concise run instructions to `README.md`;
5. report exactly which commands I should run in VS Code to launch the prototype on my phone with Expo Go.
