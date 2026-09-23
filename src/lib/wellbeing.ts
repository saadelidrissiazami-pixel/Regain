import { supabase } from './supabase';
import { CONTENT_BY_SLUG } from '../features/wellbeing/content';
import type { Reflection } from '../features/wellbeing/reflection';
import type { WellbeingProgram } from '../features/wellbeing/types';

export async function fetchPrograms(): Promise<WellbeingProgram[]> {
  const { data, error } = await supabase.from('wellbeing_programs').select('*').order('category');
  if (error) throw error;
  // Le catalogue est en base, le texte des séances est dans l'application : une version installée
  // ne sait jouer que les slugs qu'elle embarque. Sans ce filtre, ajouter des séances en base les
  // ferait apparaître chez tout le monde, y compris dans les versions plus anciennes, où les
  // ouvrir ne donnerait qu'un « Séance introuvable ». On ne montre que ce qu'on sait jouer.
  return data.filter((program) => CONTENT_BY_SLUG[program.slug]);
}

export async function fetchCompletedProgramIds(userId: string): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('wellbeing_sessions_completed')
    .select('program_id')
    .eq('user_id', userId);
  if (error) throw error;
  return new Set(data.map((row) => row.program_id));
}

export type SessionReview = {
  note?: string;
  /** 1 = très difficile … 5 = très bien. */
  mood?: number | null;
  reflections?: Reflection[];
};

export async function markProgramCompleted(userId: string, programId: string, review: SessionReview = {}) {
  const { error } = await supabase.from('wellbeing_sessions_completed').insert({
    user_id: userId,
    program_id: programId,
    session_index: 0,
    note: review.note?.trim() || null,
    mood: review.mood ?? null,
    reflections: review.reflections ?? [],
  });
  if (error) throw error;
}

export type JournalEntry = {
  id: string;
  completed_at: string;
  note: string | null;
  mood: number | null;
  reflections: Reflection[];
  program: { title: string; category: string } | null;
};

/** Historique relisible des séances : ressenti, réponses aux questions et note libre. */
export async function fetchWellbeingJournal(userId: string, limit = 100): Promise<JournalEntry[]> {
  const { data, error } = await supabase
    .from('wellbeing_sessions_completed')
    .select('id, completed_at, note, mood, reflections, wellbeing_programs(title, category)')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(limit);
  if (error) throw error;

  return (data as unknown as (Omit<JournalEntry, 'program'> & {
    wellbeing_programs: { title: string; category: string } | null;
  })[]).map(({ wellbeing_programs, reflections, ...entry }) => ({
    ...entry,
    reflections: Array.isArray(reflections) ? reflections : [],
    program: wellbeing_programs,
  }));
}
