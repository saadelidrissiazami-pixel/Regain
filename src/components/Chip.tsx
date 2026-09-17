import { Ionicons } from '@expo/vector-icons';
import { Text } from './typography';
import { PressableScale } from './motion';

type ChipProps = { selected: boolean; label: string; onPress: () => void };

export function Chip({ selected, label, onPress }: ChipProps) {
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
      {selected ? <Ionicons name="checkmark" size={14} color="#FFFFFF" style={{ marginRight: 4 }} /> : null}
      <Text
        style={{ fontFamily: 'Nunito_700Bold' }}
        className={selected ? 'text-sm text-white' : 'text-sm text-ink'}
      >
        {label}
      </Text>
    </PressableScale>
  );
}
