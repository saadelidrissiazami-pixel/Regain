// Résolveur pour `node --test` : le runner de Node strippe les types mais résout en
// ESM, qui exige une extension explicite. Le code applicatif importe sans extension
// (comme Metro et tsc l'attendent), on la rétablit ici plutôt que de polluer les
// sources d'extensions .ts.
export async function resolve(specifier, context, next) {
  const isRelative = specifier.startsWith('./') || specifier.startsWith('../');
  const hasExtension = /\.[cm]?[jt]sx?$/.test(specifier);

  if (isRelative && !hasExtension) {
    for (const candidate of [`${specifier}.ts`, `${specifier}.tsx`, `${specifier}/index.ts`]) {
      try {
        return await next(candidate, context);
      } catch {
        // on essaie la variante suivante
      }
    }
  }

  return next(specifier, context);
}
