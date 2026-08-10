# Changelog

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
