import * as Speech from 'expo-speech';
import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { Button, Text } from '../../../components/ui';
import { blockAt, narratedDuration } from '../../../features/wellbeing/narration';
import type { BreathingPhase, GroundingStep, NarratedBlock } from '../../../features/wellbeing/types';
import { speakGently as speak } from '../../../lib/voice';
import { useTheme } from '../../../theme/ThemeProvider';
import { SessionControls, SessionRing } from './SessionControls';
import { useSessionClock } from './useSessionClock';
import { t } from '../../../lib/i18n';

function stopSpeech() {
  try {
    Speech.stop();
  } catch {
    // Speech synthesis is not available here.
  }
}

function Dots({ count, index }: { count: number; index: number }) {
  const theme = useTheme();
  if (count <= 1) return null;
  return (
    <View
      style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginVertical: 14 }}
      accessible
      accessibilityLabel={t('Step {step} of {count}', { step: index + 1, count })}
    >
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={{ width: i === index ? 16 : 6, height: 6, borderRadius: 3, backgroundColor: i === index ? theme.primary600 : theme.sage300 }} />
      ))}
    </View>
  );
}

/** During a silence: a dot that breathes, to say the session is still going. */
function SilenceBreath() {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(0.55);

  useEffect(() => {
    if (reducedMotion) return;
    scale.value = withRepeat(withTiming(1, { duration: 3400 }), -1, true);
  }, [reducedMotion, scale]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View style={{ height: 22, alignItems: 'center', justifyContent: 'center' }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Animated.View style={[{ width: 10, height: 10, borderRadius: 5, backgroundColor: theme.primary600, opacity: 0.55 }, style]} />
    </View>
  );
}

/**
 * A narrated session: it runs on its own, and there is nothing to tap.
 *
 * The block on screen is not a piece of state, it is derived from the time elapsed. Pause,
 * resume and ±15 s therefore land correctly with no extra code, and the timer stops being
 * decorative: when the clock runs out, the session really is over.
 */
function NarratedSequence({
  blocks,
  elapsed,
  audioOn,
  running,
}: {
  blocks: NarratedBlock[];
  elapsed: number;
  audioOn: boolean;
  running: boolean;
}) {
  const position = blockAt(blocks, elapsed);

  // The voice says the block once, as it begins — never during the silence, which is the heart of
  // the exercise. A pause cuts it, and resuming says the current block again from its start.
  const spokenRef = useRef(-1);
  const blockIndex = position?.index ?? -1;
  const phase = position?.phase;
  useEffect(() => {
    if (!audioOn || !running) {
      stopSpeech();
      spokenRef.current = -1;
      return;
    }
    if (phase !== 'voice' || blockIndex < 0 || spokenRef.current === blockIndex) return;
    spokenRef.current = blockIndex;
    speak(blocks[blockIndex].text);
  }, [audioOn, running, phase, blockIndex, blocks]);

  useEffect(() => stopSpeech, []);

  if (!position) return null;

  return (
    <>
      {/* The text stays on screen through the silence: a screen that empties looks like a fault. */}
      <Animated.View key={position.index} entering={FadeIn.duration(400)} style={{ minHeight: 96, justifyContent: 'center' }}>
        <Text variant="bodyStrong" center style={{ fontSize: 18, lineHeight: 27 }} accessibilityLiveRegion="polite">
          {blocks[position.index].text}
        </Text>
      </Animated.View>
      {position.phase === 'silence' ? <SilenceBreath /> : <View style={{ height: 22 }} />}
      <Dots count={blocks.length} index={position.index} />
    </>
  );
}

/** Fires `onDone` exactly once, even if the parent recreates the function on every render. */
function useFinishOnce(finished: boolean, onDone: () => void) {
  const doneRef = useRef(false);
  useEffect(() => {
    if (!finished || doneRef.current) return;
    doneRef.current = true;
    stopSpeech();
    onDone();
  }, [finished, onDone]);
}

/** The intro or outro of a breathing session: it runs on its own, and skips in one move. */
export function NarratedIntro({
  blocks,
  audioOn,
  skipLabel,
  onFinish,
}: {
  blocks: NarratedBlock[];
  audioOn: boolean;
  skipLabel: string;
  onFinish: () => void;
}) {
  const total = useMemo(() => narratedDuration(blocks), [blocks]);
  const clock = useSessionClock(total);
  useFinishOnce(clock.elapsed >= total, onFinish);

  return (
    <View style={{ gap: 18 }}>
      <NarratedSequence blocks={blocks} elapsed={clock.elapsed} audioOn={audioOn} running={clock.running} />
      <Button label={skipLabel} variant="ghost" onPress={onFinish} />
    </View>
  );
}

export function NarratedPlayer({
  blocks,
  audioOn,
  onDone,
}: {
  blocks: NarratedBlock[];
  audioOn: boolean;
  onDone: () => void;
}) {
  const total = useMemo(() => narratedDuration(blocks), [blocks]);
  const clock = useSessionClock(total);
  useFinishOnce(clock.elapsed >= total, onDone);

  return (
    <View style={{ gap: 22 }}>
      <SessionRing progress={total === 0 ? 0 : clock.elapsed / total} elapsed={clock.elapsed} total={total} />
      <SessionControls running={clock.running} onToggle={clock.toggle} onSeek={clock.seek} />
      <NarratedSequence blocks={blocks} elapsed={clock.elapsed} audioOn={audioOn} running={clock.running} />
    </View>
  );
}

type BreathingState = {
  stage: 'intro' | 'active' | 'outro' | 'finished';
  cycle: number;
  phaseIndex: number;
  secondsLeft: number;
};

/** Guided breathing: the ring follows the rounds, the inner circle breathes with the phase. */
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
  intro?: NarratedBlock[];
  outro?: NarratedBlock[];
  audioOn: boolean;
  onDone: () => void;
}) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const [paused, setPaused] = useState(false);
  // Ticks and phase changes go through a pure reducer, driven from the interval.
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
    // secondsLeft deliberately absent: the animation only restarts on a new phase or on resuming.
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
      <NarratedIntro
        key={stage}
        blocks={stage === 'intro' ? intro! : outro!}
        audioOn={audioOn}
        skipLabel={stage === 'intro' ? t('Start now') : t('Finish')}
        onFinish={() => (stage === 'intro' ? dispatch('start') : onDone())}
      />
    );
  }

  if (stage === 'finished') {
    return (
      <View style={{ alignItems: 'center', gap: 12, paddingTop: 20 }}>
        <Text variant="title" center>
          {t('Nicely done')}
        </Text>
        <Text variant="body" tone="ink2" center>
          {t('You took that moment for yourself.')}
        </Text>
        <View style={{ alignSelf: 'stretch', marginTop: 16 }}>
          <Button label={t('Finish')} onPress={onDone} />
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

/** A step-by-step grounding exercise (text, a 0-10 scale, a confirmation, breaths to count). */
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
          ? t('Discomfort: {before}/10 before the session, {after}/10 after.', { before, after })
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
                    accessibilityLabel={t('{value} out of 10', { value })}
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
                {t('At ease')}
              </Text>
              <Text variant="caption" tone="ink2">
                {t('Very uncomfortable')}
              </Text>
            </View>
          </View>
        ) : null}

        {step.kind === 'breath-counter' ? (
          <View style={{ alignItems: 'center', marginTop: 16 }}>
            <Pressable
              onPress={() => setBreathCount((c) => Math.min(c + 1, step.count))}
              accessibilityRole="button"
              accessibilityLabel={t('Count a breath, {done} of {count}', { done: breathCount, count: step.count })}
              style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: theme.sage100, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text variant="metric" tabular tone="accent">
                {breathCount}/{step.count}
              </Text>
            </Pressable>
            <Text variant="caption" tone="ink2" style={{ marginTop: 10 }}>
              {t('Tap with each breath')}
            </Text>
          </View>
        ) : null}
      </Animated.View>

      <View>
        <Dots count={steps.length} index={index} />
        {step.kind === 'confirm' ? (
          <Button label={step.buttonLabel} onPress={goNext} />
        ) : canContinue ? (
          <Button label={isLast ? t('Finish') : t('Next')} variant={isLast ? 'primary' : 'secondary'} onPress={goNext} />
        ) : null}
      </View>
    </View>
  );
}

const PREP_SECONDS = 10;

/** Ten seconds to settle in before the session starts. */
export function PrepCountdown({ onDone, audioOn }: { onDone: () => void; audioOn: boolean }) {
  const [secondsLeft, setSecondsLeft] = useState(PREP_SECONDS);

  useEffect(() => {
    if (audioOn) speak(t('Make yourself comfortable. The session begins in a few seconds.'));
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
          seconds
        </Text>
      </SessionRing>
      <View style={{ alignItems: 'center', gap: 6 }}>
        <Text variant="section" center>
          {t('Make yourself comfortable')}
        </Text>
        <Text variant="bodySm" tone="ink2" center>
          {t('The session starts in a moment.')}
        </Text>
      </View>
      <Button label={t('Start now')} variant="ghost" fullWidth={false} align="center" onPress={onDone} />
    </View>
  );
}
