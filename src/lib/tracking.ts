import type { ActivityCategory } from '../features/planning/types';
import { fetchWeekPlan } from './planning';
import { supabase } from './supabase';
import { toLocalISODate } from './week';

export type WeekStats = {
  activeDays: number;
  completedCount: number;
  totalCount: number;
  minutesByCategory: Partial<Record<ActivityCategory, number>>;
};

export async function fetchWeekStats(userId: string, weekStart: string): Promise<WeekStats> {
  const items = await fetchWeekPlan(userId, weekStart);
  const completed = items.filter((i) => i.status === 'realise');
  const activeDays = new Set(completed.map((i) => i.date)).size;

  const minutesByCategory: Partial<Record<ActivityCategory, number>> = {};
  for (const item of completed) {
    const cat = item.activities_catalog.category;
    minutesByCategory[cat] = (minutesByCategory[cat] ?? 0) + item.activities_catalog.duration_minutes;
  }

  return { activeDays, completedCount: completed.length, totalCount: items.length, minutesByCategory };
}

export async function fetchStreak(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('completed_at')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false });
  if (error) throw error;

  // completed_at est un timestamptz : le tronquer donnerait la date UTC, alors que le
  // curseur ci-dessous avance en dates locales. Une activité cochée à 00h30 à Paris
  // serait comptée la veille et casserait le streak.
  const days = new Set(data.map((row) => toLocalISODate(new Date(row.completed_at as string))));

  const cursor = new Date();
  // Rien aujourd'hui n'interrompt pas la série tant qu'hier est coché.
  if (!days.has(toLocalISODate(cursor))) cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  while (days.has(toLocalISODate(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
