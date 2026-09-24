import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { MOOD_OPTIONS } from '../../features/wellbeing/reflection';
import { useTheme } from '../../theme/ThemeProvider';
import { haptic, Pop, PressableScale } from '../ui/motion';
import { Text } from '../ui/Text';

/** Visage au trait : la bouche passe de la moue (1) au grand sourire (5). */
function Face({ level, color, size = 30 }: { level: number; color: string; size?: number }) {
  // The curve of the mouth: negative is a frown, positive a smile.
  const curve = [-5, -2.5, 0, 3, 5.5][level - 1];
  const mouthY = 21 - curve / 2;
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Circle cx="16" cy="16" r="13" stroke={color} strokeWidth="2" fill="none" />
      <Circle cx="11.5" cy="13" r="1.7" fill={color} />
      <Circle cx="20.5" cy="13" r="1.7" fill={color} />
      <Path d={`M10.5 ${mouthY} Q16 ${mouthY + curve} 21.5 ${mouthY}`} stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

/** How the session felt, on 5 levels. The label always stays visible (never colour alone). */
export function MoodScale({ value, onChange }: { value: number | null; onChange: (value: number) => void }) {
  const theme = useTheme();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel="How do you feel after this session?" style={{ flexDirection: 'row', gap: 4 }}>
      {MOOD_OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <PressableScale
            key={option.value}
            onPress={() => {
              haptic.selection();
              onChange(option.value);
            }}
            feedback={null}
            scaleTo={0.94}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
            wrapperStyle={{ flex: 1 }}
            style={{ alignItems: 'center', paddingVertical: 4, minHeight: 44 }}
          >
            <Pop trigger={selected}>
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: selected ? theme.primary : theme.sage100,
                }}
              >
                <Face level={option.value} color={selected ? theme.onPrimary : theme.primary700} />
              </View>
            </Pop>
            <Text
              variant="caption"
              tone="inherit"
              center
              numberOfLines={2}
              style={{ marginTop: 8, fontSize: 12, lineHeight: 15, color: selected ? theme.primary600 : theme.ink2, fontWeight: selected ? '700' : '500' }}
            >
              {option.label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}
