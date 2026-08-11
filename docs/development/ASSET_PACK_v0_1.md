# Asset Pack v0.1

## Scene images
Project path: assets/images/backgrounds/

- 01_perception.png
- 02_hermitage.png
- 03_fragment.png
- 04_silent_room.png
- 05_continuity.png
- 06_choice.png

These are 1920x1080 prototype images in one coherent minimal alpine/posthuman visual language.

## UI
Project path: assets/images/ui/

- ui_style_reference_v0_1.png - visual reference board
- ui_assets_v0_1.zip - SVG icons, ui_theme.json, and asset manifest

The terminal UI is rendered natively so text remains editable, accessible and localizable.

## Audio
Project paths: assets/audio/music/, assets/audio/sfx/, assets/audio/ui/, assets/audio/stingers/.

The registry keeps four categories separate:

- music;
- environmental ambience;
- UI/text sounds;
- narrative stingers.

The memory integrity puzzle adds:

- music_06_memory_integrity_puzzle.wav;
- ui_fragment_open.wav;
- ui_fragment_isolate.wav;
- stinger_consistency_failed.wav;
- stinger_consistency_restored.wav.

The waterfall file may remain in the asset pack but is intentionally absent from the active prototype registry and mix.

## Fonts
Project path: assets/fonts/FONT_USAGE.md

Do not expect bundled font binaries. Use:

- @expo-google-fonts/raleway for narrative/UI text;
- @expo-google-fonts/space-mono for terminal/system text.

## Implementation rule
The prototype must degrade gracefully when an asset is missing. Keep narrative text out of images when possible; system UI should be rendered natively so it remains editable and localizable.
