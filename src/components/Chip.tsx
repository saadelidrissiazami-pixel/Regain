import { Ionicons } from '@expo/vector-icons';
import { Text } from './typography';
import { PressableScale } from './motion';
import { useTheme } from '../theme/ThemeProvider';

type ChipProps = { selected: boolean; label: string; onPress: () => void };

export function Chip({ selected, label, onPress }: ChipProps) {
  const theme = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.93}
      feedback="selection"
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      wrapperStyle={{ marginRight: 8, marginBottom: 8 }}
      className={`flex-row items-center rounded-full border px-4 py-2.5 ${
        selected ? 'border-primary bg-primary' : 'border-line bg-surface'
      }`}
    >
      {selected ? <Ionicons name="checkmark" size={14} color={theme.onPrimary} style={{ marginRight: 4 }} /> : null}
      <Text
        style={{ fontFamily: 'Figtree_700Bold' }}
        className={selected ? 'text-sm text-on-primary' : 'text-sm text-ink'}
      >
        {label}
      </Text>
    </PressableScale>
  );
}
