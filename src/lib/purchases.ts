import { Platform } from 'react-native';

// react-native-purchases est un module natif : indisponible sur web (aperçu navigateur)
// et dans Expo Go (nécessite un build de développement EAS). On protège donc chaque appel.
const isSupported = Platform.OS !== 'web';

const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;

export const isPurchasesConfigured = isSupported && !!(Platform.OS === 'ios' ? IOS_KEY : ANDROID_KEY);

let initialized = false;

async function getPurchases() {
  const module = await import('react-native-purchases');
  return module.default;
}

export async function initPurchases(userId: string) {
  if (!isPurchasesConfigured || initialized) return;
  const Purchases = await getPurchases();
  const apiKey = Platform.OS === 'ios' ? IOS_KEY! : ANDROID_KEY!;
  Purchases.configure({ apiKey, appUserID: userId });
  initialized = true;
}

export async function fetchOfferings() {
  if (!isPurchasesConfigured) return null;
  const Purchases = await getPurchases();
  const offerings = await Purchases.getOfferings();
  return offerings.current;
}

export async function purchasePackage(pkg: any) {
  const Purchases = await getPurchases();
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
}

export async function restorePurchases() {
  const Purchases = await getPurchases();
  return Purchases.restorePurchases();
}

export async function isPremium(): Promise<boolean> {
  if (!isPurchasesConfigured) return false;
  const Purchases = await getPurchases();
  const info = await Purchases.getCustomerInfo();
  return Object.keys(info.entitlements.active).length > 0;
}
