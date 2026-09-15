import { ageFromBirthYear, computeNutritionTargets, type NutritionTargets } from '../features/fitness/nutrition';
import type {
  FitnessCheckin,
  FitnessCheckinInput,
  FitnessPlan,
  FitnessProfile,
  FitnessProfileInput,
} from '../features/fitness/types';
import { supabase } from './supabase';

export async function fetchFitnessProfile(userId: string): Promise<FitnessProfile | null> {
  const { data, error } = await supabase.from('fitness_profiles').select('*').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return data ? { ...data, weight_kg: Number(data.weight_kg) } : null;
}

export async function saveFitnessProfile(userId: string, input: FitnessProfileInput) {
  const { error } = await supabase
    .from('fitness_profiles')
    .upsert({ user_id: userId, ...input, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function updateFitnessWeight(userId: string, weightKg: number) {
  const { error } = await supabase
    .from('fitness_profiles')
    .update({ weight_kg: weightKg, updated_at: new Date().toISOString() })
    .eq('user_id', userId);
  if (error) throw error;
}

export async function fetchLatestFitnessPlan(userId: string): Promise<FitnessPlan | null> {
  const { data, error } = await supabase
    .from('fitness_plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as FitnessPlan | null;
}

export async function fetchRecentCheckins(userId: string, limit = 8): Promise<FitnessCheckin[]> {
  const { data, error } = await supabase
    .from('fitness_checkins')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as FitnessCheckin[];
}

export async function createCheckin(userId: string, input: FitnessCheckinInput) {
  const { error } = await supabase.from('fitness_checkins').insert({ user_id: userId, ...input });
  if (error) throw error;
}

export function targetsForProfile(profile: FitnessProfileInput): NutritionTargets {
  return computeNutritionTargets({
    sex: profile.sex,
    age: ageFromBirthYear(profile.birth_year),
    heightCm: profile.height_cm,
    weightKg: Number(profile.weight_kg),
    activityLevel: profile.activity_level,
    goals: profile.goals,
  });
}

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
