import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import { Linking, View } from 'react-native';

import { Appear, Avatar, Card, IconButton, ListRow, PressableScale, Screen, Sheet, Text } from '../../components/ui';
import { PRIVACY_URL, SUPPORT_EMAIL, TERMS_URL } from '../../config/legal';
import { countCompletedActivities } from '../../lib/planning';
import { usePremium } from '../../lib/premium';
import { fetchProfile, firstNameOf } from '../../lib/profile';
import { fetchStreak } from '../../lib/tracking';
import { useToday } from '../../lib/useCurrentDate';
import { fromLocalISODate } from '../../lib/week';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../theme/ThemeProvider';

type IconName = ComponentProps<typeof Ionicons>['name'];

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }} accessible accessibilityLabel={`${value} ${label}`}>
      <Text variant="headline" tabular>
        {value}
      </Text>
      <Text variant="caption" tone="ink2" center>
        {label}
      </Text>
    </View>
  );
}

function MenuTile({ icon, title, onPress }: { icon: IconName; title: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Card padding={12} radius={16} onPress={onPress} accessibilityLabel={title} style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 40 }}>
        <Ionicons name={icon} size={19} color={theme.primary600} />
        <Text variant="label" style={{ flex: 1, fontSize: 14 }} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.85}>
          {title}
        </Text>
        <Ionicons name="chevron-forward" size={14} color={theme.ink3} />
      </View>
    </Card>
  );
}

/** Profil : « Comment gérer mon expérience ? » */
export default function ProfileScreen() {
  const theme = useTheme();
  const session = useAuthStore((s) => s.session);
  const userId = session?.user.id;
  const email = session?.user.email ?? '';
  const { isPremium, isDevUnlock } = usePremium();
  const [helpOpen, setHelpOpen] = useState(false);
  const today = useToday();

  const profileQuery = useQuery({ queryKey: ['profile', userId], queryFn: () => fetchProfile(userId!), enabled: !!userId });
  const streakQuery = useQuery({ queryKey: ['streak', userId], queryFn: () => fetchStreak(userId!), enabled: !!userId });
  const countQuery = useQuery({ queryKey: ['completedCount', userId], queryFn: () => countCompletedActivities(userId!), enabled: !!userId });

  const name = firstNameOf(profileQuery.data);
  const createdAt = profileQuery.data?.created_at;
  const weeks = createdAt ? Math.max(1, Math.ceil((fromLocalISODate(today).getTime() + 86_400_000 - new Date(createdAt).getTime()) / (7 * 86_400_000))) : null;

  return (
    <Screen inTabs refreshing={profileQuery.isRefetching} onRefresh={() => Promise.all([profileQuery.refetch(), streakQuery.refetch(), countQuery.refetch()])}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
        <Avatar name={name ?? email} size={72} />
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text variant="headline" numberOfLines={1} accessibilityRole="header">
            {name ?? 'Bienvenue'}
          </Text>
          <Text variant="bodySm" tone="ink2" style={{ marginTop: 2 }}>
            {name ? 'A little further each week 🌱' : email}
          </Text>
        </View>
        <IconButton icon="settings-outline" label="Settings" onPress={() => router.push('/settings')} />
      </View>

      {!name && profileQuery.isSuccess ? (
        <Appear>
          <Card variant="tinted" padding={14} onPress={() => router.push('/profile/goals')} accessibilityLabel="Add your first name" style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Ionicons name="person-add-outline" size={20} color={theme.primary600} />
              <Text variant="label" style={{ flex: 1 }}>
                What should we call you?
              </Text>
              <Ionicons name="chevron-forward" size={16} color={theme.ink2} />
            </View>
          </Card>
        </Appear>
      ) : null}

      <Appear index={1}>
        <Card padding={16}>
          <View style={{ flexDirection: 'row' }}>
            <Stat value={weeks === null ? '–' : String(weeks)} label={weeks === 1 ? 'week' : 'weeks'} />
            <View style={{ width: 1, backgroundColor: theme.divider }} />
            <Stat value={countQuery.data === undefined ? '–' : String(countQuery.data)} label={countQuery.data === 1 ? 'activity' : 'activities'} />
            <View style={{ width: 1, backgroundColor: theme.divider }} />
            <Stat value={String(streakQuery.data ?? 0)} label="days in a row" />
          </View>
        </Card>
      </Appear>

      <Appear index={2}>
        <View style={{ gap: 10, marginTop: 16 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <MenuTile icon="flag-outline" title="Mes objectifs" onPress={() => router.push('/profile/goals')} />
            <MenuTile icon="calendar-outline" title="When I am free" onPress={() => router.push('/availability')} />
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <MenuTile icon="settings-outline" title="Settings" onPress={() => router.push('/settings')} />
            <MenuTile icon="help-circle-outline" title="Aide & support" onPress={() => setHelpOpen(true)} />
          </View>
        </View>
      </Appear>

      <Appear index={3}>
        <PressableScale
          onPress={() => router.push(isPremium && !isDevUnlock ? '/settings' : '/paywall')}
          accessibilityRole="button"
          accessibilityLabel={isPremium ? 'Regain Premium active' : 'Regain Premium, unlock everything'}
          style={{ marginTop: 16, borderRadius: 18, padding: 16, backgroundColor: theme.premium, flexDirection: 'row', alignItems: 'center', gap: 12 }}
        >
          <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: theme.dark ? theme.bg : '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="diamond" size={20} color={theme.yellow} />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="label" tone="premium">
              Regain Premium
            </Text>
            <Text variant="caption" tone="premium" style={{ opacity: 0.85 }}>
              {isPremium ? (isDevUnlock ? 'Unlocked for development' : 'Active · manage my subscription') : 'Unlock everything'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.premiumInk} />
        </PressableScale>
      </Appear>

      <Sheet visible={helpOpen} title="Aide & support" onClose={() => setHelpOpen(false)} scroll={false}>
        <View style={{ paddingHorizontal: 20 }}>
          {SUPPORT_EMAIL ? (
            <ListRow icon="mail-outline" title="Write to us" subtitle={SUPPORT_EMAIL} onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)} divider />
          ) : null}
          {TERMS_URL ? <ListRow icon="document-text-outline" title="Conditions d'utilisation" onPress={() => Linking.openURL(TERMS_URL)} divider /> : null}
          {PRIVACY_URL ? <ListRow icon="shield-checkmark-outline" title="Privacy policy" onPress={() => Linking.openURL(PRIVACY_URL)} divider /> : null}
          <ListRow icon="lock-closed-outline" title="My data" subtitle="Export or delete your account" onPress={() => {
            setHelpOpen(false);
            router.push('/settings');
          }} />
          <Text variant="caption" tone="ink2" style={{ marginTop: 12 }}>
            Regain is not a substitute for a health professional. If things get difficult, talk to your doctor.
          </Text>
        </View>
      </Sheet>
    </Screen>
  );
}
