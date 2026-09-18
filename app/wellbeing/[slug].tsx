import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import { useCallback, useEffect, useReducer, useState } from 'react';
import { ActivityIndicator, Animated, Pressable, ScrollView, View } from 'react-native';
import { Text, TextInput } from '../../src/components/typography';
import { Appear, haptic, Pop, PressableScale } from '../../src/components/motion';
import { CONTENT_BY_SLUG } from '../../src/features/wellbeing/content';
import {
  cleanReflections,
  MOOD_OPTIONS,
  promptsForCategory,
  type Reflection,
} from '../../src/features/wellbeing/reflection';
import type { GroundingStep } from '../../src/features/wellbeing/types';
import { usePremium } from '../../src/lib/premium';
import { speakGently as speak } from '../../src/lib/voice';
import { fetchPrograms, markProgramCompleted, type SessionReview } from '../../src/lib/wellbeing';
import { useAuthStore } from '../../src/store/authStore';

function ParagraphStepper({
  paragraphs,
  audioOn,
  buttonLabel,
  onFinish,
}: {
  paragraphs: string[];
  audioOn: boolean;
  buttonLabel: (isLast: boolean) => string;
  onFinish: () => void;
}) {
  const [index, setIndex] = useState(0);
  const isLast = index === paragraphs.length - 1;

  useEffect(() => {
    if (audioOn) speak(paragraphs[index]);
    return () => {
      if (audioOn) Speech.stop();
    };
  }, [index, audioOn, paragraphs]);

  return (
    <View className="flex-1 justify-between px-8 pb-10">
      <View className="flex-1 items-center justify-center">
        <Text style={{ fontFamily: 'Figtree_700Bold' }} className="text-center text-xl leading-8 text-ink">
          {paragraphs[index]}
        </Text>
      </View>

      <View>
        <View className="mb-6 flex-row justify-center gap-2">
          {paragraphs.map((_, i) => (
            <View key={i} className={`h-1.5 w-1.5 rounded-full ${i === index ? 'bg-primary' : 'bg-line'}`} />
          ))}
        </View>
        <PressableScale feedback="medium"
          onPress={() => (isLast ? onFinish() : setIndex((i) => i + 1))}
          className="items-center rounded-full bg-ink px-5 py-4"
        >
          <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold' }} className="text-center text-base text-paper">
            {buttonLabel(isLast)}
          </Text>
        </PressableScale>
      </View>
    </View>
  );
}

type BreathingState = {
  stage: 'intro' | 'active' | 'outro' | 'finished';
  cycle: number;
  phaseIndex: number;
  secondsLeft: number;
};

