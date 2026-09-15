import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, View } from 'react-native';
import type { PurchasesPackage } from 'react-native-purchases';
import { PRIVACY_URL, SUBSCRIPTION_DISCLOSURE, TERMS_URL, hasLegalUrls } from '../../src/config/legal';
import { Text } from '../../src/components/typography';
import {
  annualSavingsPercent,
  defaultPackage,
  describePackage,
  sortPackages,
} from '../../src/features/subscriptions/packages';
import {
  fetchOfferings,
  isPurchasesConfigured,
  isUsingTestStore,
  purchasePackage,
  purchasesUnavailableReason,
  restorePurchases,
} from '../../src/lib/purchases';
import { useAuthStore } from '../../src/store/authStore';

const BENEFITS = [
  { icon: '🏋️', text: 'Coach forme : musculation sur mesure, menus, liste de courses et calories' },
  { icon: '🎯', text: 'Personnalisation avancée du planning' },
  { icon: '📚', text: 'Programmes bien-être premium' },
  { icon: '📈', text: 'Historique de progression complet' },
  { icon: '🔔', text: 'Rappels et suggestions adaptatifs' },
];

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
      className={`mb-3 rounded-2xl border-2 p-4 ${selected ? 'border-primary bg-primary-soft' : 'border-line bg-surface'}`}
    >
      <View className="flex-row items-center justify-between">
        <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-base text-ink">
          {display.title}
        </Text>
        {display.badge ? (
          <View className="rounded-full bg-primary px-2.5 py-0.5">
            <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-xs text-white">
              {display.badge}
            </Text>
          </View>
        ) : null}
      </View>
      <Text style={{ fontFamily: 'Nunito_700Bold' }} className="mt-1 text-sm text-ink">
        {display.price}
        {display.period ? ` ${display.period}` : ''}
      </Text>
      {display.perMonth ? <Text className="text-xs text-ink-soft">{display.perMonth}</Text> : null}
      {display.intro ? (
        <Text style={{ fontFamily: 'Nunito_700Bold' }} className="mt-1 text-xs text-calm">
          {display.intro}, puis {display.price} {display.period}
        </Text>
      ) : null}
    </Pressable>
  );
}

export default function PaywallScreen() {
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

  const packages = useMemo(() => sortPackages(offeringsQuery.data?.availablePackages ?? []), [offeringsQuery.data]);
  const savings = annualSavingsPercent(packages);
  const selected = packages.find((p) => p.identifier === selectedId) ?? defaultPackage(packages);
  const selectedDisplay = selected ? describePackage(selected, savings) : null;

  const unlockPremium = () => {
    queryClient.setQueryData(['premium', userId], true);
    router.back();
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
      <Pressable onPress={() => router.back()} className="mb-5">
        <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-sm text-ink-soft">
          ✕ Fermer
        </Text>
      </Pressable>

      <View className="mb-6 h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-sm">
        <Text className="text-2xl">✨</Text>
      </View>
      <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-1 text-[28px] leading-8 text-ink">
        Regain Premium
      </Text>
      <Text className="mb-7 text-sm text-ink-soft">Allez plus loin dans la reconstruction de votre routine.</Text>

      {BENEFITS.map((b) => (
        <View key={b.text} className="mb-3 flex-row items-center rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <Text className="mr-3 text-xl">{b.icon}</Text>
          <Text style={{ fontFamily: 'Nunito_700Bold' }} className="flex-1 text-sm text-ink">
            {b.text}
          </Text>
        </View>
      ))}

      {purchasesUnavailableReason ? (
        <View className="mt-4 rounded-2xl border border-line bg-accent-soft p-4">
          <Text className="text-sm text-ink">{purchasesUnavailableReason}</Text>
        </View>
      ) : offeringsQuery.isLoading ? (
        <ActivityIndicator className="mt-4" color="#FF6B57" />
      ) : offeringsQuery.isError ? (
        <View className="mt-4 rounded-2xl border border-line bg-surface p-4">
          <Text className="text-sm text-ink">Impossible de charger les offres : {(offeringsQuery.error as Error).message}</Text>
          <Pressable onPress={() => offeringsQuery.refetch()} className="mt-2">
            <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-sm text-primary">
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
          <Pressable onPress={handlePurchase} disabled={busy !== null} className="mb-3 mt-1 overflow-hidden rounded-full shadow-sm">
            <LinearGradient colors={['#F0A324', '#FF6B57']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingVertical: 15 }}>
              {busy === 'purchase' ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-center text-white">
                  {selectedDisplay?.intro?.includes('gratuit') ? "Commencer l'essai gratuit" : 'Continuer'}
                </Text>
              )}
            </LinearGradient>
          </Pressable>
          <Pressable onPress={handleRestore} disabled={busy !== null} className="items-center py-2">
            {busy === 'restore' ? (
              <ActivityIndicator size="small" color="#FF6B57" />
            ) : (
              <Text className="text-sm text-ink-soft">Restaurer mes achats</Text>
            )}
          </Pressable>
        </View>
      )}

      {notice ? <Text className="mt-3 text-xs text-ink">{notice}</Text> : null}
      {error ? <Text className="mt-3 text-xs text-red-700">{error}</Text> : null}

      <Text className="mt-6 text-[11px] leading-4 text-ink-soft">{SUBSCRIPTION_DISCLOSURE}</Text>

      {hasLegalUrls ? (
        <View className="mt-3 flex-row">
          <Pressable onPress={() => Linking.openURL(TERMS_URL)} className="mr-4">
            <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-xs text-ink-soft underline">
              Conditions d'utilisation
            </Text>
          </Pressable>
          <Pressable onPress={() => Linking.openURL(PRIVACY_URL)}>
            <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-xs text-ink-soft underline">
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
