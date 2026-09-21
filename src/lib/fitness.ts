import { ageFromBirthYear, computeNutritionTargets, type NutritionTargets } from '../features/fitness/nutrition';
import { generateFitnessPlan } from '../features/fitness/planGenerator';
import type {
  FitnessCheckin,
  FitnessCheckinInput,
  FitnessPlan,
  FitnessProfile,
  FitnessProfileInput,
} from '../features/fitness/types';
import { isMissingSchema } from './schemaCompat';
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

/** Derniers programmes, du plus récent au plus ancien : le précédent sert à montrer ce qui a changé. */
export async function fetchLatestFitnessPlans(userId: string, limit = 2): Promise<FitnessPlan[]> {
  const { data, error } = await supabase
    .from('fitness_plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as FitnessPlan[];
}

export async function fetchLatestFitnessPlan(userId: string): Promise<FitnessPlan | null> {
  return (await fetchLatestFitnessPlans(userId, 1))[0] ?? null;
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
 *
 * `keepVariation` reprend la graine du plan courant. À utiliser quand on régénère parce que le
 * profil a changé : l'utilisateur retrouve **sa** semaine, corrigée de ce qu'il vient de
 * déclarer, au lieu d'un programme et de menus entièrement différents pour avoir corrigé sa
 * taille. Le bilan hebdomadaire, lui, veut bien une nouvelle semaine : il ne passe rien.
 */
export async function createFitnessPlan(
  userId: string,
  profile: FitnessProfileInput,
  checkin?: Pick<FitnessCheckinInput, 'sessions_done' | 'energy'>,
  options?: { keepVariation?: boolean }
): Promise<FitnessPlan> {
  const { count, error: countError } = await supabase
    .from('fitness_plans')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  if (countError) throw countError;

  const plansSoFar = count ?? 0;
  const seed = options?.keepVariation ? Math.max(0, plansSoFar - 1) : plansSoFar;

  const targets = targetsForProfile(profile);
  const generated = generateFitnessPlan(profile, targets, { seed, checkin });

  const { data, error } = await supabase
    .from('fitness_plans')
    .insert({ user_id: userId, targets, ...generated })
    .select()
    .single();
  if (error) throw error;
  return data as FitnessPlan;
}

export type TimeSlot = 'matin' | 'apres_midi' | 'soir';

/** Quand l'utilisateur s'entraîne (0 = lundi … 6 = dimanche). */
export type TrainingSchedule = { training_slot: TimeSlot | null; training_days: number[] | null };

const EMPTY_SCHEDULE: TrainingSchedule = { training_slot: null, training_days: null };

export async function fetchTrainingSchedule(userId: string): Promise<TrainingSchedule> {
  const { data, error } = await supabase
    .from('fitness_profiles')
    .select('training_slot, training_days')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    if (isMissingSchema(error)) return EMPTY_SCHEDULE;
    throw error;
  }
  return (data as TrainingSchedule | null) ?? EMPTY_SCHEDULE;
}

export async function saveTrainingSchedule(userId: string, schedule: TrainingSchedule) {
  const { error } = await supabase.from('fitness_profiles').update(schedule).eq('user_id', userId);
  if (error && !isMissingSchema(error)) throw error;
}

export type WorkoutLog = {
  id: string;
  plan_id: string | null;
  session_index: number;
  focus: string | null;
  duration_minutes: number | null;
  completed_at: string;
};

/** Séances faites dans le lecteur depuis une date (ISO), des plus récentes aux plus anciennes. */
export async function fetchWorkoutLogs(userId: string, sinceIso: string): Promise<WorkoutLog[]> {
  const { data, error } = await supabase
    .from('workout_logs')
    .select('id, plan_id, session_index, focus, duration_minutes, completed_at')
    .eq('user_id', userId)
    .gte('completed_at', sinceIso)
    .order('completed_at', { ascending: false });
  if (error) {
    if (isMissingSchema(error)) return [];
    throw error;
  }
  return data as WorkoutLog[];
}

export async function logWorkout(
  userId: string,
  input: { planId: string; sessionIndex: number; focus: string; durationMinutes: number }
) {
  const { error } = await supabase.from('workout_logs').insert({
    user_id: userId,
    plan_id: input.planId,
    session_index: input.sessionIndex,
    focus: input.focus,
    duration_minutes: Math.max(1, Math.round(input.durationMinutes)),
  });
  if (error && !isMissingSchema(error)) throw error;
}

/** Nombre de programmes générés : sert de numéro de semaine du programme. */
export async function countFitnessPlans(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('fitness_plans')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  if (error) throw error;
  return count ?? 0;
}
