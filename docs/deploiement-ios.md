# Publier Regain sur l'App Store

Marche à suivre, dans l'ordre. Les étapes marquées **(toi)** demandent tes identifiants ou tes
coordonnées bancaires : je ne peux pas les faire à ta place, et je ne dois jamais saisir ces
informations. Tout le reste est déjà prêt dans le code.

Compte à prévoir : **99 $ par an** pour le compte Apple Developer. Le compte Expo est gratuit.

---

## 1. Compte Apple Developer **(toi)** — fait le 20 septembre 2026

1. [developer.apple.com/programs](https://developer.apple.com/programs/) → *Enroll*.
2. En tant que personne physique, aucun numéro D-U-N-S n'est demandé ; en société, il faut ce
   numéro et cela prend quelques jours.
3. Active la double authentification sur ton identifiant Apple : elle est obligatoire.

Le **contrat applications gratuites** est actif dès la validation du compte. Le contrat payant,
lui, se signe à la main (étape 3).

## 2. Statut de commerçant (DSA) **(toi)**

*Business → Contrats → « Compléter les exigences de conformité ».*

Depuis le règlement européen sur les services numériques, Apple doit publier les coordonnées de
tout vendeur qui distribue dans l'UE. **Sans ce statut, aucune app ni mise à jour ne peut être
soumise pour l'Union européenne**, et les apps déjà en ligne en sont retirées. Tu déclares
adresse, téléphone et e-mail, qui seront visibles sur la fiche App Store.

Tant que tu y es : *Modifier l'entité juridique*, exigé avant de pouvoir signer le contrat payant.

## 3. Ton encaissement **(toi)**

C'est Apple qui encaisse les abonnements et te reverse l'argent. Rien de tout cela ne passe par
l'app : tes coordonnées bancaires restent chez Apple.

1. **Accords, taxes et banque** → signer le contrat **Apps payantes**.
2. **Informations bancaires** : ajoute un compte à ton nom (IBAN). Un compte au nom d'une autre
   personne bloque les versements.
3. **Informations fiscales** : formulaire français, plus le formulaire américain W-8BEN proposé
   automatiquement.
4. **[App Store Small Business Program](https://developer.apple.com/app-store/small-business-program/)** :
   inscris-toi. La commission passe de 30 % à **15 %** tant que tu gagnes moins d'un million de
   dollars par an. C'est une simple case à cocher, et beaucoup l'oublient.
5. Les versements arrivent environ 45 jours après la fin du mois concerné.

## 4. L'app et les deux abonnements **(toi)**

D'abord l'app elle-même : [appstoreconnect.apple.com](https://appstoreconnect.apple.com) → *Apps*
→ **+**.

| Champ | Valeur |
|---|---|
| Nom | Regain |
| Langue principale | Français (France) |
| Identifiant de lot | `com.saadelidrissiazami.regain` |
| SKU | `regain-ios` |

L'identifiant de lot n'apparaît dans la liste qu'une fois enregistré : laisse `eas build` le créer
(étape 9), ou déclare-le dans *Certificates, Identifiers & Profiles → Identifiers*.

Ensuite, dans *Monétisation → Abonnements*, crée le groupe **Regain Premium**, puis :

| Produit | Identifiant | Prix | Offre |
|---|---|---|---|
| Annuel | `regain_premium_annual` | 49,99 € | essai gratuit de 3 jours |
| Mensuel | `regain_premium_monthly` | 9,99 € | aucune |

Ces identifiants doivent être **exactement** ceux-là : le code s'appuie dessus
([src/config/subscriptions.ts](../src/config/subscriptions.ts)).

Pour chaque produit : nom affiché, description, et une capture de l'écran d'abonnement de l'app
(Apple l'exige pour la revue).

## 5. RevenueCat **(toi)**

Détail complet dans [docs/abonnements.md](abonnements.md). En résumé :

1. ~~Projet « Regain », droit d'accès `premium`, les deux produits, offre `default`.~~ **Fait**,
   et le parcours complet (essai, achat, déblocage) a été vérifié sur le Test Store.
2. *Apps & providers → App Store* : ajoute `com.saadelidrissiazami.regain`, puis dépose la clé
   d'achat intégré (fichier `.p8` généré dans App Store Connect → *Utilisateurs et accès →
   Intégrations*).
3. Rattache les produits **App Store** au droit `premium` et à l'offre `default`, à côté de ceux
   du Test Store.
4. Copie la clé publique iOS (`appl_…`) : c'est `EXPO_PUBLIC_REVENUECAT_IOS_KEY`.

La clé `.p8` ne se télécharge qu'**une seule fois** : garde-la dans ton gestionnaire de mots de
passe. Perdue, il faut en générer une autre.

## 6. Les pages légales **(toi)**

Apple exige une politique de confidentialité accessible publiquement, et un lien vers tes
conditions sur l'écran d'abonnement. Les deux textes sont rédigés et t'attendent :

- [docs/legal/politique-de-confidentialite.md](legal/politique-de-confidentialite.md)
- [docs/legal/conditions-utilisation.md](legal/conditions-utilisation.md)

**C'est fait** : le site est publié par GitHub Pages depuis `main` / `docs`.

- Conditions d'utilisation : <https://saadelidrissiazami-pixel.github.io/Regain/legal/conditions-utilisation>
- Politique de confidentialité : <https://saadelidrissiazami-pixel.github.io/Regain/legal/politique-de-confidentialite>

Ces deux adresses vont dans les variables ci-dessous, et la seconde dans App Store Connect.

## 7. Les variables d'environnement

EAS ne lit pas ton fichier `.env` : les variables vivent sur le serveur, par environnement.

| Variable | Valeur | État |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | l'adresse de ton projet Supabase | ✅ `production` + `preview` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | la clé publique Supabase | ✅ `production` + `preview` |
| `EXPO_PUBLIC_TERMS_URL` | l'adresse des conditions | ✅ `production` + `preview` |
| `EXPO_PUBLIC_PRIVACY_URL` | l'adresse de la confidentialité | ✅ `production` + `preview` |
| `EXPO_PUBLIC_REVENUECAT_IOS_KEY` | la clé `appl_…` | ❌ dépend de l'étape 5 |

Les quatre premières sont publiques par construction : le préfixe `EXPO_PUBLIC_` les inscrit dans
le bundle livré, donc elles sont de toute façon lisibles dans l'app. À poser ainsi :

```bash
npx eas-cli@latest env:set --name NOM --value "valeur" --environment production --visibility plaintext
```

Ne mets **jamais** `EXPO_PUBLIC_REVENUECAT_TEST_STORE_KEY` ni `EXPO_PUBLIC_SIMULATE_FREE` en
production. Un contrôle automatique refuse la compilation dans ce cas :

```bash
npm run preflight -- production
```

## 8. Préparer la base de données **(toi)**

1. Applique les migrations manquantes dans le *SQL Editor* Supabase, dans l'ordre (voir
   [supabase/migrations](../supabase/migrations)).
2. Dans *Authentication → Providers → Email*, **réactive « Confirm email »** : il avait été
   désactivé pour les tests.
3. Déploie la fonction de suppression de compte : `npx supabase functions deploy delete-account`.
   Sans elle, le bouton « Supprimer mon compte » échoue, et Apple vérifie ce point depuis 2022.

## 9. Compiler et envoyer

Le paquet s'appelle `eas-cli` (et non `eas`) : `npx eas login` échoue avec « could not determine
executable to run ». Pour éviter de le retélécharger à chaque commande : `npm install -g eas-cli`,
puis remplace `npx eas-cli@latest` par `eas`.

```bash
npx eas-cli@latest login
npx eas-cli@latest init          # relie le projet à ton compte Expo, ajoute un identifiant dans app.json
npx eas-cli@latest build --platform ios --profile production
npx eas-cli@latest submit --platform ios --latest
```

EAS crée et garde les certificats et le profil de distribution : tu n'as rien à générer dans
Xcode. La première compilation demande ton identifiant Apple.

## 10. Tester les achats avant la sortie **(toi)**

1. App Store Connect → *Utilisateurs et accès → Testeurs Sandbox* : crée un compte de test avec
   une adresse e-mail que tu n'utilises pas déjà chez Apple.
2. Sur l'iPhone : *Réglages → App Store → Compte Sandbox*, connecte ce compte.
3. Installe la version TestFlight et souscris : l'achat est simulé, rien n'est débité, et un essai
   de 3 jours dure environ une minute en sandbox.
4. Vérifie l'essai, la restauration d'achat, et le lien « Gérer mon abonnement ».

## 11. Fiche App Store et revue

Textes, mots-clés, notes pour l'équipe de revue et réponses au questionnaire de confidentialité :
[docs/app-store.md](app-store.md).

Points qui font échouer une revue, déjà traités dans l'app :
- prix, durée et renouvellement affichés sur l'écran d'abonnement ;
- bouton « Restaurer mes achats » ;
- liens vers les conditions et la confidentialité ;
- suppression du compte depuis l'app.

Reste à fournir par toi : **un compte de démonstration** (e-mail et mot de passe d'un compte
Regain rempli d'exemples) dans les notes de revue, sinon l'app est renvoyée.

Choisis une adresse dédiée et un mot de passe, puis lance la commande en **remplaçant les deux
valeurs d'exemple** (le compte est créé s'il n'existe pas encore) :

```bash
DEMO_EMAIL=regain.demo@exemple.fr DEMO_PASSWORD='mot-de-passe' node scripts/seed-demo.mjs
```

Le script se connecte comme ce compte et lui crée des disponibilités, un planning dont deux
activités cochées, des check-ins d'énergie, quatre séances de bien-être avec ressenti et réponses,
et un profil forme. Ton mot de passe ne sort pas de ton terminal. Termine dans l'app par
*Forme → Générer mon programme*.

## 12. Après la publication

- Surveille RevenueCat : essais lancés, conversions, résiliations.
- Active le **délai de grâce** dans RevenueCat : il rattrape les échecs de paiement, qui
  représentent près d'un tiers des annulations sur Android.
- Pour une mise à jour : `npx eas-cli@latest build --platform ios --profile production` puis
  `npx eas-cli@latest submit`. Le numéro de version monte tout seul.
