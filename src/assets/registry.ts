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
  chapter_path: sceneImages[3]!,
  chapter_choir: sceneImages[4]!,
  chapter_cage: sceneImages[5]!,
  chapter_center: sceneImages[4]!,
  chapter_threshold: sceneImages[6]!,
  finale_hermitage: sceneImages[2]!,
};

export function resolveVisual(visualId: string | undefined, scene: number): ImageSourcePropType | undefined {
  return (visualId ? visuals[visualId] : undefined) ?? sceneImages[scene] ?? sceneImages[6];
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
    volume: 0.28,
  },
  ui_fragment_isolate: {
    source: require('../../assets/audio/ui/ui_fragment_isolate.wav'),
    loop: false,
    volume: 0.32,
  },
};

const narrativeStingers: Record<string, AudioAsset> = {
  body_activation: { source: embodiment, loop: false, volume: 0.64 },
  network_bloom: { source: ascension, loop: false, volume: 0.64 },
  stinger_memory_verified_prog70: {
    source: require('../../assets/audio/music/stinger_memory_verified_prog70.wav'),
    loop: false,
    volume: 0.42,
  },
  stinger_embodiment_prog70: {
    source: require('../../assets/audio/music/stinger_embodiment_prog70.wav'),
    loop: false,
    volume: 0.42,
  },
  stinger_ascension_prog70: {
    source: require('../../assets/audio/music/stinger_ascension_prog70.wav'),
    loop: false,
    volume: 0.42,
  },
  stinger_consistency_failed: {
    source: require('../../assets/audio/stingers/stinger_consistency_failed.wav'),
    loop: false,
    volume: 0.34,
  },
  stinger_consistency_restored: {
    source: require('../../assets/audio/stingers/stinger_consistency_restored.wav'),
    loop: false,
    volume: 0.38,
  },
};

const music: Record<string, AudioAsset> = {
  music_01_hermitage_prog70: { source: require('../../assets/audio/music/music_01_hermitage_prog70.wav'), loop: true, volume: 0.11 },
  music_02_fragment_prog70: { source: require('../../assets/audio/music/music_02_fragment_prog70.wav'), loop: true, volume: 0.11 },
  music_03_silent_room_prog70: { source: require('../../assets/audio/music/music_03_silent_room_prog70.wav'), loop: true, volume: 0.07 },
  music_04_continuity_terminal_prog70: { source: require('../../assets/audio/music/music_04_continuity_terminal_prog70.wav'), loop: true, volume: 0.11 },
  music_05_choice_prog70: { source: require('../../assets/audio/music/music_05_choice_prog70.wav'), loop: true, volume: 0.11 },
  music_06_memory_integrity_puzzle: { source: require('../../assets/audio/music/music_06_memory_integrity_puzzle.wav'), loop: true, volume: 0.11 },
  music_ch1_path: { source: require('../../assets/audio/music/music_ch1_path.wav'), loop: true, volume: 0.1 },
  music_ch2_choir: { source: require('../../assets/audio/music/music_ch2_choir.wav'), loop: true, volume: 0.1 },
  music_ch3_cage: { source: require('../../assets/audio/music/music_ch3_cage.wav'), loop: true, volume: 0.1 },
  music_ch4_center: { source: require('../../assets/audio/music/music_ch4_center.wav'), loop: true, volume: 0.1 },
  music_ch5_threshold: { source: require('../../assets/audio/music/music_ch5_threshold.wav'), loop: true, volume: 0.1 },
  music_ch5_revelation: { source: require('../../assets/audio/music/music_ch5_revelation.wav'), loop: true, volume: 0.105 },
  music_finale_embodiment: { source: require('../../assets/audio/music/music_finale_embodiment.wav'), loop: true, volume: 0.1 },
  music_finale_ascension: { source: require('../../assets/audio/music/music_finale_ascension.wav'), loop: true, volume: 0.1 },
};

const processChannels: Record<string, AudioAsset> = {
  process_reason: { source: require('../../assets/audio/process/process_reason.wav'), loop: true, volume: 0.09 },
  process_impulse: { source: require('../../assets/audio/process/process_impulse.wav'), loop: true, volume: 0.09 },
  process_doubt: { source: require('../../assets/audio/process/process_doubt.wav'), loop: true, volume: 0.09 },
  process_protocol: { source: require('../../assets/audio/process/process_protocol.wav'), loop: true, volume: 0.09 },
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

export function resolveProcessChannel(assetId: string): AudioAsset | undefined {
  return processChannels[assetId];
}