function BreathingPlayer({
  content,
  onDone,
  audioOn,
}: {
  content: Extract<ReturnType<typeof getContent>, { type: 'breathing' }>;
  onDone: () => void;
  audioOn: boolean;
}) {
  // Tick et changements de phase passent par un reducer pur, déclenché depuis l'intervalle :
  // ni setState imbriqué dans un updater (que React peut rejouer), ni setState synchrone
  // dans un effet.
  const [{ stage, cycle, phaseIndex, secondsLeft }, dispatch] = useReducer(
    (state: BreathingState, action: 'start' | 'tick'): BreathingState => {
      if (action === 'start') return { ...state, stage: 'active' };
      if (state.stage !== 'active') return state;
      if (state.secondsLeft > 1) return { ...state, secondsLeft: state.secondsLeft - 1 };

      const nextPhaseIndex = (state.phaseIndex + 1) % content.phases.length;
      const nextCycle = nextPhaseIndex === 0 ? state.cycle + 1 : state.cycle;
      if (nextCycle >= content.cycles) {
        return { ...state, stage: content.outro?.length ? 'outro' : 'finished' };
      }
      return {
        ...state,
        cycle: nextCycle,
        phaseIndex: nextPhaseIndex,
        secondsLeft: content.phases[nextPhaseIndex].seconds,
      };
    },
    {
      stage: content.intro?.length ? 'intro' : 'active',
      cycle: 0,
      phaseIndex: 0,
      secondsLeft: content.phases[0].seconds,
    }
  );
  const [scale] = useState(() => new Animated.Value(1));

  const phase = content.phases[phaseIndex];

  useEffect(() => {
    if (stage !== 'active') return;
    const target = phase.label.startsWith('Inspirez') || phase.label.toLowerCase().includes('inspiration') ? 1.4 : 1;
    Animated.timing(scale, { toValue: target, duration: phase.seconds * 1000, useNativeDriver: true }).start();
  }, [stage, cycle, phaseIndex, phase.label, phase.seconds, scale]);

  useEffect(() => {
    if (stage === 'active' && audioOn) speak(phase.label);
  }, [stage, cycle, phaseIndex, phase.label, audioOn]);

  useEffect(() => {
    if (stage !== 'active') return;
    const timer = setInterval(() => dispatch('tick'), 1000);
    return () => clearInterval(timer);
  }, [stage]);

  if (stage === 'intro') {
    return (
      <ParagraphStepper
        paragraphs={content.intro!}
        audioOn={audioOn}
        buttonLabel={(isLast) => (isLast ? 'Commencer' : 'Suivant')}
        onFinish={() => dispatch('start')}
      />
    );
  }

  if (stage === 'outro') {
    return (
      <ParagraphStepper
        paragraphs={content.outro!}
        audioOn={audioOn}
        buttonLabel={(isLast) => (isLast ? 'Terminer' : 'Suivant')}
        onFinish={onDone}
      />
    );
  }

  if (stage === 'finished') {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <Text className="mb-3 text-5xl">🎉</Text>
        <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold' }} className="mb-2 text-center text-2xl text-ink">
          Bien joué
        </Text>
        <Text className="mb-8 text-center text-sm text-ink-soft">Vous avez pris ce moment pour vous.</Text>
        <PressableScale feedback="medium" onPress={onDone} className="w-full items-center rounded-full bg-ink px-5 py-4">
          <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold' }} className="text-center text-base text-paper">
            Terminer
          </Text>
        </PressableScale>
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
          <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold' }} className="text-3xl text-paper">
            {secondsLeft}
          </Text>
        </View>
      </Animated.View>
      <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold' }} className="text-center text-xl text-ink">
        {phase.label}
      </Text>
      <Text className="mt-2 text-xs text-ink-soft">
        Cycle {cycle + 1} / {content.cycles}
      </Text>
    </View>
  );
}

function GuidedPlayer({
  paragraphs,
  onDone,
  audioOn,
}: {
  paragraphs: string[];
  onDone: () => void;
  audioOn: boolean;
}) {
  return (
    <ParagraphStepper
      paragraphs={paragraphs}
      audioOn={audioOn}
      buttonLabel={(isLast) => (isLast ? 'Terminer' : 'Suivant')}
      onFinish={onDone}
    />
  );
}

const SCALE_VALUES = Array.from({ length: 11 }, (_, i) => i);

