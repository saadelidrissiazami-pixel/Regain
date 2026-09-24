import { Platform } from 'react-native';
import type { CustomerInfo, CustomerInfoUpdateListener, PurchasesPackage } from 'react-native-purchases';

import { PREMIUM_ENTITLEMENT_ID, STORE_SUBSCRIPTIONS_URL } from '../config/subscriptions';
import { scheduleTrialReminder } from './notifications';
import { isExpoGo, isWeb } from './runtime';

const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
// A RevenueCat “Test Store” key: simulated purchases, with no App Store / Play Console account.
// An app submitted for review with this key is rejected, so it is only read in development.
const TEST_STORE_KEY = process.env.EXPO_PUBLIC_REVENUECAT_TEST_STORE_KEY;

const API_KEY = __DEV__ && TEST_STORE_KEY ? TEST_STORE_KEY : Platform.OS === 'ios' ? IOS_KEY : ANDROID_KEY;

export const purchasesUnavailableReason: string | null = isWeb
  ? 'Subscriptions are taken out from the mobile app.'
  : isExpoGo
    ? 'In-app purchases do not work in Expo Go: test them in a development build (see docs/abonnements.md).'
    : !API_KEY
      ? __DEV__
        ? 'Subscriptions are not configured yet: the RevenueCat key is missing (see docs/abonnements.md).'
        : 'Subscriptions are unavailable at the moment. Try again in a few moments.'
      : null;

export const isPurchasesConfigured = purchasesUnavailableReason === null;
export const isUsingTestStore = isPurchasesConfigured && __DEV__ && !!TEST_STORE_KEY;

// The RevenueCat identity currently in use. Without tracking it, a second account signed in on
// the same device would inherit the previous account's appUserID — and so its Premium access.
let configuredUserId: string | null = null;

async function getPurchases() {
  const module = await import('react-native-purchases');
  return module.default;
}

export function hasPremium(info: CustomerInfo): boolean {
  return info.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== undefined;
}

/** When the current free trial ends; null outside a trial. */
export function trialEndsAt(info: CustomerInfo): Date | null {
  const premium = info.entitlements.active[PREMIUM_ENTITLEMENT_ID];
  if (!premium || premium.periodType?.toUpperCase() !== 'TRIAL' || !premium.expirationDate) return null;
  return new Date(premium.expirationDate);
}

/** Schedules the “your trial is ending” reminder when the user is inside a trial. */
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

/** Fires on every subscription change (purchase, renewal, expiry, refund). */
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

/** “not-activated”: the payment went through but the “premium” entitlement is missing — either
 *  the product is not attached to the entitlement in RevenueCat, or the purchase is pending
 *  (parental approval, deferred payment). */
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

/** True when an active Premium subscription was found for this store account. */
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

/** Where to manage or cancel the subscription (the purchasing store's own link when RevenueCat knows it). */
export async function getManagementUrl(): Promise<string> {
  const fallback = Platform.OS === 'android' ? STORE_SUBSCRIPTIONS_URL.android : STORE_SUBSCRIPTIONS_URL.ios;
  if (!isPurchasesConfigured) return fallback;
  const Purchases = await getPurchases();
  const info = await Purchases.getCustomerInfo().catch(() => null);
  return info?.managementURL ?? fallback;
}
