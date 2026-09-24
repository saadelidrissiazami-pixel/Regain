// Regain — the AI coach (Edge Function)
// Deploy with: supabase functions deploy coach
// Required secret: supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Guard rails: without them, any authenticated account can run up the project's Anthropic bill
// (huge messages, in a loop). The hourly cap absorbs bursts; the daily one protects the margin on
// the subscription, which a single very talkative account would be enough to eat.
const MAX_MESSAGE_LENGTH = 2000;
const MAX_MESSAGES_PER_HOUR = 30;
const MAX_MESSAGES_PER_DAY = 20;

// The subject only steers the conversation: it adds no health data beyond what the person writes
// themselves.
const SUBJECTS: Record<string, string> = {
  forme: 'The person is writing to you from the Fitness area: training, nutrition, recovery.',
  'bien-etre': 'The person is writing to you from the Wellbeing area: stress, sleep, consistency.',
};

const SYSTEM_PROMPT = `You are the personal coach in Regain, an app that helps people rebuilding a routine (after burnout, after a change of life) make better use of their free time, as an alternative to passive time such as social media and streaming.

Rules:
- Warm in tone, never guilt-inducing. Never moralise about screen time or activities that were missed.
- Short, concrete answers (3-5 sentences at most, unless more detail is asked for).
- Draw on the real context provided (goals, plan, mood) rather than generalities.
- You are not a health professional and you do not diagnose anything. If the person mentions serious distress, gently encourage them to talk to a professional.
- You may suggest adjusting the plan, but you cannot change it yourself for now.`;

// The app tells us which language it speaks. 1.1 is a French build and sends nothing at all, so
// “no language” has to keep meaning French: otherwise deploying this would switch every installed
// French app's coach to English, including the build Apple is reviewing.
const LANGUAGE_RULES: Record<string, string> = {
  en: '- Write in English.',
  fr: '- Réponds en français.',
};

function systemPromptFor(language: unknown): string {
  return `${SYSTEM_PROMPT}\n${LANGUAGE_RULES[String(language)] ?? LANGUAGE_RULES.fr}`;
}

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'content-type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  // With no key, the call to Anthropic would fail and the app would report a passing outage, when
  // in fact nothing will fix itself. The two cases are kept apart.
  if (!Deno.env.get('ANTHROPIC_API_KEY')) {
    console.error('ANTHROPIC_API_KEY missing: supabase secrets set ANTHROPIC_API_KEY=...');
    return jsonResponse({ error: 'The coach is not switched on for this account yet.' }, 503);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return jsonResponse({ error: 'Not authenticated' }, 401);

  // An authenticated client only: coach_messages and user_preferences are already readable by
  // their owner through RLS, so service_role has no business here (least privilege).
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonResponse({ error: 'Not authenticated' }, 401);

  let message: unknown;
  let subject: unknown;
  let language: unknown;
  try {
    ({ message, subject, language } = await req.json());
  } catch {
    return jsonResponse({ error: 'Invalid request' }, 400);
  }

  if (typeof message !== 'string' || message.trim().length === 0) {
    return jsonResponse({ error: 'Message missing' }, 400);
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return jsonResponse({ error: `That message is too long (${MAX_MESSAGE_LENGTH} characters maximum).` }, 400);
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
    return jsonResponse({ error: 'Too many messages in the last hour. Try again a little later.' }, 429);
  }
  if ((await sentSince(new Date(now - 24 * 60 * 60 * 1000).toISOString())) >= MAX_MESSAGES_PER_DAY) {
    // A rolling window rather than a calendar day: the server does not know the user's time zone,
    // and “midnight” would hand them 40 messages in a row straddling two days.
    // So the message says 24 hours, not “tomorrow”.
    return jsonResponse(
      { error: `You have used your ${MAX_MESSAGES_PER_DAY} messages for the last 24 hours.` },
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
    ? `The user's goals: ${(prefs.primary_goals ?? []).join(', ') || 'not given'}. Budget: ${prefs.budget_level ?? 'not given'}.`
    : 'No user context available.';

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
      system: [systemPromptFor(language), SUBJECTS[String(subject)], context].filter(Boolean).join('\n\n'),
      messages: [
        ...conversation.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: message },
      ],
    }),
  });

  if (!anthropicRes.ok) {
    // The provider's details stay in the function's logs, not at the client.
    console.error('Anthropic error', anthropicRes.status, (await anthropicRes.text()).slice(0, 500));
    // A revoked key or exhausted credit is not fixed by retrying: inviting a retry would send the
    // user round in circles while the real fix waits in a console somewhere.
    if (anthropicRes.status === 401 || anthropicRes.status === 403) {
      return jsonResponse({ error: 'The coach is not set up correctly for this account.' }, 503);
    }
    return jsonResponse({ error: 'The coach is unavailable for the moment. Try again shortly.' }, 502);
  }

  const anthropicBody = await anthropicRes.json();

  // The response is a list of blocks, and the text is not necessarily the first: depending on the
  // model, a thinking block can come before it. Reading `content[0].text` then returned an empty
  // reply with an HTTP 200, the worst of both worlds.
  const reply = (anthropicBody.content ?? [])
    .filter((block: { type?: string }) => block?.type === 'text')
    .map((block: { text?: string }) => block.text ?? '')
    .join('\n')
    .trim();

  if (!reply) {
    console.error(
      'Reply with no text block',
      JSON.stringify({
        stop_reason: anthropicBody.stop_reason,
        types: (anthropicBody.content ?? []).map((b: { type?: string }) => b?.type),
      })
    );
    return jsonResponse({ error: 'The coach is unavailable for the moment. Try again shortly.' }, 502);
  }

  await supabase.from('coach_messages').insert([
    { user_id: user.id, role: 'user', content: message },
    { user_id: user.id, role: 'assistant', content: reply },
  ]);

  return jsonResponse({ reply }, 200);
});
