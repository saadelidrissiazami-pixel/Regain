import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { t } from '../../lib/i18n';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../ui/Text';

/** A short message under an action: success, information or error (never colour alone). */
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

/** A readable message out of any error (network, Supabase, and the rest). */
export function errorMessage(error: unknown, fallback = t('Something went wrong. Try again in a moment.')): string {
  if (error instanceof Error && error.message) {
    if (/network|fetch|Failed to fetch|timeout/i.test(error.message)) {
      return t('The connection looks interrupted. Check your network, then try again.');
    }
    return error.message;
  }
  return fallback;
}
