// Regain — Coach forme IA (Premium) : programme de musculation, menus, liste de courses,
// ajustement hebdomadaire et chat.
//
// Déploiement :
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//   supabase functions deploy fitness-coach
//
// Les cibles caloriques sont calculées par l'app (formule Mifflin-St Jeor, testée) et
// re-bornées ici par sécurité : l'IA compose séances et menus DANS ces limites, elle ne les
// fixe jamais elle-même.

import Anthropic from 'npm:@anthropic-ai/sdk@0.125.0';
import { betaZodOutputFormat } from 'npm:@anthropic-ai/sdk@0.125.0/helpers/beta/zod';
import { createClient, type SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import { z } from 'npm:zod@4.5.4';

const MODEL = 'claude-opus-5';
// Si les classifieurs de sécurité refusent une requête, l'API la rejoue automatiquement sur
// le modèle de repli recommandé (choisi selon la catégorie du refus).
const FALLBACK_BETA = 'server-side-fallback-2026-07-01';

// Garde-fous de coût : sans eux, un compte peut faire tourner la facture Anthropic en boucle.
const MAX_PLANS_PER_DAY = 5;
const MAX_CHAT_PER_HOUR = 30;
const MAX_CHAT_MESSAGE_LENGTH = 2000;

// Même plancher que l'app : jamais sous ce seuil, quelle que soit la cible reçue.
const CALORIE_FLOOR = { femme: 1200, homme: 1500 } as const;
const CALORIE_CEILING = 4500;

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

// --- Schémas -------------------------------------------------------------------------------
// Doivent rester alignés avec src/features/fitness/types.ts côté app.

const TargetsSchema = z.object({
  bmr: z.number(),
  maintenance: z.number(),
  calories: z.number(),
  proteinG: z.number(),
  fatG: z.number(),
  carbsG: z.number(),
  strategy: z.enum(['deficit', 'surplus', 'maintien']),
  floorApplied: z.boolean(),
});
type Targets = z.infer<typeof TargetsSchema>;

const RequestSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('generate_plan'), targets: TargetsSchema }),
  z.object({ action: z.literal('adjust_plan'), targets: TargetsSchema }),
  z.object({ action: z.literal('chat'), message: z.string() }),
]);

const PlanSchema = z.object({
  program: z.array(
    z.object({
      day_label: z.string(),
      focus: z.string(),
      duration_minutes: z.number().int(),
      warmup: z.string(),
      exercises: z.array(
        z.object({
          name: z.string(),
          sets: z.number().int(),
          reps: z.string(),
          rest_seconds: z.number().int(),
          tip: z.string(),
        })
      ),
      cooldown: z.string(),
    })
  ),
  meals: z.array(
    z.object({
      day_label: z.string(),
      total_calories: z.number().int(),
      meals: z.array(
        z.object({
          name: z.string(),
          description: z.string(),
          calories: z.number().int(),
          protein_g: z.number().int(),
        })
      ),
    })
  ),
  shopping_list: z.array(
    z.object({
      item: z.string(),
      quantity: z.string(),
      category: z.string(),
    })
  ),
  coach_notes: z.string(),
});

type Profile = {
  goals: string[];
  sex: 'femme' | 'homme';
  birth_year: number;
  height_cm: number;
  weight_kg: number;
  activity_level: string;
  experience: string;
  equipment: string;
  days_per_week: number;
  session_minutes: number;
  diet: string;
  allergies: string | null;
  health_notes: string | null;
};

// --- Prompts (stables, donc mis en cache) --------------------------------------------------

const SAFETY_RULES = `Règles de sécurité, non négociables :
- Tu n'es pas médecin ni diététicien et tu ne poses aucun diagnostic. Si la personne signale une pathologie, une blessure, une grossesse, un trouble alimentaire ou un traitement, adapte de façon prudente et recommande clairement d'en parler à un professionnel de santé avant de commencer.
- Aucune mesure extrême : pas de jeûne prolongé, pas de régime très restrictif, pas de complément présenté comme indispensable, pas de promesse de résultat chiffrée.
- Les allergies, intolérances et le régime alimentaire indiqués sont des contraintes absolues.
- Public : des adultes qui reconstruisent leur routine, parfois après un burn-out. Ton bienveillant, jamais culpabilisant, progression douce plutôt que performance.`;

