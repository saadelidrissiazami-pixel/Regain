// Regain — estimating a meal's calories from a photo (Edge Function)
// Deploy with: supabase functions deploy nutrition-photo
// Required secret: supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// An image costs considerably more than a message, so the daily cap is tighter than the coach's.
// It is counted from the rows the previous scans wrote, which needs no table of its own.
const MAX_SCANS_PER_DAY = 20;
// Anthropic refuses an image above 5MB. Base64 inflates the payload by about a third, so the
// limit is set on what actually arrives here — the app resizes before sending.
const MAX_IMAGE_BYTES = 4_500_000;
const ALLOWED_MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const SYSTEM_PROMPT = `You estimate the nutrition of a meal from a photograph, for a wellbeing app.

Return ONLY a JSON object, with no prose around it, in this exact shape:
{"items":[{"label":"string","calories":number,"protein_g":number,"carbs_g":number,"fat_g":number}],"note":"string"}

Rules:
- One entry per distinct food you can identify. At most 6.
- "label" is what a person would call it, two or three words, in the language asked for.
- "calories" is for the portion actually visible, not per 100g. Integer.
- "protein_g", "carbs_g" and "fat_g" are integers for that same visible portion, 0 where you
  genuinely cannot tell. "carbs_g" excludes fibre, as a European label does.
- Keep the three macronutrients roughly consistent with the calories (4/4/9 kcal per gram).
- Judge the portion from the plate, the cutlery or the packaging when they are visible.
- If the photo shows no food at all, return {"items":[],"note":"no food"}.
- Estimating from a photograph is imprecise. When a food is ambiguous, choose the more common
  preparation rather than the most calorific one, and say so briefly in "note".
- Never comment on what the person is eating, never judge the meal, never mention weight.`;

const LANGUAGE_RULES: Record<string, string> = {
  en: 'Write the labels in English.',
  fr: 'Réponds en français.',
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'content-type': 'application/json' },
  });
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return jsonResponse({ error: 'Not signed in.' }, 401);

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonResponse({ error: 'Not signed in.' }, 401);

  let image: unknown;
  let mediaType: unknown;
  let language: unknown;
  try {
    ({ image, mediaType, language } = await req.json());
  } catch {
    return jsonResponse({ error: 'Malformed request.' }, 400);
  }

  if (typeof image !== 'string' || image.length === 0) {
    return jsonResponse({ error: 'No photo received.' }, 400);
  }
  if (image.length > MAX_IMAGE_BYTES) {
    return jsonResponse({ error: 'That photo is too large.' }, 413);
  }
  const type = typeof mediaType === 'string' && ALLOWED_MEDIA_TYPES.includes(mediaType) ? mediaType : 'image/jpeg';

  // The cap counts the entries earlier scans created today.
  const { count } = await supabase
    .from('nutrition_entries')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('entry_date', todayISO())
    .eq('source', 'photo');
  if ((count ?? 0) >= MAX_SCANS_PER_DAY) {
    return jsonResponse({ error: 'That is a lot of photos for one day. Try again tomorrow.' }, 429);
  }

  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-5',
      max_tokens: 700,
      system: [SYSTEM_PROMPT, LANGUAGE_RULES[String(language)] ?? LANGUAGE_RULES.fr].join('\n\n'),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: type, data: image } },
            { type: 'text', text: 'Estimate this meal.' },
          ],
        },
      ],
    }),
  });

  if (!anthropicRes.ok) {
    console.error('Anthropic error', anthropicRes.status, (await anthropicRes.text()).slice(0, 500));
    if (anthropicRes.status === 401 || anthropicRes.status === 403) {
      return jsonResponse({ error: 'The photo estimate is not set up correctly for this account.' }, 503);
    }
    return jsonResponse({ error: 'The photo estimate is unavailable for the moment.' }, 502);
  }

  const body = await anthropicRes.json();
  // A thinking block can precede the text, so the text is collected rather than read at index 0.
  const raw = (body.content ?? [])
    .filter((block: { type?: string }) => block?.type === 'text')
    .map((block: { text?: string }) => block.text ?? '')
    .join('\n')
    .trim();

  // The model was asked for bare JSON, but a fenced block is the classic near-miss and is cheap
  // to survive.
  const jsonText = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  let parsed: { items?: unknown; note?: unknown };
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    console.error('Unparseable estimate', raw.slice(0, 300));
    return jsonResponse({ error: 'That photo could not be read.' }, 502);
  }

  // Everything below this line treats the model's output as untrusted: the numbers go on to be
  // written to a table with its own constraints, and a NaN or a negative would be rejected there
  // as a server error the person cannot act on.
  // A macronutrient outside what the table will accept becomes 0 rather than failing the whole
  // estimate: one implausible number should not lose the five sound ones beside it.
  const macro = (value: unknown, max: number): number => {
    const n = Math.round(Number(value));
    return Number.isFinite(n) && n >= 0 && n <= max ? n : 0;
  };

  type RawItem = { label?: unknown; calories?: unknown; protein_g?: unknown; carbs_g?: unknown; fat_g?: unknown };
  const items = (Array.isArray(parsed.items) ? parsed.items : [])
    .slice(0, 6)
    .map((item: RawItem) => ({
      label: typeof item?.label === 'string' ? item.label.trim().slice(0, 80) : '',
      calories: Math.round(Number(item?.calories)),
      protein_g: macro(item?.protein_g, 500),
      carbs_g: macro(item?.carbs_g, 1000),
      fat_g: macro(item?.fat_g, 500),
    }))
    .filter(
      (item: { label: string; calories: number }) =>
        item.label.length > 0 && Number.isFinite(item.calories) && item.calories >= 0 && item.calories <= 10000
    );

  return jsonResponse({ items, note: typeof parsed.note === 'string' ? parsed.note.slice(0, 200) : '' });
});
