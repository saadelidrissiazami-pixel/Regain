import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import type { CatalogActivity } from '../../features/planning/catalog';
import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_LABELS } from '../../features/planning/types';
import { imageForActivity } from '../../theme/images';
import { useTheme } from '../../theme/ThemeProvider';
import { Card } from '../ui/Card';
import { Tag } from '../ui/Tag';
import { Text } from '../ui/Text';
import { Thumbnail } from '../ui/Thumbnail';
import type { ComponentProps } from 'react';

type IconName = ComponentProps<typeof Ionicons>['name'];

/** The next activity, in compact form. */
export function NextUpCard({ when, activity, onPress }: { when: string; activity: CatalogActivity; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Card
      padding={14}
      onPress={onPress}
      accessibilityLabel={`${when}, ${activity.title}, ${CATEGORY_LABELS[activity.category]}, ${activity.duration_minutes} minutes`}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: theme.sage100,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <Ionicons name={CATEGORY_ICONS[activity.category] as IconName} size={19} color={theme.primary600} />
        </View>
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text variant="caption" tone="ink2" tabular>
            {when}
          </Text>
          <Text variant="label" style={{ marginTop: 2 }} numberOfLines={2}>
            {activity.title}
          </Text>
          <View style={{ marginTop: 4 }}>
            <Tag
              label={CATEGORY_LABELS[activity.category]}
              color={CATEGORY_COLORS[activity.category]}
              suffix={`${activity.duration_minutes} min`}
            />
          </View>
        </View>
        <Thumbnail
          source={imageForActivity(activity.category)}
          width={64}
          height={64}
          radius={14}
          icon={CATEGORY_ICONS[activity.category] as IconName}
          tint={CATEGORY_COLORS[activity.category]}
        />
      </View>
    </Card>
  );
}
