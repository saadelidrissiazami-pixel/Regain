// Regain — account deletion (GDPR, the right to erasure)
// Deploy with: supabase functions deploy delete-account
//
// Deleting an auth.users row requires the service_role key, which must never be on the client.
// So the function checks the caller's JWT and deletes only their own account. Everything linked
// goes with it by cascade through profiles.id -> auth.users (on delete cascade).

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
  if (!authHeader) return jsonResponse({ error: 'Not authenticated' }, 401);

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonResponse({ error: 'Not authenticated' }, 401);

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    console.error('Account deletion failed', user.id, error.message);
    return jsonResponse({ error: 'Deletion is not possible right now.' }, 500);
  }

  return jsonResponse({ deleted: true }, 200);
});
