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

    // Une migration peut aussi retirer des séances : 0027 met les SOS et les parcours de côté
    // le temps que la 1.1 sorte. Sans en tenir compte, les tests raisonneraient sur une base
    // qui n'existe pas.
    const deletes = sql.matchAll(
      /delete\s+from\s+public\.wellbeing_programs\s+where\s+category\s+in\s*\(([^)]*)\)/gi
    );
    for (const removal of deletes) {
      const categories = (removal[1].match(/'([^']+)'/g) ?? []).map((value) => value.replace(/'/g, ''));
      for (const [slug, row] of [...rows]) {
        if (categories.includes(row.category)) rows.delete(slug);
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

export type SeededActivity = {
  title: string;
  category: string;
  duration_minutes: number;
  energy_required: string;
  indoor_outdoor: string;
  cost_level: string;
  tags: string[];
  first_action: string;
  stop_rule: string;
};

/**
 * Découpe les tuples d'un `insert … values (…), (…)` en respectant les apostrophes doublées.
 * Une expression régulière suffisait pour les séances ; les activités contiennent des guillemets,
 * des apostrophes échappées et des `array[…]`, et une regex y laisserait des valeurs tronquées
 * sans prévenir.
 */
function splitTuples(sql: string): string[][] {
  const tuples: string[][] = [];
  let depth = 0;
  // Les crochets comptent autant que les parenthèses : sans ça, la virgule de
  // `array['plus_mouvement','plus_energie']` passe pour un séparateur de colonnes et décale
  // silencieusement tout le reste de la ligne.
  let brackets = 0;
  let inString = false;
  let current = '';
  let values: string[] = [];

  for (let i = 0; i < sql.length; i += 1) {
    const char = sql[i];
    if (inString) {
      if (char === "'") {
        if (sql[i + 1] === "'") {
          current += "'";
          i += 1;
        } else {
          inString = false;
        }
      } else {
        current += char;
      }
      continue;
    }
    // Commentaire SQL entre deux tuples. Sans ce saut, l'apostrophe de « -- Prendre l'air »
    // ouvre une chaîne et avale la moitié du catalogue sans rien signaler.
    if (char === '-' && sql[i + 1] === '-' && depth === 0) {
      const newline = sql.indexOf('\n', i);
      if (newline === -1) break;
      i = newline;
      continue;
    }
    if (char === "'") {
      inString = true;
    } else if (char === '(') {
      depth += 1;
      if (depth === 1) {
        values = [];
        current = '';
        continue;
      }
      current += char;
    } else if (char === ')') {
      depth -= 1;
      if (depth === 0) {
        values.push(current.trim());
        tuples.push(values);
        current = '';
        continue;
      }
      current += char;
    } else if (char === '[') {
      brackets += 1;
      current += char;
    } else if (char === ']') {
      brackets -= 1;
      current += char;
    } else if (char === ',' && depth === 1 && brackets === 0) {
      values.push(current.trim());
      current = '';
    } else if (depth >= 1) {
      current += char;
    }
  }
  return tuples;
}

/** Les activités proposées, telles que 0024_activities_first_action.sql les insère. */
export function parseSeededActivities(dir = MIGRATIONS_DIR): SeededActivity[] {
  const sql = readFileSync(join(dir, '0024_activities_first_action.sql'), 'utf8');
  const body = sql.slice(sql.indexOf('values', sql.indexOf('insert into public.activities_catalog')));
  const end = body.indexOf('on conflict');
  return splitTuples(end > 0 ? body.slice(0, end) : body).map((values) => ({
    title: values[0],
    category: values[1],
    duration_minutes: Number(values[2]),
    energy_required: values[3],
    indoor_outdoor: values[4],
    cost_level: values[5],
    tags: (values[6].match(/[a-z_]+/g) ?? []).filter((tag) => tag !== 'array'),
    first_action: values[7],
    stop_rule: values[8],
  }));
}
