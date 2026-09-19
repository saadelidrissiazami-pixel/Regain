import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../ui/Text';

/** Message court sous une action : succès, information ou erreur (jamais la couleur seule). */
export function InlineNotice({ tone = 'info', message }: { tone?: 'info' | 'success' | 'error'; message: string }) {
  const theme = useTheme();
  const icon = tone === 'error' ? 'alert-circle-outline' : tone === 'success' ? 'checkmark-circle-outline' : 'information-circle-outline';
  const color = tone === 'error' ? theme.danger : tone === 'success' ? theme.primary600 : theme.ink2;
  return (
    <Animated.View entering={FadeIn.duration(180)} accessibilityLiveRegion="polite" accessibilityRole={tone === 'error' ? 'alert' : undefined}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 10 }}>
        <Ionicons name={icon} size={18} color={color} style={{ marginTop: 1 }} />
        <Text variant="caption" tone="inherit" style={{ color, flex: 1 }}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}

/** Message d'erreur lisible à partir de n'importe quelle erreur (réseau, Supabase, etc.). */
export function errorMessage(error: unknown, fallback = 'Une erreur est survenue. Réessaie dans un instant.'): string {
  if (error instanceof Error && error.message) {
    if (/network|fetch|Failed to fetch|timeout/i.test(error.message)) {
      return 'La connexion semble interrompue. Vérifie ton réseau, puis réessaie.';
    }
    return error.message;
  }
  return fallback;
}
