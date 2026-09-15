import { Platform } from 'react-native';

import { supabase } from './supabase';

// RGPD : droit d'accès (export) et droit à l'effacement (suppression du compte).
// RLS garantit que chaque requête ne renvoie que les lignes de l'utilisateur connecté.
const EXPORTED_TABLES: { table: string; column: string }[] = [
  { table: 'profiles', column: 'id' },
  { table: 'user_preferences', column: 'user_id' },
  { table: 'availability_slots', column: 'user_id' },
  { table: 'goals', column: 'user_id' },
  { table: 'planned_activities', column: 'user_id' },
  { table: 'activity_logs', column: 'user_id' },
  { table: 'energy_checkins', column: 'user_id' },
  { table: 'wellbeing_sessions_completed', column: 'user_id' },
  { table: 'coach_messages', column: 'user_id' },
  { table: 'subscriptions', column: 'user_id' },
  { table: 'fitness_profiles', column: 'user_id' },
  { table: 'fitness_plans', column: 'user_id' },
  { table: 'fitness_checkins', column: 'user_id' },
];

export async function buildUserDataExport(userId: string): Promise<string> {
  const entries = await Promise.all(
    EXPORTED_TABLES.map(async ({ table, column }) => {
      const { data, error } = await supabase.from(table).select('*').eq(column, userId);
      if (error) throw error;
      return [table, data] as const;
    })
  );

  return JSON.stringify(
    { exported_at: new Date().toISOString(), user_id: userId, data: Object.fromEntries(entries) },
    null,
    2
  );
}

export async function exportUserData(userId: string): Promise<void> {
  const json = await buildUserDataExport(userId);
  const filename = `regain-export-${new Date().toISOString().slice(0, 10)}.json`;

  if (Platform.OS === 'web') {
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    return;
  }

  const { File, Paths } = await import('expo-file-system');
  const Sharing = await import('expo-sharing');

  const file = new File(Paths.document, filename);
  file.write(json);

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error("Le partage de fichiers n'est pas disponible sur cet appareil.");
  }
  await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: 'Exporter mes données Regain' });
}

// La suppression du compte d'authentification exige la service_role : elle passe donc par une
// Edge Function, qui vérifie le JWT de l'appelant et ne supprime que son propre compte.
// Les données liées partent en cascade (profiles.id -> auth.users on delete cascade).
export async function deleteAccount(): Promise<void> {
  const { error } = await supabase.functions.invoke('delete-account');

  if (error) {
    const response = (error as { context?: Response }).context;
    if (response?.status === 404) {
      throw new Error("La suppression de compte n'est pas encore déployée côté serveur.");
    }
    const body = await response?.json().catch(() => null);
    throw new Error(body?.error ?? 'Suppression impossible pour le moment. Réessayez dans un instant.');
  }

  await supabase.auth.signOut();
}
