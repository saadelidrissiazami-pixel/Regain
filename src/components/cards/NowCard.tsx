import type { ComponentProps, ReactNode } from 'react';
import { View } from 'react-native';

import type { CatalogActivity } from '../../features/planning/catalog';
import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_LABELS } from '../../features/planning/types';
import { imageForActivity } from '../../theme/images';
import { useTheme } from '../../theme/ThemeProvider';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { CheckCircle } from '../ui/CheckCircle';
import { Tag } from '../ui/Tag';
import { Text } from '../ui/Text';
import { Thumbnail } from '../ui/Thumbnail';

type IconName = ComponentProps<typeof Thumbnail>['icon'];

/**
 * L'activité à faire maintenant : l'heure, le quoi, le pourquoi, et une seule action.
 * `footer` accueille le check-in « Comment te sens-tu maintenant ? ».
 */
export function NowCard({
  label,
  when,
  activity,
  reason,
  done,
  toggling,
  onToggle,
  onStart,
  footer,
}: {
  label: string;
  when: string;
  activity: CatalogActivity;
  reason?: string | null;
  done: boolean;
  toggling: boolean;
  onToggle: () => void;
  onStart: () => void;
  footer?: ReactNode;
}) {
  const theme = useTheme();
  const description = reason ?? activity.instructions ?? activity.steps[0]?.description ?? null;
  return (
    <Card padding={18} radius={22}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: -6, marginRight: -8 }}>
        <Text variant="cardTitle">{label}</Text>
        <CheckCircle checked={done} busy={toggling} onPress={onToggle} label={activity.title} />
      </View>

      <View style={{ flexDirection: 'row', marginTop: 2 }}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text variant="caption" tone="ink2" tabular>
            {when}
          </Text>
          <Text variant="headline" style={{ marginTop: 6 }}>
            {activity.title}
          </Text>
          <View style={{ marginTop: 8 }}>
            <Tag
              label={CATEGORY_LABELS[activity.category]}
              color={CATEGORY_COLORS[activity.category]}
              suffix={`${activity.duration_minutes} min`}
            />
          </View>
        </View>
        <Thumbnail
          source={imageForActivity(activity.category)}
          width={84}
          height={84}
          radius={16}
          icon={CATEGORY_ICONS[activity.category] as IconName}
          tint={CATEGORY_COLORS[activity.category]}
        />
      </View>

      {description ? (
        <Text variant="bodySm" tone="ink2" style={{ marginTop: 12 }} numberOfLines={3}>
          {description}
        </Text>
      ) : null}

      <View style={{ marginTop: 16 }}>
        <Button label={done ? 'Revoir l’activité' : 'Commencer'} icon={done ? 'eye-outline' : 'play'} onPress={onStart} variant={done ? 'secondary' : 'primary'} />
      </View>

      {footer ? <View style={{ marginTop: 18, paddingTop: 16, borderTopWidth: 1, borderTopColor: theme.divider }}>{footer}</View> : null}
    </Card>
  );
}
