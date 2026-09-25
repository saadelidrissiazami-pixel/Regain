#!/usr/bin/env node
/**
 * Generates one photograph per exercise with the OpenAI images API.
 *
 *   node scripts/exercise-photos.mjs check                  # what is missing, and what it costs
 *   node scripts/exercise-photos.mjs manifest               # rewrite the module the app reads
 *   OPENAI_API_KEY=… node scripts/exercise-photos.mjs build [--only <slug>] [--quality medium]
 *
 * The key is read from the environment or from .env, and never leaves your terminal.
 *
 * Why a script rather than a chat: the file that lands on disk is the one that was asked for.
 * Downloading images out of a conversation means matching pictures to names by hand, and a
 * mismatch is silent — the wrong photo on an exercise looks exactly like the right one.
 *
 * An exercise is keyed by the slug of its English name, which is the catalogue's own key
 * (see muscleGroupOf), so renaming an exercise loses its photo instead of keeping a stale one.
 */
import { Buffer } from 'node:buffer';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'assets', 'images', 'exercises');

const MODEL = process.env.IMAGE_MODEL ?? 'gpt-image-1';
// The API's smallest square. The bundle keeps 768, which is still twice what the largest card
// shows on a 3× screen — see resize() for why the extra pixels are dropped.
const API_SIZE = '1024x1024';
const BUNDLE_SIZE = 768;
const JPEG_QUALITY = 85;
// Output tokens at $40/M: high 4160, medium 1056, low 272 for a 1024² square.
const CENTS_PER_IMAGE = { high: 16.6, medium: 4.2, low: 1.1 };

function env(name) {
  if (process.env[name]) return process.env[name];
  try {
    const line = readFileSync(join(ROOT, '.env'), 'utf8')
      .split('\n')
      .find((l) => l.startsWith(`${name}=`));
    return line?.slice(name.length + 1).trim();
  } catch {
    return undefined;
  }
}

function key() {
  const value = env('OPENAI_API_KEY');
  if (!value) {
    console.error('OPENAI_API_KEY is not set. Put it in .env or pass it on the command line.');
    process.exit(1);
  }
  return value;
}

/** The catalogue, loaded straight from the app so the two can never disagree. */
async function loadExercises() {
  // exercises.ts reaches lib/i18n for t(), which pulls in expo-localization and then
  // react-native — Flow syntax esbuild cannot parse. The English names are the catalogue's keys,
  // so a t() that returns its argument is not a stub here, it is the identity we want.
  const esbuild = await import('esbuild');
  const bundled = join(ROOT, 'node_modules', '.cache', 'exercise-photos.mjs');
  mkdirSync(dirname(bundled), { recursive: true });
  await esbuild.build({
    entryPoints: [join(ROOT, 'src/features/fitness/exercises.ts')],
    bundle: true,
    platform: 'node',
    format: 'esm',
    outfile: bundled,
    logLevel: 'error',
    plugins: [
      {
        name: 'stub-i18n',
        setup(build) {
          build.onResolve({ filter: /lib\/i18n$/ }, (args) => ({ path: args.path, namespace: 'stub' }));
          build.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({
            contents: 'export const t = (s) => s;',
            loader: 'js',
          }));
        },
      },
    ],
  });
  // slugify comes from the catalogue too, so the name this script writes and the name the app
  // looks for cannot drift apart.
  const { EXERCISES, slugify } = await import(`${bundled}?${Date.now()}`);
  return EXERCISES.map((exercise) => ({ ...exercise, slug: slugify(exercise.name) }));
}

// ---------------------------------------------------------------------------
// The prompt
//
// Three things decide whether the photo is usable: the room matches the equipment the exercise
// asks for, the camera sees the joints the coaching cue talks about, and the body is caught at
// the position that identifies the movement. Everything else is one shared house style, so the
// 56 photographs look like one set rather than 56 stock pictures.

const SETTING = {
  poids_du_corps:
    'a bright, uncluttered living room with a pale oak floor, a rolled exercise mat and soft daylight from a large window',
  halteres_maison:
    'a tidy home training corner with a pale oak floor, a pair of matte black dumbbells and soft daylight from a large window',
  salle:
    'a clean, modern gym with grey rubber flooring, matte black machines and large windows letting in even daylight',
};

/** Where the camera has to stand for the cue to be visible. */
const FRAMING = {
  jambes: 'camera at hip height, three-quarter side view, the whole body and both feet in frame',
  fessiers: 'camera low at floor level, side view, hips and thighs clearly readable',
  pectoraux: 'camera low, side view along the body, shoulders and elbows clearly readable',
  dos: 'camera at chest height, three-quarter side view, the back and the pulling arm clearly readable',
  epaules: 'camera at chest height, three-quarter front view, both arms fully in frame',
  biceps: 'camera at chest height, three-quarter front view, the working arm fully in frame',
  triceps: 'camera at chest height, side view, the elbow clearly readable',
  abdos: 'camera low at floor level, side view, the whole body from head to feet in frame',
  cardio: 'camera at chest height, three-quarter front view, the whole body in frame, mid-movement',
};

function prompt(exercise) {
  const held = exercise.timed !== undefined;
  return [
    `A photorealistic fitness reference photograph of one adult performing the exercise "${exercise.name}".`,
    // The cue goes in as a constraint, not as a thing to depict: half of them are worded
    // negatively ("do not lock the knees out"), and an image model asked to *show* a negative
    // tends to show exactly the position it names.
    `The coaching cue for this exercise, which the body position must respect: ${exercise.tip}`,
    held
      ? 'Show the position being held, steady and under control.'
      : 'Show the single moment in the movement that makes it recognisable — the hardest point of the repetition.',
    `Setting: ${SETTING[exercise.equipment]}.`,
    `Framing: ${FRAMING[exercise.group]}. Square composition, the body filling most of the frame.`,
    'The person wears plain heather-grey athletic clothing and trainers, has an ordinary athletic build, and is seen from an angle where the face is not identifiable.',
    'The form is technically correct and safe: joints aligned as the cue describes, spine neutral unless the cue says otherwise.',
    'Natural colour, soft even light, shallow depth of field. No text, no numbers, no logos, no watermark, no brand marks, no on-screen labels, no arrows, no second person, no mirror reflection.',
  ].join(' ');
}