const PLAN_SYSTEM_PROMPT = `Tu es le coach forme de Regain, une application française de bien-être. Tu conçois un programme personnalisé à partir du profil de la personne et de cibles nutritionnelles déjà calculées par l'application.

${SAFETY_RULES}

Programme d'entraînement :
- Exactement le nombre de séances hebdomadaires indiqué, chacune d'une durée inférieure ou égale au temps disponible (échauffement et retour au calme compris).
- Uniquement des exercices réalisables avec le matériel indiqué, adaptés au niveau d'expérience ; 4 à 7 exercices par séance.
- Pour chaque exercice : séries, répétitions (ex. « 8-10 » ou « 30 s »), repos en secondes, et un conseil de technique court et concret.
- Répartis les groupes musculaires sur la semaine et prévois une progression raisonnable.

Alimentation :
- Propose 3 journées types (« Journée A », « Journée B », « Journée C ») à alterner sur la semaine, de 3 à 4 repas chacune.
- Le total calorique de chaque journée doit être à ±5 % de la cible, avec un apport en protéines proche de la cible. Ne descends jamais sous la cible calorique fournie.
- Repas simples, de saison, faciles à préparer, avec des ingrédients courants en France.

Liste de courses :
- Couvre une semaine complète avec la rotation des 3 journées types.
- Quantités en unités métriques (g, kg, L, pièces), regroupées par catégorie : « Fruits et légumes », « Protéines », « Féculents et céréales », « Produits laitiers et alternatives », « Épicerie », « Autres ».

Écris tout en français. Sois concis : chaque description et chaque conseil tient en une phrase. Dans coach_notes, résume en 3 phrases maximum la logique du programme et un encouragement.`;

const CHAT_SYSTEM_PROMPT = `Tu es le coach forme de Regain, une application française de bien-être. Tu réponds aux questions de la personne sur son entraînement, son alimentation et sa motivation, en t'appuyant sur son profil et son programme actuel fournis ci-dessous.

${SAFETY_RULES}

- Réponses courtes et concrètes : 3 à 5 phrases, sauf si on te demande plus de détails.
- Tu peux proposer une variante d'exercice ou une idée de repas cohérente avec les cibles caloriques, mais tu ne modifies pas le programme toi-même : pour un vrai réajustement, invite la personne à faire son bilan de la semaine dans l'application.
- Écris en français.`;

// --- Contexte utilisateur (volatil, après le cache) -----------------------------------------

function describeProfile(p: Profile): string {
  const age = new Date().getFullYear() - p.birth_year;
  return [
    `Objectifs : ${p.goals.join(', ')}`,
    `Sexe : ${p.sex} · ${age} ans · ${p.height_cm} cm · ${p.weight_kg} kg`,
    `Activité quotidienne : ${p.activity_level}`,
    `Expérience en musculation : ${p.experience}`,
    `Matériel disponible : ${p.equipment}`,
    `Disponibilité : ${p.days_per_week} séances par semaine, ${p.session_minutes} min maximum chacune`,
    `Régime alimentaire : ${p.diet}`,
    `Allergies / intolérances : ${p.allergies ?? 'aucune signalée'}`,
    `Santé / blessures signalées : ${p.health_notes ?? 'rien de signalé'}`,
  ].join('\n');
}

function describeTargets(t: Targets): string {
  const strategy =
    t.strategy === 'deficit' ? 'léger déficit' : t.strategy === 'surplus' ? 'léger surplus' : 'équilibre';
  return `Cibles quotidiennes (calculées par l'application, à respecter) : ${t.calories} kcal (${strategy}), ${t.proteinG} g de protéines, ${t.fatG} g de lipides, ${t.carbsG} g de glucides.`;
}

