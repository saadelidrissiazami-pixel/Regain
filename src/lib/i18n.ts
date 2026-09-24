// The app speaks English or French, picked once at launch.
//
// There is no language picker in the app: iOS and Android already offer one per app
// (Settings → Regain → Language) as soon as app.json declares both languages, and changing it
// restarts the app. So the language is a constant for the life of the process, not state —
// nothing needs to re-render when it changes.
//
// The English sentence is the key. `t('Save')` reads as English in the code, and French lives
// in one dictionary (src/i18n/fr.ts), which a test checks for anything missing.

import { getLocales } from 'expo-localization';

import { FR } from '../i18n/fr';

export type Lang = 'en' | 'fr';

/** The first of the person's languages that Regain speaks, the way iOS picks a bundle's own. */
export const lang: Lang =
  getLocales()
    .map((l) => l.languageCode)
    .find((code): code is Lang => code === 'en' || code === 'fr') ?? 'en';

/** For Intl formatters and the speech voice. */
export const locale = lang === 'fr' ? 'fr-FR' : 'en-US';

/** The French for an English sentence; `{name}` holes are filled from `vars` in either language. */
export function t(english: string, vars?: Record<string, string | number>): string {
  const text = lang === 'fr' ? (FR[english] ?? english) : english;
  return vars ? text.replace(/\{(\w+)\}/g, (hole, key: string) => String(vars[key] ?? hole)) : text;
}

/** A number with a fixed count of decimals, and the decimal mark the language uses (2.5 / 2,5). */
export function decimal(n: number, digits = 1): string {
  return n.toLocaleString(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

/** A formatted date placed inside a sentence: French writes weekdays and months in lower case. */
export function midSentence(label: string): string {
  return lang === 'fr' ? label.toLowerCase() : label;
}
