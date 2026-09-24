#!/usr/bin/env node
/**
 * Fills a demo account with example data, for Apple's review.
 *
 *   DEMO_EMAIL=saadelidrissiazami+demo@gmail.com DEMO_PASSWORD='…' node scripts/seed-demo.mjs
 *
 * Replace the password with your own: together with the address, those are the credentials you
 * will give the Apple review team. The account is created if it does not exist yet.
 * The script signs in as that account and writes only its own data: the password never leaves
 * your terminal.
 *
 * Repeatable, but destructive: it deletes EVERY availability slot, energy check-in and finished
 * wellbeing session on the account before writing its own — not only the ones from the previous
 * run. Only run it on an account whose data can afford to disappear.
 */
import { readFileSync } from 'node:fs';

function env(name) {
  if (process.env[name]) return process.env[name];
  try {
    const line = readFileSync(new URL('../.env', import.meta.url), 'utf8')
      .split('\n')
      .find((l) => l.startsWith(`${name}=`));
    return line?.slice(name.length + 1).trim();
  } catch {
    return undefined;
  }
}

const URL_BASE = env('EXPO_PUBLIC_SUPABASE_URL');
const ANON = env('EXPO_PUBLIC_SUPABASE_ANON_KEY');
const EMAIL = process.env.DEMO_EMAIL;
const PASSWORD = process.env.DEMO_PASSWORD;

// A script run by hand: one readable sentence beats a Node stack trace.
function fail(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

const usage = "DEMO_EMAIL=saadelidrissiazami+demo@gmail.com DEMO_PASSWORD='your-password' node scripts/seed-demo.mjs";

if (!URL_BASE || !ANON) fail('EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY cannot be found (.env).');
// The “…” from the documentation, pasted as-is, is the likeliest mistake: say so plainly.
if (!EMAIL || !PASSWORD) fail(`Set DEMO_EMAIL and DEMO_PASSWORD:\n  ${usage}`);
if (!/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(EMAIL)) {
  fail(`“${EMAIL}” is not an email address. Replace the example values with your own:\n  ${usage}`);
}
if (PASSWORD.length < 8) fail('DEMO_PASSWORD has to be at least 8 characters (Supabase requires it).');
// An example pasted as-is is longer than 8 characters: the length check lets it through, and
// Supabase creates an account with that very password. Seen twice, so it is said here.
const PLACEHOLDERS = ['your-password', 'mot-de-passe', 'le-vrai-mot-de-passe', 'choisis-en-un', 'ton-mot-de-passe'];
if (PLACEHOLDERS.includes(PASSWORD.toLowerCase())) {
  // Without this exception, the message would point at `usage`, which contains the very value
  // that has just been refused.
  fail(`“${PASSWORD}” is the example value from the documentation.\n  Run it again with your own password in single quotes.`);
}

const iso = (date) => date.toISOString().slice(0, 10);
const day = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d;
};
const mondayOfThisWeek = () => {
  const d = new Date();
  const shift = d.getDay() === 0 ? -6 : 1 - d.getDay();
  d.setDate(d.getDate() + shift);
  return d;
};

let token = ANON;

