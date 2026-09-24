import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';

import { goBack } from '../../src/lib/navigation';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState, type ComponentProps } from 'react';
import { Linking, View } from 'react-native';
import type { PurchasesPackage } from 'react-native-purchases';
import { PRIVACY_URL, SUBSCRIPTION_DISCLOSURE, TERMS_URL, hasLegalUrls } from '../../src/config/legal';
import { ErrorState, InlineNotice, LoadingSkeleton, errorMessage } from '../../src/components/feedback';
import { Appear, Button, Card, IconButton, Pill, PressableScale, Screen, Text, TextLink } from '../../src/components/ui';
import { useTheme } from '../../src/theme/ThemeProvider';
import {
  annualSavingsPercent,
  defaultPackage,
  describePackage,
  freeTrialDays,
  sortPackages,
  trialTimeline,
} from '../../src/features/subscriptions/packages';
import {
  fetchOfferings,
  isPurchasesConfigured,
  isUsingTestStore,
  purchasePackage,
  purchasesUnavailableReason,
  restorePurchases,
} from '../../src/lib/purchases';
import { fetchPrograms } from '../../src/lib/wellbeing';
import { useAuthStore } from '../../src/store/authStore';

type IconName = ComponentProps<typeof Ionicons>['name'];

type Source = 'onboarding' | 'locked' | 'milestone' | 'default';

// The heading depends on where you arrived from, so it can speak to what you just did.
const HEADINGS: Record<Source, { title: string; lede: string }> = {
  onboarding: {
    title: 'Your routine is ready',
    lede: 'The plan, the tracking and the journal stay free. Premium adds a fitness coach and the whole wellbeing library.',
  },
  locked: {
    title: 'This one is part of Premium',
    lede: 'Unlock the fitness coach and every wellbeing session.',
  },
  milestone: {
    title: 'You have found a rhythm',
    lede: 'Three sessions done. There is more where that came from, in the full library.',
  },
  default: {
    title: 'Regain Premium',
    lede: 'Go further, with a coach that adapts to your week.',
  },
};

