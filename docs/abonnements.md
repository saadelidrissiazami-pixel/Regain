# Abonnements Premium — mise en route

Le code est prêt : paywall ([app/paywall/index.tsx](../app/paywall/index.tsx)), logique d'achat
([src/lib/purchases.ts](../src/lib/purchases.ts)) et identifiants
([src/config/subscriptions.ts](../src/config/subscriptions.ts)). Il reste à créer les comptes et
les produits, ce que vous seul pouvez faire. Les identifiants ci-dessous doivent être recopiés
**à l'identique** partout.

| Élément | Identifiant |
|---|---|
| Entitlement RevenueCat | `premium` |
| Offre RevenueCat | `default` (marquée *Current*) |
| Abonnement mensuel | `regain_premium_monthly` |
| Abonnement annuel | `regain_premium_annual` |
| Bundle iOS / package Android | `com.saadelidrissiazami.regain` |

> Les achats intégrés ne fonctionnent **ni dans Expo Go ni sur le web** : il faut un build de
> développement. Dans Expo Go, l'écran Premium l'explique et Premium reste débloqué pour tester.

## Étape 1 — Tester tout de suite, sans Apple ni Google (gratuit)

RevenueCat fournit un **Test Store** : de faux achats, mais un vrai parcours complet.

1. ~~Créez un compte sur [revenuecat.com](https://www.revenuecat.com) et un projet « Regain ».~~ **Fait**
2. ~~*Product catalog → Entitlements* : `premium`.~~ **Fait**
3. ~~*Product catalog → Products* (Test Store) : `regain_premium_monthly` (9,99) et
   `regain_premium_annual` (49,99, essai 1 semaine), rattachés à `premium`.~~ **Fait**
4. ~~*Product catalog → Offerings* : `default`, packages `$rc_monthly` et `$rc_annual`.~~ **Fait**
5. *Apps* : copiez la clé Test Store dans `.env` :
   `EXPO_PUBLIC_REVENUECAT_TEST_STORE_KEY=...`

> Le projet créé par RevenueCat contient un catalogue de démonstration (`regain_pro`,
> `monthly`/`yearly`/`lifetime`) qu'il ne faut pas confondre avec le nôtre. Seul l'entitlement
> `premium` débloque l'app ; les prix du Test Store sont en dollars, ceux de l'App Store seront
> en euros.
6. Lancez un build de développement :
   - simulateur iOS (Xcode requis, sans compte Apple payant) : `npx expo run:ios` ;
   - ou émulateur / téléphone Android : `npx expo run:android` ;
   - ou via EAS : `npx eas-cli@latest build --profile development --platform ios|android`.

Sur le paywall, un bandeau « Mode test » s'affiche et l'achat ouvre une fenêtre de simulation
(succès, échec, annulation). La clé Test Store n'est lue qu'en développement : **ne la mettez
jamais dans l'environnement de production** (Apple rejette les apps configurées avec).

## Étape 2 — Vrais abonnements iOS (Apple Developer, 99 $/an)

1. App Store Connect → *Accords, taxes et banque* : signez l'accord **Apps payantes** et
   renseignez banque et fiscalité (sans cela, aucun produit ne se charge).
2. Créez l'app `com.saadelidrissiazami.regain`, puis *Abonnements* → groupe « Regain Premium »
   avec les deux produits ci-dessus (prix, durée, et éventuellement un essai gratuit : le
   paywall l'affiche automatiquement).
3. *Utilisateurs et accès → Intégrations → Achats intégrés* : générez une clé (.p8) et
   importez-la dans RevenueCat (*Apps & providers → App Store*).
4. Rattachez les produits App Store à l'entitlement `premium` et à l'offre `default`.
5. Copiez la clé publique iOS (`appl_…`) : `EXPO_PUBLIC_REVENUECAT_IOS_KEY`.

## Étape 3 — Vrais abonnements Android (Google Play Console, 25 $ une fois)

1. Créez l'app `com.saadelidrissiazami.regain` et publiez un premier build sur un canal de
   test interne (Google n'affiche les abonnements qu'après un premier envoi).
2. *Monétiser → Abonnements* : créez les deux produits avec un forfait de base chacun.
3. Créez un compte de service Google Cloud avec accès à la Play Console et importez son JSON
   dans RevenueCat (*Apps & providers → Play Store*).
4. Rattachez les produits à `premium` / `default`, puis copiez la clé publique (`goog_…`) :
   `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`.

## Étape 4 — Variables d'environnement des builds EAS

EAS Build **ne lit pas** votre fichier `.env` (il n'est pas envoyé). Déclarez les variables
sur [expo.dev](https://expo.dev) → projet → *Environment variables*, pour chaque environnement
(`development`, `preview`, `production` — déjà reliés aux profils de [eas.json](../eas.json)) :

- `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` (sinon l'app ne démarre pas) ;
- `EXPO_PUBLIC_REVENUECAT_IOS_KEY`, `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` ;
- `EXPO_PUBLIC_TERMS_URL`, `EXPO_PUBLIC_PRIVACY_URL` ;
- `EXPO_PUBLIC_REVENUECAT_TEST_STORE_KEY` : **uniquement** en `development`.

## Avant la soumission — ce qu'Apple et Google vérifient

- [x] Prix, durée, renouvellement automatique et essai affichés sur le paywall
- [x] Bouton « Restaurer mes achats »
- [x] Lien « Gérer mon abonnement » (Profil)
- [ ] Liens CGU et confidentialité renseignés (`EXPO_PUBLIC_TERMS_URL`, `EXPO_PUBLIC_PRIVACY_URL`)
- [ ] Achat testé en sandbox (compte testeur App Store Connect / testeur de licence Google Play)
- [ ] Un compte de démonstration fourni aux reviewers dans App Store Connect

## Plus tard — vérification côté serveur

Aujourd'hui Premium est vérifié dans l'app (RevenueCat). Pour protéger aussi les données côté
Supabase, l'étape suivante est un webhook RevenueCat vers une Edge Function qui tient à jour
une table `subscriptions`, lue par les politiques RLS des tables Premium.
