import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { shortFocus } from '../../features/fitness/schedule';
import type { WorkoutSession } from '../../features/fitness/types';
import { imageForWorkout } from '../../theme/images';
import { useTheme } from '../../theme/ThemeProvider';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Pill } from '../ui/Tag';
import { Text } from '../ui/Text';
import { Thumbnail } from '../ui/Thumbnail';

/** The next session: when, what, how long, and the button to start. */
export function WorkoutHeroCard({
  when,
  session,
  deload,
  onStart,
}: {
  when: string | null;
  session: WorkoutSession;
  deload: boolean;
  onStart: () => void;
}) {
  const theme = useTheme();
  const title = shortFocus(session.focus);
  const muscles = session.focus.slice(title.length).replace(/^\s*[—-]\s*/, '');
  return (
    <Card padding={18} radius={22}>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="barbell" size={18} color={theme.ink} />
            <Text variant="label">Next session</Text>
          </View>
          {when ? (
            <Text variant="caption" tone="ink2" tabular style={{ marginTop: 10 }}>
              {when}
            </Text>
          ) : null}
          <Text variant="headline" style={{ marginTop: 4 }}>
            {title}
          </Text>
          {muscles ? (
            <Text variant="caption" tone="ink2" style={{ marginTop: 2 }} numberOfLines={2}>
              {muscles}
            </Text>
          ) : null}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <Ionicons name="time-outline" size={14} color={theme.ink2} />
            <Text variant="caption" tone="ink2">
              {session.duration_minutes} min · {session.exercises.length} exercises
            </Text>
          </View>
        </View>
        <Thumbnail source={imageForWorkout(session.focus)} width={112} height={128} radius={16} icon="barbell-outline" />
      </View>

      <View style={{ marginTop: 16 }}>
        <Button label="Start the session" icon="play" onPress={onStart} />
      </View>
      {deload ? (
        <View style={{ marginTop: 12 }}>
          <Pill icon="leaf" label="Eased off for this week" />
        </View>
      ) : null}
    </Card>
  );
}
