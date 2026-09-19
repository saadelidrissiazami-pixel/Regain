# Regain

App mobile de planification et bien-être (React Native + Expo). Répond en continu à : *« qu'est-ce qui serait une bonne activité pour moi maintenant ? »*

## Démarrer en local

```bash
npm install
npm run ios      # ou: npm run android / npm run web
```

L'app ne fonctionne pas tant que `.env` n'est pas configuré (voir ci-dessous) — elle a besoin de Supabase dès l'écran de connexion.

## Connecter Supabase (obligatoire)

Ceci demande un compte que je ne peux pas créer à votre place :

1. Créez un projet sur [supabase.com](https://supabase.com) — choisissez la région **UE (Frankfurt)** pour la conformité RGPD.
2. Dans *Project Settings → API*, copiez `Project URL` et `anon public key`.
3. Copiez `.env.example` vers `.env` et renseignez ces deux valeurs :
   ```bash
   cp .env.example .env
   ```
4. Appliquez, **dans l'ordre**, tous les fichiers de [`supabase/migrations/`](supabase/migrations) via le *SQL Editor* du dashboard Supabase (ou `supabase db push` si vous avez la CLI installée).
5. Dans **Authentication → Sign In / Providers → Email**, désactivez *Confirm email* pour tester sans boîte mail (à réactiver avant la mise en production).

## Abonnements Premium (optionnel)

Le paywall et la logique d'abonnement (RevenueCat) sont prêts : formules mensuelle et annuelle, essai gratuit, restauration, gestion de l'abonnement, mise à jour en direct du statut. Suivez **[docs/abonnements.md](docs/abonnements.md)** : on peut tout tester gratuitement avec le Test Store RevenueCat avant de créer les comptes Apple / Google.

Les achats intégrés nécessitent un **build de développement** — ils ne fonctionnent pas dans Expo Go ni dans l'aperçu web (Premium y reste débloqué pour tester).

## Synchronisation calendrier

*Profil → Calendrier* ajoute automatiquement chaque planning dans un calendrier « Regain » sur l'appareil (iCloud sur iPhone quand c'est possible), aux heures réelles de vos disponibilités, avec une alerte 15 min avant (sauf si les rappels Regain sont déjà actifs). Le bouton « Synchroniser avec mon calendrier » de l'onglet Planning le fait à la demande. Couper la synchro retire les activités à venir. Comme les achats, le calendrier n'est **pas accessible dans Expo Go** : il faut un build de développement.

## Coach IA conversationnel (optionnel — V2)

Le chat ([app/(tabs)/coach.tsx](app/(tabs)/coach.tsx)) appelle une Edge Function Supabase ([supabase/functions/coach](supabase/functions/coach)) qui elle-même appelle l'API Anthropic — la clé API n'est jamais exposée dans l'app. Sans déploiement, l'écran affiche un message d'erreur clair au lieu de planter. Pour l'activer :

1. Créez un compte sur [console.anthropic.com](https://console.anthropic.com) et générez une clé API.
2. Installez la CLI Supabase si besoin : `npm install -g supabase`.
3. `supabase login`, puis `supabase link --project-ref bbxmmqmrndgcmmsdrcjg`.
4. `supabase secrets set ANTHROPIC_API_KEY=sk-ant-votre-clé`.
5. `supabase functions deploy coach`.

## Déploiement bêta (Phase 8)

1. Créez un compte sur [expo.dev](https://expo.dev) si vous n'en avez pas, puis dans le projet : `npx eas login`.
2. `npx eas init` pour relier ce projet à votre compte Expo (ajoute un `projectId` à `app.json`).
3. `npx eas build --profile preview --platform ios` (nécessite un compte Apple Developer, 99$/an) ou `--platform android` (compte Google Play Console, 25$ une fois).
4. Distribuez le build via TestFlight (iOS) ou le canal de test interne (Android).

La configuration des profils de build est déjà prête dans [`eas.json`](eas.json). EAS Build ne lit pas `.env` : déclarez vos variables `EXPO_PUBLIC_*` sur expo.dev (voir [docs/abonnements.md](docs/abonnements.md#étape-4--variables-denvironnement-des-builds-eas)).

## Structure du projet

```
app/                    Routes Expo Router (fichiers courts qui renvoient vers src/screens)
  (tabs)/               Planning, Bien-être, Forme, Suivi, Profil
  (auth)/               Connexion
  onboarding/           Accueil en 4 étapes (prénom, objectifs, rythme, budget)
  planning/             Semaine / mois, ajout d'une activité
  fitness/              Programme, nutrition, lecteur d'entraînement, bilan, questionnaire
  wellbeing/            Séance immersive, thèmes, recherche, journal
  profile/ settings/    Mes objectifs, paramètres
  availability/         Disponibilités
  paywall/              Abonnement Premium
src/
  theme/                Design system : couleurs (clair / sombre), typo, espacements, rayons, ombres, images
  components/ui/        Primitives (Screen, ScreenHeader, Card, Button, SegmentedControl, Sheet, Tag…)
  components/cards/     Cartes métier (NowCard, WorkoutHeroCard, RecommendationHero, StatCard, MoodScale…)
  components/feedback/  États vides, erreurs, squelettes de chargement, messages
  screens/              Écrans complets, par domaine
  hooks/                Données partagées entre écrans (usePlanning, useFitness, useWellbeing…)
  features/             Logique pure et testée par domaine
  lib/                  Supabase, calendrier, notifications, achats
supabase/
  migrations/            Schéma SQL versionné (à exécuter dans l'ordre)
  functions/coach/        Edge Function du coach IA (proxy sécurisé vers Anthropic)
content/                 Bibliothèque bien-être statique (méditation, respiration, journaling...)
```

## Design system

- Couleurs : `src/theme/colors.ts` (palettes claire et sombre, contrastes vérifiés dans `tests/palettes.test.ts`).
  Les classes Tailwind (`bg-surface`, `text-ink-2`…) lisent les mêmes variables ; `useTheme()` les donne en JS.
- Typographie : SF Pro (police système) sur iOS, Inter sur Android et le web, via `<Text variant="…">`.
- Réglage Clair / Sombre / Auto dans Profil → Paramètres.
- Photos d'ambiance : à déposer dans `assets/images/` puis déclarer dans `src/theme/images.ts`.
  Sans photo, un dégradé sauge prend le relais.
- La migration `0022_coach_redesign.sql` ajoute le sommeil habituel, le créneau et les jours
  d'entraînement, et le journal des séances de musculation. Tant qu'elle n'est pas appliquée,
  ces informations restent simplement masquées.

## État d'avancement

Toutes les phases du MVP défini au départ sont implémentées et testées :

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

Les étapes restantes dépendent uniquement de comptes externes que vous devez créer vous-même (voir sections ci-dessus).
