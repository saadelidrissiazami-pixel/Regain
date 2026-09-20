#!/usr/bin/env node
/**
 * Contrôle avant compilation : refuse une build de production à laquelle il manque une clé.
 * Lancé automatiquement par EAS (script npm `eas-build-pre-install`) et à la main :
 *     node scripts/preflight.mjs production
 *
 * Les oublis visés ici coûtent cher : un build sans clé RevenueCat vend du vide, un build sans
 * liens légaux est refusé par Apple, et une clé « Test Store » en production est un rejet net.
 */
import { readFileSync } from 'node:fs';

// En local, les variables sont dans .env ; sur les serveurs EAS, dans l'environnement.
function loadDotEnv() {
  try {
    for (const line of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim();
    }
  } catch {
    // pas de .env : on s'en tient à l'environnement
  }
}
loadDotEnv();

const profile = process.argv[2] ?? process.env.EAS_BUILD_PROFILE ?? 'development';
const isProduction = profile === 'production';

const required = [
  ['EXPO_PUBLIC_SUPABASE_URL', "l'app ne démarre pas sans Supabase"],
  ['EXPO_PUBLIC_SUPABASE_ANON_KEY', "l'app ne démarre pas sans Supabase"],
];

const productionOnly = [
  ['EXPO_PUBLIC_REVENUECAT_IOS_KEY', 'sans elle, personne ne peut s’abonner : Apple rejette un contenu verrouillé sans achat possible'],
  ['EXPO_PUBLIC_TERMS_URL', 'lien obligatoire sur un écran d’abonnement (règle App Store 3.1.2)'],
  ['EXPO_PUBLIC_PRIVACY_URL', 'lien obligatoire sur un écran d’abonnement, et dans App Store Connect'],
];

const forbiddenInProduction = [
  ['EXPO_PUBLIC_REVENUECAT_TEST_STORE_KEY', 'clé de test RevenueCat : les achats seraient simulés en production'],
  ['EXPO_PUBLIC_SIMULATE_FREE', 'force la version gratuite : les abonnés ne verraient pas Premium'],
];

const problems = [];
const filled = (name) => (process.env[name] ?? '').trim().length > 0;

for (const [name, why] of required) if (!filled(name)) problems.push(`${name} manque — ${why}`);
if (isProduction) {
  for (const [name, why] of productionOnly) if (!filled(name)) problems.push(`${name} manque — ${why}`);
  for (const [name, why] of forbiddenInProduction) if (filled(name)) problems.push(`${name} ne doit pas être défini — ${why}`);
}

if (problems.length > 0) {
  console.error(`\n✖ Contrôle avant compilation (profil « ${profile} ») :`);
  for (const problem of problems) console.error(`  · ${problem}`);
  console.error('\nRenseignez ces variables sur expo.dev → projet → Environment variables, puis relancez.');
  console.error('Détail : docs/deploiement-ios.md\n');
  process.exit(1);
}

console.log(`✓ Contrôle avant compilation (profil « ${profile} ») : rien ne manque.`);
