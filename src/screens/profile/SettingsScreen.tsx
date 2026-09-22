import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';

import { goBack } from '../../lib/navigation';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Linking, Switch, View } from 'react-native';

import { errorMessage, InlineNotice } from '../../components/feedback';
import { Button, Card, ListRow, Screen, ScreenHeader, SegmentedControl, Text } from '../../components/ui';
import { fetchAvailabilitySlots } from '../../lib/availability';
import {
  calendarUnavailableReason,
  disableCalendarAutoSync,
  enableCalendarAutoSync,
  isCalendarAutoSyncEnabled,
} from '../../lib/deviceCalendar';
import { deleteAccount, exportUserData } from '../../lib/gdpr';
import { areRemindersEnabled, disableDailyReminder, enableDailyReminder, scheduleActivityReminders } from '../../lib/notifications';
import { fetchWeekPlan } from '../../lib/planning';
import { usePremium } from '../../lib/premium';
import { getManagementUrl, logOutPurchases } from '../../lib/purchases';
import { supabase } from '../../lib/supabase';
import { getWeekStart } from '../../lib/week';
import { useAuthStore } from '../../store/authStore';
import { useTheme, type ThemeMode } from '../../theme/ThemeProvider';

async function fetchCurrentWeek(userId: string) {
  const weekStart = getWeekStart();
  const [plan, availability] = await Promise.all([fetchWeekPlan(userId, weekStart), fetchAvailabilitySlots(userId)]);
  return { weekStart, plan, availability };
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text variant="overline" tone="ink2" style={{ marginBottom: 8 }} accessibilityRole="header">
        {title}
      </Text>
      <Card padding={16}>{children}</Card>
    </View>
  );
}

