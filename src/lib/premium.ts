import { useQuery } from '@tanstack/react-query';

import { isPremium, isPurchasesConfigured } from './purchases';
import { useAuthStore } from '../store/authStore';

export function usePremium() {
  const session = useAuthStore((s) => s.session);
  const query = useQuery({
    queryKey: ['premium', session?.user.id],
    queryFn: isPremium,
    enabled: !!session?.user.id,
    staleTime: 60_000,
  });
  // Le paiement n'est pas encore configuré : en développement (Expo Go, preview web) le Premium
  // est débloqué pour pouvoir tester les fonctionnalités payantes. Un build de production n'y
  // donne accès qu'avec un vrai abonnement.
  if (__DEV__) return { isPremium: true, isLoading: false, isPurchasesConfigured };
  return { isPremium: query.data ?? false, isLoading: query.isLoading, isPurchasesConfigured };
}
