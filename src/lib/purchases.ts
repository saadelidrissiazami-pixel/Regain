import { Platform } from 'react-native';
import type { CustomerInfo, CustomerInfoUpdateListener, PurchasesPackage } from 'react-native-purchases';

import { PREMIUM_ENTITLEMENT_ID, STORE_SUBSCRIPTIONS_URL } from '../config/subscriptions';
import { scheduleTrialReminder } from './notifications';
import { isExpoGo, isWeb } from './runtime';

const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
// Clé « Test Store » RevenueCat : achats simulés, sans compte App Store / Play Console.
// Une app envoyée en revue avec cette clé est rejetée : elle n'est lue qu'en développement.
const TEST_STORE_KEY = process.env.EXPO_PUBLIC_REVENUECAT_TEST_STORE_KEY;

const API_KEY = __DEV__ && TEST_STORE_KEY ? TEST_STORE_KEY : Platform.OS === 'ios' ? IOS_KEY : ANDROID_KEY;

export const purchasesUnavailableReason: string | null = isWeb
  ? "Les abonnements se souscrivent depuis l'app mobile."
  : isExpoGo
    ? "Les achats intégrés ne fonctionnent pas dans Expo Go : testez-les dans un build de développement (voir docs/abonnements.md)."
    : !API_KEY
      ? __DEV__
        ? 'Les abonnements ne sont pas encore configurés : clé RevenueCat manquante (voir docs/abonnements.md).'
        : 'Les abonnements ne sont pas disponibles pour le moment. Réessaie dans quelques instants.'
      : null;

export const isPurchasesConfigured = purchasesUnavailableReason === null;
export const isUsingTestStore = isPurchasesConfigured && __DEV__ && !!TEST_STORE_KEY;

// Identifiant RevenueCat actuellement actif. Sans ce suivi, un second compte connecté sur le
// même appareil hériterait de l'appUserID — et donc des droits Premium — du compte précédent.
let configuredUserId: string | null = null;

async function getPurchases() {
  const module = await import('react-native-purchases');
  return module.default;
}

export function hasPremium(info: CustomerInfo): boolean {
  return info.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== undefined;
}

/** Fin de l'essai gratuit en cours ; null hors période d'essai. */
export function trialEndsAt(info: CustomerInfo): Date | null {
  const premium = info.entitlements.active[PREMIUM_ENTITLEMENT_ID];
  if (!premium || premium.periodType?.toUpperCase() !== 'TRIAL' || !premium.expirationDate) return null;
  return new Date(premium.expirationDate);
}

/** Programme le rappel « votre essai se termine » si l'utilisateur est en période d'essai. */
function remindIfTrial(info: CustomerInfo) {
  const end = trialEndsAt(info);
  if (end) scheduleTrialReminder(end).catch(() => {});
}

export async function initPurchases(userId: string) {
  if (!isPurchasesConfigured || configuredUserId === userId) return;
  const Purchases = await getPurchases();

  if (configuredUserId === null) {
    Purchases.configure({ apiKey: API_KEY!, appUserID: userId });
  } else {
    await Purchases.logIn(userId);
  }
  configuredUserId = userId;
}

export async function logOutPurchases() {
  if (!isPurchasesConfigured || configuredUserId === null) return;
  const Purchases = await getPurchases();
  await Purchases.logOut();
  configuredUserId = null;
}

/** Prévient à chaque changement d'abonnement (achat, renouvellement, expiration, remboursement). */
export function onPremiumChange(listener: (premium: boolean) => void): () => void {
  if (!isPurchasesConfigured) return () => {};
  let active = true;
  const registered: CustomerInfoUpdateListener = (info) => {
    remindIfTrial(info);
    listener(hasPremium(info));
  };
  getPurchases()
    .then((Purchases) => {
      if (active) Purchases.addCustomerInfoUpdateListener(registered);
    })
    .catch(() => {});
  return () => {
    active = false;
    getPurchases()
      .then((Purchases) => Purchases.removeCustomerInfoUpdateListener(registered))
      .catch(() => {});
  };
}

export async function fetchOfferings() {
  if (!isPurchasesConfigured) return null;
  const Purchases = await getPurchases();
  const offerings = await Purchases.getOfferings();
  return offerings.current;
}

/** « not-activated » : paiement accepté mais droit « premium » absent — produit non rattaché
 *  à l'entitlement dans RevenueCat, ou achat en attente (validation parentale, paiement différé). */
export type PurchaseOutcome = 'premium' | 'cancelled' | 'not-activated';

export async function purchasePackage(pkg: PurchasesPackage): Promise<PurchaseOutcome> {
  const Purchases = await getPurchases();
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    remindIfTrial(customerInfo);
    return hasPremium(customerInfo) ? 'premium' : 'not-activated';
  } catch (error) {
    const { code, userCancelled } = error as { code?: string; userCancelled?: boolean | null };
    if (userCancelled || code === Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) return 'cancelled';
    throw error;
  }
}

/** Renvoie true si un abonnement Premium actif a été retrouvé pour ce compte store. */
export async function restorePurchases(): Promise<boolean> {
  const Purchases = await getPurchases();
  return hasPremium(await Purchases.restorePurchases());
}

export async function fetchTrialEndsAt(): Promise<Date | null> {
  if (!isPurchasesConfigured) return null;
  const Purchases = await getPurchases();
  return trialEndsAt(await Purchases.getCustomerInfo());
}

export async function isPremium(): Promise<boolean> {
  if (!isPurchasesConfigured) return false;
  const Purchases = await getPurchases();
  return hasPremium(await Purchases.getCustomerInfo());
}

/** Lien de gestion / résiliation de l'abonnement (celui du store d'achat si RevenueCat le connaît). */
export async function getManagementUrl(): Promise<string> {
  const fallback = Platform.OS === 'android' ? STORE_SUBSCRIPTIONS_URL.android : STORE_SUBSCRIPTIONS_URL.ios;
  if (!isPurchasesConfigured) return fallback;
  const Purchases = await getPurchases();
  const info = await Purchases.getCustomerInfo().catch(() => null);
  return info?.managementURL ?? fallback;
}
