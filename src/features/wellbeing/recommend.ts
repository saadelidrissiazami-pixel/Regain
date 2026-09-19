import type { EnergyLevel } from '../planning/catalog';
import type { WellbeingProgram } from './types';

export type WellbeingRecommendation = { program: WellbeingProgram; reason: string };

type Context = {
  programs: WellbeingProgram[];
  completedIds: Set<string>;
  hour: number;
  /** Dernier check-in d'énergie du jour, s'il existe. */
  energy: EnergyLevel | null;
  isPremium: boolean;
};

type Scored = { program: WellbeingProgram; score: number; reason: string; weight: number };

/**
 * Ce qui pourrait aider maintenant : l'heure (le soir → sommeil), l'énergie déclarée (basse →
 * respiration), la nouveauté (séances pas encore faites). Une séance verrouillée n'est jamais
 * proposée à un compte gratuit. Au plus une recommandation par thème.
 */
export function recommendWellbeing({ programs, completedIds, hour, energy, isPremium }: Context, count = 3): WellbeingRecommendation[] {
  const evening = hour >= 18 || hour < 5;
  const lateNight = hour >= 21 || hour < 5;
  const morning = hour >= 5 && hour < 12;

  const scored: Scored[] = programs
    .filter((program) => isPremium || !program.premium_only)
    .map((program) => {
      const reasons: { weight: number; text: string }[] = [];
      const add = (weight: number, text: string) => reasons.push({ weight, text });
      const c = program.category;

      if (c === 'Sommeil' && lateNight) add(3, 'Pour préparer une nuit plus calme.');
      else if (c === 'Sommeil' && evening) add(1.5, 'Pour ralentir doucement en fin de journée.');
      if (c === 'Méditation' && evening) add(1, 'Pour relâcher les tensions de la journée.');
      if (c === 'Respiration' && morning) add(1, 'Pour bien démarrer la journée.');
      if (c === 'Journaling' && morning) add(0.8, 'Pour poser tes idées avant de commencer.');

      if (energy === 'bas') {
        if (c === 'Respiration') add(3, "Quand l'énergie manque, quelques respirations aident à repartir.");
        if (c === 'Méditation') add(1.2, 'Une pause douce, sans effort.');
      } else if (energy === 'eleve') {
        if (c === 'Confiance en soi') add(2, 'Ton énergie est haute : un bon moment pour travailler ta confiance.');
        if (c === 'En public') add(1.5, 'Ton énergie est haute : un bon moment pour sortir de ta zone de confort.');
      } else if (energy === 'moyen') {
        if (c === 'Méditation') add(1, 'Pour te recentrer, à ton rythme.');
        if (c === 'Journaling') add(1, 'Pour faire le point, tranquillement.');
      }

      if (!completedIds.has(program.id)) add(1.5, "Une séance que tu n'as pas encore essayée.");
      // À énergie basse, on préfère les séances courtes.
      if (energy === 'bas') add(Math.max(0, 1 - program.duration_minutes / 20), '');

      const score = reasons.reduce((sum, r) => sum + r.weight, 0);
      const best = reasons.filter((r) => r.text).sort((a, b) => b.weight - a.weight)[0];
      return {
        program,
        score,
        weight: best?.weight ?? 0,
        reason: best?.text ?? 'Un moment pour toi, à ton rythme.',
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
