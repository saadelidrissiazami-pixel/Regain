import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';

import { goBack } from '../../src/lib/navigation';
import { View } from 'react-native';
import type { ComponentProps } from 'react';

import { BookSuggestionCard } from '../../src/components/activity/BookSuggestionCard';
import { NeighborhoodHistoryCard } from '../../src/components/activity/NeighborhoodHistoryCard';
import { WalkingLoopCard } from '../../src/components/activity/WalkingLoopCard';
import { NextUpCard } from '../../src/components/cards/NextUpCard';
import { EmptyState, ErrorState, LoadingSkeleton } from '../../src/components/feedback';
import { Appear, Button, Card, ListRow, Screen, ScreenHeader, SectionHeader, Tag, Text, Thumbnail } from '../../src/components/ui';
import { computeActivityFit, pickComplementaryActivities } from '../../src/features/planning/recommendation';
import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_LABELS } from '../../src/features/planning/types';
import { usePlanning } from '../../src/hooks/usePlanning';
import { fetchActivityById, fetchCatalog } from '../../src/lib/planning';
import { imageForActivity } from '../../src/theme/images';
import { useTheme } from '../../src/theme/ThemeProvider';

type IconName = ComponentProps<typeof Thumbnail>['icon'];

const NEIGHBORHOOD_HISTORY_TITLES = ['Explorer un nouveau quartier'];
const WALKING_LOOP_TITLES = ['Marche rapide 30 min', 'Balade en nature'];
const BOOK_TITLES = ["Lecture d'un livre"];
const COST_LABELS = { gratuit: 'Gratuit', faible: 'Coût faible', modere: 'Coût modéré' } as const;

/** Fiche activité : pourquoi elle t'est proposée, comment la faire, et la cocher une fois faite. */
export default function ActivityDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const planning = usePlanning();

  const activityQuery = useQuery({ queryKey: ['activity', id], queryFn: () => fetchActivityById(id!), enabled: !!id });
  const catalogQuery = useQuery({ queryKey: ['catalog'], queryFn: fetchCatalog });

  const activity = activityQuery.data;
  const prefs = planning.preferences;
  const fit = activity && prefs ? computeActivityFit(activity, prefs) : null;
  const complementary = activity && prefs && catalogQuery.data ? pickComplementaryActivities(activity, catalogQuery.data, prefs) : [];

  // L'occurrence de cette activité dans la semaine en cours (la prochaine non faite, sinon la dernière faite).
  const planned = planning.items.filter((item) => item.activities_catalog.id === id);
  const occurrence = planned.find((item) => item.status !== 'realise' && item.date >= planning.today) ?? planned.find((item) => item.status === 'realise');
  const done = occurrence?.status === 'realise';

  return (
    <Screen
      footer={
        occurrence ? (
          <Button
            label={done ? 'Fait ✓ · Annuler' : "C'est fait"}
            variant={done ? 'outline' : 'primary'}
            icon={done ? undefined : 'checkmark'}
            loading={planning.isToggling(occurrence)}
            onPress={() => planning.toggle(occurrence)}
          />
        ) : undefined
      }
    >
      <ScreenHeader title={activity?.title ?? 'Activité'} onBack={() => goBack('/(tabs)/planning')} size="headline" />

      {activityQuery.isLoading ? (
        <LoadingSkeleton preset="hero" />
      ) : activityQuery.isError ? (
        <ErrorState onRetry={() => activityQuery.refetch()} />
      ) : !activity ? (
        <EmptyState title="Activité introuvable" />
      ) : (
        <>
          <Appear>
            <Thumbnail
              source={imageForActivity(activity.category)}
              width="100%"
              height={180}
              radius={22}
              icon={CATEGORY_ICONS[activity.category] as IconName}
              tint={CATEGORY_COLORS[activity.category]}
            />
            <View style={{ marginTop: 14 }}>
              <Tag label={CATEGORY_LABELS[activity.category]} color={CATEGORY_COLORS[activity.category]} suffix={`${activity.duration_minutes} min · ${COST_LABELS[activity.cost_level]}`} />
            </View>
            {activity.instructions ? (
              <Text variant="body" tone="ink2" style={{ marginTop: 10 }}>
                {activity.instructions}
              </Text>
            ) : null}
          </Appear>

          {fit ? (
            <Appear index={1}>
              <Card variant="tinted" style={{ marginTop: 20 }}>
                <Text variant="label" style={{ marginBottom: 6 }}>
                  Pourquoi pour toi
                </Text>
                <ListRow
                  icon="flag-outline"
                  compact
                  title={fit.matchedGoalLabels.length > 0 ? `Sert tes objectifs : ${fit.matchedGoalLabels.join(', ').toLowerCase()}` : 'À tester si l’envie est là'}
                />
                <ListRow
                  icon="flash-outline"
                  compact
                  title={
                    fit.goodEnergySlotLabels.length === 3
                      ? 'Adaptée à ton énergie, à tout moment'
                      : fit.goodEnergySlotLabels.length > 0
                        ? `Plutôt adaptée le ${fit.goodEnergySlotLabels.join(', ').toLowerCase()}`
                        : 'Demande un peu plus d’énergie : mieux un jour en forme'
                  }
                />
                <ListRow icon="wallet-outline" compact title={fit.budgetFits ? 'Correspond à ton budget' : 'Un peu au-dessus de ton budget habituel'} />
              </Card>
            </Appear>
          ) : null}

          {activity.steps.length > 0 ? (
            <View style={{ marginTop: 28 }}>
              <SectionHeader title="Comment faire" />
              {activity.steps.map((step, i) => (
                <Appear key={i} index={i + 2}>
                  <Card padding={14} style={{ marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                      <View
                        style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: theme.sage100, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}
                      >
                        <Text variant="section">{step.icon}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text variant="label">
                          {i + 1}. {step.title}
                        </Text>
                        <Text variant="bodySm" tone="ink2" style={{ marginTop: 4 }}>
                          {step.description}
                        </Text>
                      </View>
                    </View>
                  </Card>
                </Appear>
              ))}
            </View>
          ) : null}

          <View style={{ marginTop: 12 }}>
            {NEIGHBORHOOD_HISTORY_TITLES.includes(activity.title) ? <NeighborhoodHistoryCard /> : null}
            {WALKING_LOOP_TITLES.includes(activity.title) ? <WalkingLoopCard durationMinutes={activity.duration_minutes} /> : null}
            {BOOK_TITLES.includes(activity.title) && prefs ? <BookSuggestionCard primaryGoals={prefs.primary_goals} /> : null}
          </View>

          {complementary.length > 0 ? (
            <View style={{ marginTop: 16 }}>
              <SectionHeader title="Dans la même veine" />
              {complementary.map((a) => (
                <View key={a.id} style={{ marginBottom: 10 }}>
                  <NextUpCard when="Suggestion" activity={a} onPress={() => router.push(`/activity/${a.id}`)} />
                </View>
              ))}
            </View>
          ) : null}
        </>
      )}
    </Screen>
  );
}
