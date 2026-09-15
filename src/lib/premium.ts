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
  // Tant que les achats ne sont pas utilisables (Expo Go, preview web, clé RevenueCat absente),
  // le Premium est débloqué en développement pour pouvoir tester les fonctionnalités payantes.
  // Dès qu'une clé est présente dans un build (Test Store compris), c'est le vrai droit qui compte ;
  // un build de production n'y donne jamais accès sans abonnement.
  if (__DEV__ && !isPurchasesConfigured) {
    return { isPremium: true, isLoading: false, isPurchasesConfigured, isDevUnlock: true };
  }
  return { isPremium: query.data ?? false, isLoading: query.isLoading, isPurchasesConfigured, isDevUnlock: false };
}
