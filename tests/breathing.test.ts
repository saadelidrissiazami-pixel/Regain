import { describe, expect, it } from 'vitest';

import { breathKind } from '../src/features/wellbeing/breathing';

// Every label the breathing sessions actually use, in both languages. A new phrasing that does
// not classify would leave the circle shrinking through an inhale and the pulse on the wrong beat.
const IN = [
  'Inspirez',
  'Inspirez par le nez',
  'Inspirez doucement par le nez',
  'Inspirez profondément par le nez',
  'Grande inspiration par le nez',
  'Petite inspiration supplémentaire',
  'Breathe in',
  'Breathe in through your nose',
  'Breathe in gently through your nose',
  'Breathe in deeply through your nose',
  'Big breath in through the nose',
  'Small extra breath in',
];

const OUT = [
  'Expirez',
  'Expirez lentement par la bouche',
  'Expirez lentement en relâchant',
  'Longue expiration, tout en douceur',
  'Breathe out',
  'Breathe out slowly through your mouth',
  'Breathe out slowly, letting go',
  'Long breath out, gently',
];

const HOLD = ['Retenez votre respiration', 'Hold your breath'];

describe('breathKind', () => {
  it.each(IN)('reads "%s" as breathing in', (label) => expect(breathKind(label)).toBe('in'));
  it.each(OUT)('reads "%s" as breathing out', (label) => expect(breathKind(label)).toBe('out'));
  it.each(HOLD)('reads "%s" as holding', (label) => expect(breathKind(label)).toBe('hold'));

  it('does not mistake breathing out for breathing in', () => {
    // "Long breath out" contains "breath", and an over-eager pattern would call it an inhale.
    expect(breathKind('Long breath out, gently')).not.toBe('in');
  });

  it('falls back to breathing out for a label it does not know', () => {
    expect(breathKind('Quelque chose de nouveau')).toBe('out');
  });
});
