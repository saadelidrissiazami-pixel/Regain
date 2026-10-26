import { describe, expect, it } from 'vitest';

import {
  AMBIENCE_VOLUME,
  AMBIENCE_VOLUME_UNDER_VOICE,
  ambienceVolume,
} from '../src/features/wellbeing/ambience';

const at = (over: Partial<Parameters<typeof ambienceVolume>[0]>) =>
  ambienceVolume({ choice: 'vagues', active: true, underVoice: false, ...over });

describe('how loud the music is', () => {
  it('drops under a spoken instruction instead of competing with it', () => {
    // The defect this locks down: for months two comments said the music ducked under the voice,
    // and the player had a single level. Music is continuous and a voice is not, so a fixed
    // level wins every sentence — which is exactly what was heard on a real phone.
    expect(at({ underVoice: true })).toBeLessThan(at({ underVoice: false }));
  });

  it('leaves enough room for the words, and comes back after them', () => {
    // Far enough below to be a background; not so far that the session falls silent between
    // sentences, which would read as the music having stopped.
    expect(AMBIENCE_VOLUME_UNDER_VOICE).toBeLessThan(AMBIENCE_VOLUME / 2);
    expect(AMBIENCE_VOLUME_UNDER_VOICE).toBeGreaterThan(0);
    expect(at({ underVoice: false })).toBe(AMBIENCE_VOLUME);
  });

  it('goes silent on a pause, like the clock and the voice', () => {
    // Leaving the sea running through a pause is why the pause button looked broken: everything
    // visible stopped, and the one thing you could hear carried on.
    expect(at({ active: false })).toBe(0);
    expect(at({ active: false, underVoice: true })).toBe(0);
  });

  it('stays silent when the music is turned off, even mid-sentence', () => {
    expect(at({ choice: 'off' })).toBe(0);
    expect(at({ choice: 'off', underVoice: true })).toBe(0);
  });
});
