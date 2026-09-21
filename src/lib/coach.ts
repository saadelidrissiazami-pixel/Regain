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

/** Espace d'où part la conversation : oriente le coach, sans transmettre de donnée de santé. */
export type CoachSubject = 'forme' | 'bien-etre';

export async function sendCoachMessage(message: string, subject?: CoachSubject): Promise<string> {
  const { data, error } = await supabase.functions.invoke<{ reply?: string }>('coach', {
    body: { message, subject },
  });

  // invoke() renvoie une error pour tout statut non-2xx : une panne serveur, un quota atteint
  // ou une fonction non déployée arrivent tous ici. On lit le message réel de la fonction
  // plutôt que de supposer qu'elle n'est pas configurée.
  if (error) {
    const response = (error as { context?: Response }).context;
    if (response?.status === 404) {
      throw new Error("Le coach IA n'est pas encore déployé côté serveur.");
    }
    const body = await response?.json().catch(() => null);
    throw new Error(body?.error ?? 'Le coach est momentanément indisponible. Réessayez dans un instant.');
  }

  if (!data?.reply) throw new Error("Le coach n'a pas renvoyé de réponse.");
  return data.reply;
}
