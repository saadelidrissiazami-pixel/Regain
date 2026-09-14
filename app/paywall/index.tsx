import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, Text, View } from 'react-native';

import { isPurchasesConfigured, fetchOfferings, purchasePackage, restorePurchases } from '../../src/lib/purchases';

// Apple (App Store Review 3.1.2) et Google exigent que l'écran d'abonnement affiche
// un lien vers les CGU et la politique de confidentialité, ainsi que la mention du
// renouvellement automatique. Renseignez ces deux URL dans .env avant soumission.
const TERMS_URL = process.env.EXPO_PUBLIC_TERMS_URL;
const PRIVACY_URL = process.env.EXPO_PUBLIC_PRIVACY_URL;
const hasLegalLinks = !!(TERMS_URL && PRIVACY_URL);

const BENEFITS = [
  { icon: '🎯', text: 'Personnalisation avancée du planning' },
  { icon: '📚', text: 'Programmes bien-être premium' },
  { icon: '📈', text: 'Historique de progression complet' },
  { icon: '🔔', text: 'Rappels et suggestions adaptatifs' },
];

export default function PaywallScreen() {
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Sans ça, l'utilisateur qui vient de payer continue de voir « Gratuit » et
  // les séances verrouillées jusqu'à expiration du cache.
  const refreshEntitlements = () => queryClient.invalidateQueries({ queryKey: ['premium'] });

  const offeringsQuery = useQuery({
    queryKey: ['offerings'],
    queryFn: fetchOfferings,
    enabled: isPurchasesConfigured,
  });

  const handlePurchase = async (pkg: any) => {
    setError(null);
    setPurchasing(true);
    try {
      await purchasePackage(pkg);
      await refreshEntitlements();
      router.back();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setError(null);
    setPurchasing(true);
    try {
      await restorePurchases();
      await refreshEntitlements();
      router.back();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-paper px-6 pt-16" contentContainerStyle={{ paddingBottom: 60 }}>
      <Pressable onPress={() => router.back()} className="mb-5">
        <Text className="font-label text-sm text-ink-soft">
          ✕ Fermer
        </Text>
      </Pressable>

      <View className="mb-6 h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-sm">
        <Text className="font-body text-2xl">✨</Text>
      </View>
      <Text className="font-display mb-1 text-[28px] leading-8 text-ink">
        Regain Premium
      </Text>
      <Text className="font-body mb-7 text-sm text-ink-soft">Allez plus loin dans la reconstruction de votre routine.</Text>

      {BENEFITS.map((b) => (
        <View key={b.text} className="mb-3 flex-row items-center rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <Text className="font-body mr-3 text-xl">{b.icon}</Text>
          <Text className="font-label flex-1 text-sm text-ink">
            {b.text}
          </Text>
        </View>
      ))}

      {!isPurchasesConfigured ? (
        <View className="mt-4 rounded-2xl border border-line bg-accent-soft p-4">
          <Text className="font-body text-sm text-ink">
            Les abonnements ne sont pas encore configurés (clé RevenueCat manquante). Ajoutez
            EXPO_PUBLIC_REVENUECAT_IOS_KEY / EXPO_PUBLIC_REVENUECAT_ANDROID_KEY à .env une fois votre compte
            RevenueCat et vos produits d'achat intégré créés.
          </Text>
        </View>
      ) : offeringsQuery.isLoading ? (
        <ActivityIndicator className="mt-4" color="#FF6B57" />
      ) : offeringsQuery.data ? (
        <View className="mt-4">
          {offeringsQuery.data.availablePackages.map((pkg: any) => (
            <Pressable
              key={pkg.identifier}
              onPress={() => handlePurchase(pkg)}
              disabled={purchasing}
              className="mb-3 overflow-hidden rounded-full shadow-sm"
            >
              <LinearGradient colors={['#F0A324', '#FF6B57']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingVertical: 15 }}>
                {purchasing ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="font-display text-center text-white">
                    {pkg.product.title} — {pkg.product.priceString}
                  </Text>
                )}
              </LinearGradient>
            </Pressable>
          ))}
          <Pressable onPress={handleRestore} className="items-center py-2">
            <Text className="font-body text-sm text-ink-soft">Restaurer mes achats</Text>
          </Pressable>
        </View>
      ) : (
        <Text className="font-body mt-4 text-sm text-ink-soft">Aucune offre disponible pour le moment.</Text>
      )}

      {error ? <Text className="font-body mt-3 text-xs text-red-700">{error}</Text> : null}

      {isPurchasesConfigured ? (
        <View className="mt-6">
          <Text className="font-body text-[11px] leading-4 text-ink-soft">
            L'abonnement est renouvelé automatiquement à la fin de chaque période, sauf résiliation au moins
            24 h avant l'échéance depuis les réglages de votre compte App Store ou Google Play.
          </Text>
          {hasLegalLinks ? (
            <View className="mt-2 flex-row">
              <Pressable onPress={() => Linking.openURL(TERMS_URL!)} className="mr-4">
                <Text className="font-label text-[11px] text-primary">Conditions d'utilisation</Text>
              </Pressable>
              <Pressable onPress={() => Linking.openURL(PRIVACY_URL!)}>
                <Text className="font-label text-[11px] text-primary">Politique de confidentialité</Text>
              </Pressable>
            </View>
          ) : (
            <Text className="font-body mt-2 text-[11px] leading-4 text-red-700">
              EXPO_PUBLIC_TERMS_URL et EXPO_PUBLIC_PRIVACY_URL ne sont pas renseignées dans .env — l'app
              sera refusée à la revue App Store tant que ces liens sont absents.
            </Text>
          )}
        </View>
      ) : null}
    </ScrollView>
  );
}
