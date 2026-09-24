import type { ActivityCategory } from '../features/planning/types';
import { supabase } from './supabase';
import { toLocalISODate } from './week';

export type CategoryAffinity = Partial<Record<ActivityCategory, number>>;

const MIN_SAMPLES = 2;

// The completed-to-planned ratio per category, over the user's *past* history.
// Activities still ahead are excluded: counted as planned but never yet done, they would
// mechanically drag down the ratio of their own category.
// Below MIN_SAMPLES occurrences a category stays neutral (0.5) rather than skewing the plan
// before there is enough real signal.
export async function fetchCategoryAffinity(userId: string): Promise<CategoryAffinity> {
  const { data, error } = await supabase
    .from('planned_activities')
    .select('status, activities_catalog(category)')
    .eq('user_id', userId)
    .lt('date', toLocalISODate(new Date()));
  if (error) throw error;

  const counts: Record<string, { planned: number; completed: number }> = {};
  for (const row of data as unknown as { status: string; activities_catalog: { category: string } | null }[]) {
    const category = row.activities_catalog?.category;
    if (!category) continue;
    counts[category] ??= { planned: 0, completed: 0 };
    counts[category].planned += 1;
    if (row.status === 'realise') counts[category].completed += 1;
  }

  const affinity: CategoryAffinity = {};
  for (const [category, { planned, completed }] of Object.entries(counts)) {
    if (planned >= MIN_SAMPLES) {
      affinity[category as ActivityCategory] = completed / planned;
    }
  }
  return affinity;
}
