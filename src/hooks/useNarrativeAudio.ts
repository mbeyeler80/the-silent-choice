import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { useEffect, useRef } from 'react';

import { resolveAudioCue } from '../assets/registry';

function release(players: AudioPlayer[]): void {
  players.forEach((player) => {
    try {
      player.pause();
      player.release();
    } catch {
      // Audio is atmospheric; an unsupported/missing player must never block the story.
    }
  });
}

export function useNarrativeAudio(cues: string[] | undefined, enabled: boolean): void {
  const players = useRef<AudioPlayer[]>([]);
  const latestCues = useRef<string[] | undefined>(cues);
  const cueKey = cues?.join('|') ?? '';

  useEffect(() => {
    void setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers' });
  }, []);

  useEffect(() => {
    if (cues) latestCues.current = cues;
    if (!enabled) {
      release(players.current);
      players.current = [];
      return;
    }
    if (!cues && players.current.length > 0) return;

    const effectiveCues = cues ?? latestCues.current;
    if (!effectiveCues) return;
    release(players.current);
    players.current = [];

    for (const cue of effectiveCues) {
      const asset = resolveAudioCue(cue);
      if (!asset) {
        if (typeof __DEV__ !== 'undefined' && __DEV__) console.info(`[audio] placeholder: ${cue}`);
        continue;
      }
      try {
        const player = createAudioPlayer(asset.source);
        player.loop = asset.loop;
        player.volume = asset.volume;
        player.play();
        players.current.push(player);
      } catch (error) {
        if (typeof __DEV__ !== 'undefined' && __DEV__) console.warn(`[audio] ${cue}`, error);
      }
    }
    // cueKey deliberately represents the array contents without depending on its identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cueKey, enabled]);

  useEffect(() => () => release(players.current), []);
}
