import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';

import { CONTENT_BY_SLUG } from '../../src/features/wellbeing/content';
import { usePremium } from '../../src/lib/premium';
import { fetchPrograms, markProgramCompleted } from '../../src/lib/wellbeing';
import { useAuthStore } from '../../src/store/authStore';

function BreathingPlayer({ content, onDone }: { content: Extract<ReturnType<typeof getContent>, { type: 'breathing' }>; onDone: () => void }) {
  const [cycle, setCycle] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(content.phases[0].seconds);
  const [finished, setFinished] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;

  const phase = content.phases[phaseIndex];

  useEffect(() => {
    const target = phase.label.startsWith('Inspirez') ? 1.4 : phase.label.startsWith('Expirez') ? 1 : 1.4;
    Animated.timing(scale, { toValue: target, duration: phase.seconds * 1000, useNativeDriver: true }).start();
  }, [phaseIndex, cycle]);

  useEffect(() => {
    if (finished) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s > 1) return s - 1;
        const nextPhaseIndex = (phaseIndex + 1) % content.phases.length;
        if (nextPhaseIndex === 0) {
          const nextCycle = cycle + 1;
          if (nextCycle >= content.cycles) {
            setFinished(true);
            return 0;
          }
          setCycle(nextCycle);
        }
        setPhaseIndex(nextPhaseIndex);
        return content.phases[nextPhaseIndex].seconds;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phaseIndex, cycle, finished]);

  if (finished) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <Text className="mb-3 text-5xl">🎉</Text>
        <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-2 text-center text-2xl text-ink">
          Bien joué
        </Text>
        <Text className="mb-8 text-center text-sm text-ink-soft">Vous avez pris ce moment pour vous.</Text>
        <Pressable onPress={onDone} className="w-full overflow-hidden rounded-full shadow-sm">
          <LinearGradient colors={['#F0A324', '#FF6B57']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingVertical: 15 }}>
            <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-center text-white">
              Terminer
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center px-8">
      <Animated.View
        style={{ transform: [{ scale }] }}
        className="mb-10 h-40 w-40 items-center justify-center rounded-full bg-calm-soft"
      >
        <View className="h-24 w-24 items-center justify-center rounded-full bg-calm">
          <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-3xl text-white">
            {secondsLeft}
          </Text>
        </View>
      </Animated.View>
      <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-center text-xl text-ink">
        {phase.label}
      </Text>
      <Text className="mt-2 text-xs text-ink-soft">
        Cycle {cycle + 1} / {content.cycles}
      </Text>
    </View>
  );
}

function GuidedPlayer({ paragraphs, onDone }: { paragraphs: string[]; onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const isLast = index === paragraphs.length - 1;

  return (
    <View className="flex-1 justify-between px-8 pb-10">
      <View className="flex-1 items-center justify-center">
        <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-center text-xl leading-8 text-ink">
          {paragraphs[index]}
        </Text>
      </View>

      <View>
        <View className="mb-6 flex-row justify-center gap-2">
          {paragraphs.map((_, i) => (
            <View key={i} className={`h-1.5 w-1.5 rounded-full ${i === index ? 'bg-primary' : 'bg-line'}`} />
          ))}
        </View>
        <Pressable
          onPress={() => (isLast ? onDone() : setIndex((i) => i + 1))}
          className="overflow-hidden rounded-full shadow-sm"
        >
          <LinearGradient colors={['#F0A324', '#FF6B57']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingVertical: 15 }}>
            <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-center text-white">
              {isLast ? 'Terminer' : 'Suivant'}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

function getContent(slug: string) {
  return CONTENT_BY_SLUG[slug];
}

export default function WellbeingSessionScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const session = useAuthStore((s) => s.session);
  const queryClient = useQueryClient();
  const { isPremium } = usePremium();
  const [completed, setCompleted] = useState(false);

  const programsQuery = useQuery({ queryKey: ['wellbeingPrograms'], queryFn: fetchPrograms });
  const program = programsQuery.data?.find((p) => p.slug === slug);
  const content = slug ? getContent(slug) : undefined;

  const completeMutation = useMutation({
    mutationFn: () => markProgramCompleted(session!.user.id, program!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['completedPrograms', session?.user.id] });
    },
  });

  const handleDone = () => {
    if (program && session?.user.id) completeMutation.mutate();
    setCompleted(true);
  };

  if (!content || !program) {
    return (
      <View className="flex-1 items-center justify-center bg-paper px-8">
        <Text className="text-sm text-ink-soft">Séance introuvable.</Text>
      </View>
    );
  }

  if (program.premium_only && !isPremium) {
    return (
      <View className="flex-1 items-center justify-center bg-paper px-8">
        <Text className="mb-3 text-4xl">🔒</Text>
        <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-2 text-center text-xl text-ink">
          Programme premium
        </Text>
        <Pressable onPress={() => router.replace('/paywall')} className="mt-4 rounded-full bg-primary px-6 py-3">
          <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-white">
            Voir Premium
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-paper pt-16">
      <Pressable onPress={() => router.back()} className="mb-4 px-6">
        <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-sm text-ink-soft">
          ✕ Fermer
        </Text>
      </Pressable>

      {completed ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="mb-3 text-5xl">✅</Text>
          <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-2 text-center text-2xl text-ink">
            Séance terminée
          </Text>
          <Pressable onPress={() => router.back()} className="mt-6 w-full overflow-hidden rounded-full shadow-sm">
            <LinearGradient colors={['#F0A324', '#FF6B57']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingVertical: 15 }}>
              <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-center text-white">
                Retour à Bien-être
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      ) : content.type === 'breathing' ? (
        <BreathingPlayer content={content} onDone={handleDone} />
      ) : (
        <GuidedPlayer paragraphs={content.paragraphs} onDone={handleDone} />
      )}
    </View>
  );
}
