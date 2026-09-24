// Reads the wellbeing catalogue straight out of the SQL migrations.
//
// A session lives in three places: an export in content/<theme>/index.ts, an entry in
// CONTENT_BY_SLUG, and an insert line in a migration. Nothing guaranteed they were talking about
// the same slugs, and a typo only showed up at runtime, in the shape of a
// “Session not found”. Rather than copy the catalogue into a test constant that drifts in its
// own turn, we read it back at the source.

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const MIGRATIONS_DIR = fileURLToPath(new URL('../../supabase/migrations', import.meta.url));

export type SeededProgram = { slug: string; category: string; duration_minutes: number };

/** Splits a line of SQL values, respecting single-quoted strings. */
function splitValues(tuple: string): string[] {
  return (tuple.match(/'(?:[^']|'')*'|[^,]+/g) ?? []).map((value) =>
    value.trim().replace(/^'|'$/g, '').replace(/''/g, "'")
  );
}

/** The catalogue as the migrations build it, inserts and updates included. */
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
          // 0013 introduced the column with a default of 3 minutes, then corrected the six
          // earlier sessions one at a time.
          duration_minutes: durationAt >= 0 ? Number(values[durationAt]) : 3,
        });
      }
    }

    // A migration can also remove sessions: 0027 sets the SOS sessions and the courses aside
    // until 1.1 ships. Without allowing for that, the tests would reason about a database
    // that does not exist.
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

/** The slugs declared free by 0023_explicit_premium_catalog.sql. */
export function parseFreeSlugsFromMigration(dir = MIGRATIONS_DIR): string[] {
  const sql = readFileSync(join(dir, '0023_explicit_premium_catalog.sql'), 'utf8');
  const array = sql.match(/array\s*\[([\s\S]*?)\]/i);
  if (!array) throw new Error('0023_explicit_premium_catalog.sql contains no array[…] list');
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
 * Splits the tuples of an `insert … values (…), (…)`, respecting doubled single quotes.
 * A regular expression was enough for the sessions; the activities contain quotation marks,
 * escaped apostrophes and `array[…]`, and a regex would leave values truncated there without
 * any warning.
 */
function splitTuples(sql: string): string[][] {
  const tuples: string[][] = [];
  let depth = 0;
  // Brackets count as much as parentheses: without that, the comma in
  // `array['plus_mouvement','plus_energie']` looks like a column separator and shifts
  // every column after it, silently.
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
    // A SQL comment between two tuples. Without this skip, the apostrophe in “-- Prendre l'air”
    // opens a string and swallows half the catalogue without saying a word.
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

/** The activities offered, as 0024_activities_first_action.sql inserts them. */
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
