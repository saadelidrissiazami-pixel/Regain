import { useQuery } from '@tanstack/react-query';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useTheme } from '../src/theme/ThemeProvider';

import { fetchProfile } from '../src/lib/profile';
import { useAuthStore } from '../src/store/authStore';

export default function Index() {
  const theme = useTheme();
  const { session, isInitialized } = useAuthStore();

  const profileQuery = useQuery({
    queryKey: ['profile', session?.user.id],
    queryFn: () => fetchProfile(session!.user.id),
    enabled: !!session?.user.id,
  });

  if (!isInitialized || (session && profileQuery.isLoading)) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bg }}>
        <ActivityIndicator color={theme.primary600} accessibilityLabel="Chargement" />
      </View>
    );
  }

  if (!session) return <Redirect href="/(auth)/sign-in" />;
  if (!profileQuery.data?.onboarding_completed_at) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)/planning" />;
}
