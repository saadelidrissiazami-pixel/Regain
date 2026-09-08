import type { ActivityCategory } from '../features/planning/types';
import { fetchWeekPlan } from './planning';
import { supabase } from './supabase';
import { toISODateUTC } from './week';

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

  const days = new Set(data.map((row) => (row.completed_at as string).slice(0, 10)));

  const cursor = new Date();
  let cursorDate = toISODateUTC(cursor.getFullYear(), cursor.getMonth(), cursor.getDate());
  if (!days.has(cursorDate)) {
    cursor.setDate(cursor.getDate() - 1);
    cursorDate = toISODateUTC(cursor.getFullYear(), cursor.getMonth(), cursor.getDate());
  }

  let streak = 0;
  while (days.has(cursorDate)) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
    cursorDate = toISODateUTC(cursor.getFullYear(), cursor.getMonth(), cursor.getDate());
  }
  return streak;
}
