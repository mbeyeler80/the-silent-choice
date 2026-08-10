# Asset Pack v0.1

## Scene images
Drive path: `assets/images/backgrounds/`

- `01_perception.png`
- `02_hermitage.png`
- `03_fragment.png`
- `04_silent_room.png`
- `05_continuity.png`
- `06_choice.png`

These are 1920x1080 prototype images in one coherent minimal alpine/posthuman visual language.

## UI
Drive path: `assets/images/ui/`

- `ui_style_reference_v0_1.png` — visual reference board
- `ui_assets_v0_1.zip` — SVG icons, `ui_theme.json`, and asset manifest

Extract the ZIP into the local project asset tree before wiring UI components.

## Audio
Drive path: `assets/audio/sfx/`

- `01_waterfall_distant_loop.wav`
- `02_wind_soft_loop.wav`
- `03_hermitage_interior_loop.wav`
- `04_machine_pulse_loop.wav`
- `05_silence_room_loop.wav`
- `06_transition_embodiment.wav`
- `07_transition_ascension.wav`
- `08_candle_extinguish.wav`

The first five are ambience/loops; the last three are one-shots/transitions.

## Fonts
Drive path: `assets/fonts/FONT_USAGE.md`

Do not expect bundled font binaries. Use:
- `@expo-google-fonts/raleway` for narrative/UI text
- `@expo-google-fonts/space-mono` for terminal/system text

## Implementation rule
The prototype must degrade gracefully when an asset is missing, but these v0.1 files should be used by default. Keep narrative text out of images when possible; system UI should be rendered natively so it remains editable and localizable.
