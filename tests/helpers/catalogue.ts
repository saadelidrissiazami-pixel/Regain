// Lit le catalogue bien-être directement dans les migrations SQL.
//
// Une séance vit dans trois endroits : un export dans content/<thème>/index.ts, une entrée dans
// CONTENT_BY_SLUG, et une ligne insert dans une migration. Rien ne garantissait qu'ils parlent
// des mêmes slugs, et une faute de frappe ne se voyait qu'à l'exécution, sous la forme d'un
// « Séance introuvable ». Plutôt que de recopier le catalogue dans une constante de test qui
// dérive à son tour, on le relit à la source.

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const MIGRATIONS_DIR = fileURLToPath(new URL('../../supabase/migrations', import.meta.url));

export type SeededProgram = { slug: string; category: string; duration_minutes: number };

/** Découpe une ligne de valeurs SQL en respectant les chaînes entre apostrophes. */
function splitValues(tuple: string): string[] {
  return (tuple.match(/'(?:[^']|'')*'|[^,]+/g) ?? []).map((value) =>
    value.trim().replace(/^'|'$/g, '').replace(/''/g, "'")
  );
}

/** Le catalogue tel que les migrations le construisent, inserts et mises à jour compris. */
export function parseSeededCatalogue(dir = MIGRATIONS_DIR): SeededProgram[] {
  const files = readdirSync(dir)
    .filter((name) => name.endsWith('.sql'))
    .sort();
  const rows = new Map<string, SeededProgram>();

  for (const file of files) {
    const sql = readFileSync(join(dir, file), 'utf8');

    const inserts = sql.matchAll(
      /insert\s+into\s+public\.wellbeing_programs\s*\(([^)]*)\)\s*values\s*([\s\S]*?)(?:on\s+conflict|;)/gi
    );
    for (const insert of inserts) {
      const columns = insert[1].split(',').map((column) => column.trim());
      const slugAt = columns.indexOf('slug');
      const categoryAt = columns.indexOf('category');
      const durationAt = columns.indexOf('duration_minutes');
      for (const tuple of insert[2].matchAll(/\(([^()]*)\)/g)) {
        const values = splitValues(tuple[1]);
        const slug = values[slugAt];
        if (!slug) continue;
        rows.set(slug, {
          slug,
          category: values[categoryAt],
          // 0013 a introduit la colonne avec un défaut de 3 minutes, puis corrigé les six
          // séances antérieures une par une.
          duration_minutes: durationAt >= 0 ? Number(values[durationAt]) : 3,
        });
      }
    }

    const updates = sql.matchAll(
      /update\s+public\.wellbeing_programs\s+set\s+duration_minutes\s*=\s*(\d+)\s+where\s+slug\s*=\s*'([^']+)'/gi
    );
    for (const update of updates) {
      const row = rows.get(update[2]);
      if (row) row.duration_minutes = Number(update[1]);
    }
  }

  return [...rows.values()];
}

/** Les slugs déclarés gratuits par 0023_explicit_premium_catalog.sql. */
export function parseFreeSlugsFromMigration(dir = MIGRATIONS_DIR): string[] {
  const sql = readFileSync(join(dir, '0023_explicit_premium_catalog.sql'), 'utf8');
  const array = sql.match(/array\s*\[([\s\S]*?)\]/i);
  if (!array) throw new Error("0023_explicit_premium_catalog.sql ne contient pas de liste array[…]");
  return (array[1].match(/'([^']+)'/g) ?? []).map((value) => value.replace(/'/g, ''));
}
