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

// RevenueCat warns on every start when a sandbox key is in use. That is accurate and wanted in
// development, where subscriptions are tested without going through the App Store — but the
// warning covers the bottom of the screen on every launch, screenshots included.
// Production is unaffected: it uses a real key, and LogBox does not exist there.
LogBox.ignoreLogs(['[RevenueCat] ⚠️ Using a Test Store API key.']);

SplashScreen.preventAutoHideAsync().catch(() => {});

// SF Pro (the system font) on iOS: Inter is only loaded for Android and the web.
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
    // Purchase, renewal or expiry: Premium updates without restarting the app.
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
