# Fiche App Store de Regain

Textes prêts à coller dans App Store Connect. Les limites de caractères d'Apple sont respectées.

## Identité

| Champ | Valeur | Limite |
|---|---|---|
| Nom | `Regain` | 30 |
| Sous-titre | `Routine, bien-être et forme` | 30 |
| Catégorie principale | Santé et forme | — |
| Catégorie secondaire | Style de vie | — |
| Classification | 4+ | — |

## Texte promotionnel (modifiable sans nouvelle version, 170 caractères)

```
Un planning réaliste, des séances guidées et un coach forme. Regain part de votre énergie du
moment, pas d'un idéal.
```

## Description

```
Regain vous aide à reconstruire une routine qui tient, sans culpabilité.

VOTRE SEMAINE, À VOTRE RYTHME
Dites à Regain quand vous êtes libre et comment vous vous sentez. Il place des activités dans vos
disponibilités, à la bonne heure, selon votre énergie du moment. Une activité à la fois, jamais une
liste écrasante.

DES SÉANCES DE BIEN-ÊTRE GUIDÉES
Respiration, méditation, journaling, confiance en soi, sommeil, et des séances discrètes à faire
en public. De une à neuf minutes. Guidage vocal en option, musiques d'ambiance composées pour
l'app, et un décompte de dix secondes pour vous installer.

UN JOURNAL QUI VOUS REGARDE AVANCER
À la fin de chaque séance, notez comment vous vous sentez et répondez à deux questions adaptées à
la séance. Tout se relit dans votre journal, et votre suivi montre l'évolution de vos ressentis.

VOTRE COACH FORME (PREMIUM)
Un programme de musculation à votre niveau et avec votre matériel, des menus calés sur vos besoins
caloriques, une liste de courses prête, et un bilan hebdomadaire qui allège ou renforce la semaine
suivante. Vos allergies et vos gênes articulaires sont respectées.

GRATUIT, VRAIMENT
Le planning, le suivi, le journal et dix-huit séances de bien-être restent gratuits, sans limite
de durée.

REGAIN PREMIUM
49,99 €/an avec 7 jours d'essai gratuit, ou 9,99 €/mois. L'abonnement se renouvelle
automatiquement sauf résiliation au moins 24 h avant la fin de la période. Résiliable à tout
moment depuis les réglages de votre compte App Store.

Regain ne pose pas de diagnostic et ne remplace pas l'avis d'un professionnel de santé.
```

## Mots-clés (100 caractères, séparés par des virgules, sans espace)

```
routine,habitudes,bien-être,méditation,respiration,sommeil,musculation,planning,énergie,journal
```

## Adresses

| Champ | Valeur |
|---|---|
| URL d'assistance | l'adresse de ta page de contact ou un lien `mailto:` |
| URL marketing | facultative |
| Politique de confidentialité | l'adresse publiée (voir `docs/legal/`) |

## Captures d'écran

Obligatoire : iPhone 6,9 pouces (1320 × 2868). Les autres tailles sont déduites par Apple.
À prendre sur un compte de démonstration, jamais sur ton compte personnel :

```bash
xcrun simctl boot "iPhone 18 Pro Max"
xcrun simctl io booted screenshot ~/Desktop/regain-1.png
```

Ordre conseillé : Planning (carte « À suivre »), séance de bien-être en cours, journal et
ressentis, coach forme (programme), écran d'abonnement.

## Notes pour l'équipe de revue

```
Compte de démonstration :
  e-mail : [adresse d'un compte rempli d'exemples]
  mot de passe : [mot de passe]

Ce compte contient déjà des disponibilités, un planning, des séances terminées et un programme
forme, pour que tout soit visible immédiatement.

Abonnement : l'onglet « Forme » et les séances marquées d'un cadenas ouvrent l'écran d'abonnement
(essai gratuit de 7 jours, puis 49,99 €/an, ou 9,99 €/mois). Le bouton « Restaurer mes achats »
est sur ce même écran, et « Gérer mon abonnement » dans l'onglet Profil.

Suppression du compte : onglet Profil → « Supprimer mon compte ». L'effacement est immédiat.

Localisation : demandée uniquement si l'utilisateur ouvre une activité de marche, pour tracer un
itinéraire. Elle n'est pas enregistrée.
```

## Questionnaire « Confidentialité de l'app »

| Donnée | Collectée | Liée à l'identité | Suivi publicitaire | Usage |
|---|---|---|---|---|
| Adresse e-mail | oui | oui | non | Fonctionnement de l'app |
| Santé et forme (poids, taille, objectifs, allergies, remarques de santé) | oui | oui | non | Fonctionnement de l'app |
| Contenus créés (notes, ressentis, réponses) | oui | oui | non | Fonctionnement de l'app |
| Identifiant utilisateur | oui | oui | non | Fonctionnement de l'app |
| Achats | oui | oui | non | Fonctionnement de l'app |
| Position précise | oui | non | non | Fonctionnement de l'app |
| Données d'usage, contacts, photos, historique de navigation | non | — | — | — |

Réponses aux autres questions : aucune publicité, aucune analyse tierce, aucun suivi entre apps
(donc pas de demande de suivi App Tracking Transparency).

## Conformité à l'export

Déjà déclaré dans `app.json` (`usesNonExemptEncryption: false`) : l'app n'utilise que le
chiffrement standard d'iOS et HTTPS. Apple ne posera plus la question à chaque envoi.
