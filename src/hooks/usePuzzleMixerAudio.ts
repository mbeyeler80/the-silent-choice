import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import { useEffect, useRef } from 'react';

import { resolveProcessChannel } from '../assets/registry';
import type { AlphaPuzzleItem } from '../puzzles/types';

interface MixerChannelState {
  volume: number;
  muted: boolean;
  solo: boolean;
}

export function usePuzzleMixerAudio(
  channels: AlphaPuzzleItem[],
  states: Record<string, MixerChannelState>,
  enabled: boolean,
): void {
  const players = useRef<Record<string, AudioPlayer>>({});

  useEffect(() => {
    if (!enabled || channels.length === 0) {
      for (const player of Object.values(players.current)) {
        try {
          player.pause();
          player.release();
        } catch {
          // Puzzle audio must not block interaction.
        }
      }
      players.current = {};
      return;
    }

    for (const channel of channels) {
      const asset = channel.tone ? resolveProcessChannel(channel.tone) : undefined;
      if (!asset || players.current[channel.id]) continue;
      try {
        const player = createAudioPlayer(asset.source);
        player.loop = true;
        player.volume = 0;
        player.play();
        players.current[channel.id] = player;
      } catch {
        // Missing channel audio degrades to the visible text channel.
      }
    }

    return () => {
      for (const player of Object.values(players.current)) {
        try {
          player.pause();
          player.release();
        } catch {
          // Ignore cleanup errors.
        }
      }
      players.current = {};
    };
  }, [channels, enabled]);

  useEffect(() => {
    const soloed = Object.entries(states)
      .filter(([, state]) => state.solo && !state.muted && state.volume > 0)
      .map(([id]) => id);
    for (const channel of channels) {
      const player = players.current[channel.id];
      const asset = channel.tone ? resolveProcessChannel(channel.tone) : undefined;
      const state = states[channel.id];
      if (!player || !asset || !state) continue;
      const audible =
        !state.muted && state.volume > 0 && (soloed.length === 0 || soloed.includes(channel.id));
      player.volume = audible ? asset.volume * (state.volume / 4) : 0;
    }
  }, [channels, states]);
}
