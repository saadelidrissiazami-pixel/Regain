import { describe, expect, it } from 'vitest';

import { blockAt, narratedDuration, speakEstimate, speakSecondsOf } from '../src/features/wellbeing/narration';
import type { NarratedBlock } from '../src/features/wellbeing/types';

// Three blocks deliberately measured by hand: 10 + 5, 20 + 30, 15 + 10 = 90 seconds.
const BLOCKS: NarratedBlock[] = [
  { text: 'Settle however you can.', speakSeconds: 10, silenceSeconds: 5 },
  { text: 'Notice where your body makes contact.', speakSeconds: 20, silenceSeconds: 30 },
  { text: 'The session is coming to an end.', speakSeconds: 15, silenceSeconds: 10 },
];

describe('speaking time', () => {
  it('estimates about two words a second', () => {
    // 22 words ≈ 10 s.
    const text =
      'one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty twenty-one twenty-two';
    expect(speakEstimate(text)).toBe(10);
  });

  it('never goes below four seconds', () => {
    // A three-word sentence read in one second would leave no time to hear it.
    expect(speakEstimate('Breathe gently.')).toBe(4);
  });

  it('returns zero for empty text', () => {
    expect(speakEstimate('   ')).toBe(0);
  });

  it('prefers the written duration to its estimate', () => {
    expect(speakSecondsOf({ text: 'Respire.', speakSeconds: 25, silenceSeconds: 0 })).toBe(25);
    expect(speakSecondsOf({ text: 'Respire.', silenceSeconds: 0 })).toBe(4);
  });
});

describe('total length', () => {
  it('adds up speech and silences', () => {
    expect(narratedDuration(BLOCKS)).toBe(90);
  });

  it('ignores a negative silence instead of shortening the session', () => {
    expect(narratedDuration([{ text: 'Respire.', speakSeconds: 10, silenceSeconds: -30 }])).toBe(10);
  });

  it('is zero with no blocks', () => {
    expect(narratedDuration([])).toBe(0);
  });
});

describe('position within the session', () => {
  it('starts with the first block’s voice', () => {
    expect(blockAt(BLOCKS, 0)).toEqual({ index: 0, phase: 'voice', remaining: 10 });
  });

  it('moves to the silence at the exact second the voice finishes', () => {
    expect(blockAt(BLOCKS, 9)).toEqual({ index: 0, phase: 'voice', remaining: 1 });
    expect(blockAt(BLOCKS, 10)).toEqual({ index: 0, phase: 'silence', remaining: 5 });
  });

  it('moves to the next block at the exact second the silence finishes', () => {
    expect(blockAt(BLOCKS, 14)).toEqual({ index: 0, phase: 'silence', remaining: 1 });
    expect(blockAt(BLOCKS, 15)).toEqual({ index: 1, phase: 'voice', remaining: 20 });
  });

  it('finds the right block in the middle of a long silence', () => {
    expect(blockAt(BLOCKS, 50)).toEqual({ index: 1, phase: 'silence', remaining: 15 });
  });

  it('still holds at the very last second', () => {
    expect(blockAt(BLOCKS, 89)).toEqual({ index: 2, phase: 'silence', remaining: 1 });
  });

  it('signals the end by returning nothing at all', () => {
    // That null is what ends the session: the player has no other counter.
    expect(blockAt(BLOCKS, 90)).toBeNull();
    expect(blockAt(BLOCKS, 1000)).toBeNull();
  });

  it('treats a negative time as the beginning', () => {
    expect(blockAt(BLOCKS, -5)).toEqual({ index: 0, phase: 'voice', remaining: 10 });
  });

  it('returns nothing for a session with no blocks', () => {
    expect(blockAt([], 0)).toBeNull();
  });

  it('passes a block with no silence without ever stopping in it', () => {
    const sansSilence: NarratedBlock[] = [
      { text: 'Un.', speakSeconds: 5, silenceSeconds: 0 },
      { text: 'Deux.', speakSeconds: 5, silenceSeconds: 0 },
    ];
    expect(blockAt(sansSilence, 4)).toEqual({ index: 0, phase: 'voice', remaining: 1 });
    expect(blockAt(sansSilence, 5)).toEqual({ index: 1, phase: 'voice', remaining: 5 });
    expect(blockAt(sansSilence, 10)).toBeNull();
  });

  it('walks the whole session with no gap and no overlap', () => {
    // Second by second: every instant belongs to exactly one block, and the index only
    // ever moves forward.
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
