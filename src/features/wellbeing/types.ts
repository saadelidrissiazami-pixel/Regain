export type WellbeingProgram = {
  id: string;
  slug: string;
  title: string;
  category: string;
  session_count: number;
  premium_only: boolean;
  duration_minutes: number;
};

export type BreathingPhase = { label: string; seconds: number };

export type GroundingStep =
  | { kind: 'text'; text: string }
  | { kind: 'scale'; prompt: string; key: string }
  | { kind: 'confirm'; text: string; buttonLabel: string }
  | { kind: 'breath-counter'; text: string; count: number };

export type ProgramContent =
  | { type: 'breathing'; cycles: number; phases: BreathingPhase[]; intro?: string[]; outro?: string[] }
  | { type: 'guided'; paragraphs: string[] }
  | { type: 'grounding'; steps: GroundingStep[] };
