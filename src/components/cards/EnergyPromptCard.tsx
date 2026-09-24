import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { isLowEnergy, LOW_ENERGY_SLUG, QUOTES } from '../../features/planning/quotes';
import { useEnergyToday } from '../../hooks/useEnergyToday';
import { useTheme } from '../../theme/ThemeProvider';
import { errorMessage, InlineNotice } from '../feedback/InlineNotice';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Sheet } from '../ui/Sheet';
import { Text } from '../ui/Text';
import { energyChoice, EnergySelector } from './EnergySelector';

/**
 * « Ton énergie aujourd'hui ? » : ouvre le check-in. Une fois répondu, la carte rappelle le niveau
 * et, s'il est bas, propose une respiration courte.
 */
export function EnergyPromptCard() {
  const theme = useTheme();
  const energy = useEnergyToday();
  const [open, setOpen] = useState(false);
  const level = energy.level;
  const choice = level ? energyChoice(level) : null;
  const low = level ? isLowEnergy(level) : false;

  const title = choice ? `${choice.label} energy today` : 'How is your energy today?';
  const subtitle = !level
    ? 'It helps us shape your day.'
    : low
      ? 'A short breathing session can help you get going.'
      : QUOTES[level === 'eleve' ? 'eleve' : 'moyen'][new Date().getDate() % 3];

  return (
    <>
      <Card
        variant="tinted"
        padding={16}
        onPress={() => setOpen(true)}
        accessibilityLabel={`${title}. ${subtitle}`}
        accessibilityHint="Opens the energy check-in"
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: theme.surface,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            {choice ? <Text variant="section">{choice.emoji}</Text> : <Ionicons name="leaf" size={20} color={theme.primary600} />}
          </View>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text variant="label">{title}</Text>
            <Text variant="caption" tone="ink2" style={{ marginTop: 2 }} numberOfLines={2}>
              {subtitle}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.ink2} />
        </View>
      </Card>

      <Sheet
        visible={open}
        title="How are you feeling right now?"
        subtitle="Your plan and your suggestions adapt to your answer."
        onClose={() => setOpen(false)}
        scroll={false}
        footer={
          low ? (
            <Button
              label="Guided breathing"
              icon="leaf-outline"
              onPress={() => {
                setOpen(false);
                router.push(`/wellbeing/${LOW_ENERGY_SLUG}`);
              }}
            />
          ) : (
            <Button label="Close" variant="secondary" onPress={() => setOpen(false)} />
          )
        }
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
          <EnergySelector value={level} onChange={energy.save} savingLevel={energy.savingLevel} disabled={energy.saving} />
          {energy.error ? <InlineNotice tone="error" message={errorMessage(energy.error)} /> : null}
          {level && !energy.saving ? (
            <InlineNotice tone="success" message={low ? 'Noted. We will take it gently today.' : 'Noted, thank you.'} />
          ) : null}
        </View>
      </Sheet>
    </>
  );
}
