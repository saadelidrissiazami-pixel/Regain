// Regain — suppression de compte (RGPD, droit à l'effacement)
// Déployer avec : supabase functions deploy delete-account
//
// La suppression d'une ligne de auth.users ne peut pas venir du client : elle exige
// la clé service_role, qui ne doit jamais quitter le serveur. On vérifie donc
// l'identité de l'appelant avec son propre jeton, puis on supprime ce compte —
// et lui seul. Toutes les tables de `public` référencent profiles/auth.users en
// `on delete cascade` : supprimer l'utilisateur efface l'intégralité de ses données.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Non authentifié');

    const caller = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
    } = await caller.auth.getUser();
    if (!user) throw new Error('Non authentifié');

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) {
      console.error('deleteUser failed', error);
      throw new Error("La suppression n'a pas pu aboutir. Réessayez ou contactez le support.");
    }

    return new Response(JSON.stringify({ deleted: true }), {
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    });
  }
});