function sanitizeTargets(targets: Targets, sex: Profile['sex']): Targets {
  const calories = Math.min(CALORIE_CEILING, Math.max(CALORIE_FLOOR[sex], Math.round(targets.calories)));
  return { ...targets, calories };
}

function extractText(content: Anthropic.Beta.BetaContentBlock[]): string {
  return content
    .filter((block): block is Anthropic.Beta.BetaTextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
    .trim();
}

// --- Actions --------------------------------------------------------------------------------

async function loadProfile(supabase: SupabaseClient, userId: string): Promise<Profile | null> {
  const { data } = await supabase.from('fitness_profiles').select('*').eq('user_id', userId).maybeSingle();
  return data ? { ...data, weight_kg: Number(data.weight_kg) } : null;
}

async function generatePlan(
  anthropic: Anthropic,
  supabase: SupabaseClient,
  userId: string,
  profile: Profile,
  targets: Targets,
  mode: 'generate_plan' | 'adjust_plan'
) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from('fitness_plans')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', since);
  if ((count ?? 0) >= MAX_PLANS_PER_DAY) {
    return jsonResponse({ error: 'Limite de programmes atteinte pour aujourd’hui. Réessayez demain.' }, 429);
  }

  const sections = [describeProfile(profile), describeTargets(targets)];

  if (mode === 'adjust_plan') {
    const [{ data: previous }, { data: checkins }] = await Promise.all([
      supabase
        .from('fitness_plans')
        .select('program, coach_notes')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('fitness_checkins')
        .select('weight_kg, sessions_done, energy, note, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(4),
    ]);
    sections.push(
      `Programme de la semaine écoulée :\n${JSON.stringify(previous?.program ?? [])}`,
      `Bilans récents (du plus récent au plus ancien, énergie de 1 à 5) :\n${JSON.stringify(checkins ?? [])}`,
      "Ajuste le programme pour la semaine qui vient à partir de ces bilans : allège si les séances n'ont pas été faites ou si l'énergie est basse, progresse doucement si tout s'est bien passé. Les cibles caloriques ont déjà été recalculées par l'application avec le poids le plus récent. Explique l'ajustement dans coach_notes."
    );
  } else {
    sections.push('Conçois le premier programme de cette personne.');
  }

  const response = await anthropic.beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    betas: [FALLBACK_BETA],
    fallbacks: 'default',
    output_config: { effort: 'medium', format: betaZodOutputFormat(PlanSchema) },
    system: [{ type: 'text', text: PLAN_SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: sections.join('\n\n') }],
  });

  if (response.stop_reason === 'refusal') {
    return jsonResponse({ error: 'Le coach ne peut pas générer ce programme. Essayez de reformuler vos notes.' }, 422);
  }
  if (response.stop_reason === 'max_tokens' || !response.parsed_output) {
    console.error('fitness-coach: programme incomplet', response.stop_reason);
    return jsonResponse({ error: 'Le programme généré était incomplet. Réessayez.' }, 502);
  }

  const plan = response.parsed_output;
  const { data: saved, error } = await supabase
    .from('fitness_plans')
    .insert({
      user_id: userId,
      targets,
      program: plan.program,
      meals: plan.meals,
      shopping_list: plan.shopping_list,
      coach_notes: plan.coach_notes,
    })
    .select()
    .single();
  if (error) throw error;

  return jsonResponse({ plan: saved }, 200);
}

