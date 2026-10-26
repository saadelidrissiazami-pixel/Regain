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

/**
 * Whether a clip is being read right now, and who wants to know.
 *
 * The ambience listens: a pad at a fixed level sits on top of a spoken instruction and wins,
 * because music is continuous and a voice is not. Nothing else can work this out from outside —
 * only this module knows when a clip starts and when it ends.
 */
let speaking = false;
const listeners = new Set<(speaking: boolean) => void>();

function setSpeaking(value: boolean) {
  if (speaking === value) return;
  speaking = value;
  for (const listener of listeners) listener(value);
}

/** Calls back immediately with the current state, then on every change. Returns the unsubscribe. */
export function subscribeToSpeech(listener: (speaking: boolean) => void): () => void {
  listeners.add(listener);
  listener(speaking);
  return () => {
    listeners.delete(listener);
  };
}

function release() {
  try {
    // Stop first, then tear down. `remove()` releases the native player, but it does not promise
    // that the sound already coming out of the speaker stops with it — so the clip being replaced
    // went on talking under the next one, and a pause did not silence the sentence in progress.
    // The ambience has always done it in this order; the voice never did.
    player?.pause();
  } catch {
    // Already stopped.
  }
  try {
    player?.remove();
  } catch {
    // Already gone.
  }
  player = null;
  setSpeaking(false);
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
    // Released on the next block or at the end of the session; this only marks the silence that
    // follows the sentence, which is where the ambience is allowed to come back up.
    player.addListener('playbackStatusUpdate', (status) => {
      if (status.didJustFinish) setSpeaking(false);
    });
    player.play();
    setSpeaking(true);
  } catch {
    release();
  }
}

export function stopSpeaking() {
  release();
}

/** Whether anything has been recorded yet — the voice toggle is pointless without clips. */
export const hasNarrationAudio = Object.keys(NARRATION_AUDIO).length > 0;
