import { existsSync, readdirSync, readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

/** Each line of the generated manifest: the clip key, and the language folder it points at. */
function entries(): { key: string; lang: string }[] {
  return [
    ...readFileSync('src/lib/narrationAudio.ts', 'utf8').matchAll(
      /'([0-9a-f]{8})': require\('\.\.\/\.\.\/assets\/narration\/(\w+)\/\1\.mp3'\)/g
    ),
  ].map((m) => ({ key: m[1], lang: m[2] }));
}

describe('the narration manifest', () => {
  const listed = entries();

  it('holds every language that has clips, not only the last one generated', () => {
    // `build --lang en` used to rewrite this file with English paths alone, which silenced the
    // three hundred French clips without touching a single one of them.
    const onDisk = readdirSync('assets/narration').filter((f) => !f.startsWith('.') && !f.includes('.'));
    expect(new Set(listed.map((e) => e.lang))).toEqual(new Set(onDisk));
  });

  it('names a key only once, so no clip can be read in the other language', () => {
    // The key is a hash of the text, so French and English keys differ — but a sentence left
    // untranslated would hash the same in both, and one language would hear the other's voice.
    const keys = listed.map((e) => e.key);
    expect(keys.length - new Set(keys).size).toBe(0);
  });

  it('points only at files that exist, since Metro resolves require() at build time', () => {
    // A missing file here does not degrade to silence: it fails the whole bundle.
    expect(listed.filter((e) => !existsSync(`assets/narration/${e.lang}/${e.key}.mp3`))).toEqual([]);
  });

  it('lists every clip on disk, so nothing paid for is left out of the bundle', () => {
    const onDisk = readdirSync('assets/narration')
      .filter((f) => !f.startsWith('.') && !f.includes('.'))
      .flatMap((lang) =>
        readdirSync(`assets/narration/${lang}`)
          .filter((f) => f.endsWith('.mp3'))
          .map((f) => `${lang}/${f.slice(0, -4)}`)
      );
    expect(onDisk.filter((id) => !listed.some((e) => `${e.lang}/${e.key}` === id))).toEqual([]);
  });
});
