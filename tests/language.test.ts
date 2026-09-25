import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

// The code is English — French lives in src/i18n/fr.ts and content/fr — but the database is not: slugs, category keys and the activity titles that
// key the wording overlay are French on purpose, because they are values in rows that belong to
// real people. So this file cannot simply ban French — it bans French *in the words somebody
// reads*, and leaves the identifiers alone.
//
// It exists because three separate sweeps each missed something the one before had caught:
// scanning for accents missed “Exercice”, scanning for French function words missed “Dernier
// bilan”, and reading every extracted label missed `sur 2:00`, since `sur` is also an English
// word. Only the simulator found that last one. A test is cheaper than another simulator pass.

const ROOTS = ['src', 'app', 'supabase/functions'];

/** Keyed by a stored French value, so the French in it is the key and not the wording. */
const FILES_WITH_DELIBERATE_FRENCH = [
  'src/features/activities/catalogue.ts',
  // The French half of the app, and the one place that picks the French date locale.
  'src/i18n/fr.ts',
  'src/lib/i18n.ts',
];

/** Values the database stores, which the app translates for display but must send back as-is. */
const STORED_VALUES = new Set(['Parcours', 'Confiance en soi', 'Méditation', 'Respiration', 'Sommeil']);

/**
 * French the coach Edge Function is *supposed* to contain: it still answers 1.1, which is a French
 * build and cannot say which language it wants. Everything else in that function is English, which
 * is how `Message manquant` sat there unnoticed until this test started reading it.
 */
const DELIBERATE_FRENCH = new Set([
  '- Réponds en français.',
  // Keywords matched against the allergies and health notes people typed — 1.1 users typed French.
  'coiffe des rotateurs',
]);

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(entry) ? [path] : [];
  });
}

const FILES = ROOTS.flatMap(sourceFiles).filter((path) => !FILES_WITH_DELIBERATE_FRENCH.includes(path));

function withoutComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}

