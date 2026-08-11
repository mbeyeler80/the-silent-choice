# The Silent Choice

**The Silent Choice** is a narrative text adventure set in a cyberpunk and posthuman future. It explores identity, freedom, control, spirituality, history, and philosophy through choices and consequences.

## Core concept

The player controls an abstract conscious entity that does not know its origin or its nature. Its search for identity is built around the **Ship of Theseus** paradox: recovering what it once was may transform what it has become.

The central conflict is **freedom versus control**.

## Opening

Consciousness first emerges near an isolated mountain hermitage. The entity understands the world but remembers nothing about itself. Several candles are already burning, and no explanation is given for who lit them or why the entity is there.

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

The game is currently available as a free playable alpha for Android development builds and locally packaged Windows x64 builds.

## Technology

- React Native;
- Expo;
- TypeScript;
- Electron for the isolated Windows wrapper;
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

## Run and package the Windows x64 app

The Windows version uses a static Expo web export inside a separate Electron wrapper. Electron dependencies remain isolated under `desktop/` and do not affect the Android application.

### Prebuilt alpha installer

[Download TheSilentChoiceSetup-0.3.0-alpha.exe](releases/windows/TheSilentChoiceSetup-0.3.0-alpha.exe)

SHA-256: `32591673ABBC42BB38C50B3AB20E7FF035D4BC2FD4A87F7C0197E33905883113`

### Requirements

- Windows x64;
- Node.js and `pnpm`.

Install both dependency sets:

```powershell
pnpm install
pnpm --dir desktop install
```

Export the current game and launch it in Electron for local testing:

```powershell
pnpm run windows:web
pnpm --dir desktop start
```

Create the Windows installer:

```powershell
pnpm run windows:make
```

The generated installer is written to:

```text
desktop/out/installer/TheSilentChoiceSetup.exe
```

Build outputs are intentionally excluded from Git and can be reproduced with the command above. The current alpha is not digitally signed, so Windows SmartScreen may display a warning. A public production release should use a code-signing certificate.

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

## Authorship and license

Created by **Marcel Beyeler**. Copyright © 2026 Marcel Beyeler.

The game is free to play in its current alpha form. No open-source license is granted; all rights are reserved.
