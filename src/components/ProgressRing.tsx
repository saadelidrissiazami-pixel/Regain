import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

type ProgressRingProps = {
  progress: number; // 0..1
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label: string;
  value: string;
};

export function ProgressRing({
  progress,
  size = 96,
  strokeWidth = 10,
  color = '#FF6B57',
  trackColor = '#FFE4DD',
  label,
  value,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(Math.max(progress, 0), 1));

  return (
    <View className="items-center">
      <View style={{ width: size, height: size }}>
        {/* La rotation passe par le style RN de ce wrapper plutôt que par les props SVG
            rotation/transform, qui déclenchent un bug de react-native-svg sur web. */}
        <View style={{ transform: [{ rotate: '-90deg' }] }}>
          <Svg width={size} height={size}>
            <Circle cx={size / 2} cy={size / 2} r={radius} stroke={trackColor} strokeWidth={strokeWidth} fill="none" />
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </Svg>
        </View>
        <View style={{ position: 'absolute', inset: 0 }} className="items-center justify-center">
          <Text className="font-display text-xl text-ink">
            {value}
          </Text>
        </View>
      </View>
      <Text className="font-label mt-2 text-xs text-ink-soft">
        {label}
      </Text>
    </View>
  );
}
