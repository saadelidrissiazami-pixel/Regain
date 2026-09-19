import { describe, expect, it } from 'vitest';

import { ambienceLabel, initialAmbience, isAmbienceChoice } from '../src/features/wellbeing/ambience';

describe("musique d'ambiance au début d'une séance", () => {
  it('démarre seule en Sommeil et en Méditation, avec une ambiance adaptée', () => {
    expect(initialAmbience('Sommeil', null)).toBe('pluie');
    expect(initialAmbience('Méditation', null)).toBe('bol');
  });

  it('reprend la dernière ambiance choisie là où la musique démarre seule', () => {
    expect(initialAmbience('Sommeil', 'vagues')).toBe('vagues');
    expect(initialAmbience('Méditation', 'nappe')).toBe('nappe');
  });

  it("ne relance plus la musique une fois que la personne l'a coupée", () => {
    expect(initialAmbience('Sommeil', 'off')).toBe('off');
  });

  it('reste silencieuse ailleurs, et toujours en public', () => {
    expect(initialAmbience('Respiration', null)).toBe('off');
    expect(initialAmbience('Respiration', 'pluie')).toBe('off');
    expect(initialAmbience('En public', 'pluie')).toBe('off');
  });

  it('reconnaît les choix valides enregistrés', () => {
    expect(isAmbienceChoice('bol')).toBe(true);
    expect(isAmbienceChoice('off')).toBe(true);
    expect(isAmbienceChoice('techno')).toBe(false);
    expect(isAmbienceChoice(null)).toBe(false);
    expect(ambienceLabel('pluie')).toBe('Pluie légère');
    expect(ambienceLabel('off')).toBeNull();
  });
});
