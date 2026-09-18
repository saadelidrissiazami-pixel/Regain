import { useMutation } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Text } from './typography';
import { haptic, PressableScale } from './motion';
import type { EnergyLevel } from '../features/planning/catalog';
import { ENERGY_LEVELS } from '../features/onboarding/options';
import { isLowEnergy, LOW_ENERGY_SLUG, randomQuote } from '../features/planning/quotes';
import { saveEnergyCheckin } from '../lib/energyCheckin';

const ENERGY_EMOJI: Record<string, string> = { bas: '🪫', moyen: '🙂', eleve: '⚡' };

export function EnergyCheckin({ userId }: { userId?: string }) {
  const [selected, setSelected] = useState<EnergyLevel | null>(null);
  const [quote, setQuote] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (level: EnergyLevel) => saveEnergyCheckin(userId!, level),
    onSuccess: (_data, level) => {
      haptic.success();
      setSelected(level);
      if (!isLowEnergy(level)) setQuote(randomQuote(level as 'moyen' | 'eleve'));
    },
  });

  const reset = () => {
    haptic.selection();
    setSelected(null);
    setQuote(null);
  };

  // Changer de clé rejoue l'animation d'apparition à chaque étape du check-in.
  const stage = !selected ? 'ask' : isLowEnergy(selected) ? 'low' : 'quote';

  return (
    <View className="mb-4 rounded-3xl bg-surface p-4 shadow-sm">
      <Text style={{ fontFamily: 'Figtree_700Bold' }} className="text-[11px] uppercase tracking-wide text-primary">
        Check-in d'énergie
      </Text>

      <Animated.View key={stage} entering={FadeInDown.springify().damping(16)}>
        {stage === 'ask' ? (
          <>
            <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold' }} className="mb-3 mt-1 text-base text-ink">
              Comment vous sentez-vous, là, maintenant ?
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {ENERGY_LEVELS.map((level) => (
                <PressableScale
                  key={level.value}
                  onPress={() => mutation.mutate(level.value as EnergyLevel)}
                  disabled={mutation.isPending}
                  scaleTo={0.9}
                  feedback="selection"
                  className="rounded-full bg-primary-soft px-4 py-2"
                >
                  {mutation.isPending && mutation.variables === level.value ? (
                    <ActivityIndicator size="small" className="text-primary" />
                  ) : (
                    <Text style={{ fontFamily: 'Figtree_700Bold' }} className="text-sm text-primary">
                      {ENERGY_EMOJI[level.value] ?? ''} {level.label}
                    </Text>
                  )}
                </PressableScale>
              ))}
            </View>
          </>
        ) : stage === 'low' ? (
          <>
            <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold' }} className="mt-1 text-base text-ink">
              L'énergie manque un peu ? Une courte respiration peut aider.
            </Text>
            <Link href={`/wellbeing/${LOW_ENERGY_SLUG}`} asChild>
              <PressableScale wrapperStyle={{ alignSelf: 'flex-start' }} className="mt-3 rounded-full bg-ink px-4 py-2.5">
                <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold' }} className="text-sm text-paper">
                  Respiration guidée →
                </Text>
              </PressableScale>
            </Link>
          </>
        ) : (
          <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold' }} className="mt-1 text-base text-ink">
            {quote}
          </Text>
        )}
      </Animated.View>

      {selected ? (
        <Animated.View entering={FadeIn.delay(250)}>
          <Pressable onPress={reset} className="mt-3 self-start">
            <Text className="text-xs text-ink-soft">Refaire le check-in</Text>
          </Pressable>
        </Animated.View>
      ) : null}
    </View>
  );
}
