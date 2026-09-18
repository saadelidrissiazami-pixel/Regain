import { describe, expect, it } from 'vitest';

import { contrastRatio, PALETTES, slotForHour, themeVariables, toRgbTriplet, type DaySlot } from '../src/theme/palettes';

describe('slotForHour', () => {
  it('suit les créneaux du planning', () => {
    expect([4, 5, 11, 12, 17, 18, 23, 0].map(slotForHour)).toEqual([
      'soir',
      'matin',
      'matin',
      'apres_midi',
      'apres_midi',
      'soir',
      'soir',
      'soir',
    ]);
  });
});

describe('variables de thème', () => {
  it('convertit les couleurs au format attendu par NativeWind', () => {
    expect(toRgbTriplet('#1F7F74')).toBe('31 127 116');
    expect(themeVariables(PALETTES.soir)['--color-paper']).toBe('23 22 43');
  });

  it('définit toutes les variables pour chaque moment', () => {
    const keys = Object.keys(themeVariables(PALETTES.matin)).sort();
    for (const slot of ['apres_midi', 'soir'] as DaySlot[]) {
      expect(Object.keys(themeVariables(PALETTES[slot])).sort()).toEqual(keys);
    }
  });
});

describe('lisibilité de chaque palette', () => {
  for (const [slot, p] of Object.entries(PALETTES)) {
    it(`${slot} : texte, texte secondaire et boutons restent lisibles`, () => {
      expect(contrastRatio(p.ink, p.paper)).toBeGreaterThanOrEqual(7);
      expect(contrastRatio(p.ink, p.surface)).toBeGreaterThanOrEqual(7);
      expect(contrastRatio(p.inkSoft, p.paper)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(p.onPrimary, p.primary)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(p.paper, p.ink)).toBeGreaterThanOrEqual(7);
      expect(contrastRatio(p.primary, p.paper)).toBeGreaterThanOrEqual(3);
    });
  }
});
