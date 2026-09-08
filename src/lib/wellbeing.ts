import { supabase } from './supabase';
import type { WellbeingProgram } from '../features/wellbeing/types';

export async function fetchPrograms(): Promise<WellbeingProgram[]> {
  const { data, error } = await supabase.from('wellbeing_programs').select('*').order('category');
  if (error) throw error;
  return data;
}

export async function fetchCompletedProgramIds(userId: string): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('wellbeing_sessions_completed')
    .select('program_id')
    .eq('user_id', userId);
  if (error) throw error;
  return new Set(data.map((row) => row.program_id));
}

export async function markProgramCompleted(userId: string, programId: string) {
  const { error } = await supabase
    .from('wellbeing_sessions_completed')
    .insert({ user_id: userId, program_id: programId, session_index: 0 });
  if (error) throw error;
}
