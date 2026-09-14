import '../src/styles/global.css';
import { Nunito_400Regular, Nunito_700Bold, Nunito_800ExtraBold, useFonts } from '@expo-google-fonts/nunito';
import { QueryClientProvider } from '@tanstack/react-query';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { queryClient } from '../src/lib/queryClient';
import { initPurchases } from '../src/lib/purchases';
import { useAuthStore } from '../src/store/authStore';

SplashScreen.preventAutoHideAsync().catch(() => {});

// Nunito s'applique via les classes NativeWind `font-body` / `font-label` /
// `font-display` (voir tailwind.config.js). Surtout pas via `Text.defaultProps` :
// le JSX runtime automatique utilisé ici n'applique pas defaultProps, le patch
// était donc silencieusement sans effet et tout le corps de texte restait dans
// la police système.

export default function RootLayout() {
  const init = useAuthStore((s) => s.init);
  const session = useAuthStore((s) => s.session);

  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (session?.user.id) initPurchases(session.user.id).catch(() => {});
  }, [session?.user.id]);

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
