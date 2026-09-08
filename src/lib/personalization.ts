import type { ActivityCategory } from '../features/planning/types';
import { supabase } from './supabase';

export type CategoryAffinity = Partial<Record<ActivityCategory, number>>;

const MIN_SAMPLES = 2;

// Ratio complétées/planifiées par catégorie, sur tout l'historique de l'utilisateur.
// En dessous de MIN_SAMPLES occurrences, une catégorie reste neutre (0.5) plutôt que
// de biaiser le planning avant d'avoir assez de signal réel.
export async function fetchCategoryAffinity(userId: string): Promise<CategoryAffinity> {
  const { data, error } = await supabase
    .from('planned_activities')
    .select('status, activities_catalog(category)')
    .eq('user_id', userId);
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
