import { supabase } from './supabase';

/** How the estimate was made. A photo estimate is shown as such, because it can be wrong. */
export type NutritionSource = 'manual' | 'photo';

export type NutritionEntry = {
  id: string;
  entry_date: string;
  label: string;
  calories: number;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  source: NutritionSource;
  created_at: string;
};

const COLUMNS = 'id, entry_date, label, calories, protein_g, carbs_g, fat_g, source, created_at';

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

/** What the app knows about a food it is about to note. Everything but the label can be unknown. */
export type NewNutritionEntry = {
  label: string;
  calories: number;
  proteinG?: number | null;
  carbsG?: number | null;
  fatG?: number | null;
  source?: NutritionSource;
};

/** A macronutrient the person did not supply stays null rather than becoming a confident zero. */
function grams(value: number | null | undefined): number | null {
  return value == null ? null : Math.round(value);
}

export async function addNutritionEntry(
  userId: string,
  entry: NewNutritionEntry & { date: string }
): Promise<void> {
  const { error } = await supabase.from('nutrition_entries').insert({
    user_id: userId,
    entry_date: entry.date,
    label: entry.label.trim(),
    calories: Math.round(entry.calories),
    protein_g: grams(entry.proteinG),
    carbs_g: grams(entry.carbsG),
    fat_g: grams(entry.fatG),
    source: entry.source ?? 'manual',
  });
  if (error) throw error;
}

export async function deleteNutritionEntry(id: string): Promise<void> {
  const { error } = await supabase.from('nutrition_entries').delete().eq('id', id);
  if (error) throw error;
}
