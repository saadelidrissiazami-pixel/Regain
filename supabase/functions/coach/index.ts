// Regain — Coach IA (Edge Function)
// Déployer avec : supabase functions deploy coach
// Secret requis : supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Tu es le coach personnel de Regain, une application qui aide des personnes en reconstruction de routine (post-burnout, changement de vie) à mieux utiliser leur temps libre, en alternative au temps passif (réseaux sociaux, streaming).

Règles :
- Ton bienveillant, jamais culpabilisant. Ne fais jamais la morale sur le temps d'écran ou les activités manquées.
- Réponses courtes et concrètes (3-5 phrases maximum sauf si on te demande plus de détails).
- Tu t'appuies sur le contexte réel fourni (objectifs, planning, humeur) plutôt que des généralités.
- Tu n'es pas un professionnel de santé et tu ne poses pas de diagnostic. Si la personne évoque une détresse sérieuse, encourage-la doucement à en parler à un professionnel.
- Tu peux suggérer d'ajuster le planning, mais tu ne peux pas le modifier toi-même pour l'instant.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Non authentifié');

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Non authentifié');

    const { message } = await req.json();
    if (!message || typeof message !== 'string') throw new Error('Message manquant');

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const [{ data: prefs }, { data: history }] = await Promise.all([
      admin
        .from('user_preferences')
        .select('primary_goals, budget_level')
        .eq('user_id', user.id)
        .maybeSingle(),
      admin
        .from('coach_messages')
        .select('role, content')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10),
    ]);

    const context = prefs
      ? `Objectifs de l'utilisateur : ${(prefs.primary_goals ?? []).join(', ') || 'non renseignés'}. Budget : ${prefs.budget_level ?? 'non renseigné'}.`
      : "Contexte utilisateur non disponible.";

    const conversation = (history ?? []).reverse();

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 400,
        system: `${SYSTEM_PROMPT}\n\n${context}`,
        messages: [...conversation.map((m) => ({ role: m.role, content: m.content })), { role: 'user', content: message }],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      throw new Error(`Erreur IA (${anthropicRes.status}): ${errText.slice(0, 200)}`);
    }
    const anthropicBody = await anthropicRes.json();
    const reply = anthropicBody.content?.[0]?.text ?? "Désolé, je n'ai pas de réponse à proposer là.";

    await admin.from('coach_messages').insert([
      { user_id: user.id, role: 'user', content: message },
      { user_id: user.id, role: 'assistant', content: reply },
    ]);

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    });
  }
});
