import { existsSync, readFileSync } from 'node:fs';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clipKey } from '../src/lib/narrationKey';
import type { ProgramContent } from '../src/features/wellbeing/types';

/** Every sentence a session says out loud, whatever kind of session it is. */
function spokenTexts(content: ProgramContent, textOf: (step: never) => string): string[] {
  if (content.type === 'narrated') return content.blocks.map((b) => b.text);
  if (content.type === 'breathing') return [...(content.intro ?? []), ...(content.outro ?? [])].map((b) => b.text);
  if (content.type === 'grounding') return content.steps.map((s) => textOf(s as never));
  return [];
}

/**
 * The sessions as the app reads them, and the folder holding that language's clips.
 *
 * The content goes through t(), so importing it gives the language the suite is running in — and
 * the suite runs in English unless a test says otherwise. Checking English sentences against the
 * French clips is a test that fails for the wrong reason; checking only English is one that
 * passes while half the app is mute.
 */
async function silentSentences(lang: 'fr' | 'en'): Promise<string[]> {
  const { CONTENT_BY_SLUG, groundingStepText } = await import('../src/features/wellbeing/content');
  return Object.entries(CONTENT_BY_SLUG).flatMap(([slug, content]) =>
    spokenTexts(content, groundingStepText as (step: never) => string)
      .filter((text) => text && !existsSync(`assets/narration/${lang}/${clipKey(text)}.mp3`))
      .map((text) => `${slug}: ${text.slice(0, 44)}…`)
  );
}

describe('what the sessions say out loud, in English', () => {
  it('has a clip for every sentence', async () => {
    // Six sessions opened in silence: the recording script collected `narrated` content and
    // nothing else, so the breathing intros and the grounding steps were never recorded. Nothing
    // failed — a block with no clip is silent by design, which is why it went unheard until
    // somebody opened one on a phone.
    expect(await silentSentences('en')).toEqual([]);
  });
});

describe('what the sessions say out loud, in French', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doMock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'fr' }] }));
  });
  afterEach(() => vi.doUnmock('expo-localization'));

  it('has a clip for every sentence', async () => {
    expect(await silentSentences('fr')).toEqual([]);
  });
});

describe('the recording and the reading', () => {
  it('agree on what a scale step says', async () => {
    // The wording sits under `prompt` on a scale and `text` everywhere else. Reading the wrong
    // field records a clip nothing asks for, and leaves the step mute.
    const { CONTENT_BY_SLUG, groundingStepText } = await import('../src/features/wellbeing/content');
    const grounding = Object.values(CONTENT_BY_SLUG).find((c) => c.type === 'grounding');
    expect(grounding?.type).toBe('grounding');
    const scale = grounding?.type === 'grounding' ? grounding.steps.find((s) => s.kind === 'scale') : undefined;
    expect(scale).toBeTruthy();
    if (scale?.kind === 'scale') expect(groundingStepText(scale)).toBe(scale.prompt);
  });

  it('covers every kind of session, so a whole kind cannot be skipped again', async () => {
    // The hole was never one session: it was a type the collector did not look at.
    const { CONTENT_BY_SLUG, groundingStepText } = await import('../src/features/wellbeing/content');
    const kinds = new Set(Object.values(CONTENT_BY_SLUG).map((c) => c.type));
    expect(kinds.size).toBeGreaterThan(1);
    for (const kind of kinds) {
      const spoken = Object.values(CONTENT_BY_SLUG)
        .filter((c) => c.type === kind)
        .flatMap((c) => spokenTexts(c, groundingStepText as (step: never) => string));
      expect({ kind, speaks: spoken.length > 0 }).toEqual({ kind, speaks: true });
    }
  });

  it('keeps both languages in the manifest the app requires', () => {
    const manifest = readFileSync('src/lib/narrationAudio.ts', 'utf8');
    for (const lang of ['fr', 'en']) expect(manifest).toContain(`assets/narration/${lang}/`);
  });
});
