import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, router } from 'expo-router';
import { Pressable, ScrollView, Switch, Text, View } from 'react-native';

import {
  areRemindersEnabled,
  cancelActivityReminders,
  disableDailyReminder,
  enableDailyReminder,
  scheduleActivityReminders,
} from '../../src/lib/notifications';
import { usePremium } from '../../src/lib/premium';
import { fetchWeekPlan } from '../../src/lib/planning';
import { logOutPurchases } from '../../src/lib/purchases';
import { supabase } from '../../src/lib/supabase';
import { getWeekStart } from '../../src/lib/week';
import { useAuthStore } from '../../src/store/authStore';

export default function ProfileScreen() {
  const session = useAuthStore((s) => s.session);
  const email = session?.user.email ?? '';
  const initial = email.charAt(0).toUpperCase() || '?';
  const { isPremium } = usePremium();
  const queryClient = useQueryClient();

  const remindersQuery = useQuery({ queryKey: ['remindersEnabled'], queryFn: areRemindersEnabled });

  const toggleReminders = useMutation({
    mutationFn: async (next: boolean) => {
      if (next) {
        const granted = await enableDailyReminder();
        if (!granted) throw new Error("Autorisez les notifications pour Regain dans les réglages de l'appareil.");
        if (session?.user.id) {
          const plan = await fetchWeekPlan(session.user.id, getWeekStart());
          await scheduleActivityReminders(plan);
        }
      } else {
        await disableDailyReminder();
      }
      return next;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['remindersEnabled'] }),
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // Rien du compte précédent ne doit survivre à la déconnexion sur un appareil
    // partagé : cache des requêtes, identité RevenueCat, rappels d'activités.
    queryClient.clear();
    await Promise.all([logOutPurchases().catch(() => {}), cancelActivityReminders().catch(() => {})]);
    router.replace('/');
  };

  return (
    <ScrollView className="flex-1 bg-paper px-5 pt-16" contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="mb-7 items-center">
        <View className="mb-3 h-20 w-20 items-center justify-center rounded-full bg-primary shadow-sm">
          <Text className="font-display text-3xl text-white">
            {initial}
          </Text>
        </View>
        <Text className="font-display text-lg text-ink">
          {email}
        </Text>
      </View>

      <View className="mb-3 rounded-2xl border border-line bg-surface p-4 shadow-sm">
        <Text className="font-label text-[11px] uppercase tracking-wide text-primary">
          Abonnement
        </Text>
        <Text className="font-label mt-1 text-base text-ink">
          {isPremium ? 'Premium ✨' : 'Gratuit'}
        </Text>
        {isPremium ? (
          <Text className="font-body mt-0.5 text-xs text-ink-soft">Gérez votre abonnement depuis les réglages de l'App Store / Google Play.</Text>
        ) : (
          <>
            <Text className="font-body mt-0.5 text-xs text-ink-soft">Passez à Premium pour la personnalisation avancée.</Text>
            <Link href="/paywall" asChild>
              <Pressable className="mt-3 items-center rounded-full bg-primary px-4 py-2.5">
                <Text className="font-display text-sm text-white">
                  Découvrir Premium
                </Text>
              </Pressable>
            </Link>
          </>
        )}
      </View>

      <View className="mb-3 rounded-2xl border border-line bg-surface p-4 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            <Text className="font-label text-[11px] uppercase tracking-wide text-primary">
              Rappels
            </Text>
            <Text className="font-body mt-0.5 text-sm text-ink-soft">
              Un signe à 8h pour préférer une respiration aux réseaux, et un petit rappel à l'heure de chaque activité planifiée.
            </Text>
          </View>
          <Switch
            value={!!remindersQuery.data}
            onValueChange={(v) => toggleReminders.mutate(v)}
            disabled={remindersQuery.isLoading || toggleReminders.isPending}
            trackColor={{ false: '#EEE4D6', true: '#FF6B57' }}
            thumbColor="#FFFFFF"
          />
        </View>
        {toggleReminders.isError ? (
          <Text className="font-body mt-2 text-xs text-red-700">{(toggleReminders.error as Error).message}</Text>
        ) : null}
      </View>

      <View className="mb-3 rounded-2xl border border-line bg-surface p-4 shadow-sm">
        <Text className="font-label text-[11px] uppercase tracking-wide text-primary">
          Confidentialité
        </Text>
        <Text className="font-body mt-1 text-sm text-ink-soft">
          Exporter mes données · Supprimer mon compte · Gérer mes consentements
        </Text>
      </View>

      <Pressable
        onPress={handleSignOut}
        className="mt-2 items-center rounded-full border border-line bg-surface px-4 py-3.5"
      >
        <Text className="font-label text-ink">
          Se déconnecter
        </Text>
      </Pressable>
    </ScrollView>
  );
}
