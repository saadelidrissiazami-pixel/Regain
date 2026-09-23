import '../src/styles/global.css';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/inter';
import { QueryClientProvider } from '@tanstack/react-query';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { LogBox, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { queryClient } from '../src/lib/queryClient';
import { initPurchases, onPremiumChange } from '../src/lib/purchases';
import { ThemeProvider } from '../src/theme/ThemeProvider';
import { useAuthStore } from '../src/store/authStore';

// RevenueCat avertit à chaque démarrage quand on utilise une clé de bac à sable. C'est exact et
// voulu en développement, où l'on teste les abonnements sans passer par l'App Store — mais
// l'avertissement recouvre le bas de l'écran à chaque lancement, y compris pendant les captures.
// La production n'est pas concernée : elle utilise une vraie clé, et LogBox n'y existe pas.
LogBox.ignoreLogs(['[RevenueCat] ⚠️ Using a Test Store API key.']);

SplashScreen.preventAutoHideAsync().catch(() => {});

// SF Pro (police système) sur iOS : Inter n'est chargée que pour Android et le web.
const FONTS =
  Platform.OS === 'ios' ? {} : { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold };

export default function RootLayout() {
  const init = useAuthStore((s) => s.init);
  const session = useAuthStore((s) => s.session);

  const [interLoaded] = useFonts(FONTS);
  const fontsLoaded = Platform.OS === 'ios' || interLoaded;

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
        <ThemeProvider>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }} />
        </ThemeProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
