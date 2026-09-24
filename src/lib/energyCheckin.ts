import type { EnergyLevel } from '../features/planning/catalog';
import { supabase } from './supabase';

// energy_checkins.energy_level is an integer 1-5 in the database; the 3 levels used elsewhere
// used elsewhere in the app (bas/moyen/eleve) to stay consistent with onboarding.
const LEVEL_TO_INT: Record<EnergyLevel, number> = { bas: 1, moyen: 3, eleve: 5 };

export async function saveEnergyCheckin(userId: string, energyLevel: EnergyLevel) {
  const { error } = await supabase
    .from('energy_checkins')
    .insert({ user_id: userId, energy_level: LEVEL_TO_INT[energyLevel] });
  if (error) throw error;
}

export type EnergyCheckinRow = { checkin_at: string; energy_level: number };

/** Energy check-ins since a date (ISO), most recent first. */
export async function fetchEnergyCheckins(userId: string, sinceIso: string): Promise<EnergyCheckinRow[]> {
  const { data, error } = await supabase
    .from('energy_checkins')
    .select('checkin_at, energy_level')
    .eq('user_id', userId)
    .gte('checkin_at', sinceIso)
    .order('checkin_at', { ascending: false });
  if (error) throw error;
  return data as EnergyCheckinRow[];
}

/** 1-5 in the database → low / medium / high. */
export function levelFromInt(value: number): EnergyLevel {
  return value <= 2 ? 'bas' : value >= 4 ? 'eleve' : 'moyen';
}
