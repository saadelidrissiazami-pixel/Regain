import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { lineForEnergy } from '../../features/planning/quotes';
import { themeLabel } from '../../features/wellbeing/catalogue';
import { useEnergySuggestion } from '../../hooks/useEnergySuggestion';
import { useEnergyToday } from '../../hooks/useEnergyToday';
import { useToday } from '../../lib/useCurrentDate';
import { useTheme } from '../../theme/ThemeProvider';
import { errorMessage, InlineNotice } from '../feedback/InlineNotice';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Sheet } from '../ui/Sheet';
import { Text } from '../ui/Text';
import { energyChoice, EnergySelector } from './EnergySelector';
import { lang, t } from '../../lib/i18n';

/**
 * “How is your energy today?” opens the check-in. Answering it has to lead somewhere: the answer
 * comes back as a line written for that level, and as one session already chosen and ready to
 * start. Being told your answer was recorded is not help.
 */
export function EnergyPromptCard() {
  const theme = useTheme();
  const today = useToday();
  const energy = useEnergyToday();
  const [open, setOpen] = useState(false);
  const level = energy.level;
  const choice = level ? energyChoice(level) : null;
  const suggestion = useEnergySuggestion(level);
  const line = level ? lineForEnergy(level, today) : null;

  const title = choice
    ? t('{level} energy today', { level: lang === 'fr' ? choice.label.toLowerCase() : choice.label })
    : t('How is your energy today?');
  // Only the suggestions read this answer — the week's plan is built from the rhythm given at
  // sign-up — so this does not claim the plan changes.
  const subtitle = line ?? t('It changes what we suggest next.');

  return (
    <>
      <Card
        variant="tinted"
        padding={16}
        onPress={() => setOpen(true)}
        accessibilityLabel={`${title}. ${subtitle}`}
        accessibilityHint={t('Opens the energy check-in')}
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
        title={t('How are you feeling right now?')}
        subtitle={t('Your suggestions adapt to your answer.')}
        onClose={() => setOpen(false)}
        scroll={false}
        footer={
          suggestion ? (
            // Doing nothing has to be as easy to reach as starting. On a day somebody has just
            // called low, a single “Start” makes the session the only way out of the sheet, and a
            // guided minute can be the one demand too many.
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button
                label={t('Not now')}
                variant="outline"
                fullWidth={false}
                style={{ flex: 1 }}
                onPress={() => setOpen(false)}
              />
              <Button
                label={t('Start')}
                icon="play"
                fullWidth={false}
                style={{ flex: 1 }}
                onPress={() => {
                  setOpen(false);
                  router.push(suggestion.href);
                }}
              />
            </View>
          ) : (
            <Button label={t('Close')} variant="secondary" onPress={() => setOpen(false)} />
          )
        }
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
          <EnergySelector value={level} onChange={energy.save} savingLevel={energy.savingLevel} disabled={energy.saving} />
          {energy.error ? <InlineNotice tone="error" message={errorMessage(energy.error)} /> : null}

          {line && !energy.saving ? (
            <Text variant="body" style={{ marginTop: 18 }}>
              {line}
            </Text>
          ) : null}

          {suggestion && !energy.saving ? (
            <Card variant="tinted" padding={14} style={{ marginTop: 14 }}>
              <Text variant="label">{suggestion.program.title}</Text>
              <Text variant="caption" tone="ink2" style={{ marginTop: 2 }}>
                {themeLabel(suggestion.program.category)} · {t('{minutes} min', { minutes: suggestion.program.duration_minutes })}
              </Text>
              <Text variant="caption" tone="ink2" style={{ marginTop: 8 }}>
                {suggestion.reason}
              </Text>
            </Card>
          ) : null}
        </View>
      </Sheet>
    </>
  );
}
