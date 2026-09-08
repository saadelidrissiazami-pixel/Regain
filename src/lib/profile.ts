import { supabase } from './supabase';
import type { OnboardingFormValues } from '../features/onboarding/schema';

export async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, onboarding_completed_at')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function completeOnboarding(userId: string, values: OnboardingFormValues) {
  const { error: prefsError } = await supabase.from('user_preferences').upsert({
    user_id: userId,
    primary_goals: values.primaryGoals,
    budget_level: values.budgetLevel,
    typical_energy_by_slot: values.energyBySlot,
  });
  if (prefsError) throw prefsError;

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ onboarding_completed_at: new Date().toISOString() })
    .eq('id', userId);
  if (profileError) throw profileError;
}
