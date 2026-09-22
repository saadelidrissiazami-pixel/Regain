import { supabase } from './supabase';
import type { AvailabilitySlot, NewAvailabilitySlot } from '../features/availability/types';

export async function fetchAvailabilitySlots(userId: string): Promise<AvailabilitySlot[]> {
  const { data, error } = await supabase
    .from('availability_slots')
    .select('*')
    .eq('user_id', userId)
    .order('is_recurring', { ascending: false })
    .order('day_of_week', { ascending: true })
    .order('specific_date', { ascending: true });
  if (error) throw error;
  return data;
}

export async function createAvailabilitySlots(userId: string, slots: NewAvailabilitySlot[]) {
  const { error } = await supabase
    .from('availability_slots')
    .insert(slots.map((slot) => ({ user_id: userId, ...slot })));
  if (error) throw error;
}

export async function deleteAvailabilitySlot(id: string) {
  const { error } = await supabase.from('availability_slots').delete().eq('id', id);
  if (error) throw error;
}

/**
 * Efface tous les créneaux du compte, en une requête.
 *
 * Supprimer ligne par ligne depuis l'app laisserait un état à moitié vidé si le réseau lâche
 * au milieu, et ferait autant d'allers-retours que de créneaux.
 */
export async function deleteAllAvailabilitySlots(userId: string) {
  const { error } = await supabase.from('availability_slots').delete().eq('user_id', userId);
  if (error) throw error;
}
