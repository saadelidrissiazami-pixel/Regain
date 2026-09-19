import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, View } from 'react-native';
import type { PurchasesPackage } from 'react-native-purchases';
import { PRIVACY_URL, SUBSCRIPTION_DISCLOSURE, TERMS_URL, hasLegalUrls } from '../../src/config/legal';
import { Appear, PressableScale } from '../../src/components/motion';
import { Text } from '../../src/components/typography';
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

const DISPLAY = { fontFamily: 'BricolageGrotesque_800ExtraBold' } as const;
const BOLD = { fontFamily: 'Figtree_700Bold' } as const;

type Source = 'onboarding' | 'locked' | 'milestone' | 'default';

// Le titre dépend de l'endroit d'où l'on arrive : on parle de ce que la personne vient de faire.
const HEADINGS: Record<Source, { title: string; lede: string }> = {
  onboarding: {
    title: 'Votre routine est prête',
    lede: 'Planning, suivi et journal restent gratuits. Premium ajoute un coach forme et toute la bibliothèque bien-être.',
  },
  locked: {
    title: 'Ceci fait partie de Premium',
    lede: 'Débloquez le coach forme et toutes les séances de bien-être.',
  },
  milestone: {
    title: 'Vous avez pris le rythme',
    lede: 'Trois séances terminées : de quoi aller plus loin, avec toute la bibliothèque.',
  },
  default: {
    title: 'Regain Premium',
    lede: 'Allez plus loin dans la reconstruction de votre routine.',
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
  const display = describePackage(pkg, savings);
  return (
    <Pressable
      onPress={onSelect}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      className={`mb-3 rounded-2xl border-2 p-4 ${selected ? 'border-primary bg-primary-soft' : 'border-line bg-surface'}`}
    >
      <View className="flex-row items-center justify-between">
        <Text style={DISPLAY} className="text-base text-ink">
          {display.title}
        </Text>
        {display.badge ? (
          <View className="rounded-full bg-primary px-2.5 py-0.5">
            <Text style={DISPLAY} className="text-xs text-on-primary">
              {display.badge}
            </Text>
          </View>
        ) : null}
      </View>
      <Text style={BOLD} className="mt-1 text-sm text-ink">
        {display.price}
        {display.period ? ` ${display.period}` : ''}
      </Text>
      {display.perMonth ? <Text className="text-xs text-ink-soft">{display.perMonth}</Text> : null}
      {display.intro ? (
        <Text style={BOLD} className="mt-1 text-xs text-calm">
          {display.intro}, puis {display.price} {display.period}
        </Text>
      ) : null}
    </Pressable>
  );
}

export default function PaywallScreen() {
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

  const benefits = [
    { icon: '🏋️', text: 'Un programme de musculation à votre niveau, ajusté chaque semaine' },
    { icon: '🥗', text: 'Des menus et une liste de courses calés sur vos calories' },
    { icon: '📋', text: 'Un bilan hebdo qui adapte séances et repas à votre semaine' },
    {
      icon: '🌙',
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
  const leave = () => (source === 'onboarding' ? router.replace('/(tabs)/planning') : router.back());

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
            'Réessayez « Restaurer mes achats » dans quelques instants.'
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

  return (
    <ScrollView className="flex-1 bg-paper px-6 pt-16" contentContainerStyle={{ paddingBottom: 60 }}>
      <Pressable onPress={leave} className="mb-5 self-start" accessibilityRole="button">
        <Text style={BOLD} className="text-sm text-ink-soft">
          {source === 'onboarding' ? 'Plus tard →' : '✕ Fermer'}
        </Text>
      </Pressable>

      <Appear>
        <Text style={BOLD} className="mb-1 text-[11px] uppercase tracking-wide text-primary">
          Regain Premium
        </Text>
        <Text style={DISPLAY} className="mb-1 text-[30px] leading-9 text-ink">
          {heading.title}
        </Text>
        <Text className="mb-6 text-[15px] leading-6 text-ink-soft">{heading.lede}</Text>
      </Appear>

      <View className="mb-2 rounded-3xl bg-surface p-4 shadow-sm">
        {benefits.map((b, i) => (
          <Appear key={b.icon} index={i + 1}>
            <View className={`flex-row items-start ${i === benefits.length - 1 ? '' : 'mb-3'}`}>
              <Text className="mr-3 text-lg">{b.icon}</Text>
              <Text style={BOLD} className="flex-1 text-sm leading-5 text-ink">
                {b.text}
              </Text>
            </View>
          </Appear>
        ))}
      </View>

      {purchasesUnavailableReason ? (
        <View className="mt-4 rounded-2xl border border-line bg-accent-soft p-4">
          <Text className="text-sm text-ink">{purchasesUnavailableReason}</Text>
        </View>
      ) : offeringsQuery.isLoading ? (
        <ActivityIndicator className="mt-4 text-primary" />
      ) : offeringsQuery.isError ? (
        <View className="mt-4 rounded-2xl border border-line bg-surface p-4">
          <Text className="text-sm text-ink">Impossible de charger les offres : {(offeringsQuery.error as Error).message}</Text>
          <Pressable onPress={() => offeringsQuery.refetch()} className="mt-2">
            <Text style={BOLD} className="text-sm text-primary">
              Réessayer
            </Text>
          </Pressable>
        </View>
      ) : packages.length === 0 ? (
        <Text className="mt-4 text-sm text-ink-soft">Aucune offre disponible pour le moment.</Text>
      ) : (
        <View className="mt-4">
          {isUsingTestStore ? (
            <Text className="mb-3 text-center text-xs text-accent">
              🧪 Mode test RevenueCat : les achats sont simulés, rien n'est débité.
            </Text>
          ) : null}
          {packages.map((pkg) => (
            <PackageOption
              key={pkg.identifier}
              pkg={pkg}
              savings={savings}
              selected={pkg.identifier === selected?.identifier}
              onSelect={() => setSelectedId(pkg.identifier)}
            />
          ))}

          {trialDays && selectedDisplay ? (
            <View className="mb-4 rounded-2xl border border-line p-4">
              {trialTimeline(trialDays, selectedDisplay.price).map((step, i) => (
                <View key={step.when} className={`flex-row ${i === 2 ? '' : 'mb-2.5'}`}>
                  <Text style={{ fontFamily: 'IBMPlexMono_500Medium' }} className="w-24 text-xs text-primary">
                    {step.when}
                  </Text>
                  <Text className="flex-1 text-sm text-ink">{step.what}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <PressableScale
            feedback="medium"
            onPress={handlePurchase}
            disabled={busy !== null}
            className="mb-3 mt-1 items-center rounded-full bg-ink px-5 py-4"
          >
            {busy === 'purchase' ? (
              <ActivityIndicator className="text-paper" />
            ) : (
              <Text style={DISPLAY} className="text-center text-base text-paper">
                {trialDays ? `Essayer ${trialDays} jours gratuitement` : 'Continuer'}
              </Text>
            )}
          </PressableScale>
          <Pressable onPress={handleRestore} disabled={busy !== null} className="items-center py-2">
            {busy === 'restore' ? (
              <ActivityIndicator className="text-primary" size="small" />
            ) : (
              <Text className="text-sm text-ink-soft">Restaurer mes achats</Text>
            )}
          </Pressable>
        </View>
      )}

      {source === 'onboarding' ? (
        <Pressable onPress={leave} className="mt-2 items-center py-3" accessibilityRole="button">
          <Text style={BOLD} className="text-sm text-ink underline">
            Continuer en version gratuite
          </Text>
        </Pressable>
      ) : null}

      {notice ? <Text className="mt-3 text-xs text-ink">{notice}</Text> : null}
      {error ? <Text className="mt-3 text-xs text-red-700">{error}</Text> : null}

      <Text className="mt-6 text-[11px] leading-4 text-ink-soft">{SUBSCRIPTION_DISCLOSURE}</Text>

      {hasLegalUrls ? (
        <View className="mt-3 flex-row">
          <Pressable onPress={() => Linking.openURL(TERMS_URL)} className="mr-4">
            <Text style={BOLD} className="text-xs text-ink-soft underline">
              Conditions d'utilisation
            </Text>
          </Pressable>
          <Pressable onPress={() => Linking.openURL(PRIVACY_URL)}>
            <Text style={BOLD} className="text-xs text-ink-soft underline">
              Politique de confidentialité
            </Text>
          </Pressable>
        </View>
      ) : (
        <Text className="mt-3 text-[11px] text-accent">
          ⚠️ EXPO_PUBLIC_TERMS_URL et EXPO_PUBLIC_PRIVACY_URL ne sont pas renseignées : ces liens sont
          obligatoires pour passer la validation App Store.
        </Text>
      )}
    </ScrollView>
  );
}
