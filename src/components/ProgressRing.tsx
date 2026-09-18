import { View } from 'react-native';
import { Text } from './typography';
import Svg, { Circle } from 'react-native-svg';
import { useAnimatedNumber } from './motion';
import { useTheme } from '../theme/ThemeProvider';

type ProgressRingProps = {
  progress: number; // 0..1
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label: string;
  /** Nombre affiché au centre, qui défile jusqu'à sa valeur. */
  value: number;
  /** Si fourni, affiché après la valeur (« 3/6 »). */
  total?: number;
};

export function ProgressRing({
  progress,
  size = 96,
  strokeWidth = 10,
  color,
  trackColor,
  label,
  value,
  total,
}: ProgressRingProps) {
  const theme = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const animatedProgress = useAnimatedNumber(Math.min(Math.max(progress, 0), 1), 900);
  const animatedValue = Math.round(useAnimatedNumber(value, 900));
  const offset = circumference * (1 - animatedProgress);

  return (
    <View className="items-center">
      <View style={{ width: size, height: size }}>
        {/* La rotation passe par le style RN de ce wrapper plutôt que par les props SVG
            rotation/transform, qui déclenchent un bug de react-native-svg sur web. */}
        <View style={{ transform: [{ rotate: '-90deg' }] }}>
          <Svg width={size} height={size}>
            <Circle cx={size / 2} cy={size / 2} r={radius} stroke={trackColor ?? theme.primarySoft} strokeWidth={strokeWidth} fill="none" />
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={color ?? theme.primary}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </Svg>
        </View>
        <View style={{ position: 'absolute', inset: 0 }} className="items-center justify-center">
          <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold' }} className="text-xl text-ink">
            {total === undefined ? animatedValue : `${animatedValue}/${total}`}
          </Text>
        </View>
      </View>
      <Text style={{ fontFamily: 'Figtree_700Bold' }} className="mt-2 text-xs text-ink-soft">
        {label}
      </Text>
    </View>
  );
}
