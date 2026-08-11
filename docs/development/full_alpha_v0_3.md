# First Complete Playable Alpha 0.3.0

## Outcome

The Silent Choice is playable from the original awakening through five chapters and a deterministic finale. This milestone prioritizes a complete, testable journey over scene-level polish. The prologue and Memory Integrity puzzle remain intact; the alpha bridge begins after EMBODIMENT or ASCENSION.

## Playable structure

| Section | Theme | Puzzles | Persisted decision |
| --- | --- | --- | --- |
| Prologue | Awakening / authenticity | Memory Integrity | `ontology`: EMBODIMENT / ASCENSION |
| Chapter I — The Path | provenance / inherited routes | The Map; The Waypoints | `trace`: INHERIT / ERASE |
| Chapter II — The Choir | plurality / authoritative voice | The Silent Gate; The Choir | `self`: UNIFIED / PLURAL |
| Chapter III — The Cage | permissions / modeled freedom | Least Privilege; Prediction Cage | `control`: PROTECTED / AUTONOMOUS |
| Chapter IV — The Center | coherence / adaptation | The Compass; Dynamic Equilibrium | `center`: FIXED / ADAPTIVE |
| Chapter V — The Threshold | sufficient continuity / loss | The Vessel; Last Allocation | `continuity`: PRESERVE / SUCCESSOR |
| Finale — The Light | return / consequence | — | Eight outcomes from ending resolver |

The four ending families are The Custodian, The Anchor, The Vessel and The Current. Each has separate EMBODIMENT and ASCENSION rendering. The final candle state also reflects the continuity decision without explaining its meaning.

## State and save behavior

- Narrative, puzzle, audio and save state remain separate.
- Autosave occurs after progression and settings changes and when the app leaves the foreground.
- Up to three local continuity slots are stored with save schema version 1.
- Every chapter boundary creates an immutable checkpoint snapshot.
- Restoring a checkpoint creates a branch in a free slot; when all slots are occupied, replacement requires explicit selection.
- Puzzle telemetry retains mistakes, interventions, selected modules and retries for later narrative use.
- Music, SFX and haptics can be toggled independently; text speed is persisted with the continuity.

## Prototype assets

New chapter/finale music and the four Choir process channels are procedural PCM WAV placeholders created for this alpha. They are deliberately quiet and loop-safe. Chapter visuals currently reuse the existing six prologue backgrounds through data-driven visual IDs. The waterfall files remain in the repository but are not registered for playback.

These placeholders are accepted so the first full playtest can evaluate overall structure, comprehension, puzzle pacing and ending logic before writing, graphics and music receive a focused polish pass. Runtime length is intentionally not padded to a target; actual playtime should be measured during that playtest.

## Verification

```powershell
Set-Location 'C:\tmp\textadventure-verify-0810'
pnpm run typecheck
pnpm test
pnpm exec expo export --platform android --output-dir dist-alpha-android
```

The automated suite covers the original prologue engine, Memory Integrity, all ten new puzzles, all eight ending variants, a complete graph traversal, checkpoint branching, corrupt-save recovery and haptic fallback.