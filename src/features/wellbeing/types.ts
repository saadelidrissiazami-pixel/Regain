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

/**
 * Un bloc de séance narrée : du texte, puis un vrai silence pour le vivre.
 * La durée de la séance se déduit de ses blocs, au lieu d'être annoncée à côté.
 */
export type NarratedBlock = {
  text: string;
  /** Durée de diction visée. Estimée depuis le texte si absente. */
  speakSeconds?: number;
  /** Silence qui suit le texte, en secondes. Zéro est permis, mais rare. */
  silenceSeconds: number;
};

export type ProgramContent =
  | { type: 'breathing'; cycles: number; phases: BreathingPhase[]; intro?: NarratedBlock[]; outro?: NarratedBlock[] }
  /**
   * Séance qui se déroule seule, sans rien demander.
   * `endsQuietly` s'arrête après la dernière seconde, sans proposer de bilan : c'est ce qu'il
   * faut pour une séance qu'on écoute au lit, où l'on ne veut plus rien avoir à faire.
   */
  | { type: 'narrated'; blocks: NarratedBlock[]; endsQuietly?: boolean }
  | { type: 'grounding'; steps: GroundingStep[] };
