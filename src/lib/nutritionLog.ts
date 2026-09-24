import { supabase } from './supabase';

/** How the estimate was made. A photo estimate is shown as such, because it can be wrong. */
export type NutritionSource = 'manual' | 'photo';

export type NutritionEntry = {
  id: string;
  entry_date: string;
  label: string;
  calories: number;
  protein_g: number | null;
  source: NutritionSource;
  created_at: string;
};

const COLUMNS = 'id, entry_date, label, calories, protein_g, source, created_at';

/** Everything eaten on one day, oldest first — the order it was added is the order it is read. */
export async function fetchNutritionDay(userId: string, date: string): Promise<NutritionEntry[]> {
  const { data, error } = await supabase
    .from('nutrition_entries')
    .select(COLUMNS)
    .eq('user_id', userId)
    .eq('entry_date', date)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as NutritionEntry[];
}

/** A range of days, for the week's picture in Tracking. */
export async function fetchNutritionRange(userId: string, from: string, to: string): Promise<NutritionEntry[]> {
  const { data, error } = await supabase
    .from('nutrition_entries')
    .select(COLUMNS)
    .eq('user_id', userId)
    .gte('entry_date', from)
    .lte('entry_date', to)
    .order('entry_date', { ascending: true });
  if (error) throw error;
  return (data ?? []) as NutritionEntry[];
}

export async function addNutritionEntry(
  userId: string,
  entry: { date: string; label: string; calories: number; proteinG?: number | null; source?: NutritionSource }
): Promise<void> {
  const { error } = await supabase.from('nutrition_entries').insert({
    user_id: userId,
    entry_date: entry.date,
    label: entry.label.trim(),
    calories: Math.round(entry.calories),
    protein_g: entry.proteinG == null ? null : Math.round(entry.proteinG),
    source: entry.source ?? 'manual',
  });
  if (error) throw error;
}

export async function deleteNutritionEntry(id: string): Promise<void> {
  const { error } = await supabase.from('nutrition_entries').delete().eq('id', id);
  if (error) throw error;
}
