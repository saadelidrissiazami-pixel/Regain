import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const BASE = 'https://saadelidrissiazami-pixel.github.io/Regain/legal';

function withEnv() {
  process.env.EXPO_PUBLIC_TERMS_URL = `${BASE}/terms-of-use`;
  process.env.EXPO_PUBLIC_PRIVACY_URL = `${BASE}/privacy-policy`;
}

describe('the legal links on an English phone', () => {
  beforeEach(() => {
    vi.resetModules();
    withEnv();
  });

  it('point at the English pages, which are the ones the variables hold', async () => {
    const legal = await import('../src/config/legal');
    expect(legal.TERMS_URL).toBe(`${BASE}/terms-of-use`);
    expect(legal.PRIVACY_URL).toBe(`${BASE}/privacy-policy`);
  });
});

describe('the legal links on a French phone', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doMock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'fr' }] }));
    withEnv();
  });
  afterEach(() => vi.doUnmock('expo-localization'));

  it('point at the French pages, on the screen Apple requires to be legible', async () => {
    // The whole app is in French here, and these two links sat in English on the subscription
    // screen — the one place where guideline 3.1.2 asks for terms somebody can actually read.
    const legal = await import('../src/config/legal');
    expect(legal.TERMS_URL).toBe(`${BASE}/conditions-utilisation`);
    expect(legal.PRIVACY_URL).toBe(`${BASE}/politique-de-confidentialite`);
  });

  it('leave an address they do not recognise alone, rather than inventing one', async () => {
    // A renamed or moved page must degrade to the English text, never to a 404 on the document
    // that says what the app does with somebody's health data.
    process.env.EXPO_PUBLIC_TERMS_URL = 'https://example.com/legal/some-other-name';
    vi.resetModules();
    const legal = await import('../src/config/legal');
    expect(legal.TERMS_URL).toBe('https://example.com/legal/some-other-name');
  });

  it('survives a trailing slash, which a published address often carries', async () => {
    process.env.EXPO_PUBLIC_PRIVACY_URL = `${BASE}/privacy-policy/`;
    vi.resetModules();
    const legal = await import('../src/config/legal');
    expect(legal.PRIVACY_URL).toBe(`${BASE}/politique-de-confidentialite/`);
  });

  it('reports the links missing when they are, so the paywall says so', async () => {
    process.env.EXPO_PUBLIC_TERMS_URL = '';
    process.env.EXPO_PUBLIC_PRIVACY_URL = '';
    vi.resetModules();
    expect((await import('../src/config/legal')).hasLegalUrls).toBe(false);
  });
});
