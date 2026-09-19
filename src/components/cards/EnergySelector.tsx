import { ActivityIndicator, View } from 'react-native';

import type { EnergyLevel } from '../../features/planning/catalog';
import { useTheme } from '../../theme/ThemeProvider';
import { PressableScale } from '../ui/motion';
import { Text } from '../ui/Text';

export const ENERGY_CHOICES: { value: EnergyLevel; label: string; emoji: string }[] = [
  { value: 'bas', label: 'Basse', emoji: '🪫' },
  { value: 'moyen', label: 'Moyenne', emoji: '🙂' },
  { value: 'eleve', label: 'Élevée', emoji: '⚡' },
];

export function energyChoice(level: EnergyLevel) {
  return ENERGY_CHOICES.find((choice) => choice.value === level)!;
}

/** Trois niveaux d'énergie côte à côte ; le choix actif passe en vert foncé. */
export function EnergySelector({
  value,
  onChange,
  savingLevel,
  disabled,
}: {
  value: EnergyLevel | null;
  onChange: (level: EnergyLevel) => void;
  savingLevel?: EnergyLevel | null;
  disabled?: boolean;
}) {
  const theme = useTheme();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel="Ton énergie" style={{ flexDirection: 'row', gap: 8 }}>
      {ENERGY_CHOICES.map((choice) => {
        const selected = value === choice.value;
        return (
          <PressableScale
            key={choice.value}
            onPress={() => onChange(choice.value)}
            disabled={disabled}
            feedback="selection"
            accessibilityRole="radio"
            accessibilityState={{ selected, disabled: !!disabled }}
            accessibilityLabel={`Énergie ${choice.label.toLowerCase()}`}
            wrapperStyle={{ flex: 1 }}
            style={{
              minHeight: 46,
              borderRadius: 14,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              paddingHorizontal: 8,
              backgroundColor: selected ? theme.primary : theme.surface,
              borderWidth: 1,
              borderColor: selected ? theme.primary : theme.line,
            }}
          >
            {savingLevel === choice.value ? (
              <ActivityIndicator size="small" color={selected ? theme.onPrimary : theme.primary600} />
            ) : (
              <>
                <Text variant="label" tone="inherit" maxFontSizeMultiplier={1.3}>
                  {choice.emoji}
                </Text>
                <Text
                  variant="label"
                  tone="inherit"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  style={{ color: selected ? theme.onPrimary : theme.ink }}
                >
                  {choice.label}
                </Text>
              </>
            )}
          </PressableScale>
        );
      })}
    </View>
  );
}
