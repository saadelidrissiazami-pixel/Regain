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
  return { isPremium: query.data ?? false, isLoading: query.isLoading, isPurchasesConfigured };
}
