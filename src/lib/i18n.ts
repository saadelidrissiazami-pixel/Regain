// The app speaks English or French, picked once at launch.
//
// It used to take the phone's answer and nothing else, on the grounds that iOS offers a language
// per app in its own Settings. On a real French iPhone that row was not there, so the app opened
// in English with no way out — which is the whole of the app, in the wrong language, with no
// recourse. A saved choice now comes first, and the phone decides only when nothing is saved.
//
// The choice has to be readable *synchronously*, at the moment this module loads: the session
// content builds itself at import time and would otherwise freeze the wrong language before any
// await could resolve. react-native's Settings is that — NSUserDefaults, no new dependency. It
// is iOS-only, which is exactly where the gap was; elsewhere the phone's own setting works.
//
// The language stays a constant for the life of the process. Changing it saves and asks for the
// app to be reopened, rather than re-rendering a tree that reads `lang` in a hundred places.
//
// The English sentence is the key. `t('Save')` reads as English in the code, and French lives
// in one dictionary (src/i18n/fr.ts), which a test checks for anything missing.

import { getLocales } from 'expo-localization';
import { Platform, Settings } from 'react-native';

import { FR } from '../i18n/fr';

export type Lang = 'en' | 'fr';

const CHOICE_KEY = 'regain.language';

function isLang(value: unknown): value is Lang {
  return value === 'en' || value === 'fr';
}

/** The language saved in the app, if somebody chose one. Synchronous, and iOS-only. */
export function savedLanguage(): Lang | null {
  if (Platform.OS !== 'ios') return null;
  try {
    const value = Settings.get(CHOICE_KEY);
    return isLang(value) ? value : null;
  } catch {
    return null;
  }
}

/** The first of the person's languages that Regain speaks, the way iOS picks a bundle's own. */
function phoneLanguage(): Lang {
  return getLocales().map((l) => l.languageCode).find(isLang) ?? 'en';
}

/**
 * Saves the choice. It takes effect when the app is next opened — see the note at the top.
 * Passing null hands the decision back to the phone.
 */
export function chooseLanguage(choice: Lang | null) {
  if (Platform.OS !== 'ios') return;
  Settings.set({ [CHOICE_KEY]: choice ?? '' });
}

export const lang: Lang = savedLanguage() ?? phoneLanguage();

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
