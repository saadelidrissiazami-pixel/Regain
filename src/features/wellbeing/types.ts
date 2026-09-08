export type WellbeingProgram = {
  id: string;
  slug: string;
  title: string;
  category: string;
  session_count: number;
  premium_only: boolean;
};

export type BreathingPhase = { label: string; seconds: number };

export type ProgramContent =
  | { type: 'breathing'; cycles: number; phases: BreathingPhase[] }
  | { type: 'guided'; paragraphs: string[] };
