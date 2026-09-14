// supabase.functions.invoke enveloppe toute réponse non-2xx dans une erreur générique :
// sans lire le corps, un quota dépassé ou une panne serveur ressemble à « fonction non
// déployée ». Nos Edge Functions renvoient toujours `{ error: string }`.
export async function readFunctionError(error: unknown): Promise<string | null> {
  const context = (error as { context?: unknown }).context;
  if (!(context instanceof Response)) return null;
  try {
    const body = await context.clone().json();
    return typeof body?.error === 'string' ? body.error : null;
  } catch {
    return null;
  }
}
