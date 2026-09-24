// The AI fitness coach's client (the supabase/functions/fitness-coach Edge Function), parked for
// as long as the free rule-based version (src/features/fitness/planGenerator.ts) is enough.
// See future-v3/README.md to bring it back.

import type { NutritionTargets } from '../src/features/fitness/nutrition';
import type { FitnessPlan } from '../src/features/fitness/types';
import { supabase } from '../src/lib/supabase';

// invoke() returns an error for any non-2xx status: we relay the function's real message
// (quota, refusal, outage) rather than assume it is not deployed.
async function invokeFitnessCoach<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T>('fitness-coach', { body });
  if (error) {
    const response = (error as { context?: Response }).context;
    if (response?.status === 404) {
      throw new Error('The fitness coach is not deployed on the server yet.');
    }
    const payload = await response?.json().catch(() => null);
    throw new Error(payload?.error ?? 'The coach is unavailable for the moment. Try again shortly.');
  }
  if (!data) throw new Error('The coach did not send anything back.');
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
