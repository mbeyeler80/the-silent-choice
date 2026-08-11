# Changelog

## 2026-08-11 - First Complete Playable Alpha 0.3.0

### Added
- complete data-driven journey: preserved Prologue, five chapters and Finale;
- ten chapter puzzles using one reusable puzzle action/state framework;
- six persistent narrative decisions and deterministic resolution of eight ending variants;
- versioned local autosave, three continuity slots, chapter checkpoints and checkpoint branching;
- independent music, SFX, haptics and text-speed settings;
- chapter/finale prototype music, four process-channel loops and narrative haptic cues;
- automated coverage for the complete journey, puzzles, endings, saves and fallback behavior.

### Updated
- application shell with main menu, archive, slot replacement flow and return-at-checkpoint behavior;
- fixed The Map touch handling so every node remains selectable inside the narrative scroll view;
- replaced the unreliable Prediction Cage long-press with an accessible tap target unlocked after three predictions;
- redesigned The Compass around three labeled identity signals: each condition explicitly declares which signals belong inside or outside, and validation now uses the geometry shown instead of hidden target values;
- clarified Dynamic Equilibrium with persistent context numbering, visible accepted ranges and explicit next-context feedback while preserving adaptive carry-over;
- added a data-driven real-life interpretation to every Dynamic Equilibrium context, connecting its calibration to uncertainty, trust and crisis;
- clarified Last Allocation with visible phase minimums, free capacity, parameter meanings, precise deficit feedback, a philosophical rationale for each resource shift and a one-minute window per phase;
- narrative/audio registries for composed story data, two-second music crossfades and chapter placeholders;
- architecture and playtest documentation for the full alpha milestone.

### Known alpha placeholders
- chapter visuals reuse existing prologue backgrounds;
- new soundtrack loops are short procedural drafts;
- writing and pacing are intentionally unpadded pending the first full playtest.
## 2026-08-11 - Memory integrity puzzle

### Added
- reusable, data-driven consistency puzzle format under game_data/puzzles/;
- terminal interaction with three inspectable memory fragments and three fading candle lights;
- persistent puzzle state for examined fragments, attempts, first isolation and final isolated fragment;
- a dedicated 35-second low-volume 7/8 puzzle loop, two UI cues and two narrative stingers;
- engine-level progression guard and regression tests for activation, failure, reset and solution.

### Updated
- inserted the puzzle after the first terminal identity exchange and before scene 3 without changing existing prose, choices or endings;
- extended narrative audio with solution ducking while preserving the existing two-second music crossfade.

## 2026-08-10 - Prog 70s music pack v0.2

### Added
- data-driven `music` asset IDs on every prologue node;
- separate registries and playback paths for music, environmental ambience, UI/text sounds and narrative stingers;
- approximately two-second music crossfades with a deliberately low music mix;
- memory verification, EMBODIMENT and ASCENSION stingers from the Prog 70s pack;
- regression coverage for scene-to-music and event-to-stinger mappings.
- 42-second vertical promotional trailer and poster under `trailer/`.

### Updated
- migrated narrative ambience cues from the generic `audio` field to `ambience`.
- removed waterfall playback cues from the prototype mix while preserving narrative text.

## 2026-08-10 - Prototype v0.1 specification

### Added
- canonical rule `KNOWLEDGE != MEMORY`;
- complete six-scene prologue structure through EMBODIMENT / ASCENSION;
- `game_data/story/prologue_v0_1.json` as data-driven narrative source;
- `docs/development/prototype_v0_1.md` with implementation scope and acceptance criteria;
- playtest procedure and post-test questions in `docs/development/testing.md`;
- cybersecurity concepts as narrative mechanics: authentication, integrity, trust, access, recovery and continuity.

### Prototype scope
- target duration: 10–15 minutes;
- both EMBODIMENT and ASCENSION endings reachable;
- prototype ends immediately after the first ontological choice;
- no final art/audio required; placeholders are allowed;
- final game language: English, while design discussion may remain in Italian.

## 2026-08-08 - Concept / Design 0.2

### Added
- definita l'entità cosciente astratta come protagonista;
- definito l'obiettivo iniziale: ritrovare se stesso e le proprie origini;
- definita l'apertura presso un eremo isolato in alta montagna;
- aggiunti cascata, vento e candele accese come elementi canonici del prologo;
- stabilito l'uso di testo descrittivo a scorrimento nell'introduzione;
- stabilita la gerarchia espressiva testo > suono > immagine > animazione;
- introdotti assi identitari nascosti al posto di un sistema bene/male;
- definita la meccanica narrativa dei frammenti e della Nave di Teseo;
- introdotto il silenzio come possibile scelta;
- aggiunto `docs/design/philosophical_framework.md` basato sui testi filosofici e spirituali forniti dall'autore;
- definite prime linee guida per UI/UX, art direction e sound direction.

### Updated
- `docs/vision.md` -> versione 0.2;
- `docs/design/game_design.md`;
- `docs/design/story.md`;
- `docs/design/world.md`;
- `docs/design/characters.md`;
- `docs/design/mechanics.md`;
- `docs/design/ui_ux.md`;
- `docs/design/art_direction.md`;
- `docs/design/music_direction.md`;
- `docs/development/decisions.md`.
