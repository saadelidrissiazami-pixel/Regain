import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { useWindowDimensions, View } from 'react-native';

import { haptic, PressableScale, ProgressRing, Text } from '../../../components/ui';
import { useTheme } from '../../../theme/ThemeProvider';
import { formatClock } from './useSessionClock';

/** The large session ring, with the timer (or the player's content) at its centre. */
export function SessionRing({
  progress,
  elapsed,
  total,
  children,
}: {
  progress: number;
  elapsed?: number;
  total?: number;
  children?: ReactNode;
}) {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const size = Math.max(168, Math.min(width * 0.6, height * 0.3, 250));
  return (
    <View style={{ alignItems: 'center' }}>
      <ProgressRing
        progress={progress}
        size={size}
        strokeWidth={10}
        animate={false}
        trackColor={theme.dark ? theme.sage200 : 'rgba(255,255,255,0.7)'}
        color={theme.primary600}
        accessibilityLabel={elapsed !== undefined && total !== undefined ? `${formatClock(elapsed)} of ${formatClock(total)}` : 'Session progress'}
      >
        {children ?? (
          <>
            <Text variant="display" tabular style={{ fontSize: size * 0.2, lineHeight: size * 0.24 }}>
              {formatClock(elapsed ?? 0)}
            </Text>
            <Text variant="caption" tone="ink2" tabular>
              of {formatClock(total ?? 0)}
            </Text>
          </>
        )}
      </ProgressRing>
    </View>
  );
}

function SeekButton({ direction, onPress }: { direction: -1 | 1; onPress: () => void }) {
  const theme = useTheme();
  return (
    <PressableScale
      onPress={() => {
        haptic.selection();
        onPress();
      }}
      feedback={null}
      accessibilityRole="button"
      accessibilityLabel={direction < 0 ? 'Back 15 seconds' : 'Forward 15 seconds'}
      style={{ width: 56, height: 56, alignItems: 'center', justifyContent: 'center' }}
    >
      <Ionicons name={direction < 0 ? 'refresh' : 'refresh'} size={30} color={theme.ink} style={direction < 0 ? { transform: [{ scaleX: -1 }] } : undefined} />
      <Text variant="caption" style={{ position: 'absolute', fontSize: 10, fontWeight: '700', top: 22 }} maxFontSizeMultiplier={1}>
        15
      </Text>
    </PressableScale>
  );
}

/** −15 s · play / pause · +15 s. Without `onSeek`, only the central button is shown. */
export function SessionControls({
  running,
  onToggle,
  onSeek,
}: {
  running: boolean;
  onToggle: () => void;
  onSeek?: (delta: number) => void;
}) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 28 }}>
      {onSeek ? <SeekButton direction={-1} onPress={() => onSeek(-15)} /> : null}
      <PressableScale
        onPress={onToggle}
        feedback="medium"
        accessibilityRole="button"
        accessibilityLabel={running ? 'Pause' : 'Resume'}
        style={{ width: 68, height: 68, borderRadius: 34, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center' }}
      >
        <Ionicons name={running ? 'pause' : 'play'} size={28} color={theme.onPrimary} style={running ? undefined : { marginLeft: 3 }} />
      </PressableScale>
      {onSeek ? <SeekButton direction={1} onPress={() => onSeek(15)} /> : null}
    </View>
  );
}
