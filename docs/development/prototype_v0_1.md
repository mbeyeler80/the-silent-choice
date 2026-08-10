# Prototype v0.1 — Vertical Slice

**Target:** mobile prototype, React Native + Expo + TypeScript.  
**Goal:** 10–15 minute playable test ending immediately after EMBODIMENT or ASCENSION.

## Canonical rules
- Text is primary: text > sound > image > animation.
- Final game language is English.
- `KNOWLEDGE != MEMORY`: the entity has semantic/procedural knowledge but lacks reliable autobiographical memory.
- No visible morality/stat bars.
- Choices update hidden state.
- Cybersecurity concepts are narrative mechanics: identity, authentication, integrity, trust, access and recovery.
- The player must never need cybersecurity knowledge to understand a choice.

## Implementation scope
Build only the vertical slice in `game_data/story/prologue_v0_1.json`. Do not implement later chapters.

Required components:
1. splash/start screen;
2. narrative scene view with slowly revealed text;
3. choice buttons;
4. terminal/system-message presentation distinct from narration;
5. scene-image slot;
6. ambient audio controller;
7. hidden game-state store;
8. restart control after ending.

## Data-driven requirement
Narrative text and branching must be loaded from JSON. Do not hard-code prose in React components. Components should interpret nodes, text arrays, choices, effects, next IDs, audio cues and visual IDs.

## First prototype assets
Real art/audio may be missing. Use clearly marked placeholders without blocking development. Do not add unrelated stock assets.

## UX
- portrait orientation first;
- dark, minimal interface;
- generous margins;
- readable typography;
- text reveal speed configurable and skippable by tapping;
- choices appear only after current text is fully revealed;
- optional/revisitable nodes must not trap the player;
- no conventional RPG HUD.

## Playtest instrumentation
For local development, keep a simple debug log, not visible in normal play, containing node IDs visited, choices selected, hidden-state changes, final path and approximate completion time. No analytics service is required for v0.1.

## Acceptance criteria
The prototype is ready when:
- `npx expo start` launches successfully;
- the whole prologue can be completed on a phone;
- both final paths are reachable;
- restart works;
- no narrative prose is hard-coded in UI components;
- missing images/audio degrade gracefully;
- TypeScript checks and available tests pass.

## Codex workflow
Before coding, read `AGENTS.md`, `docs/vision.md`, `docs/design/game_design.md`, `docs/design/story.md`, `docs/design/philosophical_framework.md`, and this file.

Keep changes focused on prototype v0.1. Record significant implementation decisions in `docs/development/decisions.md` and update `CHANGELOG.md`.
