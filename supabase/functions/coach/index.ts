// Regain — Coach IA (Edge Function)
// Déployer avec : supabase functions deploy coach
// Secret requis : supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Garde-fous de coût : l'API Anthropic est facturée à l'usage et cette fonction est
// appelable par n'importe quel compte authentifié.
const MAX_MESSAGE_CHARS = 2000;
const RATE_LIMIT_MESSAGES = 30;
const RATE_LIMIT_WINDOW_MINUTES = 60;

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
    if (message.length > MAX_MESSAGE_CHARS) {
      throw new Error(`Message trop long (${MAX_MESSAGE_CHARS} caractères maximum).`);
    }

    // Le client authentifié suffit : les policies RLS de user_preferences et
    // coach_messages limitent déjà chaque utilisateur à ses propres lignes. Pas
    // besoin de la clé service_role, qui les contournerait toutes.
    const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60_000).toISOString();
    const { count: recentCount } = await supabase
      .from('coach_messages')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'user')
      .gte('created_at', since);

    if ((recentCount ?? 0) >= RATE_LIMIT_MESSAGES) {
      throw new Error('Vous avez atteint la limite de messages pour cette heure. Réessayez un peu plus tard.');
    }

    const [{ data: prefs }, { data: history }] = await Promise.all([
      supabase
        .from('user_preferences')
        .select('primary_goals, budget_level')
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase
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
      // Le détail de l'erreur amont reste côté serveur : il peut contenir des
      // informations sur la configuration du compte Anthropic.
      console.error('Anthropic error', anthropicRes.status, (await anthropicRes.text()).slice(0, 500));
      throw new Error("Le coach n'a pas pu répondre pour le moment. Réessayez dans un instant.");
    }
    const anthropicBody = await anthropicRes.json();
    const reply = anthropicBody.content?.[0]?.text ?? "Désolé, je n'ai pas de réponse à proposer là.";

    await supabase.from('coach_messages').insert([
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
