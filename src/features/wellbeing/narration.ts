// Le temps d'une séance narrée.
//
// Le lecteur ne garde aucun index de bloc en mémoire : il lit l'horloge et demande ici quel bloc
// correspond. Pause, reprise et ±15 s deviennent alors gratuits — il n'y a qu'un seul état, le
// temps écoulé — et la durée annoncée cesse d'être une promesse pour devenir un calcul.

import type { NarratedBlock, ProgramContent } from './types';

// Diction posée : environ 130 mots par minute, soit un peu plus de deux mots par seconde.
// Volontairement prudent : mieux vaut un silence légèrement plus long qu'une phrase coupée.
const WORDS_PER_SECOND = 2.2;
const MIN_SPEAK_SECONDS = 4;

/** Temps de parole estimé pour un texte, quand l'auteur ne l'a pas mesuré lui-même. */
export function speakEstimate(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  if (words === 0) return 0;
  return Math.max(MIN_SPEAK_SECONDS, Math.round(words / WORDS_PER_SECOND));
}

/** Durée de parole d'un bloc : celle qu'on a écrite, sinon celle qu'on estime. */
export function speakSecondsOf(block: NarratedBlock): number {
  return block.speakSeconds ?? speakEstimate(block.text);
}

/** Durée totale de la séance, parole et silences compris. */
export function narratedDuration(blocks: NarratedBlock[]): number {
  return blocks.reduce((total, block) => total + speakSecondsOf(block) + Math.max(0, block.silenceSeconds), 0);
}

export type NarrationPosition = {
  index: number;
  phase: 'voice' | 'silence';
  /** Secondes restantes dans la phase en cours. */
  remaining: number;
};

/**
 * Où en est la séance à `elapsed` secondes.
 * Renvoie `null` une fois la dernière seconde passée : c'est le signal de fin.
 */
export function blockAt(blocks: NarratedBlock[], elapsed: number): NarrationPosition | null {
  let start = 0;
  const from = Math.max(0, elapsed);
  for (let index = 0; index < blocks.length; index += 1) {
    const voice = speakSecondsOf(blocks[index]);
    const silence = Math.max(0, blocks[index].silenceSeconds);
    if (from < start + voice) {
      return { index, phase: 'voice', remaining: start + voice - from };
    }
    if (from < start + voice + silence) {
      return { index, phase: 'silence', remaining: start + voice + silence - from };
    }
    start += voice + silence;
  }
  return null;
}

/**
 * Durée réelle d'une séance, quand elle est calculable.
 *
 * Renvoie `null` pour les formats qui avancent au rythme de la personne — `guided` et
 * `grounding` — où la durée annoncée reste une estimation et ne peut pas être vérifiée.
 */
export function contentDuration(content: ProgramContent): number | null {
  if (content.type === 'narrated') return narratedDuration(content.blocks);
  if (content.type === 'breathing') {
    const cycle = content.phases.reduce((total, phase) => total + phase.seconds, 0);
    return (
      narratedDuration(content.intro ?? []) + content.cycles * cycle + narratedDuration(content.outro ?? [])
    );
  }
  return null;
}
