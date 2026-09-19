// Les colonnes et tables ajoutées par une migration récente peuvent manquer tant que la
// migration n'a pas été appliquée sur Supabase. Ces erreurs-là ne doivent pas casser l'écran :
// l'information est simplement considérée comme absente.
const MISSING_SCHEMA_CODES = new Set(['42703', '42P01', 'PGRST204', 'PGRST205']);

export function isMissingSchema(error: unknown): boolean {
  return !!error && typeof error === 'object' && MISSING_SCHEMA_CODES.has(String((error as { code?: string }).code));
}
