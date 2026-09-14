import { View } from 'react-native';
import { Text } from './typography';
import { CATEGORY_COLORS, CATEGORY_LABELS, type ActivityCategory } from '../features/planning/types';

export function CategoryBadge({ category, suffix }: { category: ActivityCategory; suffix?: string }) {
  const color = CATEGORY_COLORS[category];
  return (
    <View className="flex-row items-center self-start rounded-full px-2.5 py-1" style={{ backgroundColor: color }}>
      <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-[11px] uppercase tracking-wide text-white">
        {CATEGORY_LABELS[category]}
        {suffix ? ` · ${suffix}` : ''}
      </Text>
    </View>
  );
}
