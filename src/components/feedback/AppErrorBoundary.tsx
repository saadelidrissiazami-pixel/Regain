import type { ErrorBoundaryProps } from 'expo-router';
import { Pressable, ScrollView, Text, useColorScheme, View } from 'react-native';

import { isDev, messageOf } from '../../lib/errors';
import { t } from '../../lib/i18n';

/**
 * The last screen before a white one.
 *
 * Without it, a render error anywhere takes the whole app down. That is a bad moment to hand
 * anybody, and a worse one here: the person may have opened a panic session thirty seconds ago.
 * So this says that nothing they recorded is lost, and offers one button.
 *
 * It deliberately uses nothing from the app: no ThemeProvider, no icon font, no Text component of
 * ours. Whatever broke might be one of those, and a crash screen that crashes shows the white one
 * it was written to prevent. Plain react-native primitives, and colours read straight from the
 * system rather than from a provider that may never have mounted.
 */
export function AppErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const dark = useColorScheme() === 'dark';
  const ink = dark ? '#F2F2F0' : '#1C1C1A';
  const ink2 = dark ? '#A8A8A4' : '#6B6B66';

  return (
    <View style={{ flex: 1, backgroundColor: dark ? '#17170F' : '#FBFAF7', justifyContent: 'center', padding: 28 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', color: ink, marginBottom: 12 }}>
        {t('The app stopped short')}
      </Text>
      <Text style={{ fontSize: 16, lineHeight: 24, color: ink2 }}>
        {t('Nothing you recorded is lost. Start again below, and if it happens twice, close the app and reopen it.')}
      </Text>

      <Pressable
        onPress={() => void retry()}
        accessibilityRole="button"
        style={({ pressed }) => ({
          marginTop: 28,
          paddingVertical: 16,
          borderRadius: 16,
          alignItems: 'center',
          backgroundColor: pressed ? '#4F6B4A' : '#5E7F57',
        })}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' }}>{t('Start again')}</Text>
      </Pressable>

      {/* The cause, in development only. In a build somebody uses, a stack trace is noise at best
          and alarming at worst — and there is nothing they could do with it. */}
      {isDev() ? (
        <ScrollView style={{ marginTop: 24, maxHeight: 180 }}>
          <Text selectable style={{ fontSize: 12, color: ink2, fontFamily: 'Courier' }}>
            {messageOf(error) || String(error)}
            {'\n\n'}
            {error.stack}
          </Text>
        </ScrollView>
      ) : null}
    </View>
  );
}