function PackageOption({
  pkg,
  savings,
  selected,
  onSelect,
}: {
  pkg: PurchasesPackage;
  savings: number | null;
  selected: boolean;
  onSelect: () => void;
}) {
  const theme = useTheme();
  const display = describePackage(pkg, savings);
  return (
    <PressableScale
      onPress={onSelect}
      feedback="selection"
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${display.title}, ${display.price}${display.period ? ` ${display.period}` : ''}${display.badge ? `, ${display.badge}` : ''}`}
      style={{
        marginBottom: 10,
        borderRadius: 18,
        borderWidth: 2,
        padding: 16,
        borderColor: selected ? theme.primary600 : theme.line,
        backgroundColor: selected ? theme.sage100 : theme.surface,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
          <Ionicons name={selected ? 'radio-button-on' : 'radio-button-off'} size={22} color={selected ? theme.primary600 : theme.ink3} />
          <Text variant="cardTitle">{display.title}</Text>
        </View>
        {display.badge ? <Pill label={display.badge} tone="primary" /> : null}
      </View>
      <View style={{ marginLeft: 32, marginTop: 4 }}>
        <Text variant="label" tabular>
          {display.price}
          {display.period ? ` ${display.period}` : ''}
        </Text>
        {display.perMonth ? (
          <Text variant="caption" tone="ink2">
            {display.perMonth}
          </Text>
        ) : null}
        {display.intro ? (
          <Text variant="caption" tone="accent" style={{ marginTop: 2 }}>
            {display.intro}, puis {display.price} {display.period}
          </Text>
        ) : null}
      </View>
    </PressableScale>
  );
}

export default function PaywallScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ source?: string }>();
  const source: Source =
    params.source === 'onboarding' || params.source === 'locked' || params.source === 'milestone' ? params.source : 'default';
  const heading = HEADINGS[source];

  const userId = useAuthStore((s) => s.session?.user.id);
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState<'purchase' | 'restore' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const offeringsQuery = useQuery({
    queryKey: ['offerings'],
    queryFn: fetchOfferings,
    enabled: isPurchasesConfigured,
  });
  const programsQuery = useQuery({ queryKey: ['wellbeingPrograms'], queryFn: fetchPrograms });
  const premiumSessions = programsQuery.data?.filter((program) => program.premium_only).length ?? 0;

  const benefits: { icon: IconName; text: string }[] = [
    { icon: 'barbell-outline', text: 'A strength programme at your level, adjusted every week' },
    { icon: 'restaurant-outline', text: 'Meals and a shopping list built around your calories' },
    { icon: 'clipboard-outline', text: 'A weekly check-in that adapts sessions and meals to your week' },
    {
      icon: 'moon-outline',
      text:
        premiumSessions > 0
          ? `${premiumSessions} more wellbeing sessions: sleep, meditation, breathing…`
          : 'The entire library of wellbeing sessions',
    },
  ];

  const packages = useMemo(() => sortPackages(offeringsQuery.data?.availablePackages ?? []), [offeringsQuery.data]);
  const savings = annualSavingsPercent(packages);
  const selected = packages.find((p) => p.identifier === selectedId) ?? defaultPackage(packages);
  const selectedDisplay = selected ? describePackage(selected, savings) : null;
  const trialDays = selected ? freeTrialDays(selected.product.introPrice) : null;

  // Arriving from onboarding there is no previous screen, so carry on to the plan.
  const leave = () => (source === 'onboarding' ? router.replace('/(tabs)/planning') : goBack('/(tabs)/planning'));

  const unlockPremium = () => {
    queryClient.setQueryData(['premium', userId], true);
    leave();
  };

  const handlePurchase = async () => {
    if (!selected) return;
    setError(null);
    setNotice(null);
    setBusy('purchase');
    try {
      const outcome = await purchasePackage(selected);
      if (outcome === 'premium') unlockPremium();
      if (outcome === 'not-activated') {
        setNotice(
          'Payment went through, but Premium is not active yet (the purchase may still be pending). ' +
            'Try “Restore purchases” again in a moment.'
        );
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const handleRestore = async () => {
    setError(null);
    setNotice(null);
    setBusy('restore');
    try {
      if (await restorePurchases()) unlockPremium();
      else setNotice('No active Premium subscription was found for this App Store / Google Play account.');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const canBuy = !purchasesUnavailableReason && !offeringsQuery.isLoading && !offeringsQuery.isError && packages.length > 0;

  return (
    <Screen
      footer={
        canBuy ? (
          <View style={{ gap: 4 }}>
            <Button
              label={trialDays ? `Try ${trialDays} days free` : 'Continue'}
              loading={busy === 'purchase'}
              disabled={busy !== null}
              onPress={handlePurchase}
            />
            <Button label="Restore purchases" variant="ghost" size="md" loading={busy === 'restore'} disabled={busy !== null} onPress={handleRestore} />
          </View>
        ) : undefined
      }
    >
      <View style={{ flexDirection: 'row', justifyContent: source === 'onboarding' ? 'flex-end' : 'flex-start', marginLeft: -10, marginBottom: 8 }}>
        {source === 'onboarding' ? (
          <TextLink label="Not now" onPress={leave} tone="ink2" />
        ) : (
          <IconButton icon="close" label="Close" onPress={leave} />
        )}
      </View>

      <Appear>
        <View
          style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: theme.premium, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}
        >
          <Ionicons name="diamond" size={24} color={theme.yellow} />
        </View>
        <Text variant="overline" tone="premium">
          Regain Premium
        </Text>
        <Text variant="title" style={{ marginTop: 6 }} accessibilityRole="header">
          {heading.title}
        </Text>
        <Text variant="body" tone="ink2" style={{ marginTop: 8, marginBottom: 20 }}>
          {heading.lede}
        </Text>
      </Appear>

      <Card>
        {benefits.map((b, i) => (
          <Appear key={b.icon} index={i + 1}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: i === benefits.length - 1 ? 0 : 14 }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: theme.sage100, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={b.icon} size={18} color={theme.primary600} />
              </View>
              <Text variant="bodySm" style={{ flex: 1 }}>
                {b.text}
              </Text>
            </View>
          </Appear>
        ))}
      </Card>

      <View style={{ marginTop: 20 }}>
        {purchasesUnavailableReason ? (
          <Card variant="premium">
            <Text variant="bodySm" tone="premium">
              {purchasesUnavailableReason}
            </Text>
          </Card>
        ) : offeringsQuery.isLoading ? (
          <LoadingSkeleton preset="list" />
        ) : offeringsQuery.isError ? (
          <ErrorState
            title="The plans could not be loaded"
            body={errorMessage(offeringsQuery.error)}
            onRetry={() => offeringsQuery.refetch()}
            retrying={offeringsQuery.isFetching}
          />
        ) : packages.length === 0 ? (
          <Text variant="bodySm" tone="ink2">
            No plans are available right now.
          </Text>
        ) : (
          <>
            {isUsingTestStore ? (
              <View style={{ alignSelf: 'center', marginBottom: 12 }}>
                <Pill icon="flask-outline" label="RevenueCat test mode: nothing is charged" tone="premium" />
              </View>
            ) : null}
            <View accessibilityRole="radiogroup">
              {packages.map((pkg) => (
                <PackageOption
                  key={pkg.identifier}
                  pkg={pkg}
                  savings={savings}
                  selected={pkg.identifier === selected?.identifier}
                  onSelect={() => setSelectedId(pkg.identifier)}
                />
              ))}
            </View>

            {trialDays && selectedDisplay ? (
              <Card variant="flat" style={{ marginTop: 6 }}>
                {trialTimeline(trialDays, selectedDisplay.price).map((step, i) => (
                  <View key={step.when} style={{ flexDirection: 'row', gap: 12, marginBottom: i === 2 ? 0 : 10 }}>
                    <Text variant="caption" tone="accent" tabular style={{ width: 92, fontWeight: '700' }}>
                      {step.when}
                    </Text>
                    <Text variant="bodySm" style={{ flex: 1 }}>
                      {step.what}
                    </Text>
                  </View>
                ))}
              </Card>
            ) : null}
          </>
        )}
      </View>

      {source === 'onboarding' ? (
        <Button label="Carry on with the free version" variant="ghost" onPress={leave} style={{ marginTop: 8 }} />
      ) : null}

      {notice ? <InlineNotice message={notice} /> : null}
      {error ? <InlineNotice tone="error" message={error} /> : null}

      <Text variant="caption" tone="ink3" style={{ marginTop: 20 }}>
        {SUBSCRIPTION_DISCLOSURE}
      </Text>

      {hasLegalUrls ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 4 }}>
          <TextLink label="Terms of use" icon={null} tone="ink2" onPress={() => Linking.openURL(TERMS_URL)} />
          <TextLink label="Privacy policy" icon={null} tone="ink2" onPress={() => Linking.openURL(PRIVACY_URL)} />
        </View>
      ) : (
        <InlineNotice
          tone="error"
          message="EXPO_PUBLIC_TERMS_URL and EXPO_PUBLIC_PRIVACY_URL are not set. Both links are required to pass App Store review."
        />
      )}
    </Screen>
  );
}
