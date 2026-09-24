import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { router, useLocalSearchParams } from 'expo-router';

import { goBack } from '../../lib/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Image, ScrollView, Switch, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { wellbeingTheme } from '../../components/cards/wellbeingThemes';
import { EmptyState, LoadingSkeleton } from '../../components/feedback';
import { Button, Card, ChoiceChip, haptic, IconButton, ListRow, Pill, PressableScale, Screen, Sheet, Tag, Text } from '../../components/ui';
import { AMBIENCES, ambienceLabel, initialAmbience, type AmbienceChoice } from '../../features/wellbeing/ambience';
import { CONTENT_BY_SLUG } from '../../features/wellbeing/content';
import { themeLabel } from '../../features/wellbeing/catalogue';
import { SOS_URGENCE } from '../../features/wellbeing/sos';
import { loadAmbiencePreference, saveAmbiencePreference, useAmbiencePlayer } from '../../lib/ambience';
import { usePremium } from '../../lib/premium';
import { fetchPrograms, markProgramCompleted, type SessionReview as Review } from '../../lib/wellbeing';
import { useAuthStore } from '../../store/authStore';
import { withAlpha } from '../../theme/colors';
import { IMAGES } from '../../theme/images';
import { useTheme } from '../../theme/ThemeProvider';
import { BreathingPlayer, GroundingPlayer, NarratedPlayer, PrepCountdown } from './session/players';
import { SessionReview } from './session/SessionReview';

function stopSpeech() {
  try {
    Speech.stop();
  } catch {
    // no-op
  }
}

