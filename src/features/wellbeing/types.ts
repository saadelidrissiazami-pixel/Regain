export type WellbeingProgram = {
  id: string;
  slug: string;
  title: string;
  category: string;
  session_count: number;
  premium_only: boolean;
  duration_minutes: number;
  /** The course this session belongs to, if there is one. */
  course_slug: string | null;
  /** The day's rank within that course, from 1. */
  course_day: number | null;
};

export type BreathingPhase = { label: string; seconds: number };

export type GroundingStep =
  | { kind: 'text'; text: string }
  | { kind: 'scale'; prompt: string; key: string }
  | { kind: 'confirm'; text: string; buttonLabel: string }
  | { kind: 'breath-counter'; text: string; count: number };

/**
 * One block of a narrated session: some text, then a real silence to live it in.
 * The session's length is derived from its blocks, rather than stated alongside them.
 */
export type NarratedBlock = {
  text: string;
  /** The intended speaking time. Estimated from the text when absent. */
  speakSeconds?: number;
  /** The silence that follows the text, in seconds. Zero is allowed, but rare. */
  silenceSeconds: number;
};

export type ProgramContent =
  | { type: 'breathing'; cycles: number; phases: BreathingPhase[]; intro?: NarratedBlock[]; outro?: NarratedBlock[] }
  /**
   * A session that runs on its own, asking for nothing.
   * `endsQuietly` stops after the last second with no review offered: that is what a session
   * listened to in bed needs, where there is nothing left anyone wants to do.
   */
  | { type: 'narrated'; blocks: NarratedBlock[]; endsQuietly?: boolean }
  | { type: 'grounding'; steps: GroundingStep[] };
