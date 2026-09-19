// Offre freemium : dans chaque catégorie, les séances les plus courtes restent gratuites pour
// que chacun puisse installer une vraie habitude ; les plus longues sont réservées à Premium.
// Même règle que la migration 0021_premium_catalog.sql : les deux doivent rester alignées.

export const FREE_SESSIONS_PER_CATEGORY = 3;

type ProgramLike = { slug: string; category: string; duration_minutes: number };

/** Séances gratuites : les N premières de chaque catégorie, par durée puis par nom. */
export function freeProgramSlugs(programs: ProgramLike[], perCategory = FREE_SESSIONS_PER_CATEGORY): Set<string> {
  const byCategory = new Map<string, ProgramLike[]>();
  for (const program of programs) {
    const list = byCategory.get(program.category) ?? [];
    list.push(program);
    byCategory.set(program.category, list);
  }
  const free = new Set<string>();
  for (const list of byCategory.values()) {
    [...list]
      .sort((a, b) => a.duration_minutes - b.duration_minutes || a.slug.localeCompare(b.slug))
      .slice(0, perCategory)
      .forEach((program) => free.add(program.slug));
  }
  return free;
}
