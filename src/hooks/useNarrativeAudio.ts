import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { useEffect, useRef } from 'react';

import {
  resolveEnvironmentalAmbience,
  resolveMusic,
  resolveNarrativeStinger,
  resolveUiTextSound,
  type AudioAsset,
} from '../assets/registry';

const MUSIC_CROSSFADE_MS = 2000;
const MUSIC_DUCK_MS = 300;
const FADE_STEP_MS = 50;

interface NarrativeAudio {
  music?: string;
  musicVolumeScale?: number;
  ambience?: string[];
  uiSounds?: string[];
  stingers?: string[];
  stingerDelayMs?: number;
  eventKey?: string;
}

interface ActiveMusic {
  id: string;
  player: AudioPlayer;
  targetVolume: number;
}

function release(players: AudioPlayer[]): void {
  players.forEach((player) => {
    try {
      player.pause();
      player.release();
    } catch {
      // Audio must never block the story when a player or asset is unavailable.
    }
  });
}

function createPlayers(
  ids: string[],
  resolve: (id: string) => AudioAsset | undefined,
  category: string,
): AudioPlayer[] {
  const players: AudioPlayer[] = [];

  for (const id of ids) {
    const asset = resolve(id);
    if (!asset) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.info('[audio:' + category + '] placeholder: ' + id);
      }
      continue;
    }

    try {
      const player = createAudioPlayer(asset.source);
      player.loop = asset.loop;
      player.volume = asset.volume;
      player.play();
      players.push(player);
    } catch (error) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.warn('[audio:' + category + '] ' + id, error);
      }
    }
  }

  return players;
}

