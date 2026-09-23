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
import { Button, ChoiceChip, haptic, IconButton, ListRow, Pill, PressableScale, Screen, Sheet, Tag, Text } from '../../components/ui';
import { AMBIENCES, ambienceLabel, initialAmbience, type AmbienceChoice } from '../../features/wellbeing/ambience';
import { CONTENT_BY_SLUG } from '../../features/wellbeing/content';
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

/** Séance bien-être immersive : pas de barre d'onglets, un seul point d'attention. */
export default function WellbeingSessionScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const userId = useAuthStore((s) => s.session?.user.id);
  const queryClient = useQueryClient();
  const { isPremium, isLoading: premiumLoading } = usePremium();
  const [stage, setStage] = useState<'prep' | 'play' | 'review' | 'done'>('prep');
  const [noteDraft, setNoteDraft] = useState('');
  // Une séance narrée se déroule seule : sans voix, elle obligerait quand même à lire l'écran,
  // donc à garder les yeux ouverts. La voix y est active d'emblée, et coupable en un geste
  // depuis les options. Les autres séances, qu'on fait à son rythme, restent silencieuses.
  const [audioOn, setAudioOn] = useState(() => (slug ? CONTENT_BY_SLUG[slug]?.type === 'narrated' : false));
  const [menuOpen, setMenuOpen] = useState(false);
  const [runKey, setRunKey] = useState(0);
  // Stable : PrepCountdown dépend de onDone dans son effet de décompte.
  const handlePrepDone = useCallback(() => setStage('play'), []);

  const programsQuery = useQuery({ queryKey: ['wellbeingPrograms'], queryFn: fetchPrograms });
  const program = programsQuery.data?.find((p) => p.slug === slug);
  const content = slug ? CONTENT_BY_SLUG[slug] : undefined;

  // Musique d'ambiance : choisie selon la catégorie et le dernier choix, jouée pendant la séance.
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

  // Une séance qu'on écoute au lit doit se terminer sans rien réclamer : pas de vibration de
  // fin, pas de bilan à remplir. On enregistre, et on se tait.
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
          title="Séance introuvable"
          body="Elle n'est peut-être plus disponible. Retrouve toutes les séances dans Bien-être."
          actionLabel="Retour"
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
          title="Séance Premium"
          body="Cette séance fait partie de la bibliothèque complète, accessible avec Regain Premium."
          actionLabel="Découvrir Premium"
          onAction={() => router.replace('/paywall?source=locked')}
          secondaryLabel="Retour"
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
    // Fin discrète : rien ne clignote, rien ne félicite, et la seule action possible est de
    // partir. Si la personne s'est endormie, l'écran ne lui demandera rien au réveil.
    return (
      <Screen footer={<Button label="Fermer" variant="ghost" onPress={() => goBack('/(tabs)/wellbeing')} />}>
        <View style={{ alignItems: 'center', paddingTop: 120 }}>
          <Text variant="body" tone="ink2" center>
            C&apos;est terminé. Tu n&apos;as plus rien à faire.
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
            <Button label="Retour à Bien-être" onPress={() => goBack('/(tabs)/wellbeing')} />
            <Button label="Relire mon journal" variant="ghost" onPress={() => router.replace('/wellbeing/journal')} />
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
            Séance terminée
          </Text>
          <Text variant="body" tone="ink2" center style={{ marginTop: 8 }}>
            Merci d&apos;avoir pris ce moment pour toi. Tes réponses t&apos;attendent dans ton journal.
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
          label="Fermer la séance"
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
            <Tag label={program.category} color={categoryColor} suffix={`${program.duration_minutes} min`} />
          </View>
        </View>
        <IconButton icon="ellipsis-horizontal" label="Options de la séance" onPress={() => setMenuOpen(true)} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingTop: 16, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {audioOn || playingLabel ? (
          <View style={{ alignSelf: 'center', marginBottom: 16, flexDirection: 'row', gap: 8 }}>
            {audioOn ? <Pill icon="volume-high-outline" label="Guidage vocal" tone="onImage" /> : null}
            {playingLabel ? (
              <PressableScale
                onPress={() => setMenuOpen(true)}
                feedback="selection"
                accessibilityRole="button"
                accessibilityLabel={`Musique : ${playingLabel}. Changer d'ambiance`}
              >
                <Pill icon="musical-notes-outline" label={playingLabel} tone="onImage" />
              </PressableScale>
            ) : null}
          </View>
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
          « Prends le temps d&apos;être ici. »
        </Text>
      </ScrollView>

      <Sheet visible={menuOpen} title="Options de la séance" onClose={() => setMenuOpen(false)} scroll={false}>
        <View style={{ paddingHorizontal: 20 }}>
          <ListRow
            icon={audioOn ? 'volume-high-outline' : 'volume-mute-outline'}
            title="Guidage vocal"
            subtitle="Une voix lit les consignes"
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
                accessibilityLabel="Guidage vocal"
              />
            }
          />
          <ListRow
            icon="musical-notes-outline"
            title="Musique d'ambiance"
            subtitle={
              playingLabel
                ? AMBIENCES.find((a) => a.id === ambience)?.description
                : 'Une musique calme pour t’aider à relâcher'
            }
            chevron={false}
          />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 14, paddingLeft: 4 }}>
            <ChoiceChip label="Aucune" selected={ambience === 'off'} multiple={false} onPress={() => chooseAmbience('off')} />
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
            title="Recommencer la séance"
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
