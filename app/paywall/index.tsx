import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { Text } from '../../src/components/typography';
import { isPurchasesConfigured, fetchOfferings, purchasePackage, restorePurchases } from '../../src/lib/purchases';

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
      await queryClient.invalidateQueries({ queryKey: ['premium'] });
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
      await queryClient.invalidateQueries({ queryKey: ['premium'] });
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

      {!isPurchasesConfigured ? (
        <View className="mt-4 rounded-2xl border border-line bg-accent-soft p-4">
          <Text className="text-sm text-ink">
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
                  <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-center text-white">
                    {pkg.product.title} — {pkg.product.priceString}
                  </Text>
                )}
              </LinearGradient>
            </Pressable>
          ))}
          <Pressable onPress={handleRestore} className="items-center py-2">
            <Text className="text-sm text-ink-soft">Restaurer mes achats</Text>
          </Pressable>
        </View>
      ) : (
        <Text className="mt-4 text-sm text-ink-soft">Aucune offre disponible pour le moment.</Text>
      )}

      {error ? <Text className="mt-3 text-xs text-red-700">{error}</Text> : null}
    </ScrollView>
  );
}
