import * as Speech from 'expo-speech';

import { lang, locale } from './i18n';

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

export async function speakGently(text: string) {
  try {
    Speech.stop();
    const voice = await resolveGentleVoice();
    Speech.speak(text, {
      language: locale,
      voice: voice ?? undefined,
      pitch: 1.1,
      rate: 0.85,
    });
  } catch {
    // Speech synthesis isn't available on this device/browser — carry on silently.
  }
}
