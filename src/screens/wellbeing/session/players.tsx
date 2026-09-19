import * as Speech from 'expo-speech';
import { useEffect, useReducer, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';

import { Button, Text } from '../../../components/ui';
import type { BreathingPhase, GroundingStep } from '../../../features/wellbeing/types';
import { speakGently as speak } from '../../../lib/voice';
import { useTheme } from '../../../theme/ThemeProvider';
import { SessionControls, SessionRing } from './SessionControls';
import { useSessionClock } from './useSessionClock';

function stopSpeech() {
  try {
    Speech.stop();
  } catch {
    // La synthèse vocale n'est pas disponible ici.
  }
}

function Dots({ count, index }: { count: number; index: number }) {
  const theme = useTheme();
  if (count <= 1) return null;
  return (
    <View
      style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginVertical: 14 }}
      accessible
      accessibilityLabel={`Étape ${index + 1} sur ${count}`}
    >
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={{ width: i === index ? 16 : 6, height: 6, borderRadius: 3, backgroundColor: i === index ? theme.primary600 : theme.sage300 }} />
      ))}
    </View>
  );
}

/** Texte guidé, un paragraphe à la fois ; la voix suit et s'arrête pendant la pause. */
function ParagraphStepper({
  paragraphs,
  audioOn,
  paused,
  lastLabel,
  onFinish,
}: {
  paragraphs: string[];
  audioOn: boolean;
  paused: boolean;
  lastLabel: string;
  onFinish: () => void;
}) {
  const [index, setIndex] = useState(0);
  const isLast = index === paragraphs.length - 1;

  useEffect(() => {
    if (audioOn && !paused) speak(paragraphs[index]);
    return () => {
      if (audioOn) stopSpeech();
    };
  }, [index, audioOn, paused, paragraphs]);

  return (
    <View>
      <Animated.View key={index} entering={FadeIn.duration(260)} style={{ minHeight: 96, justifyContent: 'center' }}>
        <Text variant="bodyStrong" center style={{ fontSize: 18, lineHeight: 27 }} accessibilityLiveRegion="polite">
          {paragraphs[index]}
        </Text>
      </Animated.View>
      <Dots count={paragraphs.length} index={index} />
      <Button
        label={isLast ? lastLabel : 'Suivant'}
        variant={isLast ? 'primary' : 'secondary'}
        iconRight={isLast ? undefined : 'arrow-forward'}
        onPress={() => (isLast ? onFinish() : setIndex((i) => i + 1))}
      />
    </View>
  );
}

/** Séance guidée : minuteur de la durée annoncée + paragraphes à son rythme. */
export function GuidedPlayer({
  paragraphs,
  durationMinutes,
  audioOn,
  onDone,
}: {
  paragraphs: string[];
  durationMinutes: number;
  audioOn: boolean;
  onDone: () => void;
}) {
  const clock = useSessionClock(Math.max(60, durationMinutes * 60));
  return (
    <View style={{ gap: 22 }}>
      <SessionRing progress={clock.elapsed / clock.total} elapsed={clock.elapsed} total={clock.total} />
      <SessionControls running={clock.running} onToggle={clock.toggle} onSeek={clock.seek} />
      <ParagraphStepper paragraphs={paragraphs} audioOn={audioOn} paused={!clock.running} lastLabel="Terminer" onFinish={onDone} />
    </View>
  );
}

type BreathingState = {
  stage: 'intro' | 'active' | 'outro' | 'finished';
  cycle: number;
  phaseIndex: number;
  secondsLeft: number;
};

