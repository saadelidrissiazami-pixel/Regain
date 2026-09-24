import type { ReactNode } from 'react';
import { View } from 'react-native';

import { IconButton } from './IconButton';
import { Text } from './Text';

/**
 * En-tête d'écran : petite ligne de contexte (date, « Votre coach »), grand titre, sous-titre,
 * et une action discrète à droite (avatar, réglages, recherche). `onBack` ajoute un retour.
 */
export function ScreenHeader({
  overline,
  title,
  subtitle,
  right,
  onBack,
  backLabel = 'Back',
  size = 'title',
}: {
  overline?: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onBack?: () => void;
  backLabel?: string;
  size?: 'display' | 'title' | 'headline';
}) {
  return (
    <View style={{ marginBottom: 20 }}>
      {onBack ? (
        <View style={{ marginLeft: -10, marginBottom: 4 }}>
          <IconButton icon="chevron-back" label={backLabel} onPress={onBack} size={26} />
        </View>
      ) : null}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, paddingRight: right ? 12 : 0 }}>
          {overline ? (
            <Text variant="caption" tone="ink2" style={{ marginBottom: 4 }}>
              {overline}
            </Text>
          ) : null}
          <Text variant={size} accessibilityRole="header">
            {title}
          </Text>
          {subtitle ? (
            <Text variant="bodySm" tone="ink2" style={{ marginTop: 6 }}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {right ? <View style={{ marginTop: overline ? 8 : 0 }}>{right}</View> : null}
      </View>
    </View>
  );
}
