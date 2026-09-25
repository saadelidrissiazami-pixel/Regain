import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { useEffect, useRef } from 'react';

import {
  AMBIENCE_VOLUME,
  isAmbienceChoice,
  type AmbienceChoice,
  type AmbienceId,
} from '../features/wellbeing/ambience';

const SOURCES: Record<AmbienceId, number> = {
  nappe: require('../../assets/audio/nappe.m4a'),
  pluie: require('../../assets/audio/pluie.m4a'),
  vagues: require('../../assets/audio/vagues.m4a'),
  bol: require('../../assets/audio/bol.m4a'),
};

const PREFERENCE_KEY = 'regain.wellbeing.ambience';
const FADE_MS = 1500;
const FADE_STEP_MS = 50;

export async function loadAmbiencePreference(): Promise<AmbienceChoice | null> {
  const saved = await AsyncStorage.getItem(PREFERENCE_KEY).catch(() => null);
  return isAmbienceChoice(saved) ? saved : null;
}

export function saveAmbiencePreference(choice: AmbienceChoice) {
  AsyncStorage.setItem(PREFERENCE_KEY, choice).catch(() => {});
}

/**
 * Plays the chosen ambience on a loop through the session: fading in and out, with the volume
 * lowered while the voice speaks. `active` set to false pauses it (the end of a session).
 */
export function useAmbiencePlayer(choice: AmbienceChoice, { active }: { active: boolean }) {
  const playerRef = useRef<AudioPlayer | null>(null);
  const fadeTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const target = active && choice !== 'off' ? AMBIENCE_VOLUME : 0;

  const stopFade = () => {
    if (fadeTimer.current) clearInterval(fadeTimer.current);
    fadeTimer.current = null;
  };

  useEffect(() => {
    // The music is part of the session: it plays even on silent, and mixes with whatever the
    // person is already listening to instead of cutting it off.
    setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers' }).catch(() => {});
  }, []);

  // One player per ambience, released when it changes or when the session closes.
  useEffect(() => {
    if (choice === 'off') return;
    const player = createAudioPlayer(SOURCES[choice]);
    player.loop = true;
    player.volume = 0;
    playerRef.current = player;
    return () => {
      stopFade();
      if (playerRef.current === player) playerRef.current = null;
      try {
        player.pause();
        player.remove();
      } catch {
        // already released
      }
    };
  }, [choice]);

  // Fade to the intended volume; at zero, playback pauses.
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    if (target > 0 && !player.playing) player.play();

    const start = player.volume;
    const steps = Math.max(1, Math.round(FADE_MS / FADE_STEP_MS));
    let step = 0;
    stopFade();
    fadeTimer.current = setInterval(() => {
      step += 1;
      try {
        player.volume = start + (target - start) * Math.min(1, step / steps);
        if (step >= steps) {
          if (target === 0) player.pause();
          stopFade();
        }
      } catch {
        stopFade();
      }
    }, FADE_STEP_MS);
    return stopFade;
  }, [choice, target]);
}
