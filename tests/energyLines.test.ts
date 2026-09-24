import { describe, expect, it } from 'vitest';

import { ENERGY_LINES, isLowEnergy, lineForEnergy, quoteOfTheDay } from '../src/features/planning/quotes';

// What the app says back to somebody who has just reported their energy. The low list carries the
// most risk, so most of what is checked here is about that one.

const LEVELS = ['bas', 'moyen', 'eleve'] as const;

describe('the line shown after an energy check-in', () => {
  it('has something to say at every level', () => {
    // The previous version had no list for “bas” at all: the one answer most in need of a reply
    // was the one that fell through to a generic sentence.
    for (const level of LEVELS) {
      expect(ENERGY_LINES[level].length).toBeGreaterThan(0);
      expect(ENERGY_LINES[level].every((line) => line.trim().length > 20)).toBe(true);
    }
  });

  it('stays the same all day, and moves on the next one', () => {
    // A line that changes between two glances reads like a slot machine, not like being spoken to.
    expect(lineForEnergy('bas', '2026-09-24')).toBe(lineForEnergy('bas', '2026-09-24'));
    const week = new Set(
      ['2026-09-21', '2026-09-22', '2026-09-23', '2026-09-24'].map((day) => lineForEnergy('moyen', day))
    );
    expect(week.size).toBeGreaterThan(1);
  });

  it('never asks a low day to cheer up', () => {
    // Somebody who has just said they have nothing left is the last person to hand a pep talk,
    // and the one most likely to read an imperative as one more thing they are failing at.
    for (const line of ENERGY_LINES.bas) {
      expect(line).not.toMatch(/\b(cheer|smile|positive|push|come on|effort|try harder)\b/i);
      // No sentence that opens with an order.
      expect(line).not.toMatch(/^(Go|Get|Do|Make|Push|Keep|Stay)\b/);
    }
  });

  it('promises nobody an outcome, whatever their energy', () => {
    for (const level of LEVELS) {
      for (const line of ENERGY_LINES[level]) {
        expect(line).not.toMatch(/\b(will feel|guarantee|cure|fix|heal|better tomorrow|do you good)\b/i);
      }
    }
  });

  it('never makes the effort sound smaller than it is', () => {
    // “Just a minute” argues with somebody who has already decided a minute is too much, and it
    // is the sentence they will remember if they cannot manage it.
    for (const level of LEVELS) {
      for (const line of ENERGY_LINES[level]) {
        expect(line).not.toMatch(/\b(just|only|merely|simply|quick(ly)?|takes? no time)\b/i);
      }
    }
  });

  it('answers each level differently', () => {
    const all = LEVELS.flatMap((level) => ENERGY_LINES[level]);
    expect(new Set(all).size).toBe(all.length);
  });

  it('still knows which level is the low one', () => {
    expect(isLowEnergy('bas')).toBe(true);
    expect(isLowEnergy('moyen')).toBe(false);
    expect(isLowEnergy('eleve')).toBe(false);
  });

  it('picks from the list it was given', () => {
    expect(quoteOfTheDay('2026-09-24', ['only one'])).toBe('only one');
  });
});
