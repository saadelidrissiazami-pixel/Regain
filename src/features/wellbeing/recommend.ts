import { COURSE_CATEGORY } from './courses';
import { SOS_CATEGORY } from './sos';
import type { EnergyLevel } from '../planning/catalog';
import type { WellbeingProgram } from './types';
import { t } from '../../lib/i18n';

export type WellbeingRecommendation = { program: WellbeingProgram; reason: string };

type Context = {
  programs: WellbeingProgram[];
  completedIds: Set<string>;
  hour: number;
  /** Today's most recent energy check-in, when there is one. */
  energy: EnergyLevel | null;
  isPremium: boolean;
};

type Scored = { program: WellbeingProgram; score: number; reason: string; weight: number };

/**
 * What might help right now: the time of day (evening → sleep), the energy reported (low →
 * breathing), and novelty (sessions not yet done). A locked session is never suggested to a free
 * account. At most one recommendation per theme.
 */
export function recommendWellbeing({ programs, completedIds, hour, energy, isPremium }: Context, count = 3): WellbeingRecommendation[] {
  const evening = hour >= 18 || hour < 5;
  const lateNight = hour >= 21 || hour < 5;
  const morning = hour >= 5 && hour < 12;

  const scored: Scored[] = programs
    .filter((program) => isPremium || !program.premium_only)
    // We do not suggest an emergency session to someone who did not ask for one: offering it
    // unprompted is a way of suggesting something is wrong.
    .filter((program) => program.category !== SOS_CATEGORY)
    // A course day offered outside its course makes no sense: day 7 assumes the six before it.
    .filter((program) => program.category !== COURSE_CATEGORY)
    .map((program) => {
      const reasons: { weight: number; text: string }[] = [];
      const add = (weight: number, text: string) => reasons.push({ weight, text });
      const c = program.category;

      if (c === 'Sommeil' && lateNight) add(3, t('To set up a calmer night.'));
      else if (c === 'Sommeil' && evening) add(1.5, t('To wind down gently at the end of the day.'));
      if (c === 'Méditation' && evening) add(1, t('To let go of the day’s tension.'));
      if (c === 'Respiration' && morning) add(1, t('To start the day well.'));
      if (c === 'Journaling' && morning) add(0.8, t('To put your thoughts down before you begin.'));

      if (energy === 'bas') {
        if (c === 'Respiration') add(3, t('When energy is short, a few breaths help you get going.'));
        if (c === 'Méditation') add(1.2, t('A gentle pause, with no effort required.'));
      } else if (energy === 'eleve') {
        if (c === 'Confiance en soi') add(2, t('Your energy is high — a good moment to work on your confidence.'));
        if (c === 'En public') add(1.5, t('Your energy is high — a good moment to stretch your comfort zone.'));
      } else if (energy === 'moyen') {
        if (c === 'Méditation') add(1, t('To settle yourself, at your own pace.'));
        if (c === 'Journaling') add(1, t('To take stock, quietly.'));
      }

      if (!completedIds.has(program.id)) add(1.5, t('A session you have not tried yet.'));
      // On low energy, prefer the shorter sessions.
      if (energy === 'bas') add(Math.max(0, 1 - program.duration_minutes / 20), '');

      const score = reasons.reduce((sum, r) => sum + r.weight, 0);
      const best = reasons.filter((r) => r.text).sort((a, b) => b.weight - a.weight)[0];
      return {
        program,
        score,
        weight: best?.weight ?? 0,
        reason: best?.text ?? t('A moment for yourself, at your own pace.'),
      };
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.program.duration_minutes - b.program.duration_minutes ||
        a.program.slug.localeCompare(b.program.slug)
    );

  const seen = new Set<string>();
  const result: WellbeingRecommendation[] = [];
  for (const item of scored) {
    if (seen.has(item.program.category)) continue;
    seen.add(item.program.category);
    result.push({ program: item.program, reason: item.reason });
    if (result.length === count) break;
  }
  return result;
}
