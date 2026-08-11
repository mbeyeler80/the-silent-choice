import type { ImageSourcePropType } from 'react-native';

export interface AudioAsset {
  source: number;
  loop: boolean;
  volume: number;
}

const sceneImages: Record<number, ImageSourcePropType> = {
  1: require('../../assets/images/backgrounds/01_perception.png'),
  2: require('../../assets/images/backgrounds/02_hermitage.png'),
  3: require('../../assets/images/backgrounds/03_fragment.png'),
  4: require('../../assets/images/backgrounds/04_silent_room.png'),
  5: require('../../assets/images/backgrounds/05_continuity.png'),
  6: require('../../assets/images/backgrounds/06_choice.png'),
};

const visuals: Record<string, ImageSourcePropType> = {
  hermitage_exterior_dim: sceneImages[1]!,
  hermitage_exterior_full: sceneImages[2]!,
  hermitage_interior: sceneImages[3]!,
  silent_room: sceneImages[4]!,
  black_to_physical: sceneImages[6]!,
  network_transition: sceneImages[6]!,
  three_candles_one_extinguishes: sceneImages[6]!,
};

export function resolveVisual(visualId: string | undefined, scene: number): ImageSourcePropType | undefined {
  return (visualId ? visuals[visualId] : undefined) ?? sceneImages[scene];
}

const wind = require('../../assets/audio/sfx/02_wind_soft_loop.wav');
const interior = require('../../assets/audio/sfx/03_hermitage_interior_loop.wav');
const machine = require('../../assets/audio/sfx/04_machine_pulse_loop.wav');
const silence = require('../../assets/audio/sfx/05_silent_room_loop.wav');
const embodiment = require('../../assets/audio/sfx/06_transition_embodiment.wav');
const ascension = require('../../assets/audio/sfx/07_transition_ascension.wav');

const environmentalAmbience: Record<string, AudioAsset> = {
  hermitage_interior: { source: interior, loop: true, volume: 0.1 },
  wind_soft: { source: wind, loop: true, volume: 0.1 },
  machine_pulse_low: { source: machine, loop: true, volume: 0.08 },
  near_silence: { source: silence, loop: true, volume: 0.1 },
};

const uiTextSounds: Record<string, AudioAsset> = {
  ui_fragment_open: {
    source: require('../../assets/audio/ui/ui_fragment_open.wav'),
    loop: false,
    volume: 0.34,
  },
  ui_fragment_isolate: {
    source: require('../../assets/audio/ui/ui_fragment_isolate.wav'),
    loop: false,
    volume: 0.38,
  },
};

const narrativeStingers: Record<string, AudioAsset> = {
  body_activation: { source: embodiment, loop: false, volume: 0.72 },
  network_bloom: { source: ascension, loop: false, volume: 0.72 },
  stinger_memory_verified_prog70: {
    source: require('../../assets/audio/music/stinger_memory_verified_prog70.wav'),
    loop: false,
    volume: 0.48,
  },
  stinger_embodiment_prog70: {
    source: require('../../assets/audio/music/stinger_embodiment_prog70.wav'),
    loop: false,
    volume: 0.48,
  },
  stinger_ascension_prog70: {
    source: require('../../assets/audio/music/stinger_ascension_prog70.wav'),
    loop: false,
    volume: 0.48,
  },
  stinger_consistency_failed: {
    source: require('../../assets/audio/stingers/stinger_consistency_failed.wav'),
    loop: false,
    volume: 0.4,
  },
  stinger_consistency_restored: {
    source: require('../../assets/audio/stingers/stinger_consistency_restored.wav'),
    loop: false,
    volume: 0.44,
  },
};

const music: Record<string, AudioAsset> = {
  music_01_hermitage_prog70: {
    source: require('../../assets/audio/music/music_01_hermitage_prog70.wav'),
    loop: true,
    volume: 0.12,
  },
  music_02_fragment_prog70: {
    source: require('../../assets/audio/music/music_02_fragment_prog70.wav'),
    loop: true,
    volume: 0.12,
  },
  music_03_silent_room_prog70: {
    source: require('../../assets/audio/music/music_03_silent_room_prog70.wav'),
    loop: true,
    volume: 0.08,
  },
  music_04_continuity_terminal_prog70: {
    source: require('../../assets/audio/music/music_04_continuity_terminal_prog70.wav'),
    loop: true,
    volume: 0.12,
  },
  music_05_choice_prog70: {
    source: require('../../assets/audio/music/music_05_choice_prog70.wav'),
    loop: true,
    volume: 0.12,
  },
  music_06_memory_integrity_puzzle: {
    source: require('../../assets/audio/music/music_06_memory_integrity_puzzle.wav'),
    loop: true,
    volume: 0.12,
  },
};

export function resolveMusic(assetId: string): AudioAsset | undefined {
  return music[assetId];
}

export function resolveEnvironmentalAmbience(assetId: string): AudioAsset | undefined {
  return environmentalAmbience[assetId];
}

export function resolveUiTextSound(assetId: string): AudioAsset | undefined {
  return uiTextSounds[assetId];
}

export function resolveNarrativeStinger(assetId: string): AudioAsset | undefined {
  return narrativeStingers[assetId];
}
