import { describe, expect, it } from 'vitest';

import { at } from '../src/components/ui/sliderPosition';

describe('where a touch lands on the balance track', () => {
  it('reads the position, not the distance dragged', () => {
    // A finger that leaves the track and comes back has to land where it looks like it should.
    // Accumulating deltas drifts; reading the position cannot.
    expect(at(0, 200)).toBe(0);
    expect(at(100, 200)).toBe(0.5);
    expect(at(200, 200)).toBe(1);
  });

  it('stays inside the track when the finger goes past either end', () => {
    expect(at(-60, 200)).toBe(0);
    expect(at(999, 200)).toBe(1);
  });

  it('answers the middle before the track has been measured', () => {
    // onLayout has not fired yet on the first touch of a fresh screen; dividing by zero there
    // would hand the player NaN and silence everything.
    expect(at(40, 0)).toBe(0.5);
    expect(Number.isNaN(at(40, 0))).toBe(false);
  });
});
