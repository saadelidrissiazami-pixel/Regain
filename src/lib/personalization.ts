import type { ActivityCategory } from '../features/planning/types';
import { supabase } from './supabase';
import { getToday } from './week';

export type CategoryAffinity = Partial<Record<ActivityCategory, number>>;

const MIN_SAMPLES = 2;

// Ratio complétées/planifiées par catégorie, sur tout l'historique de l'utilisateur.
// En dessous de MIN_SAMPLES occurrences, une catégorie reste neutre (0.5) plutôt que
// de biaiser le planning avant d'avoir assez de signal réel.
//
// Seules les activités échues comptent : une activité encore à venir n'est pas un
// échec, la compter tirerait mécaniquement sa catégorie vers le bas et la
// défavoriserait à la génération suivante — l'inverse de l'effet recherché.
export async function fetchCategoryAffinity(userId: string): Promise<CategoryAffinity> {
  const today = getToday();
  const { data, error } = await supabase
    .from('planned_activities')
    .select('status, activities_catalog(category)')
    .eq('user_id', userId)
    .or(`date.lt.${today},status.eq.realise`);
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