/** Respiration guidée : l'anneau suit les cycles, le cercle intérieur respire avec la phase. */
export function BreathingPlayer({
  cycles,
  phases,
  intro,
  outro,
  audioOn,
  onDone,
}: {
  cycles: number;
  phases: BreathingPhase[];
  intro?: string[];
  outro?: string[];
  audioOn: boolean;
  onDone: () => void;
}) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const [paused, setPaused] = useState(false);
  // Tick et changements de phase passent par un reducer pur, déclenché depuis l'intervalle.
  const [{ stage, cycle, phaseIndex, secondsLeft }, dispatch] = useReducer(
    (state: BreathingState, action: 'start' | 'tick'): BreathingState => {
      if (action === 'start') return { ...state, stage: 'active' };
      if (state.stage !== 'active') return state;
      if (state.secondsLeft > 1) return { ...state, secondsLeft: state.secondsLeft - 1 };
      const nextPhaseIndex = (state.phaseIndex + 1) % phases.length;
      const nextCycle = nextPhaseIndex === 0 ? state.cycle + 1 : state.cycle;
      if (nextCycle >= cycles) return { ...state, stage: outro?.length ? 'outro' : 'finished' };
      return { ...state, cycle: nextCycle, phaseIndex: nextPhaseIndex, secondsLeft: phases[nextPhaseIndex].seconds };
    },
    { stage: intro?.length ? 'intro' : 'active', cycle: 0, phaseIndex: 0, secondsLeft: phases[0].seconds }
  );
  const phase = phases[phaseIndex];
  const scale = useSharedValue(1);

  useEffect(() => {
    if (stage !== 'active' || paused) return;
    const inhale = /inspir/i.test(phase.label);
    const target = inhale ? 1.35 : /retene|bloque|pause/i.test(phase.label) ? scale.get() : 0.9;
    scale.set(reduceMotion ? target : withTiming(target, { duration: secondsLeft * 1000 }));
    // secondsLeft volontairement absent : on ne relance l'animation qu'à chaque nouvelle phase ou reprise.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, cycle, phaseIndex, paused, phase.label, reduceMotion, scale]);

  useEffect(() => {
    if (stage === 'active' && audioOn && !paused) speak(phase.label);
  }, [stage, cycle, phaseIndex, phase.label, audioOn, paused]);

  useEffect(() => {
    if (stage !== 'active' || paused) return;
    const timer = setInterval(() => dispatch('tick'), 1000);
    return () => clearInterval(timer);
  }, [stage, paused]);

  const breathStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  if (stage === 'intro' || stage === 'outro') {
    return (
      <ParagraphStepper
        key={stage}
        paragraphs={stage === 'intro' ? intro! : outro!}
        audioOn={audioOn}
        paused={false}
        lastLabel={stage === 'intro' ? 'Commencer' : 'Terminer'}
        onFinish={() => (stage === 'intro' ? dispatch('start') : onDone())}
      />
    );
  }

  if (stage === 'finished') {
    return (
      <View style={{ alignItems: 'center', gap: 12, paddingTop: 20 }}>
        <Text variant="title" center>
          Bien joué
        </Text>
        <Text variant="body" tone="ink2" center>
          Tu as pris ce moment pour toi.
        </Text>
        <View style={{ alignSelf: 'stretch', marginTop: 16 }}>
          <Button label="Terminer" onPress={onDone} />
        </View>
      </View>
    );
  }

  const cycleSeconds = phases.reduce((sum, p) => sum + p.seconds, 0);
  const done = cycle * cycleSeconds + phases.slice(0, phaseIndex).reduce((sum, p) => sum + p.seconds, 0) + (phase.seconds - secondsLeft);
  const total = cycles * cycleSeconds;

  return (
    <View style={{ gap: 22 }}>
      <SessionRing progress={done / total} elapsed={done} total={total}>
        <Animated.View
          style={[
            { position: 'absolute', width: '52%', height: '52%', borderRadius: 999, backgroundColor: theme.sage200, opacity: 0.8 },
            breathStyle,
          ]}
        />
        <Text variant="metric" tabular accessibilityLiveRegion="polite">
          {secondsLeft}
        </Text>
        <Text variant="caption" tone="ink2">
          Cycle {cycle + 1} / {cycles}
        </Text>
      </SessionRing>
      <Text variant="section" center accessibilityLiveRegion="polite">
        {phase.label}
      </Text>
      <SessionControls
        running={!paused}
        onToggle={() => {
          if (!paused) stopSpeech();
          setPaused((p) => !p);
        }}
      />
    </View>
  );
}

const SCALE_VALUES = Array.from({ length: 11 }, (_, i) => i);

/** Exercice d'ancrage pas à pas (texte, échelle 0-10, confirmation, respirations à compter). */
export function GroundingPlayer({
  steps,
  durationMinutes,
  audioOn,
  onDone,
}: {
  steps: GroundingStep[];
  durationMinutes: number;
  audioOn: boolean;
  onDone: (summaryNote?: string) => void;
}) {
  const theme = useTheme();
  const clock = useSessionClock(Math.max(60, durationMinutes * 60));
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [breathCount, setBreathCount] = useState(0);
  const step = steps[index];
  const isLast = index === steps.length - 1;
  const speakText = step.kind === 'scale' ? step.prompt : step.text;
  const paused = !clock.running;

  useEffect(() => {
    if (audioOn && !paused) speak(speakText);
    return () => {
      if (audioOn) stopSpeech();
    };
  }, [index, audioOn, paused, speakText]);

  const goNext = () => {
    if (isLast) {
      const { before, after } = answers;
      onDone(
        before !== undefined && after !== undefined
          ? `Niveau de gêne ressenti : ${before}/10 avant la séance, ${after}/10 après.`
          : undefined
      );
    } else {
      setIndex((i) => i + 1);
      setBreathCount(0);
    }
  };

  const canContinue =
    step.kind === 'text' ||
    (step.kind === 'scale' && answers[step.key] !== undefined) ||
    (step.kind === 'breath-counter' && breathCount >= step.count);

  return (
    <View style={{ gap: 20 }}>
      <SessionRing progress={clock.elapsed / clock.total} elapsed={clock.elapsed} total={clock.total} />
      <SessionControls running={clock.running} onToggle={clock.toggle} onSeek={clock.seek} />

      <Animated.View key={index} entering={FadeIn.duration(240)}>
        <Text variant="bodyStrong" center style={{ fontSize: 18, lineHeight: 27 }} accessibilityLiveRegion="polite">
          {step.kind === 'scale' ? step.prompt : step.text}
        </Text>

        {step.kind === 'scale' ? (
          <View style={{ marginTop: 16 }}>
            <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 }}>
              {SCALE_VALUES.map((value) => {
                const selected = answers[step.key] === value;
                return (
                  <Pressable
                    key={value}
                    onPress={() => setAnswers((a) => ({ ...a, [step.key]: value }))}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`${value} sur 10`}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: selected ? theme.primary : theme.line,
                      backgroundColor: selected ? theme.primary : theme.surface,
                    }}
                  >
                    <Text variant="label" tone="inherit" style={{ color: selected ? theme.onPrimary : theme.ink2 }}>
                      {value}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <Text variant="caption" tone="ink2">
                À l&apos;aise
              </Text>
              <Text variant="caption" tone="ink2">
                Très mal à l&apos;aise
              </Text>
            </View>
          </View>
        ) : null}

        {step.kind === 'breath-counter' ? (
          <View style={{ alignItems: 'center', marginTop: 16 }}>
            <Pressable
              onPress={() => setBreathCount((c) => Math.min(c + 1, step.count))}
              accessibilityRole="button"
              accessibilityLabel={`Compter une respiration, ${breathCount} sur ${step.count}`}
              style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: theme.sage100, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text variant="metric" tabular tone="accent">
                {breathCount}/{step.count}
              </Text>
            </Pressable>
            <Text variant="caption" tone="ink2" style={{ marginTop: 10 }}>
              Appuie à chaque respiration
            </Text>
          </View>
        ) : null}
      </Animated.View>

      <View>
        <Dots count={steps.length} index={index} />
        {step.kind === 'confirm' ? (
          <Button label={step.buttonLabel} onPress={goNext} />
        ) : canContinue ? (
          <Button label={isLast ? 'Terminer' : 'Suivant'} variant={isLast ? 'primary' : 'secondary'} onPress={goNext} />
        ) : null}
      </View>
    </View>
  );
}

const PREP_SECONDS = 10;

/** Dix secondes pour s'installer avant que la séance ne démarre. */
export function PrepCountdown({ onDone, audioOn }: { onDone: () => void; audioOn: boolean }) {
  const [secondsLeft, setSecondsLeft] = useState(PREP_SECONDS);

  useEffect(() => {
    if (audioOn) speak('Installe-toi confortablement. La séance commence dans quelques secondes.');
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
    <View style={{ gap: 24, alignItems: 'center' }}>
      <SessionRing progress={(PREP_SECONDS - secondsLeft) / PREP_SECONDS}>
        <Text variant="metric" tabular accessibilityLiveRegion="polite">
          {secondsLeft}
        </Text>
        <Text variant="caption" tone="ink2">
          secondes
        </Text>
      </SessionRing>
      <View style={{ alignItems: 'center', gap: 6 }}>
        <Text variant="section" center>
          Installe-toi confortablement
        </Text>
        <Text variant="bodySm" tone="ink2" center>
          La séance démarre dans un instant.
        </Text>
      </View>
      <Button label="Commencer maintenant" variant="ghost" fullWidth={false} align="center" onPress={onDone} />
    </View>
  );
}
