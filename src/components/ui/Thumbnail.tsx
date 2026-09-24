import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { ComponentProps, ReactNode } from 'react';
import { Image, View, type DimensionValue, type ImageSourcePropType } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';

type IconName = ComponentProps<typeof Ionicons>['name'];

/**
 * An illustrative image. With no photo, a soft sage gradient and an icon take over, so the
 * layout stays the same.
 */
export function Thumbnail({
  source,
  width,
  height,
  radius = 14,
  icon = 'leaf-outline',
  tint,
  children,
}: {
  source?: ImageSourcePropType;
  width: DimensionValue;
  height: DimensionValue;
  radius?: number;
  icon?: IconName;
  /** The fallback icon's colour (the category's colour). */
  tint?: string;
  children?: ReactNode;
}) {
  const theme = useTheme();
  return (
    <View
      style={{ width, height, borderRadius: radius, overflow: 'hidden', backgroundColor: theme.sage100 }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {source ? (
        <Image source={source} resizeMode="cover" style={{ width: '100%', height: '100%' }} />
      ) : (
        <LinearGradient
          colors={[theme.sage200, theme.sage100]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name={icon} size={26} color={tint ?? theme.primary600} style={{ opacity: 0.8 }} />
        </LinearGradient>
      )}
      {children ? <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>{children}</View> : null}
    </View>
  );
}
