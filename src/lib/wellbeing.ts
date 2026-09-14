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

// upsert plutôt qu'insert : refaire une séance ne doit pas empiler les lignes,
// une seule suffit pour savoir qu'elle a été terminée (cf. contrainte 0015).
export async function markProgramCompleted(userId: string, programId: string) {
  const { error } = await supabase
    .from('wellbeing_sessions_completed')
    .upsert(
      { user_id: userId, program_id: programId, session_index: 0 },
      { onConflict: 'user_id,program_id,session_index' }
    );
  if (error) throw error;
}
