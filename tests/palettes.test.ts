import { describe, expect, it } from 'vitest';

import { contrastRatio, PALETTES, themeVariables, toRgbTriplet, variableName } from '../src/theme/colors';

describe('theme variables', () => {
  it('converts the colours into the form NativeWind expects', () => {
    expect(toRgbTriplet('#1F7F74')).toBe('31 127 116');
    expect(themeVariables(PALETTES.light)['--color-bg']).toBe('245 250 248');
  });

  it('names the variables the way the Tailwind classes do', () => {
    expect(variableName('primary600')).toBe('--color-primary-600');
    expect(variableName('ink2')).toBe('--color-ink-2');
    expect(variableName('onPrimary')).toBe('--color-on-primary');
    expect(variableName('premiumInk')).toBe('--color-premium-ink');
  });

  it('defines the same variables in light and in dark', () => {
    expect(Object.keys(themeVariables(PALETTES.dark)).sort()).toEqual(Object.keys(themeVariables(PALETTES.light)).sort());
  });
});

describe('the readability of each palette', () => {
  for (const [scheme, p] of Object.entries(PALETTES)) {
    it(`${scheme} : texte, texte secondaire et boutons restent lisibles`, () => {
      expect(contrastRatio(p.ink, p.bg)).toBeGreaterThanOrEqual(7);
      expect(contrastRatio(p.ink, p.surface)).toBeGreaterThanOrEqual(7);
      expect(contrastRatio(p.ink2, p.bg)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(p.ink2, p.surface)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(p.ink3, p.surface)).toBeGreaterThanOrEqual(3);
      expect(contrastRatio(p.onPrimary, p.primary)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(p.primary600, p.surface)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(p.danger, p.surface)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(p.premiumInk, p.premium)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(p.ink, p.sage100)).toBeGreaterThanOrEqual(7);
    });
  }
});
