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

const waterfall = require('../../assets/audio/sfx/01_waterfall_distant_loop.wav');
const wind = require('../../assets/audio/sfx/02_wind_soft_loop.wav');
const interior = require('../../assets/audio/sfx/03_hermitage_interior_loop.wav');
const machine = require('../../assets/audio/sfx/04_machine_pulse_loop.wav');
const silence = require('../../assets/audio/sfx/05_silent_room_loop.wav');
const embodiment = require('../../assets/audio/sfx/06_transition_embodiment.wav');
const ascension = require('../../assets/audio/sfx/07_transition_ascension.wav');

const audio: Record<string, AudioAsset> = {
  waterfall_distant: { source: waterfall, loop: true, volume: 0.42 },
  waterfall_muffled: { source: interior, loop: true, volume: 0.28 },
  waterfall_internal_memory: { source: waterfall, loop: true, volume: 0.22 },
  waterfall_return: { source: waterfall, loop: true, volume: 0.34 },
  wind_soft: { source: wind, loop: true, volume: 0.2 },
  machine_pulse_low: { source: machine, loop: true, volume: 0.12 },
  near_silence: { source: silence, loop: true, volume: 0.28 },
  body_activation: { source: embodiment, loop: false, volume: 0.72 },
  network_bloom: { source: ascension, loop: false, volume: 0.72 },
};

export function resolveAudioCue(cueId: string): AudioAsset | undefined {
  return audio[cueId];
}
