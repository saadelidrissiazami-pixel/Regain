// Regain — the AI fitness coach (Premium): strength programme, meals, shopping list, weekly
// adjustment and chat.
//
// Deployment:
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//   supabase functions deploy fitness-coach
//
// The calorie targets are worked out by the app (the Mifflin-St Jeor equation, under test) and
// clamped again here for safety: the model composes sessions and meals INSIDE those limits, it
// never sets them itself.

import Anthropic from 'npm:@anthropic-ai/sdk@0.125.0';
import { betaZodOutputFormat } from 'npm:@anthropic-ai/sdk@0.125.0/helpers/beta/zod';
import { createClient, type SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import { z } from 'npm:zod@4.5.4';

const MODEL = 'claude-opus-5';
// If the safety classifiers refuse a request, the API replays it automatically on the
// recommended fallback model (chosen from the category of the refusal).
const FALLBACK_BETA = 'server-side-fallback-2026-07-01';

// Cost guard rails: without them, one account can run the Anthropic bill up in a loop.
const MAX_PLANS_PER_DAY = 5;
const MAX_CHAT_PER_HOUR = 30;
const MAX_CHAT_MESSAGE_LENGTH = 2000;

// The same floor as the app: never below this, whatever target arrives.
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

// --- Schemas -------------------------------------------------------------------------------
// These have to stay aligned with src/features/fitness/types.ts on the app side.

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

// --- Prompts (stable, and so cached) -------------------------------------------------------

const SAFETY_RULES = `Safety rules, non-negotiable:
- You are not a doctor or a dietitian and you do not diagnose anything. If the person reports a condition, an injury, a pregnancy, an eating disorder or medication, adapt cautiously and clearly recommend they talk to a health professional before starting.
- No extreme measures: no prolonged fasting, no very restrictive diet, no supplement presented as essential, no promise of a numbered result.
- The allergies, intolerances and diet given are absolute constraints.
- The audience: adults rebuilding a routine, sometimes after burnout. Warm in tone, never guilt-inducing, gentle progression rather than performance.`;

const PLAN_SYSTEM_PROMPT = `You are the fitness coach in Regain, a wellbeing app. You design a personal programme from the person's profile and from nutrition targets the app has already worked out.

${SAFETY_RULES}

Training programme:
- Exactly the number of weekly sessions given, each no longer than the time available (warm-up and cool-down included).
- Only exercises that are possible with the equipment given, suited to the level of experience; 4 to 7 exercises per session.
- For each exercise: sets, reps (e.g. "8-10" or "30 s"), rest in seconds, and one short, concrete technique cue.
- Spread the muscle groups across the week and allow for sensible progression.

Food:
- Offer 3 sample days ("Day A", "Day B", "Day C") to rotate through the week, 3 to 4 meals each.
- Each day's calorie total must be within ±5% of the target, with protein close to the target. Never go below the calorie target provided.
- Simple, seasonal meals, easy to prepare, from ingredients that are easy to find.

Shopping list:
- Cover a full week with the 3 sample days in rotation.
- Amounts in metric units (g, kg, L, pieces), grouped by category: "Fruit and vegetables", "Protein", "Grains and starches", "Dairy and alternatives", "Store cupboard", "Other".

Write everything in English. Be concise: each description and each cue fits in one sentence. In coach_notes, sum up the logic of the programme in at most 3 sentences, plus one word of encouragement.`;

const CHAT_SYSTEM_PROMPT = `You are the fitness coach in Regain, a wellbeing app. You answer the person's questions about their training, their food and their motivation, drawing on the profile and current programme given below.

${SAFETY_RULES}

- Short, concrete answers: 3 to 5 sentences, unless more detail is asked for.
- You may suggest an exercise variation or a meal idea consistent with the calorie targets, but you do not change the programme yourself: for a real readjustment, invite the person to do their weekly check-in in the app.
- Write in English.`;

// --- User context (volatile, so it comes after the cache) -----------------------------------

function describeProfile(p: Profile): string {
  const age = new Date().getFullYear() - p.birth_year;
  return [
    `Goals: ${p.goals.join(', ')}`,
    `Sex: ${p.sex} · ${age} years · ${p.height_cm} cm · ${p.weight_kg} kg`,
    `Everyday activity: ${p.activity_level}`,
    `Strength-training experience: ${p.experience}`,
    `Equipment available: ${p.equipment}`,
    `Availability: ${p.days_per_week} sessions a week, ${p.session_minutes} min each at most`,
    `Diet: ${p.diet}`,
    `Allergies / intolerances: ${p.allergies ?? 'none reported'}`,
    `Health / injuries reported: ${p.health_notes ?? 'nothing reported'}`,
  ].join('\n');
}

function describeTargets(t: Targets): string {
  const strategy =
    t.strategy === 'deficit' ? 'slight deficit' : t.strategy === 'surplus' ? 'slight surplus' : 'maintenance';
  return `Daily targets (worked out by the app, to be respected): ${t.calories} kcal (${strategy}), ${t.proteinG} g protein, ${t.fatG} g fat, ${t.carbsG} g carbohydrate.`;
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
    return jsonResponse({ error: 'You have reached today’s limit on new programmes. Try again tomorrow.' }, 429);
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
      `Last week's programme:\n${JSON.stringify(previous?.program ?? [])}`,
      `Recent check-ins (most recent first, energy from 1 to 5):\n${JSON.stringify(checkins ?? [])}`,
      "Adjust the programme for the coming week from these check-ins: ease off if the sessions were not done or if energy is low, progress gently if it all went well. The calorie targets have already been recalculated by the app from the most recent weight. Explain the adjustment in coach_notes."
    );
  } else {
    sections.push('Design this person’s first programme.');
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
    return jsonResponse({ error: 'The coach cannot build this programme. Try rewording your notes.' }, 422);
  }
  if (response.stop_reason === 'max_tokens' || !response.parsed_output) {
    console.error('fitness-coach: programme incomplet', response.stop_reason);
    return jsonResponse({ error: 'The programme that came back was incomplete. Try again.' }, 502);
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
    return jsonResponse({ error: `That message is too long (${MAX_CHAT_MESSAGE_LENGTH} characters maximum).` }, 400);
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from('coach_messages')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('role', 'user')
    .gte('created_at', oneHourAgo);
  if ((count ?? 0) >= MAX_CHAT_PER_HOUR) {
    return jsonResponse({ error: 'Too many messages in the last hour. Try again a little later.' }, 429);
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
    plan ? describeTargets(plan.targets as Targets) : 'No targets worked out yet.',
    plan ? `Current programme:\n${JSON.stringify(plan.program)}` : 'No programme yet: invite the person to build one in the app.',
  ].join('\n\n');

  // The history has to begin with a user message.
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
      ? 'I cannot help you with that one. For anything to do with your health, talk to a professional.'
      : extractText(response.content) || 'Sorry, I have no answer to offer there.';

  await supabase.from('coach_messages').insert([
    { user_id: userId, role: 'user', content: trimmed },
    { user_id: userId, role: 'assistant', content: reply },
  ]);

  return jsonResponse({ reply }, 200);
}