/** An immersive wellbeing session: no tab bar, one single thing to attend to. */
export default function WellbeingSessionScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const userId = useAuthStore((s) => s.session?.user.id);
  const queryClient = useQueryClient();
  const { isPremium, isLoading: premiumLoading } = usePremium();
  const [stage, setStage] = useState<'prep' | 'play' | 'review' | 'done'>('prep');
  const [noteDraft, setNoteDraft] = useState('');
  // A narrated session runs on its own: with no voice it would still force you to read the
  // screen, and so to keep your eyes open. The voice is on from the start there, and can be
  // turned off in one move from the options. The others, done at your own pace, stay silent.
  const [audioOn, setAudioOn] = useState(() => (slug ? CONTENT_BY_SLUG[slug]?.type === 'narrated' : false));
  const [menuOpen, setMenuOpen] = useState(false);
  const [runKey, setRunKey] = useState(0);
  // Stable: PrepCountdown depends on onDone inside its countdown effect.
  const handlePrepDone = useCallback(() => setStage('play'), []);

  const programsQuery = useQuery({ queryKey: ['wellbeingPrograms'], queryFn: fetchPrograms });
  const program = programsQuery.data?.find((p) => p.slug === slug);
  const content = slug ? CONTENT_BY_SLUG[slug] : undefined;

  // Background music: chosen from the category and the last choice, played through the session.
  const [ambience, setAmbience] = useState<AmbienceChoice>('off');
  const category = program?.category;
  useEffect(() => {
    if (!category) return;
    let cancelled = false;
    loadAmbiencePreference().then((saved) => {
      if (!cancelled) setAmbience(initialAmbience(category, saved));
    });
    return () => {
      cancelled = true;
    };
  }, [category]);
  useAmbiencePlayer(ambience, { active: stage === 'prep' || stage === 'play', ducked: audioOn });

  const chooseAmbience = (choice: AmbienceChoice) => {
    setAmbience(choice);
    saveAmbiencePreference(choice);
  };
  const playingLabel = ambienceLabel(ambience);

  // A session listened to in bed has to end without asking for anything: no buzz at the end, no
  // review to fill in. We record it, and say nothing.
  const [quietEnding, setQuietEnding] = useState(false);

  const completeMutation = useMutation({
    mutationFn: ({ review }: { review: Review; quiet?: boolean }) => markProgramCompleted(userId!, program!.id, review),
    onSuccess: (_result, variables) => {
      if (!variables.quiet) haptic.success();
      queryClient.invalidateQueries({ queryKey: ['completedPrograms', userId] });
      queryClient.invalidateQueries({ queryKey: ['wellbeingJournal', userId] });
      setStage('done');
    },
  });

  useEffect(() => stopSpeech, []);

  const handleDone = (prefillNote?: string) => {
    stopSpeech();
    if (prefillNote) setNoteDraft(prefillNote);
    setStage('review');
  };

  const handleQuietDone = () => {
    stopSpeech();
    setQuietEnding(true);
    if (!program || !userId) {
      setStage('done');
      return;
    }
    completeMutation.mutate({ review: {}, quiet: true });
  };

  const submitReview = (review: Review) => {
    if (!program || !userId) {
      setStage('done');
      return;
    }
    completeMutation.mutate({ review });
  };

  if (programsQuery.isLoading || (program?.premium_only && premiumLoading)) {
    return (
      <Screen>
        <LoadingSkeleton preset="hero" />
      </Screen>
    );
  }

  if (!content || !program) {
    return (
      <Screen>
        <EmptyState
          icon="search-outline"
          title="Session not found"
          body="It may no longer be available. You will find every session under Wellbeing."
          actionLabel="Go back"
          onAction={() => goBack('/(tabs)/wellbeing')}
        />
      </Screen>
    );
  }

  if (program.premium_only && !isPremium) {
    return (
      <Screen>
        <EmptyState
          icon="lock-closed-outline"
          title="A Premium session"
          body="This session is part of the full library, which comes with Regain Premium."
          actionLabel="See what Premium adds"
          onAction={() => router.replace('/paywall?source=locked')}
          secondaryLabel="Go back"
          onSecondary={() => goBack('/(tabs)/wellbeing')}
        />
      </Screen>
    );
  }

  if (stage === 'review') {
    return (
      <SessionReview
        category={program.category}
        initialNote={noteDraft}
        saving={completeMutation.isPending}
        error={completeMutation.error}
        onSubmit={submitReview}
        onSkip={() => {
          if (userId) {
            markProgramCompleted(userId, program.id)
              .then(() => {
                queryClient.invalidateQueries({ queryKey: ['completedPrograms', userId] });
                queryClient.invalidateQueries({ queryKey: ['wellbeingJournal', userId] });
              })
              .catch(() => {});
          }
          goBack('/(tabs)/wellbeing');
        }}
      />
    );
  }

  if (stage === 'done' && quietEnding) {
    // A quiet ending: nothing flashes, nothing congratulates, and the only thing to do is
    // leave. If the person fell asleep, the screen will ask nothing of them when they wake.
    return (
      <Screen footer={<Button label="Close" variant="ghost" onPress={() => goBack('/(tabs)/wellbeing')} />}>
        <View style={{ alignItems: 'center', paddingTop: 120 }}>
          <Text variant="body" tone="ink2" center>
            That is the end. There is nothing left to do.
          </Text>
        </View>
      </Screen>
    );
  }

  if (stage === 'done') {
    return (
      <Screen
        footer={
          <View style={{ gap: 8 }}>
            <Button label="Back to Wellbeing" onPress={() => goBack('/(tabs)/wellbeing')} />
            <Button label="Read my journal" variant="ghost" onPress={() => router.replace('/wellbeing/journal')} />
          </View>
        }
      >
        <View style={{ alignItems: 'center', paddingTop: 80 }}>
          <Animated.View entering={ZoomIn.duration(260)}>
            <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: theme.primary600, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="checkmark" size={46} color={theme.dark ? theme.bg : '#FFFFFF'} />
            </View>
          </Animated.View>
          <Text variant="title" center style={{ marginTop: 24 }}>
            Session complete
          </Text>
          <Text variant="body" tone="ink2" center style={{ marginTop: 8 }}>
            Thank you for taking that time. Your answers are waiting in your journal.
          </Text>
        </View>
      </Screen>
    );
  }

  const background = IMAGES.sessionLake;
  const categoryColor = wellbeingTheme(program.category).color(theme);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      {background ? (
        <Image source={background} resizeMode="cover" style={{ position: 'absolute', width: '100%', height: '100%' }} />
      ) : null}
      <LinearGradient
        colors={
          background
            ? [withAlpha(theme.scrim, 0.35), withAlpha(theme.scrim, 0.6), withAlpha(theme.scrim, 0.92)]
            : [theme.sage200, theme.sage100, theme.bg]
        }
        locations={[0, 0.45, 1]}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      />

      <View style={{ paddingTop: insets.top + 4, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center' }}>
        <IconButton
          icon="close"
          label="Close the session"
          onPress={() => {
            stopSpeech();
            goBack('/(tabs)/wellbeing');
          }}
        />
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text variant="cardTitle" center numberOfLines={1}>
            {program.title}
          </Text>
          <View style={{ marginTop: 4 }}>
            <Tag label={themeLabel(program.category)} color={categoryColor} suffix={`${program.duration_minutes} min`} />
          </View>
        </View>
        <IconButton icon="ellipsis-horizontal" label="Session options" onPress={() => setMenuOpen(true)} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingTop: 16, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {audioOn || playingLabel ? (
          <View style={{ alignSelf: 'center', marginBottom: 16, flexDirection: 'row', gap: 8 }}>
            {audioOn ? <Pill icon="volume-high-outline" label="Voice guidance" tone="onImage" /> : null}
            {playingLabel ? (
              <PressableScale
                onPress={() => setMenuOpen(true)}
                feedback="selection"
                accessibilityRole="button"
                accessibilityLabel={`Music: ${playingLabel}. Change the ambience`}
              >
                <Pill icon="musical-notes-outline" label={playingLabel} tone="onImage" />
              </PressableScale>
            ) : null}
          </View>
        ) : null}
        {/* Here too, not only on the list: a direct link to the session would slip past the
            notice. The app does not get to decide that what is happening is anxiety. */}
        {stage === 'prep' && slug === 'sos-angoisse' ? (
          <Card variant="tinted" style={{ marginBottom: 18 }}>
            <Text variant="bodySm">{SOS_URGENCE}</Text>
          </Card>
        ) : null}
        <View key={runKey}>
          {stage === 'prep' ? (
            <PrepCountdown onDone={handlePrepDone} audioOn={audioOn} />
          ) : content.type === 'breathing' ? (
            <BreathingPlayer
              cycles={content.cycles}
              phases={content.phases}
              intro={content.intro}
              outro={content.outro}
              audioOn={audioOn}
              onDone={handleDone}
            />
          ) : content.type === 'narrated' ? (
            <NarratedPlayer blocks={content.blocks} audioOn={audioOn} onDone={content.endsQuietly ? handleQuietDone : handleDone} />
          ) : (
            <GroundingPlayer steps={content.steps} durationMinutes={program.duration_minutes} audioOn={audioOn} onDone={handleDone} />
          )}
        </View>
        <Text variant="caption" tone="ink2" center style={{ marginTop: 28, fontStyle: 'italic' }}>
          “Take the time to be here.”
        </Text>
      </ScrollView>

      <Sheet visible={menuOpen} title="Session options" onClose={() => setMenuOpen(false)} scroll={false}>
        <View style={{ paddingHorizontal: 20 }}>
          <ListRow
            icon={audioOn ? 'volume-high-outline' : 'volume-mute-outline'}
            title="Voice guidance"
            subtitle="A voice reads the instructions"
            chevron={false}
            divider
            right={
              <Switch
                value={audioOn}
                onValueChange={(value) => {
                  if (!value) stopSpeech();
                  setAudioOn(value);
                }}
                trackColor={{ false: theme.line, true: theme.primary600 }}
                thumbColor="#FFFFFF"
                accessibilityLabel="Voice guidance"
              />
            }
          />
          <ListRow
            icon="musical-notes-outline"
            title="Background music"
            subtitle={
              playingLabel
                ? AMBIENCES.find((a) => a.id === ambience)?.description
                : 'Quiet music to help you let go'
            }
            chevron={false}
          />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 14, paddingLeft: 4 }}>
            <ChoiceChip label="None" selected={ambience === 'off'} multiple={false} onPress={() => chooseAmbience('off')} />
            {AMBIENCES.map((option) => (
              <ChoiceChip
                key={option.id}
                label={option.label}
                selected={ambience === option.id}
                multiple={false}
                onPress={() => chooseAmbience(option.id)}
              />
            ))}
          </View>
          <ListRow
            icon="refresh-outline"
            title="Start the session again"
            onPress={() => {
              stopSpeech();
              setMenuOpen(false);
              setStage('prep');
              setRunKey((k) => k + 1);
            }}
          />
        </View>
      </Sheet>
    </View>
  );
}
