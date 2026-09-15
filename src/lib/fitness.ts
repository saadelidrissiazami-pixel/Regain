import { ageFromBirthYear, computeNutritionTargets, type NutritionTargets } from '../features/fitness/nutrition';
import { generateFitnessPlan } from '../features/fitness/planGenerator';
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

/**
 * Génère un programme par règles (sans IA, gratuit) et l'enregistre. Le nombre de programmes
 * déjà créés sert de graine : chaque nouvelle semaine varie les exercices et les recettes.
 */
export async function createFitnessPlan(
  userId: string,
  profile: FitnessProfileInput,
  checkin?: Pick<FitnessCheckinInput, 'sessions_done' | 'energy'>
): Promise<FitnessPlan> {
  const { count, error: countError } = await supabase
    .from('fitness_plans')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  if (countError) throw countError;

  const targets = targetsForProfile(profile);
  const generated = generateFitnessPlan(profile, targets, { seed: count ?? 0, checkin });

  const { data, error } = await supabase
    .from('fitness_plans')
    .insert({ user_id: userId, targets, ...generated })
    .select()
    .single();
  if (error) throw error;
  return data as FitnessPlan;
}
