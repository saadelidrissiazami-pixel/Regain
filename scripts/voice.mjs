#!/usr/bin/env node
/**
 * Generates the narration audio with ElevenLabs.
 *
 *   node scripts/voice.mjs voices                      # list the voices on your account
 *   node scripts/voice.mjs check                       # what would be generated, and its cost
 *   ELEVENLABS_API_KEY=… node scripts/voice.mjs build --voice <id> [--lang fr|en] [--only <slug>]
 *
 * The key is read from the environment or from .env, and never leaves your terminal.
 *
 * Why generate ahead of time rather than call the API while a session plays: a session has to
 * work without a network, a block has to start the instant the clock says so, and the audio you
 * generate is yours to keep — an account's voices can be withdrawn, and ElevenLabs retires its
 * default voices on 31 December 2026. Files already written are unaffected by both.
 */
import { Buffer } from 'node:buffer';
import { mkdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'assets', 'narration');

// mp3_44100_128 is constant bitrate, so bytes / (128000/8) is the exact duration and no audio
// library is needed to measure it.
const FORMAT = 'mp3_44100_128';
const BYTES_PER_SECOND = 128000 / 8;

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
  const value = env('ELEVENLABS_API_KEY');
  if (!value) {
    console.error('ELEVENLABS_API_KEY is not set. Put it in .env or pass it on the command line.');
    process.exit(1);
  }
  return value;
}

async function api(path, init = {}) {
  const res = await fetch(`https://api.elevenlabs.io/v1${path}`, {
    ...init,
    headers: { 'xi-api-key': key(), ...(init.headers ?? {}) },
  });
  if (!res.ok) {
    throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  return res;
}

/** The narration, loaded straight from the content tree. */
async function loadBlocks(lang) {
  // content.ts reaches lib/i18n for one thing only: which language tree to pick. That module
  // pulls in expo-localization and then react-native, which esbuild cannot parse (Flow syntax).
  // Stubbing it with the language we were asked for is enough, and keeps the content files —
  // which import nothing but a type — loadable from node.
  const esbuild = await import('esbuild');
  const bundled = join(ROOT, 'node_modules', '.cache', `voice-${lang}.mjs`);
  mkdirSync(dirname(bundled), { recursive: true });
  await esbuild.build({
    entryPoints: [join(ROOT, 'src/features/wellbeing/content.ts')],
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
            contents: `export const lang = ${JSON.stringify(lang)};
              export const locale = ${JSON.stringify(lang === 'fr' ? 'fr-FR' : 'en-US')};
              export const t = (s) => s;
              export const midSentence = (s) => s;`,
            loader: 'js',
          }));
        },
      },
    ],
  });

  // clipKey comes from the app's own module rather than a copy: a second implementation here
  // would drift, and every clip would quietly stop being found.
  const keyFile = join(ROOT, 'node_modules', '.cache', 'voice-key.mjs');
  await esbuild.build({
    entryPoints: [join(ROOT, 'src/lib/narrationKey.ts')],
    bundle: true,
    platform: 'node',
    format: 'esm',
    outfile: keyFile,
    logLevel: 'error',
  });
  const { clipKey } = await import(`file://${keyFile}?${Date.now()}`);

  const mod = await import(`file://${bundled}?${Date.now()}`);
  const bySlug = mod.CONTENT_BY_SLUG;
  if (!bySlug) throw new Error('CONTENT_BY_SLUG not found in the bundled content.');
  const out = [];
  for (const [slug, content] of Object.entries(bySlug)) {
    if (content?.type !== 'narrated') continue;
    content.blocks.forEach((block, index) => {
      out.push({ slug, index, key: clipKey(block.text), text: block.text, speakSeconds: block.speakSeconds });
    });
  }
  return out;
}

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? fallback : process.argv[i + 1];
}

async function voices() {
  const res = await api('/voices');
  const { voices: list } = await res.json();
  for (const v of list) {
    console.log(`${v.voice_id}  ${v.name.padEnd(22)} ${v.labels?.accent ?? ''} ${v.labels?.description ?? ''}`);
  }
  console.log(`\n${list.length} voices. Pass one of these ids to --voice.`);
}

