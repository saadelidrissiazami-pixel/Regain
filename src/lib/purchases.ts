import { Platform } from 'react-native';

// react-native-purchases est un module natif : indisponible sur web (aperçu navigateur)
// et dans Expo Go (nécessite un build de développement EAS). On protège donc chaque appel.
const isSupported = Platform.OS !== 'web';

const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;

export const isPurchasesConfigured = isSupported && !!(Platform.OS === 'ios' ? IOS_KEY : ANDROID_KEY);

// Utilisateur actuellement identifié auprès de RevenueCat. `configure` ne doit être
// appelé qu'une fois par lancement ; les changements de compte passent par `logIn`,
// sans quoi le second utilisateur d'un même appareil hériterait des droits du premier.
let configured = false;
let currentUserId: string | null = null;

async function getPurchases() {
  const module = await import('react-native-purchases');
  return module.default;
}

export async function initPurchases(userId: string) {
  if (!isPurchasesConfigured || currentUserId === userId) return;
  const Purchases = await getPurchases();

  if (!configured) {
    const apiKey = Platform.OS === 'ios' ? IOS_KEY! : ANDROID_KEY!;
    Purchases.configure({ apiKey, appUserID: userId });
    configured = true;
  } else {
    await Purchases.logIn(userId);
  }
  currentUserId = userId;
}

// À appeler à la déconnexion : RevenueCat bascule sur un utilisateur anonyme, ce qui
// évite qu'un abonnement reste attribué au compte suivant sur le même appareil.
export async function logOutPurchases() {
  if (!isPurchasesConfigured || !configured) {
    currentUserId = null;
    return;
  }
  const Purchases = await getPurchases();
  await Purchases.logOut();
  currentUserId = null;
}

export async function fetchOfferings() {
  if (!isPurchasesConfigured) return null;
  const Purchases = await getPurchases();
  const offerings = await Purchases.getOfferings();
  return offerings.current;
}

export async function purchasePackage(pkg: any) {
  if (!isPurchasesConfigured) throw new Error('Les abonnements ne sont pas configurés sur cet appareil.');
  const Purchases = await getPurchases();
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
}

export async function restorePurchases() {
  if (!isPurchasesConfigured) throw new Error('Les abonnements ne sont pas configurés sur cet appareil.');
  const Purchases = await getPurchases();
  return Purchases.restorePurchases();
}

export async function isPremium(): Promise<boolean> {
  if (!isPurchasesConfigured) return false;
  const Purchases = await getPurchases();
  const info = await Purchases.getCustomerInfo();
  return Object.keys(info.entitlements.active).length > 0;
}
