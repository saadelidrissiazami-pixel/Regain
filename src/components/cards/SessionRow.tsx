import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { sessionTitle } from '../../features/fitness/schedule';
import type { WorkoutSession } from '../../features/fitness/types';
import { imageForWorkout } from '../../theme/images';
import { useTheme } from '../../theme/ThemeProvider';
import { Card } from '../ui/Card';
import { Text } from '../ui/Text';
import { Thumbnail } from '../ui/Thumbnail';

/** Une séance du programme : vignette, titre, durée et nombre d'exercices. */
export function SessionRow({ session, onPress, done }: { session: WorkoutSession; onPress: () => void; done?: boolean }) {
  const theme = useTheme();
  const title = sessionTitle(session);
  return (
    <Card
      padding={10}
      onPress={onPress}
      style={{ marginBottom: 10 }}
      accessibilityLabel={`${title}, ${session.duration_minutes} minutes, ${session.exercises.length} exercises${done ? ', done this week' : ''}`}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Thumbnail source={imageForWorkout(session.focus)} width={68} height={68} radius={14} icon="barbell-outline" />
        <View style={{ flex: 1, paddingHorizontal: 12 }}>
          <Text variant="label" numberOfLines={2}>
            {title}
          </Text>
          <Text variant="caption" tone="ink2" style={{ marginTop: 3 }}>
            {session.duration_minutes} min · {session.exercises.length} exercises
          </Text>
          {done ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
              <Ionicons name="checkmark-circle" size={14} color={theme.primary600} />
              <Text variant="caption" tone="accent">
                Done this week
              </Text>
            </View>
          ) : null}
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.ink3} style={{ marginRight: 6 }} />
      </View>
    </Card>
  );
}
