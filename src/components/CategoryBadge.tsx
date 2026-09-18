import { View } from 'react-native';
import { Text } from './typography';
import { CATEGORY_COLORS, CATEGORY_LABELS, type ActivityCategory } from '../features/planning/types';

/** Catégorie en libellé discret : un point de couleur, pas une pastille pleine qui vole la vedette. */
export function CategoryBadge({ category, suffix }: { category: ActivityCategory; suffix?: string }) {
  return (
    <View className="flex-row items-center self-start">
      <View style={{ width: 8, height: 8, borderRadius: 4, marginRight: 6, backgroundColor: CATEGORY_COLORS[category] }} />
      <Text style={{ fontFamily: 'Figtree_700Bold' }} className="text-[11px] uppercase tracking-wide text-ink-soft">
        {CATEGORY_LABELS[category]}
        {suffix ? ` · ${suffix}` : ''}
      </Text>
    </View>
  );
}
