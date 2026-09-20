// Identifiants à recréer À L'IDENTIQUE dans RevenueCat, App Store Connect et Google Play
// Console (voir docs/abonnements.md). Un identifiant différent = Premium jamais débloqué.

/** Droit d'accès (« entitlement ») RevenueCat qui débloque toutes les fonctionnalités Premium. */
export const PREMIUM_ENTITLEMENT_ID = 'premium';

/** Produits d'abonnement proposés, rattachés à l'offre « default » de RevenueCat. */
export const PRODUCT_IDS = {
  monthly: 'regain_premium_monthly',
  annual: 'regain_premium_annual',
} as const;

export const ANDROID_PACKAGE = 'com.saadelidrissiazami.regain';

/** Pages de gestion des abonnements des stores, si RevenueCat ne fournit pas de lien direct. */
export const STORE_SUBSCRIPTIONS_URL = {
  ios: 'https://apps.apple.com/account/subscriptions',
  android: `https://play.google.com/store/account/subscriptions?package=${ANDROID_PACKAGE}`,
} as const;
