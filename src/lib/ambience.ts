import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { useEffect, useRef } from 'react';

import {
  AMBIENCE_DUCKED_VOLUME,
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
 * Joue l'ambiance choisie en boucle pendant la séance : fondu à l'entrée comme à la sortie,
 * volume abaissé quand la voix guide. `active` à false met en pause (fin de séance).
 */
export function useAmbiencePlayer(choice: AmbienceChoice, { active, ducked }: { active: boolean; ducked: boolean }) {
  const playerRef = useRef<AudioPlayer | null>(null);
  const fadeTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const target = active && choice !== 'off' ? (ducked ? AMBIENCE_DUCKED_VOLUME : AMBIENCE_VOLUME) : 0;

  const stopFade = () => {
    if (fadeTimer.current) clearInterval(fadeTimer.current);
    fadeTimer.current = null;
  };

  useEffect(() => {
    // La musique fait partie de la séance : elle joue même en mode silencieux, et se mêle à
    // ce que la personne écoute déjà au lieu de le couper.
    setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers' }).catch(() => {});
  }, []);

  // Un lecteur par ambiance, libéré quand elle change ou quand la séance se ferme.
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
        // déjà libéré
      }
    };
  }, [choice]);

  // Fondu jusqu'au volume voulu ; à zéro, la lecture se met en pause.
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
