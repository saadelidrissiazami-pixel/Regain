#!/usr/bin/env node
/**
 * What Apple currently thinks of each version.
 *
 *   node scripts/app-store.mjs
 *
 * This exists because the answer to "where is 1.1?" lives only in App Store Connect, and the web
 * dashboard asks for a password and a 2FA code every time — which means it can only be checked by
 * a human sitting at the keyboard. An App Store Connect API key is created once and then the
 * question is answerable forever, which matters here: the state of the version under review is
 * what decides whether the next one may be built at all.
 *
 * Needs, in .env:
 *   ASC_KEY_ID          the ten-character key id
 *   ASC_ISSUER_ID       the issuer uuid, shown above the key list
 *   ASC_PRIVATE_KEY     path to the AuthKey_<id>.p8 Apple lets you download exactly once
 *
 * Create them in App Store Connect → Users and Access → Integrations → App Store Connect API,
 * with the App Manager role. *.p8 is gitignored; keep the file outside the repo anyway.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { api, token } from './lib/appStore.mjs';
import { env, ROOT } from './lib/env.mjs';

function credentials() {
  const keyId = env('ASC_KEY_ID');
  const issuerId = env('ASC_ISSUER_ID');
  const path = env('ASC_PRIVATE_KEY');
  if (!keyId || !issuerId || !path) {
    console.error('Il manque ASC_KEY_ID, ASC_ISSUER_ID ou ASC_PRIVATE_KEY. Voir l’en-tête de ce fichier.');
    process.exit(1);
  }
  return { keyId, issuerId, privateKey: readFileSync(path, 'utf8') };
}

const bundleId = JSON.parse(readFileSync(join(ROOT, 'app.json'), 'utf8')).expo.ios.bundleIdentifier;
const jwt = token(credentials());

const apps = await api(`/v1/apps?filter[bundleId]=${encodeURIComponent(bundleId)}&limit=1`, jwt);
const app = apps.data?.[0];
if (!app) {
  console.error(`Aucune app avec le bundle id ${bundleId} sur ce compte.`);
  process.exit(1);
}
console.log(`${app.attributes.name} — ${bundleId}\n`);

const versions = await api(`/v1/apps/${app.id}/appStoreVersions?limit=10`, jwt);
if (versions.data.length === 0) console.log('Aucune version n’a jamais été créée.');
for (const { attributes: a } of versions.data) {
  // appStoreState is deprecated in favour of appVersionState; which one comes back depends on the
  // API version Apple serves, so print whichever is populated rather than betting on one.
  const state = a.appVersionState ?? a.appStoreState ?? 'inconnu';
  console.log(`${a.versionString.padEnd(8)} ${state.padEnd(28)} ${a.platform}  créée ${a.createdDate?.slice(0, 10)}`);
}

const builds = await api(`/v1/apps/${app.id}/builds?limit=5`, jwt);
console.log('\nBuilds reçus par Apple :');
for (const { attributes: a } of builds.data) {
  console.log(
    `  build ${String(a.version).padEnd(4)} ${a.processingState.padEnd(12)} expire ${a.expirationDate?.slice(0, 10) ?? '—'}`,
  );
}
