# AGENTS.md


## Project


Mobile text adventure with philosophical, spiritual and historical themes in a cyberpunk/posthuman setting.


## Source of truth


Before changing code or content, read at minimum:


- `docs/vision.md`
- `docs/design/game_design.md`
- `docs/design/story.md`
- `docs/design/world.md`
- `docs/design/characters.md`
- `docs/design/mechanics.md`
- `docs/design/ui_ux.md`
- `docs/design/art_direction.md`
- `docs/design/music_direction.md`
- `docs/design/philosophical_framework.md`
- `docs/development/decisions.md`


If code and documentation disagree, do not silently choose one: report the conflict and prefer the latest explicit decision in `decisions.md` until clarified.


## Technology


Target stack:


- React Native
- Expo
- TypeScript
- Visual Studio Code
- Git


Do not introduce a different framework or major dependency without an explicit design/development decision.


## Core design constraints


1. This is a **text adventure**, not a conventional visual novel or action game.
2. Priority: **text > sound > image > animation**.
3. The protagonist begins as an abstract conscious entity with no certain ontological definition.
4. Central philosophical structure: Ship of Theseus / continuity of identity.
5. Central conflict: freedom / control.
6. No simple good/evil morality meter.
7. Philosophical themes must be experienced through situations, choices and consequences, not lectures.
8. The opening takes place at an isolated mountain hermitage with waterfall, wind and lit candles.
9. The first moments contain no music: environmental sound comes first.
10. Avoid defining the protagonist's body, gender or original nature too early.


## Narrative data


Prefer separating narrative content from application logic. Story scenes, choices, fragments, locations and items should eventually live in structured data under `game_data/` rather than being hard-coded throughout UI components.


Do not design the final narrative schema until the first playable scene requirements are clear.


## Code quality


- TypeScript strictness preferred.
- Keep components small and focused.
- Separate rendering, game state and narrative data.
- Avoid premature abstractions.
- Add tests for game-state transformations and branching logic.
- Keep mobile accessibility in mind from the first prototype.


## Change discipline


For meaningful changes:


1. inspect relevant documentation;
2. explain the intended change briefly;
3. implement the smallest coherent change;
4. run relevant checks/tests;
5. update documentation when behavior or architecture changes;
6. update `CHANGELOG.md` for milestones;
7. update `docs/development/decisions.md` for important architectural or design decisions.


Do not rewrite large parts of the project unless required by the task.


## Current phase


The project is currently in **Concept / Design 0.2**. Do not begin broad implementation without an explicit request to start the prototype.