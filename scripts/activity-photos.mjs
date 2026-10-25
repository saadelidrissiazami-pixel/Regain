#!/usr/bin/env node
/**
 * One photograph per activity.
 *
 *   OPENAI_API_KEY=… node scripts/activity-photos.mjs check
 *   OPENAI_API_KEY=… node scripts/activity-photos.mjs build [--only <slug>] [--quality high|medium|low]
 *   node scripts/activity-photos.mjs manifest
 *
 * The forty-eight activities all share one picture per category today, so nine images cover the
 * whole catalogue and none of them shows what the activity actually is. The exercises had the
 * same problem and it was worth fixing: a photograph of the thing is the shortest answer to
 * "what am I being asked to do".
 *
 * These are deliberately not the exercise photographs' subject. An exercise photo shows a body at
 * the moment that identifies a movement. An activity photo shows a *place ready for it* — a mug
 * waiting, a cleared corner of table, a bench outside. Most of these activities are ordinary and
 * small, and a photograph with somebody performing enthusiastically in it would misrepresent
 * them: the point of "sit outside for a few minutes" is that it asks almost nothing.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { CENTS_PER_IMAGE, generate, ROOT, resize, writeManifest } from './lib/photos.mjs';

const OUT = join(ROOT, 'assets', 'images', 'activities');

/**
 * The catalogue, read from the migrations that insert it.
 *
 * The rows live in Postgres, and the slugs live in the bundle — reading the SQL is what keeps
 * this script naming the same files the app looks for, without a database connection.
 */
async function loadActivities() {
  const { readFileSync } = await import('node:fs');
  const esbuild = await import('esbuild');
  const bundled = join(ROOT, 'node_modules', '.cache', 'activity-photos.mjs');
  mkdirSync(join(ROOT, 'node_modules', '.cache'), { recursive: true });
  await esbuild.build({
    entryPoints: [join(ROOT, 'src/features/activities/catalogue.ts')],
    bundle: true,
    platform: 'node',
    format: 'esm',
    outfile: bundled,
    logLevel: 'error',
    plugins: [
      {
        name: 'stub-i18n',
        setup(build) {
          build.onResolve({ filter: /lib\/i18n$/ }, () => ({ path: 'i18n', namespace: 'stub' }));
          build.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({
            contents: "export const lang='fr'; export const t=(s)=>s;",
            loader: 'js',
          }));
        },
      },
    ],
  });
  const { ACTIVITY_PHOTOS, englishTitle } = await import(`${bundled}?${Date.now()}`);

  // The English wording, so the prompt is written in the language the model reads best.
  const sql = ['0024_activities_first_action', '0031_walks']
    .map((f) => readFileSync(join(ROOT, 'supabase/migrations', `${f}.sql`), 'utf8'))
    .join('\n');
  const rows = [...sql.matchAll(/^\('((?:''|[^'])+)', '(\w+)', (\d+),/gm)].map((m) => ({
    storedTitle: m[1].replace(/''/g, "'"),
    category: m[2],
    minutes: Number(m[3]),
  }));

  return rows.map((row) => ({
    ...row,
    slug: ACTIVITY_PHOTOS[row.storedTitle],
    english: englishTitle(row.storedTitle),
  }));
}

// ---------------------------------------------------------------------------

/**
 * One house style, so forty-eight pictures read as one set rather than forty-eight stock photos.
 *
 * The category decides the room and the light; the activity decides the one object in it.
 */
const SETTING = {
  physique: 'a bright, uncluttered room with a pale oak floor and soft daylight from a large window',
  outdoor: 'a calm ordinary street or small park in soft overcast daylight, European, nothing picturesque',
  indoor: 'a lived-in but tidy home interior with warm wood, linen and soft daylight',
  social: 'a warm domestic corner with a phone or a cup on a wooden surface, soft lamplight',
  relaxation: 'a quiet, dim domestic corner with soft textiles and low warm light',
  meditation: 'a bare, calm corner of a room with a cushion on a pale floor and soft daylight',
  dev_perso: 'a plain wooden desk with an open notebook and a pen, soft daylight from the side',
  recuperation: 'a softly lit bedroom or sitting room with rumpled linen and the curtains half drawn',
  temps_libre: 'a comfortable domestic corner with a book, a blanket and a pool of warm lamplight',
};

