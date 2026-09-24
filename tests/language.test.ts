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
