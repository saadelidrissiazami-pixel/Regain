import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, Switch, View } from 'react-native';
import { Text } from '../../src/components/typography';
import { fetchAvailabilitySlots } from '../../src/lib/availability';
import {
  calendarUnavailableReason,
  disableCalendarAutoSync,
  enableCalendarAutoSync,
  isCalendarAutoSyncEnabled,
} from '../../src/lib/deviceCalendar';
import { deleteAccount, exportUserData } from '../../src/lib/gdpr';
import { areRemindersEnabled, disableDailyReminder, enableDailyReminder, scheduleActivityReminders } from '../../src/lib/notifications';
import { usePremium } from '../../src/lib/premium';
import { getManagementUrl, logOutPurchases } from '../../src/lib/purchases';
import { fetchWeekPlan } from '../../src/lib/planning';
import { supabase } from '../../src/lib/supabase';
import { getWeekStart } from '../../src/lib/week';
import { useAuthStore } from '../../src/store/authStore';

async function fetchCurrentWeek(userId: string) {
  const weekStart = getWeekStart();
  const [plan, availability] = await Promise.all([fetchWeekPlan(userId, weekStart), fetchAvailabilitySlots(userId)]);
  return { weekStart, plan, availability };
}

export default function ProfileScreen() {
  const session = useAuthStore((s) => s.session);
  const email = session?.user.email ?? '';
  const initial = email.charAt(0).toUpperCase() || '?';
  const { isPremium, isDevUnlock } = usePremium();
  const queryClient = useQueryClient();

  const remindersQuery = useQuery({ queryKey: ['remindersEnabled'], queryFn: areRemindersEnabled });

  const toggleReminders = useMutation({
    mutationFn: async (next: boolean) => {
      if (next) {
        const granted = await enableDailyReminder();
        if (!granted) throw new Error("Autorisez les notifications pour Regain dans les réglages de l'appareil.");
        if (session?.user.id) {
          const { plan, availability } = await fetchCurrentWeek(session.user.id);
          await scheduleActivityReminders(plan, availability);
        }
      } else {
        await disableDailyReminder();
      }
      return next;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['remindersEnabled'] }),
  });

  const calendarQuery = useQuery({ queryKey: ['calendarAutoSync'], queryFn: isCalendarAutoSyncEnabled });

  const toggleCalendar = useMutation({
    mutationFn: async (next: boolean): Promise<number | null> => {
      if (!next) {
        await disableCalendarAutoSync();
        return null;
      }
      const { weekStart, plan, availability } = await fetchCurrentWeek(session!.user.id);
      return enableCalendarAutoSync(plan, availability, weekStart);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['calendarAutoSync'] }),
  });

  const manageSubscription = useMutation({
    mutationFn: async () => Linking.openURL(await getManagementUrl()),
  });

  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const exportMutation = useMutation({
    mutationFn: () => exportUserData(session!.user.id),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      queryClient.clear();
      router.replace('/');
    },
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // Sans ce nettoyage, les données du compte précédent (catalogue, planning, droits
    // Premium RevenueCat) restent visibles pour le compte suivant sur le même appareil.
    await logOutPurchases().catch(() => {});
    queryClient.clear();
    router.replace('/');
  };

  return (
    <ScrollView className="flex-1 bg-paper px-5 pt-16" contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="mb-7 items-center">
        <View className="mb-3 h-20 w-20 items-center justify-center rounded-full bg-primary shadow-sm">
          <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-3xl text-white">
            {initial}
          </Text>
        </View>
        <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-lg text-ink">
          {email}
        </Text>
      </View>

      <View className="mb-3 rounded-2xl border border-line bg-surface p-4 shadow-sm">
        <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-[11px] uppercase tracking-wide text-primary">
          Abonnement
        </Text>
        <Text style={{ fontFamily: 'Nunito_700Bold' }} className="mt-1 text-base text-ink">
          {isPremium ? 'Premium ✨' : 'Gratuit'}
        </Text>
        {isDevUnlock ? (
          <>
            <Text className="mt-0.5 text-xs text-ink-soft">
              Débloqué pour le développement : les achats ne sont pas disponibles ici, un build de production
              demandera un vrai abonnement.
            </Text>
            <Link href="/paywall" asChild>
              <Pressable className="mt-3 items-center rounded-full border border-line bg-paper px-4 py-2.5">
                <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-sm text-ink">
                  Voir l'écran d'abonnement
                </Text>
              </Pressable>
            </Link>
          </>
        ) : isPremium ? (
          <>
            <Text className="mt-0.5 text-xs text-ink-soft">
              Modifiez ou résiliez votre abonnement à tout moment depuis votre compte App Store / Google Play.
            </Text>
            <Pressable
              onPress={() => manageSubscription.mutate()}
              disabled={manageSubscription.isPending}
              className="mt-3 items-center rounded-full border border-line bg-paper px-4 py-2.5"
            >
              <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-sm text-ink">
                Gérer mon abonnement
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text className="mt-0.5 text-xs text-ink-soft">
              Passez à Premium pour le coach forme et la personnalisation avancée.
            </Text>
            <Link href="/paywall" asChild>
              <Pressable className="mt-3 items-center rounded-full bg-primary px-4 py-2.5">
                <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-sm text-white">
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
            <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-[11px] uppercase tracking-wide text-primary">
              Rappels
            </Text>
            <Text className="mt-0.5 text-sm text-ink-soft">
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
          <Text className="mt-2 text-xs text-red-700">{(toggleReminders.error as Error).message}</Text>
        ) : null}
      </View>

      <View className="mb-3 rounded-2xl border border-line bg-surface p-4 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-[11px] uppercase tracking-wide text-primary">
              Calendrier
            </Text>
            <Text className="mt-0.5 text-sm text-ink-soft">
              Ajoute automatiquement chaque planning dans un calendrier « Regain », aux heures de vos disponibilités.
            </Text>
          </View>
          {calendarUnavailableReason ? null : (
            <Switch
              value={!!calendarQuery.data}
              onValueChange={(v) => toggleCalendar.mutate(v)}
              disabled={calendarQuery.isLoading || toggleCalendar.isPending}
              trackColor={{ false: '#EEE4D6', true: '#FF6B57' }}
              thumbColor="#FFFFFF"
            />
          )}
        </View>
        {calendarUnavailableReason ? (
          <Text className="mt-2 text-xs text-ink-soft">{calendarUnavailableReason}</Text>
        ) : null}
        {toggleCalendar.isPending ? <ActivityIndicator className="mt-2" size="small" color="#FF6B57" /> : null}
        {toggleCalendar.isError ? (
          <Text className="mt-2 text-xs text-red-700">{(toggleCalendar.error as Error).message}</Text>
        ) : null}
        {toggleCalendar.isSuccess && toggleCalendar.data !== null ? (
          <Text className="mt-2 text-xs text-calm">
            {toggleCalendar.data} activité{toggleCalendar.data > 1 ? 's' : ''} de la semaine ajoutée
            {toggleCalendar.data > 1 ? 's' : ''}. Les prochains plannings suivront automatiquement.
          </Text>
        ) : null}
        {toggleCalendar.isSuccess && toggleCalendar.data === null ? (
          <Text className="mt-2 text-xs text-ink-soft">Synchronisation coupée : les activités à venir ont été retirées du calendrier.</Text>
        ) : null}
      </View>

      <View className="mb-3 rounded-2xl border border-line bg-surface p-4 shadow-sm">
        <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-[11px] uppercase tracking-wide text-primary">
          Confidentialité
        </Text>
        <Text className="mt-1 text-sm text-ink-soft">
          Notifications, calendrier et localisation restent facultatifs : ils ne s'activent que si vous les
          autorisez, et se coupent depuis les réglages ci-dessus ou ceux de votre appareil.
        </Text>

        <Pressable
          onPress={() => exportMutation.mutate()}
          disabled={exportMutation.isPending}
          className="mt-3 items-center rounded-full border border-line bg-paper px-4 py-3"
        >
          {exportMutation.isPending ? (
            <ActivityIndicator size="small" color="#FF6B57" />
          ) : (
            <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-sm text-ink">
              Exporter mes données
            </Text>
          )}
        </Pressable>
        {exportMutation.isError ? (
          <Text className="mt-2 text-xs text-red-700">{(exportMutation.error as Error).message}</Text>
        ) : null}

        {confirmingDelete ? (
          <View className="mt-3 rounded-2xl border border-line bg-paper p-3">
            <Text className="text-sm text-ink">
              Supprimer définitivement votre compte et toutes vos données ? Cette action est irréversible.
            </Text>
            {isPremium && !isDevUnlock ? (
              <Text className="mt-2 text-xs text-ink-soft">
                Supprimer le compte ne résilie pas l'abonnement : pensez à le résilier depuis « Gérer mon abonnement ».
              </Text>
            ) : null}
            <View className="mt-3 flex-row">
              <Pressable
                onPress={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="mr-3 rounded-full bg-red-700 px-4 py-2.5"
              >
                {deleteMutation.isPending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-sm text-white">
                    Supprimer définitivement
                  </Text>
                )}
              </Pressable>
              <Pressable onPress={() => setConfirmingDelete(false)} className="justify-center px-2">
                <Text className="text-sm text-ink-soft">Annuler</Text>
              </Pressable>
            </View>
            {deleteMutation.isError ? (
              <Text className="mt-2 text-xs text-red-700">{(deleteMutation.error as Error).message}</Text>
            ) : null}
          </View>
        ) : (
          <Pressable onPress={() => setConfirmingDelete(true)} className="mt-2 items-center px-4 py-3">
            <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-sm text-accent">
              Supprimer mon compte
            </Text>
          </Pressable>
        )}
      </View>

      <Pressable
        onPress={handleSignOut}
        className="mt-2 items-center rounded-full border border-line bg-surface px-4 py-3.5"
      >
        <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-ink">
          Se déconnecter
        </Text>
      </Pressable>
    </ScrollView>
  );
}
