/**
 * Which of the three movements a breathing phase asks for, read from its label.
 *
 * The label is the only thing a phase carries — the content files were written with no field for
 * this — so it has to be matched. Both the animation and the vibration ask here rather than
 * keeping a regular expression each: they had drifted apart already, and the English labels
 * matched neither.
 *
 * "breath in" and "breathe in" both occur ("Big breath in through the nose", "Breathe in"), so
 * the "e" is optional. Anything that is neither breathing in nor holding is breathing out, which
 * is the movement that can afford to be wrong: it is the resting state of the animation.
 */
export type BreathKind = 'in' | 'hold' | 'out';

export function breathKind(label: string): BreathKind {
  if (/\bhold\b|reten|bloque/i.test(label)) return 'hold';
  if (/inspir|breathe? in\b/i.test(label)) return 'in';
  return 'out';
}