/** Every string literal and every piece of JSX text, with `${…}` holes blanked out. */
function readableStrings(source: string): string[] {
  const code = withoutComments(source);
  const found: string[] = [];
  for (const line of code.split('\n')) {
    for (const match of line.matchAll(/(?<![\w$])(['"`])((?:\\.|(?!\1)[^\\\n]){2,})\1/g)) {
      found.push(match[2]);
    }
    // JSX text, which the literal pattern above never sees.
    const blanked = line.replace(/\{[^{}]*\}/g, ' ');
    for (const match of blanked.matchAll(/>([^<>]{2,})</g)) found.push(match[1]);
  }
  return found.map((s) => s.replace(/\$\{[^}]*\}/g, ' ').trim()).filter(Boolean);
}

/** Identifiers, routes, icon names and package names are not wording. */
function isIdentifier(value: string): boolean {
  return value.includes('/') || value.includes('_') || /^[a-z0-9-]+$/.test(value);
}

describe('the app speaks English', () => {
  it('formats every date with an English locale', () => {
    // A single `fr-FR` here is what put “Septembre 2026” above an otherwise English calendar.
    const offenders = FILES.filter((path) => /['"]fr[-_]FR['"]/.test(readFileSync(path, 'utf8')));
    expect(offenders).toEqual([]);
  });

  it('has no French left in anything somebody reads', () => {
    // Short words that are French *and* English (`sur`, `car`, `son`, `pas`) are the ones every
    // other kind of scan lets through, so they are the point of this list rather than an
    // afterthought. Words that only ever appear in French are here too.
    const FRENCH = new Set([
      'sur', 'car', 'par', 'son', 'ton', 'pas', 'ni', 'ans', 'fin', 'mais', 'donc', 'puis',
      'avec', 'sans', 'pour', 'dans', 'chez', 'vers', 'entre', 'sous', 'depuis', 'pendant',
      'une', 'des', 'les', 'aux', 'est', 'sont', 'etre', 'avoir', 'cette', 'ces', 'cet',
      'tout', 'toute', 'tous', 'toutes', 'rien', 'deja', 'encore', 'toujours', 'jamais',
      'qui', 'que', 'quoi', 'dont', 'quand', 'comment', 'pourquoi', 'quel', 'quelle',
      'tu', 'toi', 'vous', 'votre', 'vos', 'notre', 'nos', 'leur', 'leurs', 'mes',
      'jour', 'jours', 'semaine', 'semaines', 'annee', 'heure', 'heures',
      'seance', 'seances', 'exercice', 'exercices', 'repos', 'serie', 'series', 'repetitions',
      'objectif', 'objectifs', 'activite', 'activites', 'reglages', 'abonnement', 'compte',
      'choisir', 'choisis', 'valider', 'envoyer', 'supprimer', 'garder', 'retirer', 'ajouter',
      'commencer', 'terminer', 'continuer', 'reprendre', 'arreter', 'mettre', 'faire',
      'bonjour', 'bonsoir', 'merci', 'desole', 'oui', 'non', 'aujourd', 'demain', 'hier',
      'matin', 'soir', 'midi', 'nuit', 'dernier', 'derniere', 'premier', 'premiere',
      'prochain', 'prochaine', 'nouveau', 'nouvelle', 'ancienne', 'bilan', 'impossible',
      'glucides', 'lipides', 'proteines', 'poids', 'taille', 'niveau', 'corps', 'entier',
      'plusieurs', 'possibles', 'suivant', 'precedent', 'ferme', 'cours', 'lecture',
    ]);

    const offenders: string[] = [];
    for (const path of FILES) {
      for (const value of readableStrings(readFileSync(path, 'utf8'))) {
        if (isIdentifier(value) || STORED_VALUES.has(value) || DELIBERATE_FRENCH.has(value)) continue;
        // Apostrophes split words, so “aujourd'hui” is read as “aujourd” and caught.
        const words = value.toLowerCase().match(/[a-zà-ÿ]+/g) ?? [];
        // A single hit is enough: every word in the list above is one no English sentence in this
        // app has a reason to contain, so finding one at all means the string was never translated.
        const french = words.filter((word) => FRENCH.has(normalise(word)));
        if (french.length > 0) offenders.push(`${path}: ${value}  ← ${french.join(', ')}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

function normalise(word: string): string {
  return word.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

// ---------------------------------------------------------------------------------------------
// The other half of the problem. Everything above bans French in the code; none of it noticed
// nine screens whose English was never wrapped in t() at all, because untranslated English looks
// exactly like translated English to a scan for French words. In French those screens rendered in
// English, which no test failed over.
//
// So this reads the props that carry wording and insists the value went through t(). It walks the
// expression rather than matching a pattern, because the strings that survived the last three
// sweeps were all inside something: a template literal, a ternary, a plural built with `${}`.
// `sur 2:00` was found in the simulator; `, fait` and `grammes` sat in accessibility labels.

/** Props whose value is read aloud or displayed. `value` is left out: it carries data, not wording. */
const WORDING_PROPS = [
  'title', 'subtitle', 'label', 'body', 'placeholder', 'actionLabel', 'secondaryLabel',
  'message', 'overline', 'hint', 'caption', 'unit', 'accessibilityLabel', 'accessibilityHint',
];

/** Values that are the same in every language, so t() would only add noise. */
const NOT_WORDING = new Set([
  // A unit symbol.
  'kg',
  // Intl.DateTimeFormat option values, passed to toLocaleDateString rather than shown.
  'long',
  'numeric',
  // An example address, which reads the same in French.
  'you@example.com',
  // Addressed to whoever builds the app, and names the two environment variables they must set:
  // it only appears when they are missing, which never happens in a released build.
  'EXPO_PUBLIC_TERMS_URL and EXPO_PUBLIC_PRIVACY_URL are not set. Both links are required to pass App Store review.',
]);

const UI_ROOTS = ['src/screens', 'src/components', 'app'];

/** Two letters together: enough to tell a word from a separator, a number or a symbol. */
const HAS_WORD = /[A-Za-zÀ-ÿ]{2,}/;
/** A literal that t() is already being given. */
const TRANSLATED = /\bt\(\s*$/;
/** A literal being compared or used as a key, which is a value in the code and not wording. */
const COMPARED = /(?:===|!==|==|!=|case|includes\(|startsWith\(|endsWith\(|\[)\s*$/;

function readQuoted(src: string, i: number): { body: string; end: number } | null {
  const quote = src[i];
  for (let j = i + 1; j < src.length; j++) {
    if (src[j] === '\\') j++;
    else if (src[j] === quote) return { body: src.slice(i + 1, j), end: j + 1 };
  }
  return null;
}

/** A template literal split into its own text and the source of each `${…}` hole. */
function readTemplate(src: string, i: number): { text: string; holes: string[]; end: number } | null {
  let text = '';
  let hole = '';
  let depth = 0;
  const holes: string[] = [];
  for (let j = i + 1; j < src.length; j++) {
    const c = src[j];
    if (c === '\\') { j++; continue; }
    if (depth === 0) {
      if (c === '`') return { text, holes, end: j + 1 };
      if (c === '$' && src[j + 1] === '{') { depth = 1; hole = ''; j++; continue; }
      text += c;
      continue;
    }
    // Inside a hole, quotes and nested templates are skipped whole so their braces do not count.
    if (c === '"' || c === "'") {
      const quoted = readQuoted(src, j);
      if (!quoted) break;
      hole += src.slice(j, quoted.end);
      j = quoted.end - 1;
      continue;
    }
    if (c === '`') {
      const nested = readTemplate(src, j);
      if (!nested) break;
      hole += src.slice(j, nested.end);
      j = nested.end - 1;
      continue;
    }
    if (c === '{') depth++;
    else if (c === '}' && --depth === 0) { holes.push(hole); continue; }
    hole += c;
  }
  return null;
}

/** Every piece of wording in an expression that t() was not given. */
function untranslated(expression: string): string[] {
  const found: string[] = [];
  for (let i = 0; i < expression.length; i++) {
    const c = expression[i];
    if (c === '"' || c === "'") {
      const quoted = readQuoted(expression, i);
      if (!quoted) break;
      const before = expression.slice(0, i);
      const after = expression.slice(quoted.end);
      if (!TRANSLATED.test(before) && !COMPARED.test(before) && !/^\s*(===|!==|==|!=)/.test(after)) {
        found.push(quoted.body);
      }
      i = quoted.end - 1;
      continue;
    }
    if (c === '`') {
      const template = readTemplate(expression, i);
      if (!template) break;
      // The template's own text, then whatever the holes are built from.
      found.push(template.text);
      for (const hole of template.holes) found.push(...untranslated(hole));
      i = template.end - 1;
      continue;
    }
  }
  return found;
}

/** The source of a prop's value: the quoted string, or the balanced `{…}` after the `=`. */
function propValue(src: string, i: number): string | null {
  const c = src[i];
  if (c === '"' || c === "'") {
    const quoted = readQuoted(src, i);
    return quoted && src.slice(i, quoted.end);
  }
  if (c !== '{') return null;
  let depth = 0;
  for (let j = i; j < src.length; j++) {
    const ch = src[j];
    if (ch === '\\') { j++; continue; }
    if (ch === '"' || ch === "'") {
      const quoted = readQuoted(src, j);
      if (!quoted) break;
      j = quoted.end - 1;
      continue;
    }
    if (ch === '`') {
      const template = readTemplate(src, j);
      if (!template) break;
      j = template.end - 1;
      continue;
    }
    if (ch === '{') depth++;
    else if (ch === '}' && --depth === 0) return src.slice(i + 1, j);
  }
  return null;
}

describe('every screen speaks the reader’s language', () => {
  it('passes each piece of wording through t()', () => {
    const offenders: string[] = [];
    // No space before the `=`, which is what tells a JSX prop from a default parameter value
    // (`placeholder = t('Choose')`), and no dot before the name, which excludes `props.title=`.
    const prop = new RegExp(`(?<![\\w$.])(${WORDING_PROPS.join('|')})=(?=['"\`{])`, 'g');

    for (const path of UI_ROOTS.flatMap(sourceFiles)) {
      const code = withoutComments(readFileSync(path, 'utf8'));
      for (const match of code.matchAll(prop)) {
        const value = propValue(code, match.index + match[0].length);
        if (value === null) continue;
        for (const wording of untranslated(value)) {
          if (!HAS_WORD.test(wording) || NOT_WORDING.has(wording.trim())) continue;
          offenders.push(`${path}: ${match[1]}={${JSON.stringify(wording)}}  ← wrap in t()`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it('notices a bare string prop, so the check above cannot quietly stop working', () => {
    // Left in on purpose: a test that only ever sees clean code proves nothing about what it
    // catches. Each of these is a shape that really did get through — a plain prop, a ternary of
    // two literals, a plural spliced into a template.
    const offenders = (jsx: string) =>
      [...jsx.matchAll(new RegExp(`(?<![\\w$.])(${WORDING_PROPS.join('|')})=(?=['"\`{])`, 'g'))].flatMap((m) =>
        untranslated(propValue(jsx, m.index + m[0].length) ?? '').filter((s) => HAS_WORD.test(s))
      );

    expect(offenders('<Button label="Sign out" />')).toEqual(['Sign out']);
    expect(offenders("<Button label={'Sign out'} />")).toEqual(['Sign out']);
    expect(offenders("<Row label={open ? 'Show less' : 'Show more'} />")).toEqual(['Show less', 'Show more']);
    expect(offenders('<Row accessibilityLabel={`Mark “${title}” as done`} />')).toEqual(['Mark “” as done']);
    expect(offenders('<Row subtitle={`${n} activit${n > 1 ? "ies" : "y"}`} />')).toEqual([' activit', 'ies']);

    // And the shapes it must stay quiet about, or nobody will keep it.
    expect(offenders("<Button label={t('Sign out')} />")).toEqual([]);
    expect(offenders("<Button label={open ? t('Show less') : t('Show more')} />")).toEqual([]);
    expect(offenders('<Stat accessibilityLabel={`${value} ${label}`} />')).toEqual([]);
    expect(offenders("<Row title={lang === 'fr' ? french : english} />")).toEqual([]);
    expect(offenders("<Row subtitle={t('{count} left', { count })} />")).toEqual([]);
  });
});
