import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../theme/ThemeProvider';
import { PressableScale } from './motion';
import { Text } from './Text';

/** Pastille de choix (filtre, jour de la semaine). Cochée : vert foncé avec une coche. */
export function ChoiceChip({
  label,
  selected,
  onPress,
  multiple = true,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** false : choix unique (lu comme bouton radio). */
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