/** Paramètres : apparence, rappels, calendrier, abonnement, données, déconnexion. */
export default function SettingsScreen() {
  const theme = useTheme();
  const session = useAuthStore((s) => s.session);
  const email = session?.user.email ?? '';
  const { isPremium, isDevUnlock } = usePremium();
  const queryClient = useQueryClient();

  const remindersQuery = useQuery({ queryKey: ['remindersEnabled'], queryFn: areRemindersEnabled });
  const toggleReminders = useMutation({
    mutationFn: async (next: boolean) => {
      if (next) {
        const granted = await enableDailyReminder();
        if (!granted) throw new Error("Autorise les notifications pour Regain dans les réglages de l'appareil.");
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

  const manageSubscription = useMutation({ mutationFn: async () => Linking.openURL(await getManagementUrl()) });

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const exportMutation = useMutation({ mutationFn: () => exportUserData(session!.user.id) });
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

  const switchProps = { trackColor: { false: theme.line, true: theme.primary600 }, thumbColor: '#FFFFFF' };

  return (
    <Screen>
      <ScreenHeader title="Paramètres" subtitle={email} onBack={() => goBack('/(tabs)/profile')} />

      <Section title="Apparence">
        <SegmentedControl<ThemeMode>
          label="Apparence"
          tone="surface"
          value={theme.mode}
          onChange={theme.setMode}
          options={[
            { value: 'auto', label: 'Auto' },
            { value: 'light', label: 'Clair' },
            { value: 'dark', label: 'Sombre' },
          ]}
        />
        <Text variant="caption" tone="ink2" style={{ marginTop: 10 }}>
          En automatique, Regain suit le réglage clair ou sombre de ton téléphone.
        </Text>
      </Section>

      <Section title="Rappels et calendrier">
        <ListRow
          icon="notifications-outline"
          title="Rappels"
          subtitle="Un signe à 8 h pour préférer une respiration aux réseaux, et un rappel à l'heure de chaque activité."
          chevron={false}
          divider
          subtitleLines={4}
          right={
            <Switch
              value={!!remindersQuery.data}
              onValueChange={(v) => toggleReminders.mutate(v)}
              disabled={remindersQuery.isLoading || toggleReminders.isPending}
              accessibilityLabel="Rappels"
              {...switchProps}
            />
          }
        />
        {toggleReminders.isError ? <InlineNotice tone="error" message={errorMessage(toggleReminders.error)} /> : null}
        <ListRow
          icon="calendar-outline"
          title="Calendrier"
          subtitle={
            calendarUnavailableReason ??
            'Ajoute automatiquement chaque planning dans un calendrier « Regain », aux heures de tes disponibilités.'
          }
          chevron={false}
          subtitleLines={4}
          right={
            calendarUnavailableReason ? null : toggleCalendar.isPending ? (
              <ActivityIndicator color={theme.primary600} />
            ) : (
              <Switch
                value={!!calendarQuery.data}
                onValueChange={(v) => toggleCalendar.mutate(v)}
                disabled={calendarQuery.isLoading}
                accessibilityLabel="Synchroniser le calendrier"
                {...switchProps}
              />
            )
          }
        />
        {toggleCalendar.isError ? <InlineNotice tone="error" message={errorMessage(toggleCalendar.error)} /> : null}
        {toggleCalendar.isSuccess && toggleCalendar.data !== null ? (
          <InlineNotice
            tone="success"
            message={`${toggleCalendar.data} activité${toggleCalendar.data > 1 ? 's' : ''} de la semaine ajoutée${
              toggleCalendar.data > 1 ? 's' : ''
            }. Les prochains plannings suivront automatiquement.`}
          />
        ) : null}
        {toggleCalendar.isSuccess && toggleCalendar.data === null ? (
          <InlineNotice message="Synchronisation coupée : les activités à venir ont été retirées du calendrier." />
        ) : null}
      </Section>

      <Section title="Abonnement">
        <Text variant="label">{isPremium ? 'Regain Premium' : 'Formule gratuite'}</Text>
        {isDevUnlock ? (
          <>
            <Text variant="caption" tone="ink2" style={{ marginTop: 4 }}>
              Débloqué pour le développement : les achats ne sont pas disponibles ici, un build de production demandera un vrai abonnement.
            </Text>
            <Button label="Voir l'écran d'abonnement" variant="outline" size="md" onPress={() => router.push('/paywall')} style={{ marginTop: 12 }} />
          </>
        ) : isPremium ? (
          <>
            <Text variant="caption" tone="ink2" style={{ marginTop: 4 }}>
              Modifie ou résilie ton abonnement à tout moment depuis ton compte App Store / Google Play.
            </Text>
            <Button
              label="Gérer mon abonnement"
              variant="outline"
              size="md"
              loading={manageSubscription.isPending}
              onPress={() => manageSubscription.mutate()}
              style={{ marginTop: 12 }}
            />
          </>
        ) : (
          <>
            <Text variant="caption" tone="ink2" style={{ marginTop: 4 }}>
              Passe à Premium pour le coach forme et toute la bibliothèque bien-être.
            </Text>
            <Button label="Découvrir Premium" size="md" onPress={() => router.push('/paywall')} style={{ marginTop: 12 }} />
          </>
        )}
      </Section>

      <Section title="Confidentialité">
        <Text variant="caption" tone="ink2">
          Notifications, calendrier et localisation restent facultatifs : ils ne s&apos;activent que si tu les autorises, et se coupent ici ou
          dans les réglages de ton appareil.
        </Text>
        <Button
          label="Exporter mes données"
          variant="outline"
          size="md"
          icon="download-outline"
          loading={exportMutation.isPending}
          onPress={() => exportMutation.mutate()}
          style={{ marginTop: 12 }}
        />
        {exportMutation.isError ? <InlineNotice tone="error" message={errorMessage(exportMutation.error)} /> : null}

        {confirmingDelete ? (
          <View style={{ marginTop: 14, borderRadius: 14, padding: 14, backgroundColor: theme.fat }}>
            <Text variant="bodySm">Supprimer définitivement ton compte et toutes tes données ? Cette action est irréversible.</Text>
            {isPremium && !isDevUnlock ? (
              <Text variant="caption" tone="ink2" style={{ marginTop: 6 }}>
                Supprimer le compte ne résilie pas l&apos;abonnement : pense à le résilier depuis « Gérer mon abonnement ».
              </Text>
            ) : null}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <Button
                label="Supprimer définitivement"
                variant="destructive"
                size="md"
                fullWidth={false}
                loading={deleteMutation.isPending}
                onPress={() => deleteMutation.mutate()}
              />
              <Button label="Annuler" variant="ghost" size="md" fullWidth={false} onPress={() => setConfirmingDelete(false)} />
            </View>
            {deleteMutation.isError ? <InlineNotice tone="error" message={errorMessage(deleteMutation.error)} /> : null}
          </View>
        ) : (
          <Button label="Supprimer mon compte" variant="ghost" size="md" onPress={() => setConfirmingDelete(true)} style={{ marginTop: 4 }} />
        )}
      </Section>

      <Button label="Se déconnecter" variant="outline" icon="log-out-outline" onPress={handleSignOut} />
    </Screen>
  );
}
