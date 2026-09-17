import { useMutation } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
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
    <LinearGradient
      colors={['#F0A324', '#FF6B57']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: 20, padding: 16, marginBottom: 16 }}
    >
      <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-[11px] uppercase tracking-wide text-white/90">
        Check-in d'énergie
      </Text>

      <Animated.View key={stage} entering={FadeInDown.springify().damping(16)}>
        {stage === 'ask' ? (
          <>
            <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-3 mt-1 text-base text-white">
              Comment vous sentez-vous là, maintenant ?
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {ENERGY_LEVELS.map((level) => (
                <PressableScale
                  key={level.value}
                  onPress={() => mutation.mutate(level.value as EnergyLevel)}
                  disabled={mutation.isPending}
                  scaleTo={0.9}
                  feedback="selection"
                  className="rounded-full bg-white/20 px-4 py-2"
                >
                  {mutation.isPending && mutation.variables === level.value ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-sm text-white">
                      {ENERGY_EMOJI[level.value] ?? ''} {level.label}
                    </Text>
                  )}
                </PressableScale>
              ))}
            </View>
          </>
        ) : stage === 'low' ? (
          <>
            <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mt-1 text-base text-white">
              L'énergie manque un peu ? Une courte respiration peut aider.
            </Text>
            <Link href={`/wellbeing/${LOW_ENERGY_SLUG}`} asChild>
              <PressableScale wrapperStyle={{ alignSelf: 'flex-start' }} className="mt-3 rounded-full bg-white px-4 py-2.5">
                <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-sm text-primary">
                  🌬️ Respiration guidée →
                </Text>
              </PressableScale>
            </Link>
          </>
        ) : (
          <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mt-1 text-base text-white">
            {quote}
          </Text>
        )}
      </Animated.View>

      {selected ? (
        <Animated.View entering={FadeIn.delay(250)}>
          <Pressable onPress={reset} className="mt-3 self-start">
            <Text className="text-xs text-white/80">Refaire le check-in</Text>
          </Pressable>
        </Animated.View>
      ) : null}
    </LinearGradient>
  );
}
