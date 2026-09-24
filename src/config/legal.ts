// App Review guideline 3.1.2 : tout écran d'abonnement doit afficher la durée, le prix,
// le renouvellement automatique, et des liens fonctionnels vers les CGU et la politique de
// confidentialité. Sans ces liens, la soumission est rejetée.
// À renseigner dans .env avant toute soumission App Store / Play Store.
export const TERMS_URL = process.env.EXPO_PUBLIC_TERMS_URL ?? '';
export const PRIVACY_URL = process.env.EXPO_PUBLIC_PRIVACY_URL ?? '';

export const hasLegalUrls = !!TERMS_URL && !!PRIVACY_URL;

export const SUBSCRIPTION_DISCLOSURE =
  'Your subscription renews automatically unless it is cancelled at least 24 hours before the end of the current period. ' +
  'Payment is charged to your App Store or Google Play account on confirmation. ' +
  'You can manage or cancel your subscription at any time from your account settings.';

/** Adresse de contact affichée dans Profil → Aide & support (facultative). */
export const SUPPORT_EMAIL = process.env.EXPO_PUBLIC_SUPPORT_EMAIL ?? '';
