// Identifiers to recreate EXACTLY in RevenueCat, App Store Connect and the Google Play
// Console (see docs/abonnements.md). A different identifier means Premium never unlocks.

/** The RevenueCat entitlement that unlocks every Premium feature. */
export const PREMIUM_ENTITLEMENT_ID = 'premium';

/** The subscription products offered, attached to RevenueCat's “default” offering. */
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
