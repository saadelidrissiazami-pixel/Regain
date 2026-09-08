import type { EnergyLevel } from '../features/planning/catalog';
import { supabase } from './supabase';

// energy_checkins.energy_level est un entier 1-5 en base ; on y projette les 3 niveaux
// utilisés ailleurs dans l'app (bas/moyen/élevé) pour rester cohérent avec l'onboarding.
const LEVEL_TO_INT: Record<EnergyLevel, number> = { bas: 1, moyen: 3, eleve: 5 };

export async function saveEnergyCheckin(userId: string, energyLevel: EnergyLevel) {
  const { error } = await supabase
    .from('energy_checkins')
    .insert({ user_id: userId, energy_level: LEVEL_TO_INT[energyLevel] });
  if (error) throw error;
}
