# Regain

App mobile de planification et bien-être (React Native + Expo). Répond en continu à : *« qu'est-ce qui serait une bonne activité pour moi maintenant ? »*

## Démarrer en local

```bash
npm install
npm run ios      # ou: npm run android / npm run web
```

L'app ne fonctionne pas tant que `.env` n'est pas configuré (voir ci-dessous) — elle a besoin de Supabase dès l'écran de connexion.

## Vérifier le code

```bash
npm run check      # typecheck + lint + tests (ce que lance la CI)
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm test           # tests unitaires (runner natif de Node, sans dépendance)
```

Les tests couvrent la logique pure : moteur de règles, calcul de semaine, créneaux
horaires, série de jours consécutifs ([`src/__tests__/`](src/__tests__)). Ils tournent
sur `node --test` via un petit résolveur ESM ([`scripts/`](scripts)) — aucun framework
de test à installer. La CI GitHub Actions rejoue les trois commandes à chaque push.

## Connecter Supabase (obligatoire)

Ceci demande un compte que je ne peux pas créer à votre place :

1. Créez un projet sur [supabase.com](https://supabase.com) — choisissez la région **UE (Frankfurt)** pour la conformité RGPD.
2. Dans *Project Settings → API*, copiez `Project URL` et `anon public key`.
3. Copiez `.env.example` vers `.env` et renseignez ces deux valeurs :
   ```bash
   cp .env.example .env
   ```
4. Appliquez, **dans l'ordre**, tous les fichiers de [`supabase/migrations/`](supabase/migrations) via le *SQL Editor* du dashboard Supabase (ou `supabase db push` si vous avez la CLI installée). Ils sont idempotents : les réappliquer ne duplique rien.
5. Dans **Authentication → Sign In / Providers → Email**, désactivez *Confirm email* pour tester sans boîte mail (à réactiver avant la mise en production).

## Abonnements Premium (optionnel — Phase 6)

Le code du paywall et de la logique d'abonnement (RevenueCat) est déjà en place ([src/lib/purchases.ts](src/lib/purchases.ts)). Sans configuration, l'écran Premium affiche un message d'information au lieu de planter. Pour l'activer :

1. Créez un compte [RevenueCat](https://www.revenuecat.com), ainsi qu'un compte Apple Developer (payant) et/ou Google Play Console.
2. Configurez vos produits d'achat intégré (abonnement mensuel/annuel) dans App Store Connect / Play Console, puis reliez-les dans RevenueCat.
3. Renseignez `EXPO_PUBLIC_REVENUECAT_IOS_KEY` / `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` dans `.env`.

Ces achats intégrés nécessitent un **build natif** (EAS Build) — ils ne fonctionnent pas dans Expo Go ni dans l'aperçu web.

## Coach IA conversationnel (optionnel — V2)

L'écran de chat est pour l'instant mis de côté dans [future-v3/coach.tsx](future-v3/coach.tsx) (voir [future-v3/README.md](future-v3/README.md) pour le réactiver). Il appelle une Edge Function Supabase ([supabase/functions/coach](supabase/functions/coach)) qui elle-même appelle l'API Anthropic — la clé API n'est jamais exposée dans l'app. Sans déploiement, l'écran affiche un message d'erreur clair au lieu de planter. Pour l'activer :

1. Créez un compte sur [console.anthropic.com](https://console.anthropic.com) et générez une clé API.
2. Installez la CLI Supabase si besoin : `npm install -g supabase`.
3. `supabase login`, puis `supabase link --project-ref bbxmmqmrndgcmmsdrcjg`.
4. `supabase secrets set ANTHROPIC_API_KEY=sk-ant-votre-clé`.
5. `supabase functions deploy coach`.

## Suppression de compte (RGPD — à déployer)

L'écran Profil permet d'exporter ses données (JSON, partagé via la feuille de partage
système) et de supprimer son compte. L'export fonctionne sans configuration ; la
suppression passe par une Edge Function, car effacer une ligne de `auth.users` exige
la clé `service_role`, qui ne doit jamais être embarquée dans l'app :

```bash
supabase functions deploy delete-account
```

Tant qu'elle n'est pas déployée, le bouton affiche un message d'erreur explicite au
lieu de planter. Toutes les tables référencent `profiles`/`auth.users` en
`on delete cascade` : supprimer l'utilisateur efface l'intégralité de ses données.

## Déploiement bêta (Phase 8)

1. Créez un compte sur [expo.dev](https://expo.dev) si vous n'en avez pas, puis dans le projet : `npx eas login`.
2. `npx eas init` pour relier ce projet à votre compte Expo (ajoute un `projectId` à `app.json`).
3. `npx eas build --profile preview --platform ios` (nécessite un compte Apple Developer, 99$/an) ou `--platform android` (compte Google Play Console, 25$ une fois).
4. Renseignez `EXPO_PUBLIC_TERMS_URL` et `EXPO_PUBLIC_PRIVACY_URL` dans `.env` : l'écran d'abonnement doit afficher ces deux liens, sans quoi la revue App Store refuse l'app (guideline 3.1.2). L'écran signale leur absence en rouge.
5. Distribuez le build via TestFlight (iOS) ou le canal de test interne (Android).

La configuration des profils de build est déjà prête dans [`eas.json`](eas.json).

## Structure du projet

```
app/                    Écrans Expo Router
  (tabs)/               Planning, Bien-être, Suivi, Profil
  (auth)/               Connexion
  onboarding/           Parcours d'accueil
  availability/         Gestion des disponibilités
  wellbeing/[slug]/      Lecteur de séance bien-être
  paywall/               Écran d'abonnement Premium
src/
  components/           Composants UI partagés (Chip, CategoryBadge, ProgressRing...)
  features/              Logique par domaine (planning, availability, onboarding, wellbeing)
  lib/                   Supabase, moteur de planning, personnalisation, calendrier, coach, achats
  styles/                Tailwind / NativeWind
  __tests__/             Tests unitaires de la logique pure
supabase/
  migrations/            Schéma SQL versionné (à exécuter dans l'ordre, réexécutable)
  functions/coach/        Edge Function du coach IA (proxy sécurisé vers Anthropic)
  functions/delete-account/  Edge Function de suppression de compte (RGPD)
content/                 Bibliothèque bien-être statique (méditation, respiration, journaling...)
scripts/                 Résolveur ESM pour `node --test`
future-v3/               Écrans mis de côté (coach IA)
```

## État d'avancement

Toutes les phases du MVP défini au départ sont implémentées. La logique métier pure
est couverte par des tests unitaires ; les écrans n'ont pas de tests automatisés et
sont vérifiés manuellement.

- **Phase 0-1** — Fondations, comptes & onboarding
- **Phase 2** — Calendrier interne (disponibilités récurrentes/ponctuelles)
- **Phase 3** — Moteur de règles générant le planning hebdomadaire réel
- **Phase 4** — Bibliothèque bien-être (respiration, méditation, journaling, confiance, sommeil, détachement en public)
- **Phase 5** — Suivi connecté aux vraies activités réalisées (streaks, temps par catégorie)
- **Phase 6** — Paywall Premium prêt (code) — nécessite vos comptes RevenueCat/App Store/Play Store
- **Phase 7** — Rappels quotidiens, pull-to-refresh
- **Phase 8** — Configuration EAS prête — nécessite votre compte Expo pour builder et distribuer

Fonctionnalités V2 (au-delà du MVP initial) :

- **Personnalisation apprise** — le moteur de règles favorise progressivement les catégories que vous complétez le plus souvent
- **Synchronisation calendrier** — export du planning vers le calendrier natif de l'appareil (iOS/Android)
- **Coach IA conversationnel** — prêt (code) — nécessite votre compte Anthropic + déploiement de l'Edge Function

Conformité :

- **Export des données et suppression de compte** — implémentés (la suppression demande le déploiement d'une Edge Function, voir plus haut)
- **Liens CGU / confidentialité sur le paywall** — à renseigner dans `.env` avant soumission

Les étapes restantes dépendent uniquement de comptes externes que vous devez créer vous-même (voir sections ci-dessus).
