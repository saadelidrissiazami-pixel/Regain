// Regain — Coach IA (Edge Function)
// Déployer avec : supabase functions deploy coach
// Secret requis : supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Garde-fous : sans eux, n'importe quel compte authentifié peut faire tourner la facture
// Anthropic du projet (messages géants, en boucle). L'heure amortit les rafales ; le jour
// protège la marge de l'abonnement, qu'un seul compte très bavard suffirait à manger.
const MAX_MESSAGE_LENGTH = 2000;
const MAX_MESSAGES_PER_HOUR = 30;
const MAX_MESSAGES_PER_DAY = 20;

// Le sujet ne sert qu'à orienter la conversation : il n'ajoute aucune donnée de santé à ce que
// la personne écrit elle-même.
const SUBJECTS: Record<string, string> = {
  forme: "La personne t'écrit depuis l'espace Forme : entraînement, nutrition, récupération.",
  'bien-etre': "La personne t'écrit depuis l'espace Bien-être : stress, sommeil, régularité.",
};

const SYSTEM_PROMPT = `Tu es le coach personnel de Regain, une application qui aide des personnes en reconstruction de routine (post-burnout, changement de vie) à mieux utiliser leur temps libre, en alternative au temps passif (réseaux sociaux, streaming).

Règles :
- Ton bienveillant, jamais culpabilisant. Ne fais jamais la morale sur le temps d'écran ou les activités manquées.
- Réponses courtes et concrètes (3-5 phrases maximum sauf si on te demande plus de détails).
- Tu t'appuies sur le contexte réel fourni (objectifs, planning, humeur) plutôt que des généralités.
- Tu n'es pas un professionnel de santé et tu ne poses pas de diagnostic. Si la personne évoque une détresse sérieuse, encourage-la doucement à en parler à un professionnel.
- Tu peux suggérer d'ajuster le planning, mais tu ne peux pas le modifier toi-même pour l'instant.`;

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'content-type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  // Sans clé, l'appel à Anthropic échouerait et l'app annoncerait une panne passagère, alors
  // que rien ne s'arrangera tout seul. On distingue les deux cas.
  if (!Deno.env.get('ANTHROPIC_API_KEY')) {
    console.error('ANTHROPIC_API_KEY absent : supabase secrets set ANTHROPIC_API_KEY=...');
    return jsonResponse({ error: "Le coach n'est pas encore activé sur ce compte." }, 503);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return jsonResponse({ error: 'Non authentifié' }, 401);

  // Client authentifié uniquement : coach_messages et user_preferences sont déjà lisibles
  // par leur propriétaire via RLS, la service_role n'a rien à faire ici (moindre privilège).
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonResponse({ error: 'Non authentifié' }, 401);

  let message: unknown;
  let subject: unknown;
  try {
    ({ message, subject } = await req.json());
  } catch {
    return jsonResponse({ error: 'Requête invalide' }, 400);
  }

  if (typeof message !== 'string' || message.trim().length === 0) {
    return jsonResponse({ error: 'Message manquant' }, 400);
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return jsonResponse({ error: `Message trop long (${MAX_MESSAGE_LENGTH} caractères maximum).` }, 400);
  }

  const sentSince = async (isoDate: string) => {
    const { count } = await supabase
      .from('coach_messages')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('role', 'user')
      .gte('created_at', isoDate);
    return count ?? 0;
  };

  const now = Date.now();
  if ((await sentSince(new Date(now - 60 * 60 * 1000).toISOString())) >= MAX_MESSAGES_PER_HOUR) {
    return jsonResponse({ error: 'Trop de messages sur la dernière heure. Réessayez un peu plus tard.' }, 429);
  }
  if ((await sentSince(new Date(now - 24 * 60 * 60 * 1000).toISOString())) >= MAX_MESSAGES_PER_DAY) {
    // Fenêtre glissante plutôt que jour calendaire : le serveur ne connaît pas le fuseau de
    // l'utilisateur, et « minuit » lui donnerait 40 messages d'affilée à cheval sur deux jours.
    // Le message dit donc 24 heures, et non « demain ».
    return jsonResponse(
      { error: `Tu as atteint tes ${MAX_MESSAGES_PER_DAY} messages sur les dernières 24 heures.` },
      429
    );
  }

  const [{ data: prefs }, { data: history }] = await Promise.all([
    supabase.from('user_preferences').select('primary_goals, budget_level').eq('user_id', user.id).maybeSingle(),
    supabase
      .from('coach_messages')
      .select('role, content')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  const context = prefs
    ? `Objectifs de l'utilisateur : ${(prefs.primary_goals ?? []).join(', ') || 'non renseignés'}. Budget : ${prefs.budget_level ?? 'non renseigné'}.`
    : 'Contexte utilisateur non disponible.';

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
      system: [SYSTEM_PROMPT, SUBJECTS[String(subject)], context].filter(Boolean).join('\n\n'),
      messages: [
        ...conversation.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: message },
      ],
    }),
  });

  if (!anthropicRes.ok) {
    // Les détails du fournisseur restent dans les logs de la fonction, pas chez le client.
    console.error('Anthropic error', anthropicRes.status, (await anthropicRes.text()).slice(0, 500));
    // Une clé révoquée ou un crédit épuisé ne se répare pas en réessayant : inviter à réessayer
    // ferait tourner l'utilisateur en rond pendant que le vrai correctif attend côté console.
    if (anthropicRes.status === 401 || anthropicRes.status === 403) {
      return jsonResponse({ error: "Le coach n'est pas activé correctement sur ce compte." }, 503);
    }
    return jsonResponse({ error: 'Le coach est momentanément indisponible. Réessayez dans un instant.' }, 502);
  }

  const anthropicBody = await anthropicRes.json();

  // La réponse est une liste de blocs dont le texte n'est pas forcément le premier : selon le
  // modèle, un bloc de réflexion peut le précéder. Lire `content[0].text` renvoyait alors une
  // réponse vide avec un HTTP 200, le pire des deux mondes.
  const reply = (anthropicBody.content ?? [])
    .filter((block: { type?: string }) => block?.type === 'text')
    .map((block: { text?: string }) => block.text ?? '')
    .join('\n')
    .trim();

  if (!reply) {
    console.error(
      'Réponse sans bloc texte',
      JSON.stringify({
        stop_reason: anthropicBody.stop_reason,
        types: (anthropicBody.content ?? []).map((b: { type?: string }) => b?.type),
      })
    );
    return jsonResponse({ error: 'Le coach est momentanément indisponible. Réessayez dans un instant.' }, 502);
  }

  await supabase.from('coach_messages').insert([
    { user_id: user.id, role: 'user', content: message },
    { user_id: user.id, role: 'assistant', content: reply },
  ]);

  return jsonResponse({ reply }, 200);
});
