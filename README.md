# The Silent Choice

**The Silent Choice** is a mobile narrative text adventure set in a cyberpunk and posthuman future. It explores identity, freedom, control, spirituality, history, and philosophy through choices and consequences.

## Core concept

The player controls an abstract conscious entity that does not know its origin or its nature. Its search for identity is built around the **Ship of Theseus** paradox: recovering what it once was may transform what it has become.

The central conflict is **freedom versus control**.

## Opening

Consciousness first emerges near an isolated mountain hermitage. The first perceptions are a distant waterfall and the wind. Several candles are already burning. The entity does not know why it is there or where it should go.

The prologue uses progressively revealed descriptive text. The expressive hierarchy of the project is:

**text > sound > image > animation**

## Current status

**First Complete Playable Alpha 0.3.0**

The playable journey includes:

- a Prologue, five chapters, and a complete Finale;
- eleven narrative puzzles;
- six persistent decisions;
- eight ending variants;
- local autosave;
- three continuity slots and chapter checkpoints.

This alpha prioritizes a complete end-to-end experience. Some backgrounds and music tracks are intentional placeholders that will be refined after full playtesting.

## Technology

- React Native;
- Expo;
- TypeScript;
- Git.

## Run the mobile app

### Requirements

- Node.js and `pnpm`;
- Android Studio with a configured emulator, or an Android phone with Expo Go.

Install the project dependencies from the repository directory:

```powershell
pnpm install
```

### Android emulator

Start the emulator from Android Studio first, then run:

```powershell
pnpm exec expo start --android --clear
```

If Metro is already running, press `a` in the terminal to open the game in the Android emulator.

### Physical Android device with Expo Go

Connect the computer and phone to the same network, then run:

```powershell
pnpm exec expo start --clear
```

Open Expo Go on the phone and scan the QR code displayed by Metro.

## Validation

Run the TypeScript check and automated test suite with:

```powershell
pnpm run typecheck
pnpm test
```

## Project documentation

- `docs/vision.md` — project vision;
- `docs/design/game_design.md` — experience structure;
- `docs/design/story.md` — story and prologue;
- `docs/design/world.md` — setting and recurring motifs;
- `docs/design/characters.md` — protagonist and characters;
- `docs/design/mechanics.md` — choices, fragments, and identity systems;
- `docs/design/ui_ux.md` — mobile interface and accessibility;
- `docs/design/art_direction.md` — visual direction;
- `docs/design/music_direction.md` — music and sound direction;
- `docs/design/philosophical_framework.md` — philosophical framework;
- `docs/development/architecture.md` — application architecture;
- `docs/development/decisions.md` — canonical development decisions;
- `docs/development/full_alpha_v0_3.md` — alpha milestone scope and known placeholders;
- `CHANGELOG.md` — project history.
