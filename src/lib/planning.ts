import type { BudgetLevel, CatalogActivity } from '../features/planning/catalog';
import { generateWeeklyPlan, type EnergyBySlot } from '../features/planning/ruleEngine';
import type { AvailabilitySlot } from '../features/availability/types';
import { fetchAvailabilitySlots } from './availability';
import { fetchCategoryAffinity } from './personalization';
import { fromLocalISODate, getWeekStart } from './week';
import { supabase } from './supabase';

export async function fetchCatalog(): Promise<CatalogActivity[]> {
  // Seules les activités encore proposées : les anciennes restent en base parce que des
  // plannings les référencent, mais on ne les place plus dans de nouvelles semaines.
  const { data, error } = await supabase.from('activities_catalog').select('*').eq('active', true);
  if (error) throw error;
  return data;
}

export async function fetchActivityById(id: string): Promise<CatalogActivity> {
  const { data, error } = await supabase.from('activities_catalog').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export type UserPreferences = {
  primary_goals: string[];
  typical_energy_by_slot: EnergyBySlot;
  budget_level: BudgetLevel;
};

export async function fetchPreferences(userId: string): Promise<UserPreferences> {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('primary_goals, typical_energy_by_slot, budget_level')
    .eq('user_id', userId)
    .single();
  if (error) throw error;
  return data as UserPreferences;
}

export type PlannedActivityRow = {
  id: string;
  date: string;
  time_slot: 'matin' | 'apres_midi' | 'soir';
  status: string;
  activities_catalog: CatalogActivity;
};

export async function fetchWeekPlan(userId: string, weekStart: string): Promise<PlannedActivityRow[]> {
  const { data, error } = await supabase
    .from('planned_activities')
    .select('id, date, time_slot, status, activities_catalog(*)')
    .eq('user_id', userId)
    .eq('week_start_date', weekStart)
    .order('date', { ascending: true });
  if (error) throw error;
  return data as unknown as PlannedActivityRow[];
}

export async function generateAndSaveWeekPlan(userId: string, weekStart = getWeekStart()) {
  const [availability, catalog, prefs, categoryAffinity, existing] = await Promise.all([
    fetchAvailabilitySlots(userId),
    fetchCatalog(),
    fetchPreferences(userId),
    fetchCategoryAffinity(userId),
    fetchWeekPlan(userId, weekStart),
  ]);

  // Ce qui a déjà été fait n'est jamais effacé ni remplacé par une régénération :
  // ces activités gardent leur créneau, qui devient indisponible pour la génération.
  const keptItems = existing
    .filter((item) => item.status === 'realise')
    .map((item) => ({ date: item.date, timeSlot: item.time_slot, activity: item.activities_catalog }));

  const items = generateWeeklyPlan({
    availability: availability as AvailabilitySlot[],
    catalog,
    primaryGoals: prefs.primary_goals ?? [],
    energyBySlot: prefs.typical_energy_by_slot ?? {},
    budgetLevel: prefs.budget_level ?? 'modere',
    weekStart,
    categoryAffinity,
    keptItems,
  });

  // Suppression des anciennes propositions + insertion des nouvelles dans une seule
  // transaction Postgres, pour ne jamais laisser l'utilisateur sans planning.
  const { error } = await supabase.rpc('replace_week_plan', {
    p_week_start: weekStart,
    p_items: items.map((item) => ({
      activity_id: item.activity.id,
      date: item.date,
      time_slot: item.timeSlot,
    })),
  });
  if (error) throw error;

  return fetchWeekPlan(userId, weekStart);
}

/** Activités planifiées entre deux dates incluses (vue Mois). */
export async function fetchPlanRange(userId: string, from: string, to: string): Promise<PlannedActivityRow[]> {
  const { data, error } = await supabase
    .from('planned_activities')
    .select('id, date, time_slot, status, activities_catalog(*)')
    .eq('user_id', userId)
    .gte('date', from)
    .lte('date', to)
    .order('date', { ascending: true });
  if (error) throw error;
  return data as unknown as PlannedActivityRow[];
}

/** Ajoute une activité choisie par l'utilisateur à un jour et un moment précis. */
export async function addPlannedActivity(
  userId: string,
  input: { activityId: string; date: string; timeSlot: PlannedActivityRow['time_slot'] }
) {
  const { error } = await supabase.from('planned_activities').insert({
    user_id: userId,
    activity_id: input.activityId,
    week_start_date: getWeekStart(fromLocalISODate(input.date)),
    date: input.date,
    time_slot: input.timeSlot,
    status: 'propose',
  });
  if (error) throw error;
}

/** Nombre total d'activités réalisées depuis l'inscription. */
export async function countCompletedActivities(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('planned_activities')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'realise');
  if (error) throw error;
  return count ?? 0;
}

export async function fetchCompletedActivities(userId: string, limit = 100): Promise<PlannedActivityRow[]> {
  const { data, error } = await supabase
    .from('planned_activities')
    .select('id, date, time_slot, status, activities_catalog(*)')
    .eq('user_id', userId)
    .eq('status', 'realise')
    .order('date', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as unknown as PlannedActivityRow[];
}

export async function markActivityDone(userId: string, plannedActivityId: string) {
  const { error: statusError } = await supabase
    .from('planned_activities')
    .update({ status: 'realise' })
    .eq('id', plannedActivityId);
  if (statusError) throw statusError;

  const { error: logError } = await supabase
    .from('activity_logs')
    .insert({ user_id: userId, planned_activity_id: plannedActivityId });
  if (logError) throw logError;
}

export async function markActivityUndone(userId: string, plannedActivityId: string) {
  const { error: statusError } = await supabase
    .from('planned_activities')
    .update({ status: 'propose' })
    .eq('id', plannedActivityId);
  if (statusError) throw statusError;

  const { error: logError } = await supabase
    .from('activity_logs')
    .delete()
    .eq('user_id', userId)
    .eq('planned_activity_id', plannedActivityId);
  if (logError) throw logError;
}
