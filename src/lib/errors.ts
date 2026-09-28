import { t } from './i18n';

/** The text an error carries, whether it is an Error or one of Supabase's plain objects. */
function messageOf(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message: unknown }).message;
    return typeof message === 'string' ? message : '';
  }
  return '';
}

/**
 * A database error, recognised by the SQLSTATE or PostgREST code Supabase attaches.
 *
 * These name columns, constraints and policies. That is the developer's business, never the
 * person holding the phone — but it was being thrown away for everyone, which is how a missing
 * column showed up as “something went wrong” and cost an evening to find.
 */
function databaseCode(error: unknown): string | null {
  if (typeof error !== 'object' || error === null || !('code' in error)) return null;
  const code = (error as { code: unknown }).code;
  return typeof code === 'string' && /^[A-Z0-9]{5,}$/i.test(code) ? code : null;
}

/** `__DEV__` is injected by Metro and absent everywhere else, tests included. */
function isDev(): boolean {
  return typeof __DEV__ !== 'undefined' && __DEV__;
}

/** A readable message out of any error (network, Supabase, and the rest). */
export function errorMessage(error: unknown, fallback = t('Something went wrong. Try again in a moment.')): string {
  const message = messageOf(error);
  if (!message) return fallback;
  if (/network|fetch|Failed to fetch|timeout/i.test(message)) {
    return t('The connection looks interrupted. Check your network, then try again.');
  }
  const code = databaseCode(error);
  // In a build somebody uses, a schema error stays the neutral sentence. In development it is
  // printed in full, because that is the only moment it can still be acted upon.
  if (code) return isDev() ? `${code}: ${message}` : fallback;
  return message;
}
