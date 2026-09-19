import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { haptic } from '../components/ui/motion';
import type { EnergyLevel } from '../features/planning/catalog';
import { fetchEnergyCheckins, levelFromInt, saveEnergyCheckin } from '../lib/energyCheckin';
import { useToday } from '../lib/useCurrentDate';
import { fromLocalISODate } from '../lib/week';
import { useAuthStore } from '../store/authStore';

/** Énergie déclarée aujourd'hui (dernier check-in), partagée par la carte d'accueil et le sélecteur. */
export function useEnergyToday() {
  const userId = useAuthStore((s) => s.session?.user.id);
  const today = useToday();
  const queryClient = useQueryClient();
  const key = ['energyToday', userId, today];

  const query = useQuery({
    queryKey: key,
    queryFn: async () => {
      const rows = await fetchEnergyCheckins(userId!, fromLocalISODate(today).toISOString());
      const latest = rows[0];
      return latest ? { level: levelFromInt(latest.energy_level), at: latest.checkin_at } : null;
    },
    enabled: !!userId,
  });

  const mutation = useMutation({
    mutationFn: (level: EnergyLevel) => saveEnergyCheckin(userId!, level),
    onSuccess: (_data, level) => {
      haptic.success();
      queryClient.setQueryData(key, { level, at: new Date().toISOString() });
      queryClient.invalidateQueries({ queryKey: ['energyHistory', userId] });
    },
  });

  return {
    level: (query.data?.level ?? null) as EnergyLevel | null,
    at: query.data?.at ?? null,
    isLoading: query.isLoading,
    save: (level: EnergyLevel) => mutation.mutate(level),
    saving: mutation.isPending,
    savingLevel: mutation.isPending ? mutation.variables : null,
    error: mutation.error,
  };
}
