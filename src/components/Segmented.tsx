import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { haptic } from './motion';
import { Text } from './typography';

const PADDING = 4;

/** Sélecteur à segments : le fond blanc glisse jusqu'au choix. Pour 2 à 4 options courtes. */
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
}) {
  const [width, setWidth] = useState(0);
  const index = Math.max(0, options.findIndex((option) => option.value === value));
  const segmentWidth = width > 0 ? (width - PADDING * 2) / options.length : 0;
  const offset = useSharedValue(0);

  useEffect(() => {
    offset.set(withSpring(index * segmentWidth, { damping: 20, stiffness: 220 }));
  }, [index, segmentWidth, offset]);

  const indicatorStyle = useAnimatedStyle(() => ({ transform: [{ translateX: offset.get() }] }));

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      className="mb-3 flex-row rounded-full border border-line bg-paper"
      style={{ padding: PADDING }}
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
              borderRadius: 999,
              backgroundColor: '#FFFFFF',
              shadowColor: '#2B2620',
              shadowOpacity: 0.08,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
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
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => {
              haptic.selection();
              onChange(option.value);
            }}
            className="flex-1 items-center justify-center py-2.5"
          >
            <Text
              style={{ fontFamily: selected ? 'Nunito_800ExtraBold' : 'Nunito_700Bold' }}
              className={`text-sm ${selected ? 'text-primary' : 'text-ink-soft'}`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