async function chat(anthropic: Anthropic, supabase: SupabaseClient, userId: string, profile: Profile, message: string) {
  const trimmed = message.trim();
  if (!trimmed) return jsonResponse({ error: 'Message manquant' }, 400);
  if (trimmed.length > MAX_CHAT_MESSAGE_LENGTH) {
    return jsonResponse({ error: `Message trop long (${MAX_CHAT_MESSAGE_LENGTH} caractères maximum).` }, 400);
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from('coach_messages')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('role', 'user')
    .gte('created_at', oneHourAgo);
  if ((count ?? 0) >= MAX_CHAT_PER_HOUR) {
    return jsonResponse({ error: 'Trop de messages sur la dernière heure. Réessayez un peu plus tard.' }, 429);
  }

  const [{ data: plan }, { data: history }] = await Promise.all([
    supabase
      .from('fitness_plans')
      .select('targets, program, coach_notes')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('coach_messages')
      .select('role, content')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(12),
  ]);

  const context = [
    `Profil :\n${describeProfile(profile)}`,
    plan ? describeTargets(plan.targets as Targets) : 'Aucune cible calculée pour le moment.',
    plan ? `Programme actuel :\n${JSON.stringify(plan.program)}` : "Pas encore de programme : invite la personne à le générer dans l'application.",
  ].join('\n\n');

  // L'historique doit commencer par un message utilisateur.
  const ordered = (history ?? []).reverse();
  const firstUser = ordered.findIndex((m) => m.role === 'user');
  const past: Anthropic.Beta.BetaMessageParam[] = (firstUser === -1 ? [] : ordered.slice(firstUser)).map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content as string,
  }));

  const response = await anthropic.beta.messages.create({
    model: MODEL,
    max_tokens: 4000,
    betas: [FALLBACK_BETA],
    fallbacks: 'default',
    output_config: { effort: 'low' },
    system: [
      { type: 'text', text: CHAT_SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
      { type: 'text', text: context },
    ],
    messages: [...past, { role: 'user', content: trimmed }],
  });

  const reply =
    response.stop_reason === 'refusal'
      ? "Je ne peux pas t'aider sur ce point. Pour toute question de santé, parles-en à un professionnel."
      : extractText(response.content) || "Désolé, je n'ai pas de réponse à proposer là.";

  await supabase.from('coach_messages').insert([
    { user_id: userId, role: 'user', content: trimmed },
    { user_id: userId, role: 'assistant', content: reply },
  ]);

  return jsonResponse({ reply }, 200);
}

// --- Point d'entrée -------------------------------------------------------------------------

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return jsonResponse({ error: 'Non authentifié' }, 401);

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    console.error('fitness-coach: ANTHROPIC_API_KEY manquante');
    return jsonResponse({ error: "Le coach IA n'est pas encore configuré côté serveur." }, 503);
  }

  // Client authentifié : toutes les lectures/écritures passent par les policies RLS de l'utilisateur.
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonResponse({ error: 'Non authentifié' }, 401);

  let body: z.infer<typeof RequestSchema>;
  try {
    const parsed = RequestSchema.safeParse(await req.json());
    if (!parsed.success) return jsonResponse({ error: 'Requête invalide' }, 400);
    body = parsed.data;
  } catch {
    return jsonResponse({ error: 'Requête invalide' }, 400);
  }

  const profile = await loadProfile(supabase, user.id);
  if (!profile) return jsonResponse({ error: "Complétez d'abord le questionnaire forme." }, 400);
  if (new Date().getFullYear() - profile.birth_year < 18) {
    return jsonResponse({ error: 'Le coach forme est réservé aux adultes.' }, 403);
  }

  const anthropic = new Anthropic({ apiKey });

  try {
    if (body.action === 'chat') return await chat(anthropic, supabase, user.id, profile, body.message);
    return await generatePlan(
      anthropic,
      supabase,
      user.id,
      profile,
      sanitizeTargets(body.targets, profile.sex),
      body.action
    );
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return jsonResponse({ error: 'Le coach est très sollicité. Réessayez dans une minute.' }, 429);
    }
    if (err instanceof Anthropic.AuthenticationError) {
      console.error('fitness-coach: clé Anthropic invalide');
      return jsonResponse({ error: 'Le coach IA est mal configuré côté serveur.' }, 503);
    }
    if (err instanceof Anthropic.APIError) {
      console.error('fitness-coach: erreur API', err.status, err.message);
      return jsonResponse({ error: 'Le coach est momentanément indisponible. Réessayez dans un instant.' }, 502);
    }
    console.error('fitness-coach: échec', err);
    return jsonResponse({ error: 'Le coach est momentanément indisponible. Réessayez dans un instant.' }, 500);
  }
});
