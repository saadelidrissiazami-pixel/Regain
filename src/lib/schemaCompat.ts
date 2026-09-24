// Columns and tables added by a recent migration can be missing until that migration has been
// applied on Supabase. Those errors must not break the screen: the information is simply
// treated as absent.
const MISSING_SCHEMA_CODES = new Set(['42703', '42P01', 'PGRST204', 'PGRST205']);

export function isMissingSchema(error: unknown): boolean {
  return !!error && typeof error === 'object' && MISSING_SCHEMA_CODES.has(String((error as { code?: string }).code));
}
