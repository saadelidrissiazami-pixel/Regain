import type { BudgetLevel, CatalogActivity, EnergyLevel } from '../features/planning/catalog';
import { generateWeeklyPlan, type EnergyBySlot } from '../features/planning/ruleEngine';
import type { AvailabilitySlot } from '../features/availability/types';
import { fetchAvailabilitySlots } from './availability';
import { fetchCategoryAffinity } from './personalization';
import { getWeekStart } from './week';
import { supabase } from './supabase';

export async function fetchCatalog(): Promise<CatalogActivity[]> {
  const { data, error } = await supabase.from('activities_catalog').select('*');
  if (error) throw error;
  return data;
}

export async function fetchActivityById(id: string): Promise<CatalogActivity> {
  const { data, error } = await supabase.from('activities_catalog').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

async function fetchPreferences(userId: string) {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('primary_goals, typical_energy_by_slot, budget_level')
    .eq('user_id', userId)
    .single();
  if (error) throw error;
  return data as {
    primary_goals: string[];
    typical_energy_by_slot: EnergyBySlot;
    budget_level: BudgetLevel;
  };
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
  const [availability, catalog, prefs, categoryAffinity] = await Promise.all([
    fetchAvailabilitySlots(userId),
    fetchCatalog(),
    fetchPreferences(userId),
    fetchCategoryAffinity(userId),
  ]);

  const items = generateWeeklyPlan({
    availability: availability as AvailabilitySlot[],
    catalog,
    primaryGoals: prefs.primary_goals ?? [],
    energyBySlot: prefs.typical_energy_by_slot ?? {},
    budgetLevel: prefs.budget_level ?? 'modere',
    weekStart,
    categoryAffinity,
  });

  await supabase.from('planned_activities').delete().eq('user_id', userId).eq('week_start_date', weekStart);

  if (items.length === 0) return [];

  const { error } = await supabase.from('planned_activities').insert(
    items.map((item) => ({
      user_id: userId,
      activity_id: item.activity.id,
      week_start_date: weekStart,
      date: item.date,
      time_slot: item.timeSlot,
      status: 'propose',
    }))
  );
  if (error) throw error;

  return fetchWeekPlan(userId, weekStart);
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
