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

## Abonnements Premium (optionnel — Phase 6)

Le code du paywall et de la logique d'abonnement (RevenueCat) est déjà en place ([src/lib/purchases.ts](src/lib/purchases.ts)). Sans configuration, l'écran Premium affiche un message d'information au lieu de planter. Pour l'activer :

1. Créez un compte [RevenueCat](https://www.revenuecat.com), ainsi qu'un compte Apple Developer (payant) et/ou Google Play Console.
2. Configurez vos produits d'achat intégré (abonnement mensuel/annuel) dans App Store Connect / Play Console, puis reliez-les dans RevenueCat.
3. Renseignez `EXPO_PUBLIC_REVENUECAT_IOS_KEY` / `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` dans `.env`.

Ces achats intégrés nécessitent un **build natif** (EAS Build) — ils ne fonctionnent pas dans Expo Go ni dans l'aperçu web.

## Déploiement bêta (Phase 8)

1. Créez un compte sur [expo.dev](https://expo.dev) si vous n'en avez pas, puis dans le projet : `npx eas login`.
2. `npx eas init` pour relier ce projet à votre compte Expo (ajoute un `projectId` à `app.json`).
3. `npx eas build --profile preview --platform ios` (nécessite un compte Apple Developer, 99$/an) ou `--platform android` (compte Google Play Console, 25$ une fois).
4. Distribuez le build via TestFlight (iOS) ou le canal de test interne (Android).

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
  lib/                   Supabase, moteur de planning, suivi, notifications, achats
  styles/                Tailwind / NativeWind
supabase/
  migrations/            Schéma SQL versionné (à exécuter dans l'ordre)
content/                 Bibliothèque bien-être statique (méditation, respiration, journaling...)
```

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

Les étapes restantes dépendent uniquement de comptes externes que vous devez créer vous-même (voir sections ci-dessus).
