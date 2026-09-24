import { describe, expect, it } from 'vitest';

import { ambienceLabel, initialAmbience, isAmbienceChoice } from '../src/features/wellbeing/ambience';

describe('background music at the start of a session', () => {
  it('starts on its own for Sleep and Meditation, with a fitting ambience', () => {
    expect(initialAmbience('Sommeil', null)).toBe('pluie');
    expect(initialAmbience('Méditation', null)).toBe('bol');
  });

  it('reuses the last ambience chosen where the music starts on its own', () => {
    expect(initialAmbience('Sommeil', 'vagues')).toBe('vagues');
    expect(initialAmbience('Méditation', 'nappe')).toBe('nappe');
  });

  it('does not start the music again once the person has turned it off', () => {
    expect(initialAmbience('Sommeil', 'off')).toBe('off');
  });

  it('stays silent elsewhere, and always in public', () => {
    expect(initialAmbience('Respiration', null)).toBe('off');
    expect(initialAmbience('Respiration', 'pluie')).toBe('off');
    expect(initialAmbience('En public', 'pluie')).toBe('off');
  });

  it('recognises the valid stored choices', () => {
    expect(isAmbienceChoice('bol')).toBe(true);
    expect(isAmbienceChoice('off')).toBe(true);
    expect(isAmbienceChoice('techno')).toBe(false);
    expect(isAmbienceChoice(null)).toBe(false);
    expect(ambienceLabel('pluie')).toBe('Light rain');
    expect(ambienceLabel('off')).toBeNull();
  });
});