// --- Entry point ---------------------------------------------------------------------------

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return jsonResponse({ error: 'Not authenticated' }, 401);

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    console.error('fitness-coach: ANTHROPIC_API_KEY manquante');
    return jsonResponse({ error: 'The AI coach is not configured on the server yet.' }, 503);
  }

  // An authenticated client: every read and write goes through the user's own RLS policies.
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonResponse({ error: 'Not authenticated' }, 401);

  let body: z.infer<typeof RequestSchema>;
  try {
    const parsed = RequestSchema.safeParse(await req.json());
    if (!parsed.success) return jsonResponse({ error: 'Invalid request' }, 400);
    body = parsed.data;
  } catch {
    return jsonResponse({ error: 'Invalid request' }, 400);
  }

  const profile = await loadProfile(supabase, user.id);
  if (!profile) return jsonResponse({ error: 'Fill in the fitness questionnaire first.' }, 400);
  if (new Date().getFullYear() - profile.birth_year < 18) {
    return jsonResponse({ error: 'The fitness coach is for adults only.' }, 403);
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
      return jsonResponse({ error: 'The coach is very busy. Try again in a minute.' }, 429);
    }
    if (err instanceof Anthropic.AuthenticationError) {
      console.error('fitness-coach: invalid Anthropic key');
      return jsonResponse({ error: 'The AI coach is misconfigured on the server.' }, 503);
    }
    if (err instanceof Anthropic.APIError) {
      console.error('fitness-coach: erreur API', err.status, err.message);
      return jsonResponse({ error: 'The coach is unavailable for the moment. Try again shortly.' }, 502);
    }
    console.error('fitness-coach: failed', err);
    return jsonResponse({ error: 'The coach is unavailable for the moment. Try again shortly.' }, 500);
  }
});
