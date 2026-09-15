// Client du coach forme IA (Edge Function supabase/functions/fitness-coach), mis de côté tant
// que la version gratuite par règles (src/features/fitness/planGenerator.ts) suffit.
// Voir future-v3/README.md pour le réactiver.

import type { NutritionTargets } from '../src/features/fitness/nutrition';
import type { FitnessPlan } from '../src/features/fitness/types';
import { supabase } from '../src/lib/supabase';

// invoke() renvoie une error pour tout statut non-2xx : on relaie le message réel de la
// fonction (quota, refus, panne) plutôt que de supposer qu'elle n'est pas déployée.
async function invokeFitnessCoach<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T>('fitness-coach', { body });
  if (error) {
    const response = (error as { context?: Response }).context;
    if (response?.status === 404) {
      throw new Error("Le coach forme n'est pas encore déployé côté serveur.");
    }
    const payload = await response?.json().catch(() => null);
    throw new Error(payload?.error ?? 'Le coach est momentanément indisponible. Réessayez dans un instant.');
  }
  if (!data) throw new Error("Le coach n'a pas renvoyé de réponse.");
  return data;
}

export async function requestFitnessPlan(
  action: 'generate_plan' | 'adjust_plan',
  targets: NutritionTargets
): Promise<FitnessPlan> {
  const { plan } = await invokeFitnessCoach<{ plan: FitnessPlan }>({ action, targets });
  return plan;
}

export async function sendFitnessChatMessage(message: string): Promise<string> {
  const { reply } = await invokeFitnessCoach<{ reply: string }>({ action: 'chat', message });
  return reply;
}
