import '../src/styles/global.css';
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/nunito';
import { QueryClientProvider } from '@tanstack/react-query';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { queryClient } from '../src/lib/queryClient';
import { initPurchases, onPremiumChange } from '../src/lib/purchases';
import { useAuthStore } from '../src/store/authStore';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const init = useAuthStore((s) => s.init);
  const session = useAuthStore((s) => s.session);

  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  useEffect(() => {
    init();
  }, [init]);

  const userId = session?.user.id;
  useEffect(() => {
    if (!userId) return;
    initPurchases(userId).catch(() => {});
    // Achat, renouvellement ou expiration : le Premium se met à jour sans relancer l'app.
    return onPremiumChange((premium) => queryClient.setQueryData(['premium', userId], premium));
  }, [userId]);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    let subscription: { remove: () => void } | undefined;
    import('expo-notifications').then((Notifications) => {
      subscription = Notifications.addNotificationResponseReceivedListener((response) => {
        const route = response.notification.request.content.data?.route;
        if (typeof route === 'string') router.push(route as never);
      });
    });
    return () => subscription?.remove();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
