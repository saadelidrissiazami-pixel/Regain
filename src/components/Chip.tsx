import { Pressable, Text } from 'react-native';

type ChipProps = { selected: boolean; label: string; onPress: () => void };

export function Chip({ selected, label, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`mb-2 mr-2 rounded-full border px-4 py-2.5 ${
        selected ? 'border-primary bg-primary' : 'border-line bg-surface'
      }`}
    >
      <Text
        style={{ fontFamily: 'Nunito_700Bold' }}
        className={selected ? 'text-sm text-white' : 'text-sm text-ink'}
      >
        {label}
      </Text>
    </Pressable>
  );
}
