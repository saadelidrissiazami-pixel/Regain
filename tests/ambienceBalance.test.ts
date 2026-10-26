import { describe, expect, it } from 'vitest';

import {
  AMBIENCE_VOLUME,
  AMBIENCE_VOLUME_UNDER_VOICE,
  BALANCE_MIDDLE,
  ambienceVolume,
  normaliseBalance,
  voiceVolume,
} from '../src/features/wellbeing/ambience';

const music = (over: Partial<Parameters<typeof ambienceVolume>[0]> = {}) =>
  ambienceVolume({ choice: 'vagues', active: true, underVoice: false, balance: BALANCE_MIDDLE, ...over });

describe('the balance between the music and the voice', () => {
  it('leaves the middle exactly where the levels were before', () => {
    // Somebody who never touches the slider must not hear a change on the next update.
    expect(music()).toBeCloseTo(AMBIENCE_VOLUME, 5);
    expect(music({ underVoice: true })).toBeCloseTo(AMBIENCE_VOLUME_UNDER_VOICE, 5);
    expect(voiceVolume(BALANCE_MIDDLE)).toBe(1);
  });

  it('silences the music at the voice end, and the voice at the music end', () => {
    expect(music({ balance: 1 })).toBe(0);
    expect(voiceVolume(0)).toBe(0);
  });

  it('keeps the voice at full from the middle onwards', () => {
    // Fading the voice as soon as any music is wanted makes the session unfollowable; the music
    // is what gives way, which is the whole point of ducking.
    expect(voiceVolume(0.5)).toBe(1);
    expect(voiceVolume(0.75)).toBe(1);
  });

  it('raises the music above its old level when asked, but never past the ceiling', () => {
    expect(music({ balance: 0.25 })).toBeGreaterThan(AMBIENCE_VOLUME);
    expect(music({ balance: 0 })).toBeGreaterThan(music({ balance: 0.25 }));
    expect(music({ balance: 0 })).toBeLessThanOrEqual(0.5);
  });

  it('still ducks under a sentence, wherever the slider sits', () => {
    for (const balance of [0, 0.25, 0.5]) {
      expect(music({ balance, underVoice: true })).toBeLessThan(music({ balance }));
    }
  });

  it('still goes silent on a pause and when the music is off', () => {
    expect(music({ active: false })).toBe(0);
    expect(music({ choice: 'off' })).toBe(0);
  });

  it('survives a stored value that is not a number in range', () => {
    // It comes back from storage, so it can be anything at all.
    for (const junk of [null, undefined, 'loud', NaN, -3, 42]) {
      const value = normaliseBalance(junk as never);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    }
    expect(normaliseBalance('loud' as never)).toBe(BALANCE_MIDDLE);
  });
});
