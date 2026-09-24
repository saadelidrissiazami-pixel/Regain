import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useTheme } from '../../theme/ThemeProvider';
import { useAnimatedNumber } from './motion';

/** A progress ring (0..1). The centre is free: a timer, a counter, an icon. */
export function ProgressRing({
  progress,
  size = 96,
  strokeWidth = 10,
  color,
  trackColor,
  animate = true,
  children,
  accessibilityLabel,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  /** false for a timer that already advances second by second. */
  animate?: boolean;
  children?: ReactNode;
  accessibilityLabel?: string;
}) {
  const theme = useTheme();
  const clamped = Math.min(Math.max(progress, 0), 1);
  const animated = useAnimatedNumber(clamped, 700);
  const shown = animate ? animated : clamped;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <View
      style={{ width: size, height: size }}
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityLabel ? 'progressbar' : undefined}
      accessibilityValue={accessibilityLabel ? { min: 0, max: 100, now: Math.round(clamped * 100) } : undefined}
    >
      {/* The rotation goes through this wrapper's RN style rather than the SVG
          rotation/transform props, which trigger a react-native-svg bug on the web. */}
      <View style={{ transform: [{ rotate: '-90deg' }] }}>
        <Svg width={size} height={size}>
          <Circle cx={size / 2} cy={size / 2} r={radius} stroke={trackColor ?? theme.sage200} strokeWidth={strokeWidth} fill="none" />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color ?? theme.primary600}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - shown)}
          />
        </Svg>
      </View>
      {children ? (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
          {children}
        </View>
      ) : null}
    </View>
  );
}
