// App Review guideline 3.1.2: every subscription screen must show the duration, the price, the
// le renouvellement automatique, et des liens fonctionnels vers les CGU et la politique de
// privacy policy. Without those links, the submission is rejected.
// To be set in .env before any App Store / Play Store submission.
export const TERMS_URL = process.env.EXPO_PUBLIC_TERMS_URL ?? '';
export const PRIVACY_URL = process.env.EXPO_PUBLIC_PRIVACY_URL ?? '';

export const hasLegalUrls = !!TERMS_URL && !!PRIVACY_URL;

export const SUBSCRIPTION_DISCLOSURE =
  'Your subscription renews automatically unless it is cancelled at least 24 hours before the end of the current period. ' +
  'Payment is charged to your App Store or Google Play account on confirmation. ' +
  'You can manage or cancel your subscription at any time from your account settings.';

/** The contact address shown in Profile → Help & support (optional). */
export const SUPPORT_EMAIL = process.env.EXPO_PUBLIC_SUPPORT_EMAIL ?? '';
