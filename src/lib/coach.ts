import { supabase } from './supabase';

export type CoachMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
};

export async function fetchCoachHistory(userId: string): Promise<CoachMessage[]> {
  const { data, error } = await supabase
    .from('coach_messages')
    .select('id, role, content, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(50);
  if (error) throw error;
  return data;
}

/** Where the conversation starts from: it steers the coach, and carries no health data. */
export type CoachSubject = 'forme' | 'bien-etre';

export async function sendCoachMessage(message: string, subject?: CoachSubject): Promise<string> {
  const { data, error } = await supabase.functions.invoke<{ reply?: string }>('coach', {
    // This build is in English and says so. Older French builds send nothing, and the function
    // keeps answering them in French — which is why it can be deployed before 1.2 ships.
    body: { message, subject, language: 'en' },
  });

  // invoke() returns an error for any non-2xx status: a server fault, a spent quota and an
  // undeployed function all arrive here. We read the function's real message rather than assume
  // it has not been configured.
  if (error) {
    const response = (error as { context?: Response }).context;
    if (response?.status === 404) {
      throw new Error('The AI coach is not deployed on the server yet.');
    }
    const body = await response?.json().catch(() => null);
    throw new Error(body?.error ?? 'The coach is unavailable for the moment. Try again shortly.');
  }

  if (!data?.reply) throw new Error('The coach did not send anything back.');
  return data.reply;
}
