#!/usr/bin/env node
/**
 * Remplit un compte de démonstration avec des données d'exemple, pour la revue Apple.
 *
 *   DEMO_EMAIL=demo@exemple.fr DEMO_PASSWORD='…' node scripts/seed-demo.mjs
 *
 * Remplacez les deux valeurs par les vôtres : ce sont les identifiants que vous donnerez à
 * l'équipe de revue Apple. Le compte est créé s'il n'existe pas encore.
 * Le script se connecte comme lui et n'écrit que ses propres données : le mot de passe ne sort
 * pas de votre terminal. Relançable : il remplace ce qu'il a créé la fois précédente.
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

// Script lancé à la main : une phrase lisible vaut mieux qu'une trace Node.
function fail(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

const usage = "DEMO_EMAIL=regain.demo@exemple.fr DEMO_PASSWORD='mot-de-passe' node scripts/seed-demo.mjs";

if (!URL_BASE || !ANON) fail('EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_ANON_KEY sont introuvables (.env).');
// Le « … » de la documentation recopié tel quel est l'erreur la plus probable : la dire en clair.
if (!EMAIL || !PASSWORD) fail(`Renseignez DEMO_EMAIL et DEMO_PASSWORD :\n  ${usage}`);
if (!/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(EMAIL)) {
  fail(`« ${EMAIL} » n'est pas une adresse e-mail. Remplacez les valeurs d'exemple par les vôtres :\n  ${usage}`);
}
if (PASSWORD.length < 8) fail('DEMO_PASSWORD doit faire au moins 8 caractères (exigence de Supabase).');

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
  const session = await auth('/auth/v1/token?grant_type=password', 'connexion');
  if (!session.error) return { userId: session.user.id, created: false, accessToken: session.access_token };

  // Compte inexistant : on le crée. Toute autre erreur (mot de passe faux) doit rester visible.
  if (!/invalid login credentials/i.test(session.error)) fail(`Connexion refusée : ${session.error}`);

  const signUp = await auth('/auth/v1/signup', 'inscription');
  // Supabase répond « Invalid login credentials » aussi bien pour un compte absent que pour un
  // mot de passe faux ; c'est l'inscription qui tranche.
  if (/already registered/i.test(signUp.error ?? '')) {
    fail(`Le compte ${EMAIL} existe, mais ce mot de passe ne correspond pas.`);
  }
  if (signUp.error) fail(`Création du compte refusée : ${signUp.error}`);
  if (!signUp.access_token) {
    fail(
      `Compte créé, mais Supabase attend une confirmation par e-mail.\n` +
        `  Ouvrez le lien envoyé à ${EMAIL}, puis relancez cette commande.`,
    );
  }
  return { userId: signUp.user.id, created: true, accessToken: signUp.access_token };
}

const { userId, created, accessToken } = await signInOrCreate();
token = accessToken;
console.log(created ? `Compte ${EMAIL} créé` : `Connecté comme ${EMAIL}`);

// 1. Profil et préférences : l'accueil est considéré comme terminé.
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

// 2. Disponibilités : trois soirs en semaine et le samedi matin.
await api(`/rest/v1/availability_slots?user_id=eq.${userId}`, { method: 'DELETE' });
await api('/rest/v1/availability_slots', {
  method: 'POST',
  body: [0, 2, 4]
    .map((dayOfWeek) => ({
      user_id: userId,
      label: 'Après le travail',
      is_recurring: true,
      day_of_week: dayOfWeek,
      time_slot: 'soir',
      start_time: '18:30',
      end_time: '20:00',
    }))
    .concat([
      {
        user_id: userId,
        label: 'Matinée libre',
        is_recurring: true,
        day_of_week: 5,
        time_slot: 'matin',
        start_time: '09:00',
        end_time: '11:30',
      },
    ]),
});

// 3. Planning de la semaine, via la même fonction que l'app.
const catalog = await api('/rest/v1/activities_catalog?select=id,title,duration_minutes&order=duration_minutes&limit=8');
const weekStart = mondayOfThisWeek();
const items = [0, 2, 4, 5].map((offset, index) => {
  const date = new Date(weekStart);
  date.setDate(date.getDate() + offset);
  return { activity_id: catalog[index % catalog.length].id, date: iso(date), time_slot: offset === 5 ? 'matin' : 'soir' };
});
await api('/rest/v1/rpc/replace_week_plan', { method: 'POST', body: { p_week_start: iso(weekStart), p_items: items } });

// 4. Deux activités déjà faites, pour que le suivi ne soit pas vide.
const planned = await api(`/rest/v1/planned_activities?select=id&user_id=eq.${userId}&week_start_date=eq.${iso(weekStart)}&order=date&limit=2`);
for (const activity of planned) {
  await api(`/rest/v1/planned_activities?id=eq.${activity.id}`, { method: 'PATCH', body: { status: 'realise' } });
  await api('/rest/v1/activity_logs', { method: 'POST', body: [{ user_id: userId, planned_activity_id: activity.id }] });
}

// 5. Check-ins d'énergie des derniers jours.
await api(`/rest/v1/energy_checkins?user_id=eq.${userId}`, { method: 'DELETE' });
await api('/rest/v1/energy_checkins', {
  method: 'POST',
  body: [3, 4, 3, 5, 4].map((level, index) => ({
    user_id: userId,
    energy_level: level,
    checkin_at: day(-index - 1).toISOString(),
  })),
});

// 6. Séances de bien-être terminées, avec ressenti et réponses écrites.
const programs = await api('/rest/v1/wellbeing_programs?select=id,slug,category&premium_only=is.false&limit=4');
await api(`/rest/v1/wellbeing_sessions_completed?user_id=eq.${userId}`, { method: 'DELETE' });
const journalEntries = [
  { mood: 4, note: 'Respiration courte avant une réunion, ça a aidé.', prompt: "Qu'est-ce qui a changé dans ton corps ?", answer: 'Les épaules sont redescendues.' },
  { mood: 5, note: null, prompt: 'Quelle petite chose a été agréable aujourd’hui ?', answer: 'Un café au soleil, sans téléphone.' },
  { mood: 3, note: 'Journée dense, difficile de me poser.', prompt: 'Quelles pensées sont revenues le plus souvent ?', answer: 'La liste de choses à faire.' },
  { mood: 4, note: null, prompt: "Qu'est-ce qui t'empêche de lâcher prise ce soir ?", answer: 'Rien de précis, juste l’habitude de scroller.' },
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

// 7. Profil forme, pour que l'onglet Forme soit complet.
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
Compte de démonstration prêt :
  · accueil terminé, 4 disponibilités récurrentes
  · planning de la semaine, dont 2 activités déjà cochées
  · 5 check-ins d'énergie, 4 séances de bien-être avec ressenti et réponses
  · profil forme rempli

Dernière étape, dans l'app avec ce compte : onglet Forme → « Générer mon programme »
(le programme, les menus et la liste de courses sont calculés dans l'app).`);
