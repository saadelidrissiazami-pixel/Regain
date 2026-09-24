// The clock of a narrated session.
//
// The player keeps no block index in memory: it reads the clock and asks here which block that
// corresponds to. Pause, resume and ±15 s then come for free — there is only one piece of state,
// the time elapsed — and the stated duration stops being a promise and becomes a calculation.

import type { NarratedBlock, ProgramContent } from './types';

// An unhurried delivery: about 130 words a minute, a little over two words a second.
// Deliberately cautious: a slightly longer silence beats a sentence cut off.
const WORDS_PER_SECOND = 2.2;
const MIN_SPEAK_SECONDS = 4;

/** The estimated speaking time for a text, when the author has not measured it. */
export function speakEstimate(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  if (words === 0) return 0;
  return Math.max(MIN_SPEAK_SECONDS, Math.round(words / WORDS_PER_SECOND));
}

/** A block's speaking time: the one written down, otherwise the estimate. */
export function speakSecondsOf(block: NarratedBlock): number {
  return block.speakSeconds ?? speakEstimate(block.text);
}

/** The session's total length, speech and silences included. */
export function narratedDuration(blocks: NarratedBlock[]): number {
  return blocks.reduce((total, block) => total + speakSecondsOf(block) + Math.max(0, block.silenceSeconds), 0);
}

export type NarrationPosition = {
  index: number;
  phase: 'voice' | 'silence';
  /** Seconds left in the current phase. */
  remaining: number;
};

/**
 * Where the session is at `elapsed` seconds.
 * Returns `null` once the last second has gone by: that is the signal to end.
 */
export function blockAt(blocks: NarratedBlock[], elapsed: number): NarrationPosition | null {
  let start = 0;
  const from = Math.max(0, elapsed);
  for (let index = 0; index < blocks.length; index += 1) {
    const voice = speakSecondsOf(blocks[index]);
    const silence = Math.max(0, blocks[index].silenceSeconds);
    if (from < start + voice) {
      return { index, phase: 'voice', remaining: start + voice - from };
    }
    if (from < start + voice + silence) {
      return { index, phase: 'silence', remaining: start + voice + silence - from };
    }
    start += voice + silence;
  }
  return null;
}

/**
 * A session's real length, when it can be computed.
 *
 * Returns `null` for the formats that move at the person's own pace — `guided` and
 * `grounding` — where the stated duration stays an estimate and cannot be checked.
 */
export function contentDuration(content: ProgramContent): number | null {
  if (content.type === 'narrated') return narratedDuration(content.blocks);
  if (content.type === 'breathing') {
    const cycle = content.phases.reduce((total, phase) => total + phase.seconds, 0);
    return (
      narratedDuration(content.intro ?? []) + content.cycles * cycle + narratedDuration(content.outro ?? [])
    );
  }
  return null;
}
