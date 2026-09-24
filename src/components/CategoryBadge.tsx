import { Tag } from './ui/Tag';
import { CATEGORY_COLORS, CATEGORY_LABELS, type ActivityCategory } from '../features/planning/types';

/** An activity's category as a quiet label: “● MEDITATION · 15 min”. */
export function CategoryBadge({ category, suffix }: { category: ActivityCategory; suffix?: string }) {
  return <Tag label={CATEGORY_LABELS[category]} color={CATEGORY_COLORS[category]} suffix={suffix} />;
}
