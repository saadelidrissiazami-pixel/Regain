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

const STREAK_LOOKBACK_DAYS = 400;

export async function fetchStreak(userId: string): Promise<number> {
  const since = new Date();
  since.setDate(since.getDate() - STREAK_LOOKBACK_DAYS);

  const { data, error } = await supabase
    .from('activity_logs')
    .select('completed_at')
    .eq('user_id', userId)
    .gte('completed_at', since.toISOString())
    .order('completed_at', { ascending: false });
  if (error) throw error;

  // completed_at est un timestamptz : sa date UTC peut désigner la veille pour une activité
  // cochée en soirée. On compare donc des dates locales des deux côtés.
  const days = new Set(data.map((row) => toLocalISODate(new Date(row.completed_at as string))));

  const cursor = new Date();
  let cursorDate = toLocalISODate(cursor);
  if (!days.has(cursorDate)) {
    cursor.setDate(cursor.getDate() - 1);
    cursorDate = toLocalISODate(cursor);
  }

  let streak = 0;
  while (days.has(cursorDate)) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
    cursorDate = toLocalISODate(cursor);
  }
  return streak;
}
