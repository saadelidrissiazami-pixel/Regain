import { supabase } from './supabase';
import type { OnboardingFormValues } from '../features/onboarding/schema';
import { isMissingSchema } from './schemaCompat';

export type Profile = {
  id: string;
  display_name: string | null;
  onboarding_completed_at: string | null;
  created_at: string;
};

export async function fetchProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, onboarding_completed_at, created_at')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data as Profile;
}

export async function updateDisplayName(userId: string, displayName: string) {
  const { error } = await supabase
    .from('profiles')
    .update({ display_name: displayName.trim() || null })
    .eq('id', userId);
  if (error) throw error;
}

/** Usual sleep in minutes (null when unset, or when migration 0022 is missing). */
export async function fetchSleepMinutes(userId: string): Promise<number | null> {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('typical_sleep_minutes')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    if (isMissingSchema(error)) return null;
    throw error;
  }
  return (data as { typical_sleep_minutes: number | null } | null)?.typical_sleep_minutes ?? null;
}

export async function saveSleepMinutes(userId: string, minutes: number | null) {
  const { error } = await supabase.from('user_preferences').update({ typical_sleep_minutes: minutes }).eq('user_id', userId);
  // Without migration 0022, keep the rest of onboarding rather than blocking all of it.
  if (error && !isMissingSchema(error)) throw error;
}

/** Saves the onboarding answers. `markCompleted` means the first run (otherwise it is an edit). */
export async function completeOnboarding(userId: string, values: OnboardingFormValues, markCompleted = true) {
  const { error: prefsError } = await supabase.from('user_preferences').upsert({
    user_id: userId,
    primary_goals: values.primaryGoals,
    budget_level: values.budgetLevel,
    typical_energy_by_slot: values.energyBySlot,
  });
  if (prefsError) throw prefsError;

  await saveSleepMinutes(userId, values.sleepMinutes ?? null);

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      display_name: values.firstName.trim() || null,
      ...(markCompleted ? { onboarding_completed_at: new Date().toISOString() } : null),
    })
    .eq('id', userId);
  if (profileError) throw profileError;
}

/** The first name to show: the one given, otherwise nothing (we do not guess one from the email). */
export function firstNameOf(profile: Pick<Profile, 'display_name'> | null | undefined): string | null {
  const name = profile?.display_name?.trim();
  return name ? name.split(/\s+/)[0] : null;
}
