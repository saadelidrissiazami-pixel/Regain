import { Ionicons } from '@expo/vector-icons';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { ActivityIndicator, View } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { haptic, PressableScale } from './motion';

/** A tickable completion mark: a 28 px circle inside a 44 px touch target. */
export function CheckCircle({
  checked,
  onPress,
  busy,
  label,
  size = 28,
}: {
  checked: boolean;
  onPress?: () => void;
  busy?: boolean;
  /** What is being ticked, as VoiceOver reads it: “Body scan”. */
  label: string;
  size?: number;
}) {
  const theme = useTheme();
  const circle = (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: checked ? theme.primary600 : 'transparent',
        borderWidth: checked ? 0 : 2,
        borderColor: theme.line,
      }}
    >
      {busy ? (
        <ActivityIndicator size="small" color={checked ? theme.onPrimary : theme.primary600} />
      ) : checked ? (
        <Animated.View entering={ZoomIn.duration(200)}>
          <Ionicons name="checkmark" size={size * 0.6} color={theme.dark ? theme.bg : '#FFFFFF'} />
        </Animated.View>
      ) : null}
    </View>
  );
  if (!onPress) return <View style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>{circle}</View>;
  return (
    <PressableScale
      onPress={() => {
        if (!checked) haptic.success();
        onPress();
      }}
      disabled={busy}
      scaleTo={0.88}
      feedback={null}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, busy: !!busy }}
      accessibilityLabel={checked ? `${label}: done` : `Mark “${label}” as done`}
      style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
    >
      {circle}
    </PressableScale>
  );
}
