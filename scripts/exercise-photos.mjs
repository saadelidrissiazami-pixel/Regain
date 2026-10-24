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
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { CENTS_PER_IMAGE, generate, resize, ROOT, writeManifest } from './lib/photos.mjs';

const OUT = join(ROOT, 'assets', 'images', 'exercises');

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
  // The slug is written down in the catalogue, not computed here: the file this script names and
  // the file the app looks for are then the same string, in either language.
  const { EXERCISES } = await import(`${bundled}?${Date.now()}`);
  return EXERCISES;
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
    'The person wears plain heather-grey athletic clothing and trainers and has an ordinary athletic build.',
    // Saying only "the face is not identifiable" was read as permission to crop: three of the first
    // ten came back with the head cut off at the neck or out of frame. Anonymity has to be stated
    // as a camera angle, and completeness as its own requirement.
    'The whole body is inside the frame, head and both hands and both feet included, nothing cut off at any edge. The person is anonymous because the head is turned away from the camera or seen from behind or in profile — never because it is cropped, missing or out of frame.',
    'Every piece of equipment the exercise names is present and in the right number: an exercise done with dumbbells shows two dumbbells, one in each hand.',
    'The form is technically correct and safe: joints aligned as the cue describes, spine neutral unless the cue says otherwise.',
    'Natural colour, soft even light, shallow depth of field. No text, no numbers, no logos, no watermark, no brand marks, no on-screen labels, no arrows, no second person, no mirror reflection.',
  ].join(' ');
}

// ---------------------------------------------------------------------------

function writeExerciseManifest() {
  return writeManifest({
    dir: OUT,
    out: 'src/theme/exercisePhotos.ts',
    constName: 'EXERCISE_PHOTOS',
    assetPath: '../../assets/images/exercises',
    keyedBy: { script: 'scripts/exercise-photos.mjs', by: 'photoSlug() from src/features/fitness/exercises.ts' },
  });
}

async function build(exercises, quality) {
  mkdirSync(OUT, { recursive: true });
  let written = 0;
  for (const exercise of exercises) {
    const path = join(OUT, `${exercise.slug}.jpg`);
    process.stdout.write(`${exercise.slug}… `);
    try {
      writeFileSync(path, await generate(prompt(exercise), quality));
      resize(path);
      written += 1;
      console.log('ok');
    } catch (error) {
      console.log(`failed: ${error.message}`);
    }
  }
  writeExerciseManifest();
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
    writeExerciseManifest();
  } else {
    console.log(
      `${missing.length} images at ${quality} quality ≈ $${((missing.length * CENTS_PER_IMAGE[quality]) / 100).toFixed(2)}\n`,
    );
    await build(missing, quality);
  }
} else if (args[0] === 'manifest') {
  writeExerciseManifest();
} else {
  console.error('Usage: exercise-photos.mjs check | manifest | build [--only <slug>] [--quality high|medium|low]');
  process.exit(1);
}
