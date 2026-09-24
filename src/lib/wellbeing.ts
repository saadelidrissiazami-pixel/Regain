import { supabase } from './supabase';
import { programTitle, titleForSlug } from '../features/wellbeing/catalogue';
import { CONTENT_BY_SLUG } from '../features/wellbeing/content';
import type { Reflection } from '../features/wellbeing/reflection';
import type { WellbeingProgram } from '../features/wellbeing/types';

export async function fetchPrograms(): Promise<WellbeingProgram[]> {
  const { data, error } = await supabase.from('wellbeing_programs').select('*').order('category');
  if (error) throw error;
  // The catalogue lives in the database, the session scripts live in the app: an installed build
  // can only play the slugs it ships with. Without this filter, adding sessions to the database
  // would surface them for everyone, including older builds, where opening one would give nothing
  // but “Session not found”. We only show what we know how to play.
  //
  // The title is swapped for this build's wording on the way through, so every screen downstream
  // reads `program.title` without having to know the wording lives in the bundle.
  return data
    .filter((program) => CONTENT_BY_SLUG[program.slug])
    .map((program) => ({ ...program, title: programTitle(program) }));
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
  /** 1 = very hard … 5 = very good. */
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

/** A readable history of sessions: how it felt, the answers given, and any note written. */
export async function fetchWellbeingJournal(userId: string, limit = 100): Promise<JournalEntry[]> {
  const { data, error } = await supabase
    .from('wellbeing_sessions_completed')
    .select('id, completed_at, note, mood, reflections, wellbeing_programs(slug, title, category)')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(limit);
  if (error) throw error;

  return (data as unknown as (Omit<JournalEntry, 'program'> & {
    wellbeing_programs: { slug: string; title: string; category: string } | null;
  })[]).map(({ wellbeing_programs, reflections, ...entry }) => ({
    ...entry,
    reflections: Array.isArray(reflections) ? reflections : [],
    program: wellbeing_programs
      ? {
          title: titleForSlug(wellbeing_programs.slug, wellbeing_programs.title),
          category: wellbeing_programs.category,
        }
      : null,
  }));
}
