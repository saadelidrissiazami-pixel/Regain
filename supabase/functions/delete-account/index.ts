// Regain — suppression de compte (RGPD, droit à l'effacement)
// Déployer avec : supabase functions deploy delete-account
//
// La suppression d'un utilisateur auth.users exige la service_role, qui ne doit jamais
// se trouver côté client. La fonction vérifie donc le JWT de l'appelant et ne supprime
// que son propre compte. Toutes les données liées partent en cascade via
// profiles.id -> auth.users (on delete cascade).

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'content-type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return jsonResponse({ error: 'Non authentifié' }, 401);

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonResponse({ error: 'Non authentifié' }, 401);

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    console.error('Account deletion failed', user.id, error.message);
    return jsonResponse({ error: 'Suppression impossible pour le moment.' }, 500);
  }

  return jsonResponse({ deleted: true }, 200);
});
