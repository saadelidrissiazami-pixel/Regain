import { afterEach, describe, expect, it, vi } from 'vitest';

import { Settings } from './helpers/react-native';

/** The module reads the saved choice once, at import; each case needs a fresh one. */
async function openApp({ phone, saved }: { phone: 'fr' | 'en'; saved?: 'fr' | 'en' }) {
  vi.resetModules();
  Settings.clear();
  if (saved) Settings.set({ 'regain.language': saved });
  vi.doMock('expo-localization', () => ({ getLocales: () => [{ languageCode: phone }] }));
  return import('../src/lib/i18n');
}

afterEach(() => {
  vi.doUnmock('expo-localization');
  Settings.clear();
});

describe('the language the app opens in', () => {
  it('follows the phone when nobody has chosen', async () => {
    expect((await openApp({ phone: 'fr' })).lang).toBe('fr');
    expect((await openApp({ phone: 'en' })).lang).toBe('en');
  });

  it('obeys a saved choice over the phone', async () => {
    // The defect this exists for: an iPhone whose per-app Language row is simply absent left the
    // app in English with no recourse. The saved choice has to win, or there is no way out.
    expect((await openApp({ phone: 'en', saved: 'fr' })).lang).toBe('fr');
    expect((await openApp({ phone: 'fr', saved: 'en' })).lang).toBe('en');
  });

  it('reads the choice synchronously, before anything freezes the wrong language', async () => {
    // The session content builds itself at import time. A choice that arrived one await later
    // would be a choice the content never saw.
    const { lang, savedLanguage } = await openApp({ phone: 'en', saved: 'fr' });
    expect(savedLanguage()).toBe('fr');
    expect(lang).toBe('fr');
  });

  it('hands the decision back to the phone when the choice is cleared', async () => {
    const { chooseLanguage } = await openApp({ phone: 'fr', saved: 'en' });
    chooseLanguage(null);
    expect((await openApp({ phone: 'fr' })).lang).toBe('fr');
  });

  it('ignores a stored value that is not a language we speak', async () => {
    vi.resetModules();
    Settings.clear();
    Settings.set({ 'regain.language': 'de' });
    vi.doMock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'en' }] }));
    const { lang } = await import('../src/lib/i18n');
    expect(lang).toBe('en');
  });

  it('translates with the chosen language, not only the phone’s', async () => {
    const { t } = await openApp({ phone: 'en', saved: 'fr' });
    expect(t('Save')).not.toBe('Save');
  });
});
