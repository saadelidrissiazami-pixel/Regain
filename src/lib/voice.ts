import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Speech from 'expo-speech';

import { lang, locale } from './i18n';
import { NARRATION_AUDIO } from './narrationAudio';
import { clipKey } from './narrationKey';

// expo-speech doesn't expose a voice's gender (and neither iOS, Android nor the web reports it
// reliably) — so we pick out the voices in the app's language with a typically female name among those installed.
const FEMALE_NAME_HINTS = [
  // French
  'audrey',
  'amelie',
  'amélie',
  'aurelie',
  'aurélie',
  'julie',
  'marie',
  'celine',
  'céline',
  'charlotte',
  'chantal',
  'virginie',
  'lea',
  'léa',
  'manon',
  'elise',
  'élise',
  'sophie',
  'claire',
  // English
  'samantha',
  'karen',
  'moira',
  'tessa',
  'fiona',
  'victoria',
  'ava',
  'allison',
  'susan',
  'zoe',
  'serena',
  'kate',
  'martha',
  'nicky',
  'joelle',
  'catherine',
  'emily',
  'olivia',
  'sonia',
  'female',
];

let cachedVoiceId: string | null | undefined;

async function resolveGentleVoice(): Promise<string | null> {
  if (cachedVoiceId !== undefined) return cachedVoiceId;
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const ownVoices = voices.filter((v) => v.language?.toLowerCase().startsWith(lang));
    const female = ownVoices.find((v) =>
      FEMALE_NAME_HINTS.some(
        (hint) => v.name?.toLowerCase().includes(hint) || v.identifier?.toLowerCase().includes(hint)
      )
    );
    cachedVoiceId = female?.identifier ?? ownVoices[0]?.identifier ?? null;
  } catch {
    cachedVoiceId = null;
  }
  return cachedVoiceId;
}

// One player at a time: a session speaks one block, and the next block must replace it rather
// than talk over it. Kept so stopSpeaking can silence a recording the way it silences the
// synthesiser.
let player: AudioPlayer | null = null;
let audioModeSet = false;

function releasePlayer() {
  try {
    player?.remove();
  } catch {
    // Already gone.
  }
  player = null;
}

/**
 * Plays the recorded clip for this text if there is one, and speaks it with the device voice
 * otherwise. Returns whether a recording was used.
 */
function playRecording(text: string): boolean {
  const source = NARRATION_AUDIO[clipKey(text)];
  if (!source) return false;
  try {
    releasePlayer();
    if (!audioModeSet) {
      audioModeSet = true;
      // A guided session is the reason the phone is out; a silent switch left on should not turn
      // it into a silent screen.
      void setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'duckOthers' });
    }
    player = createAudioPlayer(source);
    player.volume = 0.9;
    player.play();
    return true;
  } catch {
    releasePlayer();
    return false;
  }
}

export async function speakGently(text: string) {
  try {
    stopSpeaking();
    if (playRecording(text)) return;
    const voice = await resolveGentleVoice();
    Speech.speak(text, {
      language: locale,
      voice: voice ?? undefined,
      // Below 1, because a raised pitch reads as bright and alert — the opposite of what a
      // session is for. Not lower than this: past about 0.9 most installed voices start to
      // sound synthetic rather than calm.
      pitch: 0.95,
      // Spoken a little under full volume, which is most of what makes a voice sound gentle.
      volume: 0.9,
      // Not slower than this, however unhurried we would like to sound. Every block in the
      // scripts carries a speaking time written by hand, and the tightest of them already asks
      // for 2.4 words a second — more than the 2.2 narration.ts calls a cautious assumption. A
      // slower delivery would run past those windows and cut sentences off at the silence.
      // To actually slow the voice down, lengthen those blocks first; the stated duration of
      // each session is calculated from them and would change with it.
      rate: 0.85,
    });
  } catch {
    // Speech synthesis isn't available on this device/browser — carry on silently.
  }
}

/** Silences whichever of the two is talking. */
export function stopSpeaking() {
  releasePlayer();
  try {
    Speech.stop();
  } catch {
    // Nothing was speaking.
  }
}
