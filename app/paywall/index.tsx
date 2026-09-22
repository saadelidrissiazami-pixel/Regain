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

// Le titre dépend de l'endroit d'où l'on arrive : on parle de ce que la personne vient de faire.
const HEADINGS: Record<Source, { title: string; lede: string }> = {
  onboarding: {
    title: 'Ta routine est prête',
    lede: 'Planning, suivi et journal restent gratuits. Premium ajoute un coach forme et toute la bibliothèque bien-être.',
  },
  locked: {
    title: 'Ceci fait partie de Premium',
    lede: 'Débloque le coach forme et toutes les séances de bien-être.',
  },
  milestone: {
    title: 'Tu as pris le rythme',
    lede: 'Trois séances terminées : de quoi aller plus loin, avec toute la bibliothèque.',
  },
  default: {
    title: 'Regain Premium',
    lede: 'Va plus loin, avec un coach qui s’adapte à ta semaine.',
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
    { icon: 'barbell-outline', text: 'Un programme de musculation à ton niveau, ajusté chaque semaine' },
    { icon: 'restaurant-outline', text: 'Des menus et une liste de courses calés sur tes calories' },
    { icon: 'clipboard-outline', text: 'Un bilan hebdo qui adapte séances et repas à ta semaine' },
    {
      icon: 'moon-outline',
      text:
        premiumSessions > 0
          ? `${premiumSessions} séances de bien-être en plus : sommeil, méditation, respiration…`
          : 'Toute la bibliothèque de séances de bien-être',
    },
  ];

  const packages = useMemo(() => sortPackages(offeringsQuery.data?.availablePackages ?? []), [offeringsQuery.data]);
  const savings = annualSavingsPercent(packages);
  const selected = packages.find((p) => p.identifier === selectedId) ?? defaultPackage(packages);
  const selectedDisplay = selected ? describePackage(selected, savings) : null;
  const trialDays = selected ? freeTrialDays(selected.product.introPrice) : null;

  // Depuis l'accueil, il n'y a pas d'écran précédent : on continue vers le planning.
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
          "Paiement enregistré, mais Premium n'est pas encore actif (achat en attente de validation ?). " +
            'Réessaie « Restaurer mes achats » dans quelques instants.'
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
      else setNotice("Aucun abonnement Premium actif n'a été retrouvé pour ce compte App Store / Google Play.");
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
              label={trialDays ? `Essayer ${trialDays} jours gratuitement` : 'Continuer'}
              loading={busy === 'purchase'}
              disabled={busy !== null}
              onPress={handlePurchase}
            />
            <Button label="Restaurer mes achats" variant="ghost" size="md" loading={busy === 'restore'} disabled={busy !== null} onPress={handleRestore} />
          </View>
        ) : undefined
      }
    >
      <View style={{ flexDirection: 'row', justifyContent: source === 'onboarding' ? 'flex-end' : 'flex-start', marginLeft: -10, marginBottom: 8 }}>
        {source === 'onboarding' ? (
          <TextLink label="Plus tard" onPress={leave} tone="ink2" />
        ) : (
          <IconButton icon="close" label="Fermer" onPress={leave} />
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
            title="Les offres n'ont pas pu se charger"
            body={errorMessage(offeringsQuery.error)}
            onRetry={() => offeringsQuery.refetch()}
            retrying={offeringsQuery.isFetching}
          />
        ) : packages.length === 0 ? (
          <Text variant="bodySm" tone="ink2">
            Aucune offre disponible pour le moment.
          </Text>
        ) : (
          <>
            {isUsingTestStore ? (
              <View style={{ alignSelf: 'center', marginBottom: 12 }}>
                <Pill icon="flask-outline" label="Mode test RevenueCat : rien n'est débité" tone="premium" />
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
        <Button label="Continuer en version gratuite" variant="ghost" onPress={leave} style={{ marginTop: 8 }} />
      ) : null}

      {notice ? <InlineNotice message={notice} /> : null}
      {error ? <InlineNotice tone="error" message={error} /> : null}

      <Text variant="caption" tone="ink3" style={{ marginTop: 20 }}>
        {SUBSCRIPTION_DISCLOSURE}
      </Text>

      {hasLegalUrls ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 4 }}>
          <TextLink label="Conditions d'utilisation" icon={null} tone="ink2" onPress={() => Linking.openURL(TERMS_URL)} />
          <TextLink label="Politique de confidentialité" icon={null} tone="ink2" onPress={() => Linking.openURL(PRIVACY_URL)} />
        </View>
      ) : (
        <InlineNotice
          tone="error"
          message="EXPO_PUBLIC_TERMS_URL et EXPO_PUBLIC_PRIVACY_URL ne sont pas renseignées : ces liens sont obligatoires pour passer la validation App Store."
        />
      )}
    </Screen>
  );
}
