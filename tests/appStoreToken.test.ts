import { generateKeyPairSync, verify } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { token } from '../scripts/lib/appStore.mjs';

/** Le même genre de clé qu'Apple fournit dans un .p8 : EC, courbe P-256. */
const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });

function parts(jwt: string) {
  const [header, claims, signature] = jwt.split('.');
  const json = (part: string) => JSON.parse(Buffer.from(part, 'base64url').toString('utf8'));
  return { header: json(header), claims: json(claims), signature, signed: `${header}.${claims}` };
}

describe('le jeton envoyé à App Store Connect', () => {
  const now = 1_700_000_000;
  const jwt = token({ keyId: 'ABCDE12345', issuerId: 'issuer-uuid', privateKey, now });

  it('annonce ES256 et le numéro de clé, qui est ce qui identifie la clé', () => {
    expect(parts(jwt).header).toEqual({ alg: 'ES256', kid: 'ABCDE12345', typ: 'JWT' });
  });

  it("nomme l'audience exacte qu'Apple attend", () => {
    // Une autre valeur, ou une absence, donne un 401 indiscernable d'une mauvaise clé.
    expect(parts(jwt).claims).toEqual({
      iss: 'issuer-uuid',
      iat: now,
      exp: now + 600,
      aud: 'appstoreconnect-v1',
    });
  });

  it('expire dans la fenêtre que le serveur accepte', () => {
    // Apple refuse au-delà de vingt minutes ; dix laisse la marge d'une horloge qui dérive.
    const { claims } = parts(jwt);
    expect(claims.exp - claims.iat).toBeLessThanOrEqual(20 * 60);
    expect(claims.exp - claims.iat).toBeGreaterThan(60);
  });

  it('signe en r‖s brut, et non dans l’enveloppe DER que node produit par défaut', () => {
    // Le vrai piège : une signature DER est une signature valide que le serveur rejette quand
    // même. Deux coordonnées de 32 octets, donc 64, et jamais la longueur variable du DER.
    const { signature } = parts(jwt);
    expect(Buffer.from(signature, 'base64url').length).toBe(64);
  });

  it('produit une signature que la clé publique correspondante vérifie', () => {
    const { signed, signature } = parts(jwt);
    expect(
      verify('sha256', Buffer.from(signed), { key: publicKey, dsaEncoding: 'ieee-p1363' }, Buffer.from(signature, 'base64url')),
    ).toBe(true);
  });
});