async function check(lang) {
  const blocks = await loadBlocks(lang);
  const chars = blocks.reduce((n, b) => n + b.text.length, 0);
  console.log(`${blocks.length} blocks, ${chars.toLocaleString()} characters in "${lang}".`);
  console.log(`About ${chars} credits on eleven_multilingual_v2 (1 credit per character).`);

  // Two blocks sharing a key would share a clip, and one of them would be read in the other's
  // words. Worth knowing before paying to generate anything.
  const byKey = new Map();
  for (const b of blocks) {
    const seen = byKey.get(b.key);
    if (seen && seen !== b.text) console.log(`COLLISION on ${b.key}: "${seen.slice(0, 40)}…" / "${b.text.slice(0, 40)}…"`);
    byKey.set(b.key, b.text);
  }
  const unique = new Set(blocks.map((b) => b.text)).size;
  console.log(`${byKey.size} distinct clips for ${unique} distinct texts${byKey.size === unique ? ' — no collisions.' : ' — MISMATCH.'}`);
}

async function build(lang, voiceId, only) {
  if (!voiceId) {
    console.error('Pass --voice <id>. Run "node scripts/voice.mjs voices" to see yours.');
    process.exit(1);
  }
  const blocks = (await loadBlocks(lang)).filter((b) => !only || b.slug === only);
  const dir = join(OUT, lang);
  mkdirSync(dir, { recursive: true });

  const index = {};
  const tooLong = [];
  for (const [n, block] of blocks.entries()) {
    const name = block.key;
    const file = join(dir, `${name}.mp3`);
    if (existsSync(file)) {
      // Already generated: regenerating would be paid for twice.
      index[name] = statSync(file).size / BYTES_PER_SECOND;
      continue;
    }
    const res = await api(`/text-to-speech/${voiceId}?output_format=${FORMAT}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        text: block.text,
        // The model ElevenLabs documents as the most stable on long-form generations, which is
        // what a session is. v3 is more expressive, which is the wrong direction here.
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.6, similarity_boost: 0.75, style: 0, use_speaker_boost: false },
      }),
    });
    const audio = Buffer.from(await res.arrayBuffer());
    writeFileSync(file, audio);
    const seconds = audio.length / BYTES_PER_SECOND;
    index[name] = seconds;
    // The block's silence starts when its speaking time is up. A clip longer than that would be
    // cut off mid-sentence, which is the one failure the scripts were written to avoid.
    if (block.speakSeconds && seconds > block.speakSeconds) {
      tooLong.push({ name, seconds: seconds.toFixed(1), allowed: block.speakSeconds });
    }
    process.stdout.write(`\r${n + 1}/${blocks.length}  ${name}          `);
  }

  writeFileSync(join(dir, 'index.json'), JSON.stringify(index, null, 2) + '\n');

  // Metro resolves require() at build time, so the map has to exist as source.
  const requires = Object.keys(index)
    .sort()
    .map((k) => `  '${k}': require('../../assets/narration/${lang}/${k}.mp3'),`)
    .join('\n');
  writeFileSync(
    join(ROOT, 'src/lib/narrationAudio.ts'),
    `import type { AudioSource } from 'expo-audio';

/**
 * Narration recorded ahead of time, by clip key.
 *
 * Generated by \`node scripts/voice.mjs build --lang ${lang}\`. Do not edit by hand.
 * A block with no clip here is spoken by the device's own voice instead.
 */
export const NARRATION_AUDIO: Record<string, AudioSource> = {
${requires}
};
`
  );
  console.log(`\n${Object.keys(index).length} clips in assets/narration/${lang}, and src/lib/narrationAudio.ts rewritten.`);

  if (tooLong.length > 0) {
    console.log(`\n${tooLong.length} clips run past the speaking time their block allows:`);
    for (const t of tooLong) console.log(`  ${t.name}: ${t.seconds}s of audio for ${t.allowed}s`);
    console.log('Lengthen speakSeconds on those blocks, or the sentence will be cut off.');
  }
}

const command = process.argv[2];
const lang = arg('lang', 'fr');
if (command === 'voices') await voices();
else if (command === 'check') await check(lang);
else if (command === 'build') await build(lang, arg('voice'), arg('only'));
else {
  console.log('Usage: node scripts/voice.mjs voices | check [--lang fr] | build --voice <id> [--lang fr] [--only <slug>]');
  process.exit(1);
}
