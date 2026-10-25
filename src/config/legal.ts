import { lang, t } from '../lib/i18n';

/**
 * The French page for each English one, under the same address.
 *
 * One environment variable per document holds the English URL, and the app is read in French on
 * a French phone — so a French reader was being sent to an English privacy policy on the very
 * screen where Apple requires the terms to be legible. The four pages exist, published side by
 * side; only the last segment of the address differs.
 */
const FRENCH_PAGE: Record<string, string> = {
  'privacy-policy': 'politique-de-confidentialite',
  'terms-of-use': 'conditions-utilisation',
};

/**
 * An unknown address is returned untouched, on purpose. If these pages are ever moved or renamed,
 * a French reader sees the English text — which is what happens today — rather than a 404 on the
 * document that explains what the app does with their health data.
 */
function inReadersLanguage(url: string): string {
  if (lang !== 'fr' || !url) return url;
  return url.replace(/([^/]+)(\/?)$/, (whole, slug, slash) =>
    FRENCH_PAGE[slug] ? FRENCH_PAGE[slug] + slash : whole
  );
}

// App Review guideline 3.1.2: every subscription screen must show the duration, the price, the
// automatic renewal, and working links to the terms of use and the
// privacy policy. Without those links, the submission is rejected.
// To be set in .env before any App Store / Play Store submission.
export const TERMS_URL = inReadersLanguage(process.env.EXPO_PUBLIC_TERMS_URL ?? '');
export const PRIVACY_URL = inReadersLanguage(process.env.EXPO_PUBLIC_PRIVACY_URL ?? '');

export const hasLegalUrls = !!TERMS_URL && !!PRIVACY_URL;

export const SUBSCRIPTION_DISCLOSURE = t(
  'Your subscription renews automatically unless it is cancelled at least 24 hours before the end of the current period. Payment is charged to your App Store or Google Play account on confirmation. You can manage or cancel your subscription at any time from your account settings.'
);

/** The contact address shown in Profile → Help & support (optional). */
export const SUPPORT_EMAIL = process.env.EXPO_PUBLIC_SUPPORT_EMAIL ?? '';
