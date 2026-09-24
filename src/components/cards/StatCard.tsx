import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { View } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { Card } from '../ui/Card';
import { Text } from '../ui/Text';

type IconName = ComponentProps<typeof Ionicons>['name'];

/** Évolution en % : flèche + signe, jamais la couleur seule. */
export function Delta({ value }: { value: number }) {
  const theme = useTheme();
  const up = value >= 0;
  return (
    <View
      accessibilityLabel={`${up ? 'Up' : 'Down'} ${Math.abs(value)}% on last week`}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999, backgroundColor: theme.sage100 }}
    >
      <Ionicons name={up ? 'arrow-up' : 'arrow-down'} size={11} color={up ? theme.primary600 : theme.ink2} />
      <Text variant="caption" tone="inherit" style={{ fontSize: 12, color: up ? theme.primary600 : theme.ink2, fontWeight: '700' }}>
        {up ? '+' : '−'}
        {Math.abs(value)} %
      </Text>
    </View>
  );
}

/** Petites barres verticales (7 jours, 10 séances…). Une barre vide = pas de mesure. */
export function MiniBars({
  values,
  max,
  labels,
  color,
  height = 36,
}: {
  values: (number | null)[];
  max: number;
  labels?: string[];
  color?: string;
  height?: number;
}) {
  const theme = useTheme();
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height, gap: 4 }}>
        {values.map((value, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: value === null ? 3 : Math.max(4, (value / max) * height),
              borderRadius: 3,
              backgroundColor: value === null ? theme.sage200 : color ?? theme.primary500,
              opacity: value === null ? 1 : 0.35 + 0.65 * (value / max),
            }}
          />
        ))}
      </View>
      {labels ? (
        <View style={{ flexDirection: 'row', gap: 4, marginTop: 4 }}>
          {labels.map((label, i) => (
            <Text key={i} variant="caption" tone="ink3" center style={{ flex: 1, fontSize: 10, lineHeight: 12 }} maxFontSizeMultiplier={1}>
              {label}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

/** Tuile d'indicateur : question implicite, réponse en gros, détail discret. */
export function StatCard({
  icon,
  iconColor,
  title,
  value,
  unit,
  delta,
  caption,
  children,
  onPress,
  accessibilityLabel,
}: {
  icon?: IconName;
  iconColor?: string;
  title: string;
  value: string;
  unit?: string;
  delta?: number | null;
  caption?: string;
  children?: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
}) {
  const theme = useTheme();
  return (
    <Card
      padding={14}
      radius={18}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel ?? `${title} : ${value}${unit ? ` ${unit}` : ''}${caption ? `, ${caption}` : ''}`}
      style={{ flex: 1, minHeight: 148 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {icon ? <Ionicons name={icon} size={15} color={iconColor ?? theme.primary600} /> : null}
        <Text variant="caption" tone="ink2" numberOfLines={2} style={{ flex: 1 }}>
          {title}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
        <Text variant="headline" tabular numberOfLines={1} adjustsFontSizeToFit>
          {value}
          {unit ? (
            <Text variant="bodySm" tone="ink2">
              {` ${unit}`}
            </Text>
          ) : null}
        </Text>
        {delta !== undefined && delta !== null ? <Delta value={delta} /> : null}
      </View>
      {caption ? (
        <Text variant="caption" tone="ink2" style={{ marginTop: 2 }}>
          {caption}
        </Text>
      ) : null}
      {children ? <View style={{ marginTop: 'auto', paddingTop: 10 }}>{children}</View> : null}
    </Card>
  );
}
