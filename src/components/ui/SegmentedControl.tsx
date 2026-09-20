import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';

import { useTheme } from '../../theme/ThemeProvider';
import { haptic } from './motion';
import { Text } from './Text';

const PADDING = 4;

/** Sélecteur à segments : la pastille verte glisse jusqu'au choix. Pour 2 à 4 options courtes. */
export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  label,
  tone = 'primary',
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  /** Nom du groupe lu par VoiceOver. */
  label?: string;
  /** `primary` = pastille vert foncé (navigation d'écran), `surface` = pastille blanche (formulaires). */
  tone?: 'primary' | 'surface';
}) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const [width, setWidth] = useState(0);
  const index = Math.max(0, options.findIndex((option) => option.value === value));
  const segmentWidth = width > 0 ? (width - PADDING * 2) / options.length : 0;
  const offset = useSharedValue(0);

  useEffect(() => {
    const target = index * segmentWidth;
    offset.set(reduceMotion ? target : withTiming(target, { duration: 200 }));
  }, [index, segmentWidth, offset, reduceMotion]);

  const indicatorStyle = useAnimatedStyle(() => ({ transform: [{ translateX: offset.get() }] }));
  // En sombre, une pastille « surface » se confondrait avec le fond de la carte : on la teinte.
  const selectedBg = tone === 'primary' ? theme.primary : theme.dark ? theme.sage300 : theme.surface;
  const selectedFg = tone === 'primary' ? theme.onPrimary : theme.ink;

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={label}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={{ flexDirection: 'row', padding: PADDING, borderRadius: 14, backgroundColor: theme.sage100 }}
    >
      {segmentWidth > 0 ? (
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: PADDING,
              bottom: PADDING,
              left: PADDING,
              width: segmentWidth,
              borderRadius: 11,
              backgroundColor: selectedBg,
            },
            indicatorStyle,
          ]}
        />
      ) : null}
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={String(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
            onPress={() => {
              if (selected) return;
              haptic.selection();
              onChange(option.value);
            }}
            style={{ flex: 1, minHeight: 40, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}
          >
            <Text
              variant={options.length > 3 ? 'caption' : 'label'}
              tone="inherit"
              numberOfLines={1}
              adjustsFontSizeToFit
              style={{ color: selected ? selectedFg : theme.ink2, fontWeight: selected ? '700' : '500' }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