// ---------------------------------------------------------------------------

/** OpenAI quotes the key it was given back at you in a 401. Never print one. */
function redactKeys(text) {
  return text.replace(/sk-[\w-]+/g, 'sk-…');
}

async function generate(exercise, quality) {
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      prompt: prompt(exercise),
      n: 1,
      size: API_SIZE,
      quality,
      output_format: 'jpeg',
      // Close to lossless out of the model; the one lossy step is the resize below.
      output_compression: 95,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${redactKeys((await res.text()).slice(0, 300))}`);
  const body = await res.json();
  const b64 = body.data?.[0]?.b64_json;
  if (!b64) throw new Error(`no image in the response: ${JSON.stringify(body).slice(0, 300)}`);
  return Buffer.from(b64, 'base64');
}

/**
 * 1024² down to 768², in place.
 *
 * The largest card shows the photo about 200pt wide, so 768 is already generous at 3×, and the
 * 56 photographs are going into the app bundle — at 1024 they would add megabytes nobody sees.
 * sips ships with macOS, which beats adding an image library for two operations.
 */
function resize(path) {
  execFileSync('sips', ['-Z', String(BUNDLE_SIZE), '-s', 'formatOptions', String(JPEG_QUALITY), path], {
    stdio: 'ignore',
  });
}

/**
 * Rewrites the module the app reads, listing only the photographs that are on disk.
 *
 * Metro resolves require() at build time, so a module naming a file that does not exist fails the
 * whole bundle. Generating the list from the directory means the app builds and runs at seven
 * photographs exactly as it will at fifty-six — the exercises without one fall back to their
 * muscle group, as they did before any of this existed.
 */
function writeManifest() {
  const slugs = readdirSync(OUT)
    .filter((file) => file.endsWith('.jpg'))
    .map((file) => file.slice(0, -4))
    .sort();
  writeFileSync(
    join(ROOT, 'src', 'theme', 'exercisePhotos.ts'),
    [
      "import type { ImageSourcePropType } from 'react-native';",
      '',
      '// Generated by scripts/exercise-photos.mjs — do not edit by hand.',
      '// Keyed by photoSlug() from src/features/fitness/exercises.ts.',
      'export const EXERCISE_PHOTOS: Record<string, ImageSourcePropType> = {',
      ...slugs.map((slug) => `  '${slug}': require('../../assets/images/exercises/${slug}.jpg'),`),
      '};',
      '',
    ].join('\n'),
  );
  console.log(`src/theme/exercisePhotos.ts: ${slugs.length} photographs`);
}

async function build(exercises, quality) {
  mkdirSync(OUT, { recursive: true });
  let written = 0;
  for (const exercise of exercises) {
    const path = join(OUT, `${exercise.slug}.jpg`);
    process.stdout.write(`${exercise.slug}… `);
    try {
      writeFileSync(path, await generate(exercise, quality));
      resize(path);
      written += 1;
      console.log('ok');
    } catch (error) {
      console.log(`failed: ${error.message}`);
    }
  }
  writeManifest();
  console.log(`\n${written}/${exercises.length} written to assets/images/exercises/`);
  if (written < exercises.length) console.log('Run the same command again: what exists is skipped.');
}

const args = process.argv.slice(2);
const flag = (name) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? undefined : args[index + 1];
};

const all = await loadExercises();
const only = flag('only');
const quality = flag('quality') ?? 'high';
if (!(quality in CENTS_PER_IMAGE)) {
  console.error(`--quality must be one of ${Object.keys(CENTS_PER_IMAGE).join(', ')}`);
  process.exit(1);
}

const wanted = only ? all.filter((e) => e.slug === only) : all;
if (only && wanted.length === 0) {
  console.error(`No exercise has the slug "${only}".`);
  process.exit(1);
}
// An --only slug is regenerated even when it exists: that is what asking for one is for.
const missing = only ? wanted : wanted.filter((e) => !existsSync(join(OUT, `${e.slug}.jpg`)));

if (args[0] === 'check') {
  console.log(`${all.length} exercises, ${all.length - missing.length} photographed, ${missing.length} missing.`);
  for (const exercise of missing) console.log(`  ${exercise.slug}  (${exercise.equipment})`);
  for (const [name, cents] of Object.entries(CENTS_PER_IMAGE)) {
    console.log(`\n${name}: ${missing.length} images ≈ $${((missing.length * cents) / 100).toFixed(2)}`);
  }
  console.log(`\nOne prompt, for reading:\n\n${prompt(missing[0] ?? all[0])}`);
} else if (args[0] === 'build') {
  if (missing.length === 0) {
    console.log('Every exercise already has its photograph.');
    writeManifest();
  } else {
    console.log(
      `${missing.length} images at ${quality} quality ≈ $${((missing.length * CENTS_PER_IMAGE[quality]) / 100).toFixed(2)}\n`,
    );
    await build(missing, quality);
  }
} else if (args[0] === 'manifest') {
  writeManifest();
} else {
  console.error('Usage: exercise-photos.mjs check | manifest | build [--only <slug>] [--quality high|medium|low]');
  process.exit(1);
}