function GroundingPlayer({
  steps,
  onDone,
  audioOn,
}: {
  steps: GroundingStep[];
  onDone: (summaryNote?: string) => void;
  audioOn: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [breathCount, setBreathCount] = useState(0);
  const step = steps[index];
  const isLast = index === steps.length - 1;

  const speakText =
    step.kind === 'scale' ? step.prompt : step.kind === 'text' || step.kind === 'confirm' ? step.text : step.text;

  useEffect(() => {
    if (audioOn) speak(speakText);
    return () => {
      if (audioOn) Speech.stop();
    };
  }, [index, audioOn, speakText]);

  const goNext = () => {
    if (isLast) {
      const { before, after } = answers;
      const summary =
        before !== undefined && after !== undefined
          ? `Niveau de gêne ressenti : ${before}/10 avant la séance, ${after}/10 après.`
          : undefined;
      onDone(summary);
    } else {
      setIndex((i) => i + 1);
      setBreathCount(0);
    }
  };

  return (
    <View className="flex-1 justify-between px-8 pb-10">
      <View className="flex-1 items-center justify-center">
        {step.kind === 'text' ? (
          <Text style={{ fontFamily: 'Figtree_700Bold' }} className="text-center text-xl leading-8 text-ink">
            {step.text}
          </Text>
        ) : step.kind === 'confirm' ? (
          <>
            <Text style={{ fontFamily: 'Figtree_700Bold' }} className="mb-8 text-center text-xl leading-8 text-ink">
              {step.text}
            </Text>
            <PressableScale onPress={goNext} feedback="medium" className="items-center rounded-full bg-calm px-6 py-3.5">
              <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold' }} className="text-center text-paper">
                {step.buttonLabel}
              </Text>
            </PressableScale>
          </>
        ) : step.kind === 'breath-counter' ? (
          <>
            <Text style={{ fontFamily: 'Figtree_700Bold' }} className="mb-8 text-center text-xl leading-8 text-ink">
              {step.text}
            </Text>
            <Pressable
              onPress={() => setBreathCount((c) => Math.min(c + 1, step.count))}
              className="h-32 w-32 items-center justify-center rounded-full bg-calm-soft"
            >
              <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold' }} className="text-3xl text-calm">
                {breathCount}/{step.count}
              </Text>
            </Pressable>
            <Text className="mt-4 text-xs text-ink-soft">Appuyez à chaque respiration</Text>
          </>
        ) : (
          <>
            <Text style={{ fontFamily: 'Figtree_700Bold' }} className="mb-6 text-center text-xl leading-8 text-ink">
              {step.prompt}
            </Text>
            <View className="flex-row flex-wrap justify-center gap-2">
              {SCALE_VALUES.map((value) => {
                const selected = answers[step.key] === value;
                return (
                  <Pressable
                    key={value}
                    onPress={() => setAnswers((a) => ({ ...a, [step.key]: value }))}
                    className={`h-10 w-10 items-center justify-center rounded-full border ${
                      selected ? 'border-primary bg-primary' : 'border-line bg-surface'
                    }`}
                  >
                    <Text
                      style={{ fontFamily: 'Figtree_700Bold' }}
                      className={`text-sm ${selected ? 'text-on-primary' : 'text-ink-soft'}`}
                    >
                      {value}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <View className="mt-2 flex-row justify-between px-1" style={{ width: 280 }}>
              <Text className="text-[11px] text-ink-soft">À l'aise</Text>
              <Text className="text-[11px] text-ink-soft">Très mal à l'aise</Text>
            </View>
          </>
        )}
      </View>

      <View>
        <View className="mb-6 flex-row justify-center gap-2">
          {steps.map((_, i) => (
            <View key={i} className={`h-1.5 w-1.5 rounded-full ${i === index ? 'bg-primary' : 'bg-line'}`} />
          ))}
        </View>
        {step.kind === 'text' || (step.kind === 'scale' && answers[step.key] !== undefined) || (step.kind === 'breath-counter' && breathCount >= step.count) ? (
          <PressableScale feedback="medium" onPress={goNext} className="items-center rounded-full bg-ink px-5 py-4">
            <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold' }} className="text-center text-base text-paper">
              {isLast ? 'Terminer' : 'Suivant'}
            </Text>
          </PressableScale>
        ) : null}
      </View>
    </View>
  );
}

const PREP_SECONDS = 10;

function PrepCountdown({ onDone, audioOn }: { onDone: () => void; audioOn: boolean }) {
  const [secondsLeft, setSecondsLeft] = useState(PREP_SECONDS);

  useEffect(() => {
    if (audioOn) speak('Installez-vous confortablement. La séance commence dans quelques secondes.');
  }, [audioOn]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onDone();
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, onDone]);

  return (
    <View className="flex-1 items-center justify-center px-8">
      <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold' }} className="mb-6 text-center text-xl text-ink">
        Installez-vous, préparez-vous
      </Text>
      <View className="mb-8 h-32 w-32 items-center justify-center rounded-full bg-calm-soft">
        <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold' }} className="text-5xl text-calm">
          {secondsLeft}
        </Text>
      </View>
      <Text className="mb-8 text-center text-sm text-ink-soft">La séance démarre dans un instant.</Text>
      <Pressable onPress={onDone}>
        <Text style={{ fontFamily: 'Figtree_700Bold' }} className="text-sm text-ink-soft underline">
          Passer
        </Text>
      </Pressable>
    </View>
  );
}

function MoodPicker({ value, onChange }: { value: number | null; onChange: (value: number) => void }) {
  return (
    <View className="mb-1 flex-row justify-between">
      {MOOD_OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <PressableScale
            key={option.value}
            onPress={() => {
              haptic.selection();
              onChange(option.value);
            }}
            feedback={null}
            scaleTo={0.9}
            wrapperStyle={{ flex: 1, marginHorizontal: 3 }}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
            className={`items-center rounded-2xl border py-3 ${
              selected ? 'border-primary bg-primary-soft' : 'border-line bg-surface'
            }`}
          >
            <Pop trigger={selected}>
              <Text className="text-2xl">{option.emoji}</Text>
            </Pop>
          </PressableScale>
        );
      })}
    </View>
  );
}

/** Fin de séance : ressenti chiffré, questions ouvertes puis note libre. Tout est facultatif. */
function SessionReviewScreen({
  category,
  initialNote,
  saving,
  error,
  onSubmit,
}: {
  category?: string;
  initialNote?: string;
  saving: boolean;
  error?: string;
  onSubmit: (review: Required<Pick<SessionReview, 'mood' | 'reflections' | 'note'>>) => void;
}) {
  const prompts = promptsForCategory(category);
  const [mood, setMood] = useState<number | null>(null);
  const [answers, setAnswers] = useState<string[]>(() => prompts.map(() => ''));
  const [note, setNote] = useState(initialNote ?? '');

  const selectedMood = MOOD_OPTIONS.find((option) => option.value === mood);
  const reflections: Reflection[] = prompts.map((prompt, i) => ({ prompt, answer: answers[i] ?? '' }));

  return (
    <ScrollView className="flex-1 px-7" contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <Appear>
        <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold' }} className="mb-1 text-center text-xl text-ink">
          Comment vous sentez-vous ?
        </Text>
        <Text className="mb-4 text-center text-sm text-ink-soft">
          Votre ressenti juste après la séance. Il nourrit votre suivi.
        </Text>
        <MoodPicker value={mood} onChange={setMood} />
        <Text style={{ fontFamily: 'Figtree_700Bold' }} className="mb-6 h-5 text-center text-xs text-primary">
          {selectedMood?.label ?? ''}
        </Text>
      </Appear>

      {prompts.map((prompt, i) => (
        <Appear key={prompt} index={i + 1}>
          <Text style={{ fontFamily: 'Figtree_700Bold' }} className="mb-1.5 text-sm text-ink">
            {prompt}
          </Text>
          <TextInput
            value={answers[i]}
            onChangeText={(text) => setAnswers((current) => current.map((a, j) => (i === j ? text : a)))}
            multiline
            placeholder="Votre réponse… (facultatif)"

            className="mb-4 min-h-[80px] rounded-2xl border border-line bg-surface p-4 text-base text-ink"
            style={{ fontFamily: 'Figtree_700Bold', textAlignVertical: 'top' }}
          />
        </Appear>
      ))}

      <Appear index={prompts.length + 1}>
        <Text style={{ fontFamily: 'Figtree_700Bold' }} className="mb-1.5 text-sm text-ink">
          Autre chose à noter ?
        </Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          multiline
          placeholder="Écrivez librement ici… (facultatif)"

          className="mb-2 min-h-[90px] rounded-2xl border border-line bg-surface p-4 text-base text-ink"
          style={{ fontFamily: 'Figtree_700Bold', textAlignVertical: 'top' }}
        />
        <Text className="mb-5 text-xs text-ink-soft">
          Ces réponses restent privées : vous les relisez dans votre journal, sur l'onglet Bien-être.
        </Text>

        {error ? <Text className="mb-3 text-xs text-red-700">{error}</Text> : null}

        <PressableScale
          onPress={() => onSubmit({ mood, reflections: cleanReflections(reflections), note })}
          disabled={saving}
          feedback="medium"
          className="items-center rounded-full bg-ink px-5 py-4"
        >
          {saving ? (
            <ActivityIndicator className="text-paper" />
          ) : (
            <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold' }} className="text-center text-base text-paper">
              Enregistrer et terminer
            </Text>
          )}
        </PressableScale>
      </Appear>
    </ScrollView>
  );
}

function getContent(slug: string) {
  return CONTENT_BY_SLUG[slug];
}

export default function WellbeingSessionScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const session = useAuthStore((s) => s.session);
  const queryClient = useQueryClient();
  const { isPremium, isLoading: premiumLoading } = usePremium();
  const [completed, setCompleted] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const [audioOn, setAudioOn] = useState(false);
  const [preparing, setPreparing] = useState(true);
  // Stable : PrepCountdown dépend de onDone dans son effet de décompte.
  const handlePrepDone = useCallback(() => setPreparing(false), []);

  const programsQuery = useQuery({ queryKey: ['wellbeingPrograms'], queryFn: fetchPrograms });
  const program = programsQuery.data?.find((p) => p.slug === slug);
  const content = slug ? getContent(slug) : undefined;

  const completeMutation = useMutation({
    mutationFn: (review: SessionReview) => markProgramCompleted(session!.user.id, program!.id, review),
    onSuccess: () => {
      haptic.success();
      queryClient.invalidateQueries({ queryKey: ['completedPrograms', session?.user.id] });
      queryClient.invalidateQueries({ queryKey: ['wellbeingJournal', session?.user.id] });
      setCompleted(true);
    },
  });

  const handleDone = (prefillNote?: string) => {
    try {
      Speech.stop();
    } catch {
      // no-op
    }
    if (prefillNote) setNoteDraft(prefillNote);
    setShowNote(true);
  };

  const handleSubmitReview = (review: SessionReview) => {
    if (!program || !session?.user.id) {
      setCompleted(true);
      return;
    }
    completeMutation.mutate(review);
  };

  useEffect(() => {
    return () => {
      try {
        Speech.stop();
      } catch {
        // no-op
      }
    };
  }, []);

  if (!content || !program) {
    return (
      <View className="flex-1 items-center justify-center bg-paper px-8">
        <Text className="text-sm text-ink-soft">Séance introuvable.</Text>
      </View>
    );
  }

  if (program.premium_only && premiumLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-paper px-8">
        <ActivityIndicator className="text-primary" />
      </View>
    );
  }

  if (program.premium_only && !isPremium) {
    return (
      <View className="flex-1 items-center justify-center bg-paper px-8">
        <Text className="mb-3 text-4xl">🔒</Text>
        <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold' }} className="mb-2 text-center text-xl text-ink">
          Programme premium
        </Text>
        <Pressable onPress={() => router.replace('/paywall')} className="mt-4 rounded-full bg-ink px-6 py-3">
          <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold' }} className="text-paper">
            Voir Premium
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-paper pt-16">
      <View className="mb-4 flex-row items-center justify-between px-6">
        <Pressable onPress={() => router.back()}>
          <Text style={{ fontFamily: 'Figtree_700Bold' }} className="text-sm text-ink-soft">
            ✕ Fermer
          </Text>
        </Pressable>
        {!completed && !showNote ? (
          <Pressable
            onPress={() => {
              setAudioOn((v) => {
                if (v) {
                  try {
                    Speech.stop();
                  } catch {
                    // no-op
                  }
                }
                return !v;
              });
            }}
            className={`flex-row items-center rounded-full px-3 py-1.5 ${audioOn ? 'bg-primary-soft' : 'bg-surface'}`}
          >
            <Text style={{ fontFamily: 'Figtree_700Bold' }} className={`text-xs ${audioOn ? 'text-primary' : 'text-ink-soft'}`}>
              {audioOn ? '🔊 Guidage audio' : '🔇 Muet'}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {completed ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="mb-3 text-5xl">✅</Text>
          <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold' }} className="mb-2 text-center text-2xl text-ink">
            Séance terminée
          </Text>
          <Text className="mb-2 text-center text-sm text-ink-soft">
            Vos réponses vous attendent dans votre journal.
          </Text>
          <Pressable onPress={() => router.replace('/wellbeing/journal')} className="mt-2">
            <Text style={{ fontFamily: 'Figtree_700Bold' }} className="text-sm text-primary underline">
              Relire mon journal
            </Text>
          </Pressable>
          <PressableScale feedback="medium" onPress={() => router.back()} className="mt-6 w-full items-center rounded-full bg-ink px-5 py-4">
            <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold' }} className="text-center text-base text-paper">
              Retour à Bien-être
            </Text>
          </PressableScale>
        </View>
      ) : showNote ? (
        <SessionReviewScreen
          category={program.category}
          initialNote={noteDraft}
          saving={completeMutation.isPending}
          error={completeMutation.isError ? (completeMutation.error as Error).message : undefined}
          onSubmit={handleSubmitReview}
        />
      ) : preparing ? (
        <PrepCountdown onDone={handlePrepDone} audioOn={audioOn} />
      ) : content.type === 'breathing' ? (
        <BreathingPlayer content={content} onDone={handleDone} audioOn={audioOn} />
      ) : content.type === 'grounding' ? (
        <GroundingPlayer steps={content.steps} onDone={handleDone} audioOn={audioOn} />
      ) : (
        <GuidedPlayer paragraphs={content.paragraphs} onDone={handleDone} audioOn={audioOn} />
      )}
    </View>
  );
}
