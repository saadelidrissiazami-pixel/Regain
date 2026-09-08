import * as Speech from 'expo-speech';

// expo-speech n'expose pas le genre d'une voix (ni iOS/Android/web ne le fournissent de façon
// fiable) — on repère les voix françaises au nom typiquement féminin parmi celles installées.
const FEMALE_NAME_HINTS = [
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
  'fiona',
  'victoria',
  'samantha',
  'moira',
  'tessa',
  'karen',
  'female',
];

let cachedVoiceId: string | null | undefined;

async function resolveGentleFrenchVoice(): Promise<string | null> {
  if (cachedVoiceId !== undefined) return cachedVoiceId;
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const frVoices = voices.filter((v) => v.language?.toLowerCase().startsWith('fr'));
    const female = frVoices.find((v) =>
      FEMALE_NAME_HINTS.some(
        (hint) => v.name?.toLowerCase().includes(hint) || v.identifier?.toLowerCase().includes(hint)
      )
    );
    cachedVoiceId = female?.identifier ?? frVoices[0]?.identifier ?? null;
  } catch {
    cachedVoiceId = null;
  }
  return cachedVoiceId;
}

export async function speakGently(text: string) {
  try {
    Speech.stop();
    const voice = await resolveGentleFrenchVoice();
    Speech.speak(text, {
      language: 'fr-FR',
      voice: voice ?? undefined,
      pitch: 1.1,
      rate: 0.85,
    });
  } catch {
    // La synthèse vocale n'est pas disponible sur cet appareil/navigateur — on continue en silence.
  }
}
