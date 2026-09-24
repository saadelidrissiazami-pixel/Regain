#!/usr/bin/env node
/**
 * A pre-build check: it refuses a production build that is missing a key.
 * Run automatically by EAS (the `eas-build-pre-install` npm script) and by hand:
 *     node scripts/preflight.mjs production
 *
 * The omissions this catches are expensive: a build with no RevenueCat key sells nothing, a build
 * with no legal links is refused by Apple, and a “Test Store” key in production is a flat reject.
 */
import { readFileSync } from 'node:fs';

// Locally the variables live in .env; on the EAS servers, in the environment.
// We remember which ones come from the file: `.env` is not sent to the build servers, so a key
// that only exists there will never reach production and must not block anything.
const fromDotEnv = new Set();
function loadDotEnv() {
  try {
    for (const line of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].trim();
        fromDotEnv.add(match[1]);
      }
    }
  } catch {
    // no .env: stick to the environment
  }
}
loadDotEnv();

const profile = process.argv[2] ?? process.env.EAS_BUILD_PROFILE ?? 'development';
const isProduction = profile === 'production';

const required = [
  ['EXPO_PUBLIC_SUPABASE_URL', 'the app does not start without Supabase'],
  ['EXPO_PUBLIC_SUPABASE_ANON_KEY', 'the app does not start without Supabase'],
];

const productionOnly = [
  ['EXPO_PUBLIC_REVENUECAT_IOS_KEY', 'without it nobody can subscribe, and Apple rejects locked content with no way to buy'],
  ['EXPO_PUBLIC_TERMS_URL', 'a mandatory link on a subscription screen (App Store rule 3.1.2)'],
  ['EXPO_PUBLIC_PRIVACY_URL', 'a mandatory link on a subscription screen, and in App Store Connect'],
];

const forbiddenInProduction = [
  ['EXPO_PUBLIC_REVENUECAT_TEST_STORE_KEY', 'a RevenueCat test key: purchases would be simulated in production'],
  ['EXPO_PUBLIC_SIMULATE_FREE', 'forces the free version: subscribers would not see Premium'],
];

const problems = [];
const filled = (name) => (process.env[name] ?? '').trim().length > 0;

for (const [name, why] of required) if (!filled(name)) problems.push(`${name} manque — ${why}`);
if (isProduction) {
  for (const [name, why] of productionOnly) if (!filled(name)) problems.push(`${name} manque — ${why}`);
  // Only the variables actually present in the build environment count here.
  for (const [name, why] of forbiddenInProduction) {
    if (filled(name) && !fromDotEnv.has(name)) problems.push(`${name} must not be set — ${why}`);
  }
}

if (problems.length > 0) {
  console.error(`\n✖ Pre-build check (the “${profile}” profile):`);
  for (const problem of problems) console.error(`  · ${problem}`);
  console.error('\nSet these on expo.dev → project → Environment variables, then run it again.');
  console.error('Details: docs/deploiement-ios.md\n');
  process.exit(1);
}

console.log(`✓ Pre-build check (the “${profile}” profile): nothing missing.`);
