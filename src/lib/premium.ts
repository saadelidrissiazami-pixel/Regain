import { useQuery } from '@tanstack/react-query';

import { isPremium, isPurchasesConfigured } from './purchases';
import { useAuthStore } from '../store/authStore';

export function usePremium() {
  const session = useAuthStore((s) => s.session);
  const query = useQuery({
    queryKey: ['premium', session?.user.id],
    queryFn: isPremium,
    enabled: !!session?.user.id && isPurchasesConfigured,
    staleTime: 60_000,
  });
  // While purchases are unusable (Expo Go, the web preview, a missing RevenueCat key), Premium is
  // unlocked in development so the paid features can be tested.
  // As soon as a key is present in a build (the Test Store included), the real entitlement is what
  // counts; a production build never grants access without a subscription.
  // EXPO_PUBLIC_SIMULATE_FREE=1: see the app as a free user does (padlocks, paywall).
  if (__DEV__ && process.env.EXPO_PUBLIC_SIMULATE_FREE === '1') {
    return { isPremium: false, isLoading: false, isPurchasesConfigured, isDevUnlock: false };
  }
  if (__DEV__ && !isPurchasesConfigured) {
    return { isPremium: true, isLoading: false, isPurchasesConfigured, isDevUnlock: true };
  }
  return { isPremium: query.data ?? false, isLoading: query.isLoading, isPurchasesConfigured, isDevUnlock: false };
}
