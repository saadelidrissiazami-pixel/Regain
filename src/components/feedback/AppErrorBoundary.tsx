import type { ErrorBoundaryProps } from 'expo-router';
import { Pressable, ScrollView, Text, useColorScheme, View } from 'react-native';

import { isDev, messageOf } from '../../lib/errors';
import { t } from '../../lib/i18n';

/** The first line of the stack that is not framework noise: enough to name the screen at fault. */
function topFrame(error: Error): string {
  const frame = (error.stack ?? '')
    .split('\n')
    .slice(1)
    .find((line) => !/node_modules|\[native code\]/.test(line));
  return frame ? `\n${frame.trim()}` : '';
}

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
        // A plain object with an opacity on press: the button has to look like one even if the
        // style function is the thing that went wrong.
        style={({ pressed }) => [
          {
            marginTop: 28,
            paddingVertical: 16,
            paddingHorizontal: 24,
            borderRadius: 16,
            alignItems: 'center',
            backgroundColor: '#5E7F57',
          },
          pressed && { opacity: 0.8 },
        ]}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' }}>{t('Start again')}</Text>
      </Pressable>

      {/*
        The cause, always — not only in development.

        It used to be hidden outside dev, on the grounds that a stack trace is noise to anybody
        who did not write the app. That reasoning cost a diagnosis: somebody hit this screen on a
        real phone and there was nothing to go on, not even a sentence. One selectable line that
        can be read aloud or long-pressed and copied is worth more than the silence it replaces.
        The whole stack stays behind __DEV__, where it is read rather than endured.
      */}
      <ScrollView style={{ marginTop: 24, maxHeight: isDev() ? 180 : 96 }}>
        <Text selectable style={{ fontSize: 12, lineHeight: 18, color: ink2, fontFamily: 'Courier' }}>
          {messageOf(error) || String(error)}
          {isDev() ? `\n\n${error.stack ?? ''}` : topFrame(error)}
        </Text>
      </ScrollView>
    </View>
  );
}