export function useNarrativeAudio(audio: NarrativeAudio, enabled: boolean): void {
  const ambiencePlayers = useRef<AudioPlayer[]>([]);
  const uiPlayers = useRef<AudioPlayer[]>([]);
  const stingerPlayers = useRef<AudioPlayer[]>([]);
  const stingerTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const activeMusic = useRef<ActiveMusic | undefined>(undefined);
  const fadingOutMusic = useRef<AudioPlayer | undefined>(undefined);
  const musicFade = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const musicMixFade = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const latestAmbience = useRef<string[] | undefined>(undefined);
  const lastMusicVolumeScale = useRef(audio.musicVolumeScale ?? 1);

  const ambienceKey = audio.ambience?.join('|') ?? '__inherit__';
  const uiKey = audio.uiSounds?.join('|') ?? '';
  const stingerKey = audio.stingers?.join('|') ?? '';
  const musicVolumeScale = Math.max(0, Math.min(1, audio.musicVolumeScale ?? 1));

  useEffect(() => {
    void setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers' });
  }, []);

  useEffect(() => {
    if (musicFade.current) clearInterval(musicFade.current);
    if (musicMixFade.current) clearInterval(musicMixFade.current);
    musicFade.current = undefined;
    musicMixFade.current = undefined;
    if (fadingOutMusic.current) release([fadingOutMusic.current]);
    fadingOutMusic.current = undefined;

    if (!enabled) {
      if (activeMusic.current) release([activeMusic.current.player]);
      activeMusic.current = undefined;
      return;
    }

    if (activeMusic.current?.id === audio.music) return;
    lastMusicVolumeScale.current = musicVolumeScale;

    const outgoing = activeMusic.current;
    const asset = audio.music ? resolveMusic(audio.music) : undefined;
    let incoming: ActiveMusic | undefined;

    if (audio.music && !asset && typeof __DEV__ !== 'undefined' && __DEV__) {
      console.info('[audio:music] placeholder: ' + audio.music);
    }

    if (asset) {
      try {
        const player = createAudioPlayer(asset.source);
        player.loop = asset.loop;
        player.volume = 0;
        player.play();
        incoming = { id: audio.music!, player, targetVolume: asset.volume };
      } catch (error) {
        if (typeof __DEV__ !== 'undefined' && __DEV__) {
          console.warn('[audio:music] ' + audio.music, error);
        }
      }
    }

    activeMusic.current = incoming;
    fadingOutMusic.current = outgoing?.player;
    const outgoingStartVolume = outgoing?.player.volume ?? 0;
    const startedAt = Date.now();

    musicFade.current = setInterval(() => {
      const progress = Math.min(1, (Date.now() - startedAt) / MUSIC_CROSSFADE_MS);
      if (outgoing) outgoing.player.volume = outgoingStartVolume * (1 - progress);
      if (incoming) {
        incoming.player.volume = incoming.targetVolume * musicVolumeScale * progress;
      }

      if (progress >= 1) {
        if (musicFade.current) clearInterval(musicFade.current);
        musicFade.current = undefined;
        if (outgoing) release([outgoing.player]);
        fadingOutMusic.current = undefined;
      }
    }, FADE_STEP_MS);
  }, [audio.music, enabled, musicVolumeScale]);

  useEffect(() => {
    if (lastMusicVolumeScale.current === musicVolumeScale) return;
    lastMusicVolumeScale.current = musicVolumeScale;

    const active = activeMusic.current;
    if (!enabled || !active) return;

    if (musicMixFade.current) clearInterval(musicMixFade.current);
    const startedAt = Date.now();
    const startVolume = active.player.volume;
    const targetVolume = active.targetVolume * musicVolumeScale;

    musicMixFade.current = setInterval(() => {
      const progress = Math.min(1, (Date.now() - startedAt) / MUSIC_DUCK_MS);
      active.player.volume = startVolume + (targetVolume - startVolume) * progress;

      if (progress >= 1) {
        if (musicMixFade.current) clearInterval(musicMixFade.current);
        musicMixFade.current = undefined;
      }
    }, FADE_STEP_MS);
  }, [enabled, musicVolumeScale]);

  useEffect(() => {
    if (audio.ambience !== undefined) latestAmbience.current = audio.ambience;
    if (!enabled) {
      release(ambiencePlayers.current);
      ambiencePlayers.current = [];
      return;
    }
    if (audio.ambience === undefined && ambiencePlayers.current.length > 0) return;

    const ambience = audio.ambience ?? latestAmbience.current;
    if (!ambience) return;
    release(ambiencePlayers.current);
    ambiencePlayers.current = createPlayers(
      ambience,
      resolveEnvironmentalAmbience,
      'ambience',
    );
  }, [ambienceKey, enabled]);

  useEffect(() => {
    release(uiPlayers.current);
    uiPlayers.current = enabled
      ? createPlayers(audio.uiSounds ?? [], resolveUiTextSound, 'ui')
      : [];
  }, [audio.eventKey, enabled, uiKey]);

  useEffect(() => {
    if (stingerTimer.current) clearTimeout(stingerTimer.current);
    stingerTimer.current = undefined;
    release(stingerPlayers.current);
    stingerPlayers.current = [];

    if (!enabled) return;
    const playStingers = () => {
      stingerPlayers.current = createPlayers(
        audio.stingers ?? [],
        resolveNarrativeStinger,
        'stinger',
      );
    };
    if ((audio.stingerDelayMs ?? 0) > 0) {
      stingerTimer.current = setTimeout(playStingers, audio.stingerDelayMs);
    } else {
      playStingers();
    }
  }, [audio.eventKey, audio.stingerDelayMs, enabled, stingerKey]);

  useEffect(
    () => () => {
      if (musicFade.current) clearInterval(musicFade.current);
      if (musicMixFade.current) clearInterval(musicMixFade.current);
      if (stingerTimer.current) clearTimeout(stingerTimer.current);
      release([
        ...ambiencePlayers.current,
        ...uiPlayers.current,
        ...stingerPlayers.current,
        ...(activeMusic.current ? [activeMusic.current.player] : []),
        ...(fadingOutMusic.current ? [fadingOutMusic.current] : []),
      ]);
    },
    [],
  );
}
