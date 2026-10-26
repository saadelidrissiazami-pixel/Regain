import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { PanResponder, View, type GestureResponderEvent } from 'react-native';

import { at } from './sliderPosition';
import { Text } from './Text';
import { useTheme } from '../../theme/ThemeProvider';

const TRACK_HEIGHT = 4;
const THUMB = 26;

/**
 * One control between two things that compete for the same ears.
 *
 * Written with PanResponder rather than a slider package: the app carries no gesture library,
 * and a horizontal drag on a known width is the one gesture this needs. The value is read from
 * the drag's position on the track, never accumulated from deltas, so a finger that leaves the
 * track and comes back lands where it looks like it should.
 */
export function BalanceSlider({
  value,
  onChange,
  onSettle,
  leftLabel,
  rightLabel,
  leftIcon = 'leaf-outline',
  rightIcon = 'mic-outline',
  accessibilityLabel,
}: {
  value: number;
  onChange: (value: number) => void;
  /** Called when the finger lifts: the moment worth writing to storage. */
  onSettle?: () => void;
  leftLabel: string;
  rightLabel: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  accessibilityLabel: string;
}) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);

  // Rebuilt when the track is measured, and only then. It deliberately closes over nothing that
  // changes during a drag: the position it last computed lives in `last`, so releasing reports
  // what the finger did rather than what React has re-rendered since.
  const responder = useMemo(() => {
    const to = (event: GestureResponderEvent) => onChange(at(event.nativeEvent.locationX, width));
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: to,
      onPanResponderMove: to,
      // No argument: the parent already holds the value every move reported to it, and a
      // variable kept alive across renders to repeat it back is a second source of truth.
      onPanResponderRelease: () => onSettle?.(),
    });
  }, [width, onChange, onSettle]);

  const filled = Math.min(1, Math.max(0, value));

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(filled * 100) }}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === 'increment') onChange(Math.min(1, filled + 0.1));
        if (event.nativeEvent.actionName === 'decrement') onChange(Math.max(0, filled - 0.1));
        onSettle?.();
      }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Ionicons name={leftIcon} size={18} color={theme.ink2} />
        <View
          style={{ flex: 1, height: THUMB, justifyContent: 'center' }}
          onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
          {...responder.panHandlers}
        >
          <View style={{ height: TRACK_HEIGHT, borderRadius: TRACK_HEIGHT, backgroundColor: theme.line }} />
          <View
            style={{
              position: 'absolute',
              left: Math.max(0, filled * width - THUMB / 2),
              width: THUMB,
              height: THUMB,
              borderRadius: THUMB / 2,
              backgroundColor: theme.primary600,
            }}
          />
        </View>
        <Ionicons name={rightIcon} size={18} color={theme.ink2} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
        <Text variant="caption" tone="ink2">
          {leftLabel}
        </Text>
        <Text variant="caption" tone="ink2">
          {rightLabel}
        </Text>
      </View>
    </View>
  );
}
