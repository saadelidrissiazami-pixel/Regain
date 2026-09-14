import { Platform, Share } from 'react-native';

import { readFunctionError } from './functionError';
import { supabase } from './supabase';

// Tables contenant des données personnelles, avec la colonne qui porte le
// propriétaire. `profiles` est indexée par `id`, les autres par `user_id`.
const USER_TABLES: { table: string; column: string }[] = [
  { table: 'profiles', column: 'id' },
  { table: 'user_preferences', column: 'user_id' },
  { table: 'availability_slots', column: 'user_id' },
  { table: 'goals', column: 'user_id' },
  { table: 'planned_activities', column: 'user_id' },
  { table: 'activity_logs', column: 'user_id' },
  { table: 'energy_checkins', column: 'user_id' },
  { table: 'wellbeing_sessions_completed', column: 'user_id' },
  { table: 'subscriptions', column: 'user_id' },
  { table: 'coach_messages', column: 'user_id' },
];

export type ExportedData = {
  exported_at: string;
  account: { id: string; email: string | null };
  data: Record<string, unknown[]>;
};

// RGPD art. 20 (portabilité) : l'utilisateur doit pouvoir récupérer ses données
// dans un format structuré et lisible par machine.
export async function buildDataExport(userId: string, email: string | null): Promise<ExportedData> {
  const results = await Promise.all(
    USER_TABLES.map(async ({ table, column }) => {
      const { data, error } = await supabase.from(table).select('*').eq(column, userId);
      // Une table absente de la base (coach_messages avant sa migration) ne doit pas
      // faire échouer tout l'export.
      return [table, error ? [] : (data ?? [])] as const;
    })
  );

  return {
    exported_at: new Date().toISOString(),
    account: { id: userId, email },
    data: Object.fromEntries(results),
  };
}

// Sur le web, react-native-web rejette Share.share si navigator.share n'existe pas
// (tous les navigateurs de bureau) : on télécharge le fichier à la place, ce qui est
// de toute façon plus pratique pour un export de données.
function downloadOnWeb(json: string, filename: string) {
  const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function shareDataExport(userId: string, email: string | null) {
  const payload = await buildDataExport(userId, email);
  const json = JSON.stringify(payload, null, 2);

  if (Platform.OS === 'web') {
    downloadOnWeb(json, `regain-donnees-${payload.exported_at.slice(0, 10)}.json`);
    return;
  }

  await Share.share({ title: 'Mes données Regain', message: json });
}

// RGPD art. 17 (effacement). Passe par une Edge Function : supprimer une ligne de
// auth.users demande la clé service_role, qui ne doit jamais être embarquée dans l'app.
export async function deleteAccount(): Promise<void> {
  const { data, error } = await supabase.functions.invoke('delete-account');
  if (error) {
    const serverMessage = await readFunctionError(error);
    throw new Error(
      serverMessage ??
        "La suppression de compte n'est pas disponible (fonction `delete-account` non déployée)."
    );
  }
  if (data?.error) throw new Error(data.error);
}
