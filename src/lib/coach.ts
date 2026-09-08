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

export async function sendCoachMessage(message: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke('coach', { body: { message } });
  if (error) {
    throw new Error(
      "Le coach IA n'est pas encore configuré côté serveur (fonction non déployée ou clé API manquante)."
    );
  }
  if (data?.error) throw new Error(data.error);
  return data.reply as string;
}
