import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

import { NARRATION_AUDIO } from './narrationAudio';
import { clipKey } from './narrationKey';

/**
 * The recorded narration for a block of text.
 *
 * There is deliberately no fallback to the device's speech synthesiser. It is the robotic voice
 * this exists to replace, and a session that suddenly switches to it mid-way would be worse than
 * one that stays quiet: the text is on screen either way. A block with no clip is simply silent,
 * which is also what happens before the clips have been generated at all.
 */

// One player at a time: a session speaks one block, and the next has to replace it rather than
// talk over it.
let player: AudioPlayer | null = null;
let audioModeSet = false;

function release() {
  try {
    player?.remove();
  } catch {
    // Already gone.
  }
  player = null;
}

export function speakGently(text: string) {
  const source = NARRATION_AUDIO[clipKey(text)];
  if (!source) return;
  try {
    release();
    if (!audioModeSet) {
      audioModeSet = true;
      // A guided session is the reason the phone is out: a silent switch left on should not turn
      // it into a silent screen. It mixes rather than interrupting whatever else is playing.
      void setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers' });
    }
    player = createAudioPlayer(source);
    player.volume = 1;
    player.play();
  } catch {
    release();
  }
}

export function stopSpeaking() {
  release();
}

/** Whether anything has been recorded yet — the voice toggle is pointless without clips. */
export const hasNarrationAudio = Object.keys(NARRATION_AUDIO).length > 0;
