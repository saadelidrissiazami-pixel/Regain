import { Image, View, type ImageSourcePropType } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { font } from '../../theme/typography';
import { Text } from './Text';

/** An initial on a sage ground (or a photo, when one is given). */
export function Avatar({ name, size = 44, source }: { name: string; size?: number; source?: ImageSourcePropType }) {
  const theme = useTheme();
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  if (source) {
    return <Image source={source} style={{ width: size, height: size, borderRadius: size / 2 }} accessibilityIgnoresInvertColors />;
  }
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: theme.sage200,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        tone="inherit"
        style={[font(700), { color: theme.primary700, fontSize: size * 0.42, lineHeight: size * 0.52 }]}
        maxFontSizeMultiplier={1}
      >
        {initial}
      </Text>
    </View>
  );
}