async function api(path, { method = 'GET', body, prefer } = {}) {
  const response = await fetch(`${URL_BASE}${path}`, {
    method,
    headers: {
      apikey: ANON,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(prefer ? { Prefer: prefer } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${method} ${path} → ${response.status} ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : null;
}

async function auth(path, label) {
  const response = await fetch(`${URL_BASE}${path}`, {
    method: 'POST',
    headers: { apikey: ANON, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const data = await response.json();
  if (!response.ok) return { error: data.error_description ?? data.msg ?? `${label} → ${response.status}` };
  return data;
}

async function signInOrCreate() {
  const session = await auth('/auth/v1/token?grant_type=password', 'sign in');
  if (!session.error) return { userId: session.user.id, created: false, accessToken: session.access_token };

  // No such account: create it. Any other error (a wrong password) has to stay visible.
  if (!/invalid login credentials/i.test(session.error)) fail(`Sign-in refused: ${session.error}`);

  const signUp = await auth('/auth/v1/signup', 'sign up');
  // Supabase answers “Invalid login credentials” both for a missing account and for a
  // wrong password; signing up is what settles it.
  if (/already registered/i.test(signUp.error ?? '')) {
    fail(`The account ${EMAIL} exists, but that password does not match it.`);
  }
  if (signUp.error) fail(`Account creation refused: ${signUp.error}`);
  if (!signUp.access_token) {
    fail(
      `Account created, but Supabase is waiting for an email confirmation.\n` +
        `  Open the link sent to ${EMAIL}, then run this command again.`,
    );
  }
  return { userId: signUp.user.id, created: true, accessToken: signUp.access_token };
}

const { userId, created, accessToken } = await signInOrCreate();
token = accessToken;
console.log(created ? `Account ${EMAIL} created` : `Signed in as ${EMAIL}`);

// 1. Profile and preferences: onboarding counts as done.
await api('/rest/v1/profiles', {
  method: 'POST',
  prefer: 'resolution=merge-duplicates',
  body: [{ id: userId, display_name: 'Camille', onboarding_completed_at: new Date().toISOString() }],
});
await api('/rest/v1/user_preferences', {
  method: 'POST',
  prefer: 'resolution=merge-duplicates',
  body: [
    {
      user_id: userId,
      primary_goals: ['plus_energie', 'mieux_dormir', 'plus_mouvement'],
      typical_energy_by_slot: { matin: 'moyen', apres_midi: 'eleve', soir: 'bas' },
      budget_level: 'modere',
    },
  ],
});

// 2. Availability: three weekday evenings and Saturday morning.
await api(`/rest/v1/availability_slots?user_id=eq.${userId}`, { method: 'DELETE' });
await api('/rest/v1/availability_slots', {
  method: 'POST',
  body: [0, 2, 4]
    .map((dayOfWeek) => ({
      user_id: userId,
      label: 'After work',
      is_recurring: true,
      day_of_week: dayOfWeek,
      time_slot: 'soir',
      start_time: '18:30',
      end_time: '20:00',
    }))
    .concat([
      {
        user_id: userId,
        label: 'Free morning',
        is_recurring: true,
        day_of_week: 5,
        time_slot: 'matin',
        start_time: '09:00',
        end_time: '11:30',
      },
    ]),
});

// 3. The week's plan, through the same function the app uses.
// `active=is.true` matters more than it looks: the rows left inactive are the ones from an
// earlier catalogue, which this build has no English wording for. Without the filter the demo
// account — the one Apple reviews — ends up with French activity titles on its home screen.
const catalog = await api(
  '/rest/v1/activities_catalog?select=id,title,duration_minutes&active=is.true&order=duration_minutes&limit=8',
);
const weekStart = mondayOfThisWeek();
const items = [0, 2, 4, 5].map((offset, index) => {
  const date = new Date(weekStart);
  date.setDate(date.getDate() + offset);
  return { activity_id: catalog[index % catalog.length].id, date: iso(date), time_slot: offset === 5 ? 'matin' : 'soir' };
});
await api('/rest/v1/rpc/replace_week_plan', { method: 'POST', body: { p_week_start: iso(weekStart), p_items: items } });

// 4. Two activities already done, so the tracking is not empty.
const planned = await api(`/rest/v1/planned_activities?select=id&user_id=eq.${userId}&week_start_date=eq.${iso(weekStart)}&order=date&limit=2`);
for (const activity of planned) {
  await api(`/rest/v1/planned_activities?id=eq.${activity.id}`, { method: 'PATCH', body: { status: 'realise' } });
  await api('/rest/v1/activity_logs', { method: 'POST', body: [{ user_id: userId, planned_activity_id: activity.id }] });
}

// 5. Energy check-ins for the last few days.
await api(`/rest/v1/energy_checkins?user_id=eq.${userId}`, { method: 'DELETE' });
await api('/rest/v1/energy_checkins', {
  method: 'POST',
  body: [3, 4, 3, 5, 4].map((level, index) => ({
    user_id: userId,
    energy_level: level,
    checkin_at: day(-index - 1).toISOString(),
  })),
});

// 6. Finished wellbeing sessions, with ratings and written answers.
const programs = await api('/rest/v1/wellbeing_programs?select=id,slug,category&premium_only=is.false&limit=4');
await api(`/rest/v1/wellbeing_sessions_completed?user_id=eq.${userId}`, { method: 'DELETE' });
const journalEntries = [
  { mood: 4, note: 'A short breathing session before a meeting, and it helped.', prompt: 'What changed in your body during the session?', answer: 'My shoulders came back down.' },
  { mood: 5, note: null, prompt: 'What small thing was good today?', answer: 'A coffee in the sun, with no phone.' },
  { mood: 3, note: 'A dense day, hard to settle.', prompt: 'Which thoughts came back the most?', answer: 'The list of things to do.' },
  { mood: 4, note: null, prompt: 'What is stopping you letting go tonight?', answer: 'Nothing in particular, just the habit of scrolling.' },
];
await api('/rest/v1/wellbeing_sessions_completed', {
  method: 'POST',
  body: journalEntries.map((entry, index) => ({
    user_id: userId,
    program_id: programs[index % programs.length].id,
    session_index: 0,
    completed_at: day(-index - 1).toISOString(),
    mood: entry.mood,
    note: entry.note,
    reflections: [{ prompt: entry.prompt, answer: entry.answer }],
  })),
});

// 7. The fitness profile, so the Fitness tab is complete.
await api('/rest/v1/fitness_profiles', {
  method: 'POST',
  prefer: 'resolution=merge-duplicates',
  body: [
    {
      user_id: userId,
      goals: ['bien_etre', 'tonifier'],
      sex: 'femme',
      birth_year: 1994,
      height_cm: 170,
      weight_kg: 68,
      activity_level: 'modere',
      experience: 'debutant',
      equipment: 'halteres_maison',
      days_per_week: 3,
      session_minutes: 45,
      diet: 'omnivore',
      allergies: null,
      health_notes: null,
    },
  ],
});

console.log(`
Demo account ready:
  · onboarding done, 4 recurring availability slots
  · the week's plan, with 2 activities already ticked off
  · 5 energy check-ins, 4 wellbeing sessions with ratings and answers
  · the fitness profile filled in

One last step, in the app with this account: the Fitness tab → “Build my programme”
(the programme, the meals and the shopping list are computed in the app).`);
