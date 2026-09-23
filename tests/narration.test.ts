import { describe, expect, it } from 'vitest';

import { blockAt, narratedDuration, speakEstimate, speakSecondsOf } from '../src/features/wellbeing/narration';
import type { NarratedBlock } from '../src/features/wellbeing/types';

// Trois blocs volontairement mesurés à la main : 10 + 5, 20 + 30, 15 + 10 = 90 secondes.
const BLOCKS: NarratedBlock[] = [
  { text: 'Installe-toi comme tu peux.', speakSeconds: 10, silenceSeconds: 5 },
  { text: 'Remarque le contact de ton corps.', speakSeconds: 20, silenceSeconds: 30 },
  { text: 'La séance touche à sa fin.', speakSeconds: 15, silenceSeconds: 10 },
];

describe('durée de parole', () => {
  it('estime environ deux mots par seconde', () => {
    // 22 mots ≈ 10 s.
    const text = 'un deux trois quatre cinq six sept huit neuf dix onze douze treize quatorze quinze seize dix-sept dix-huit dix-neuf vingt vingt-et-un vingt-deux';
    expect(speakEstimate(text)).toBe(10);
  });

  it('ne descend jamais sous quatre secondes', () => {
    // Une phrase de trois mots lue en une seconde ne laisserait pas le temps de l'entendre.
    expect(speakEstimate('Respire doucement.')).toBe(4);
  });

  it('rend zéro pour un texte vide', () => {
    expect(speakEstimate('   ')).toBe(0);
  });

  it('préfère la durée écrite à son estimation', () => {
    expect(speakSecondsOf({ text: 'Respire.', speakSeconds: 25, silenceSeconds: 0 })).toBe(25);
    expect(speakSecondsOf({ text: 'Respire.', silenceSeconds: 0 })).toBe(4);
  });
});

describe('durée totale', () => {
  it('additionne parole et silences', () => {
    expect(narratedDuration(BLOCKS)).toBe(90);
  });

  it('ignore un silence négatif au lieu de raccourcir la séance', () => {
    expect(narratedDuration([{ text: 'Respire.', speakSeconds: 10, silenceSeconds: -30 }])).toBe(10);
  });

  it('vaut zéro sans bloc', () => {
    expect(narratedDuration([])).toBe(0);
  });
});

describe('position dans la séance', () => {
  it('commence par la voix du premier bloc', () => {
    expect(blockAt(BLOCKS, 0)).toEqual({ index: 0, phase: 'voice', remaining: 10 });
  });

  it('passe au silence à la seconde exacte où la voix finit', () => {
    expect(blockAt(BLOCKS, 9)).toEqual({ index: 0, phase: 'voice', remaining: 1 });
    expect(blockAt(BLOCKS, 10)).toEqual({ index: 0, phase: 'silence', remaining: 5 });
  });

  it('passe au bloc suivant à la seconde exacte où le silence finit', () => {
    expect(blockAt(BLOCKS, 14)).toEqual({ index: 0, phase: 'silence', remaining: 1 });
    expect(blockAt(BLOCKS, 15)).toEqual({ index: 1, phase: 'voice', remaining: 20 });
  });

  it('trouve le bon bloc au milieu d un long silence', () => {
    expect(blockAt(BLOCKS, 50)).toEqual({ index: 1, phase: 'silence', remaining: 15 });
  });

  it('tient encore à la toute dernière seconde', () => {
    expect(blockAt(BLOCKS, 89)).toEqual({ index: 2, phase: 'silence', remaining: 1 });
  });

  it('signale la fin en ne renvoyant plus rien', () => {
    // C'est ce null qui termine la séance : le lecteur n'a pas d'autre compteur.
    expect(blockAt(BLOCKS, 90)).toBeNull();
    expect(blockAt(BLOCKS, 1000)).toBeNull();
  });

  it('traite un temps négatif comme le début', () => {
    expect(blockAt(BLOCKS, -5)).toEqual({ index: 0, phase: 'voice', remaining: 10 });
  });

  it('ne renvoie rien pour une séance sans bloc', () => {
    expect(blockAt([], 0)).toBeNull();
  });

  it('saute un bloc sans silence sans jamais s y arrêter', () => {
    const sansSilence: NarratedBlock[] = [
      { text: 'Un.', speakSeconds: 5, silenceSeconds: 0 },
      { text: 'Deux.', speakSeconds: 5, silenceSeconds: 0 },
    ];
    expect(blockAt(sansSilence, 4)).toEqual({ index: 0, phase: 'voice', remaining: 1 });
    expect(blockAt(sansSilence, 5)).toEqual({ index: 1, phase: 'voice', remaining: 5 });
    expect(blockAt(sansSilence, 10)).toBeNull();
  });

  it('parcourt toute la séance sans trou ni chevauchement', () => {
    // Seconde par seconde : chaque instant appartient à exactement un bloc, et l'index ne
    // recule jamais.
    let precedent = -1;
    for (let t = 0; t < narratedDuration(BLOCKS); t += 1) {
      const position = blockAt(BLOCKS, t);
      expect(position).not.toBeNull();
      expect(position!.index).toBeGreaterThanOrEqual(precedent);
      expect(position!.remaining).toBeGreaterThan(0);
      precedent = position!.index;
    }
    expect(precedent).toBe(BLOCKS.length - 1);
  });
});
