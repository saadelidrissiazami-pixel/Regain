// App Review guideline 3.1.2 : tout écran d'abonnement doit afficher la durée, le prix,
// le renouvellement automatique, et des liens fonctionnels vers les CGU et la politique de
// confidentialité. Sans ces liens, la soumission est rejetée.
// À renseigner dans .env avant toute soumission App Store / Play Store.
export const TERMS_URL = process.env.EXPO_PUBLIC_TERMS_URL ?? '';
export const PRIVACY_URL = process.env.EXPO_PUBLIC_PRIVACY_URL ?? '';

export const hasLegalUrls = !!TERMS_URL && !!PRIVACY_URL;

export const SUBSCRIPTION_DISCLOSURE =
  "L'abonnement est renouvelé automatiquement sauf résiliation au moins 24 h avant la fin de la période en cours. " +
  'Le paiement est débité sur votre compte App Store ou Google Play à la confirmation. ' +
  'Vous pouvez gérer ou résilier votre abonnement à tout moment depuis les réglages de votre compte.';

/** Adresse de contact affichée dans Profil → Aide & support (facultative). */
export const SUPPORT_EMAIL = process.env.EXPO_PUBLIC_SUPPORT_EMAIL ?? '';
