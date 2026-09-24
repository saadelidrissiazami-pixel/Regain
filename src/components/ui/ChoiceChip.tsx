import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../theme/ThemeProvider';
import { PressableScale } from './motion';
import { Text } from './Text';

/** A choice chip (a filter, a day of the week). Selected: dark green with a tick. */
export function ChoiceChip({
  label,
  selected,
  onPress,
  multiple = true,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** false means a single choice (read out as a radio button). */
  multiple?: boolean;
}) {
  const theme = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      feedback="selection"
      accessibilityRole={multiple ? 'checkbox' : 'radio'}
      accessibilityState={multiple ? { checked: selected } : { selected }}
      accessibilityLabel={label}
      style={{
        minHeight: 40,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 14,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: selected ? theme.primary : theme.line,
        backgroundColor: selected ? theme.primary : theme.surface,
      }}
    >
      {selected && multiple ? <Ionicons name="checkmark" size={14} color={theme.onPrimary} /> : null}
      <Text variant="label" tone="inherit" style={{ color: selected ? theme.onPrimary : theme.ink }} numberOfLines={1}>
        {label}
      </Text>
    </PressableScale>
  );
}
