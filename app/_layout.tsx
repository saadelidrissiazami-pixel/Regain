import '../src/styles/global.css';
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/nunito';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Text, TextInput } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { queryClient } from '../src/lib/queryClient';
import { initPurchases } from '../src/lib/purchases';
import { useAuthStore } from '../src/store/authStore';

SplashScreen.preventAutoHideAsync().catch(() => {});

// Applique Nunito comme police par défaut à tous les <Text>/<TextInput> sans
// avoir à répéter une className sur chaque composant de l'app.
const defaultTextStyle = { fontFamily: 'Nunito_400Regular' };
// @ts-expect-error — patch global de defaultProps, technique standard RN pour une police par défaut
Text.defaultProps = { ...(Text.defaultProps ?? {}), style: [defaultTextStyle, Text.defaultProps?.style] };
// @ts-expect-error
TextInput.defaultProps = { ...(TextInput.defaultProps ?? {}), style: [defaultTextStyle, TextInput.defaultProps?.style] };

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

  useEffect(() => {
    if (session?.user.id) initPurchases(session.user.id).catch(() => {});
  }, [session?.user.id]);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

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
