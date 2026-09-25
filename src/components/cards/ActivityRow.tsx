import { View } from 'react-native';

import type { CatalogActivity } from '../../features/planning/catalog';
import { t } from '../../lib/i18n';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../../features/planning/types';
import { useTheme } from '../../theme/ThemeProvider';
import { CheckCircle } from '../ui/CheckCircle';
import { PressableScale } from '../ui/motion';
import { Tag } from '../ui/Tag';
import { Text } from '../ui/Text';

/** A row of the plan: the time in a box, the activity, and its completion tick. */
export function ActivityRow({
  time,
  activity,
  done,
  toggling,
  onToggle,
  onPress,
}: {
  time: string;
  activity: CatalogActivity;
  done: boolean;
  toggling: boolean;
  onToggle: () => void;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: theme.line,
        backgroundColor: done ? theme.sage100 : theme.surface,
        paddingLeft: 12,
        paddingRight: 4,
        paddingVertical: 10,
      }}
    >
      <PressableScale
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={
          t('{time}, {title}, {category}, {minutes} minutes', {
            time,
            title: activity.title,
            category: CATEGORY_LABELS[activity.category],
            minutes: activity.duration_minutes,
          }) + (done ? `, ${t('done')}` : '')
        }
        wrapperStyle={{ flex: 1 }}
        style={{ flexDirection: 'row', alignItems: 'center' }}
      >
        <View
          style={{
            width: 58,
            minHeight: 44,
            borderRadius: 12,
            backgroundColor: done ? theme.surface : theme.sage100,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <Text variant="label" tabular maxFontSizeMultiplier={1.2}>
            {time}
          </Text>
        </View>
        <View style={{ flex: 1, paddingRight: 4 }}>
          <Text
            variant="bodyStrong"
            tone={done ? 'ink2' : 'ink'}
            style={done ? { textDecorationLine: 'line-through' } : undefined}
            numberOfLines={2}
          >
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
      </PressableScale>
      <CheckCircle checked={done} busy={toggling} onPress={onToggle} label={activity.title} />
    </View>
  );
}