function prompt(activity) {
  return [
    `A photorealistic, quiet still-life photograph illustrating the everyday activity "${activity.english}".`,
    // No performer. These activities are small on purpose, and a smiling model doing one of them
    // turns "put five things back" into an advertisement for a life somebody does not have.
    'Show the place and the objects ready for it, with nobody in the frame. No people, no faces, no hands.',
    `Setting: ${SETTING[activity.category]}.`,
    'Square composition, one clear subject, generous empty space around it.',
    'Muted natural colour, soft even light, shallow depth of field, calm and unstyled — an ordinary home or street, not a showroom or a magazine shoot.',
    'No text, no numbers, no logos, no watermark, no brand marks, no on-screen labels, no arrows.',
  ].join(' ');
}

// ---------------------------------------------------------------------------

function manifest() {
  return writeManifest({
    dir: OUT,
    out: 'src/theme/activityPhotos.ts',
    constName: 'ACTIVITY_PHOTOGRAPHS',
    assetPath: '../../assets/images/activities',
    keyedBy: {
      script: 'scripts/activity-photos.mjs',
      by: 'the slugs in src/features/activities/photos.ts',
    },
  });
}

async function build(activities, quality) {
  mkdirSync(OUT, { recursive: true });
  let written = 0;
  for (const activity of activities) {
    const path = join(OUT, `${activity.slug}.jpg`);
    process.stdout.write(`${activity.slug}… `);
    try {
      writeFileSync(path, await generate(prompt(activity), quality));
      resize(path);
      written += 1;
      console.log('ok');
    } catch (error) {
      console.log(`failed: ${error.message}`);
    }
  }
  manifest();
  console.log(`\n${written}/${activities.length} written to assets/images/activities/`);
  if (written < activities.length) console.log('Run the same command again: what exists is skipped.');
}

const args = process.argv.slice(2);
const flag = (name) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? undefined : args[index + 1];
};

if (args[0] === 'manifest') {
  manifest();
} else {
  const all = await loadActivities();
  const unslugged = all.filter((a) => !a.slug);
  if (unslugged.length > 0) {
    console.error(`${unslugged.length} activities have no slug in src/features/activities/photos.ts:`);
    for (const a of unslugged) console.error(`  ${a.storedTitle}`);
    process.exit(1);
  }

  const only = flag('only');
  const quality = flag('quality') ?? 'high';
  if (!(quality in CENTS_PER_IMAGE)) {
    console.error(`--quality must be one of ${Object.keys(CENTS_PER_IMAGE).join(', ')}`);
    process.exit(1);
  }

  const wanted = only ? all.filter((a) => a.slug === only) : all;
  if (only && wanted.length === 0) {
    console.error(`No activity has the slug "${only}".`);
    process.exit(1);
  }
  // An --only slug is regenerated even when it exists: that is what asking for one is for.
  const missing = only ? wanted : wanted.filter((a) => !existsSync(join(OUT, `${a.slug}.jpg`)));

  if (args[0] === 'check') {
    console.log(`${all.length} activities, ${all.length - missing.length} photographed, ${missing.length} missing.`);
    for (const [name, cents] of Object.entries(CENTS_PER_IMAGE)) {
      console.log(`${name}: ${missing.length} images ≈ $${((missing.length * cents) / 100).toFixed(2)}`);
    }
    console.log(`\nOne prompt, for reading:\n\n${prompt(missing[0] ?? all[0])}`);
  } else if (args[0] === 'build') {
    if (missing.length === 0) {
      console.log('Every activity already has its photograph.');
      manifest();
    } else {
      console.log(
        `${missing.length} images at ${quality} quality ≈ $${((missing.length * CENTS_PER_IMAGE[quality]) / 100).toFixed(2)}\n`,
      );
      await build(missing, quality);
    }
  } else {
    console.error('Usage: activity-photos.mjs check | manifest | build [--only <slug>] [--quality high|medium|low]');
    process.exit(1);
  }
}
