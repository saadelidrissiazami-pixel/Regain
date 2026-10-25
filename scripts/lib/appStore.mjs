/**
 * Signing a request to App Store Connect.
 *
 * Apple authenticates with a short-lived ES256 JWT rather than a static key, and wants the
 * signature as raw r‖s — not the DER envelope node produces by default. Getting that one option
 * wrong returns a 401 that reads exactly like a wrong key, which is why this lives in its own
 * file with a test rather than inline in the script.
 */
import { Buffer } from 'node:buffer';
import { sign } from 'node:crypto';

const base64url = (value) =>
  Buffer.from(typeof value === 'string' ? value : JSON.stringify(value)).toString('base64url');

export function token({ keyId, issuerId, privateKey, now = Math.floor(Date.now() / 1000) }) {
  const claims = { iss: issuerId, iat: now, exp: now + 600, aud: 'appstoreconnect-v1' };
  const body = `${base64url({ alg: 'ES256', kid: keyId, typ: 'JWT' })}.${base64url(claims)}`;
  // privateKey is the PEM text of the .p8 as Apple ships it; sign() takes that directly.
  const signature = sign('sha256', Buffer.from(body), { key: privateKey, dsaEncoding: 'ieee-p1363' });
  return `${body}.${signature.toString('base64url')}`;
}

export async function api(pathname, jwt) {
  const res = await fetch(`https://api.appstoreconnect.apple.com${pathname}`, {
    headers: { Authorization: `Bearer ${jwt}` },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    // Apple's errors are specific and worth reading verbatim; none of them quote the key back.
    const detail = body.errors?.map((e) => `${e.title}: ${e.detail}`).join('; ') ?? res.statusText;
    throw new Error(`App Store Connect ${res.status} — ${detail}`);
  }
  return body;
}
