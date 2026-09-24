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

// These three extras belong to catalogue rows from an earlier version, which are no longer
// offered but are still referenced by older plans. The titles matched here are the ones the
// person reads, after localiseActivity has done its work — not the ones stored in the database.
const NEIGHBORHOOD_HISTORY_TITLES = ['Explore a new neighbourhood'];
const WALKING_LOOP_TITLES = ['A brisk 30-minute walk', 'A walk in nature'];
const BOOK_TITLES = ['Read a book'];
const COST_LABELS = { gratuit: 'Free', faible: 'Low cost', modere: 'Moderate cost' } as const;

/** One activity: why it was suggested, how to do it, and how to tick it off. */
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

  // This activity's slot in the current week: the next one not done, otherwise the last one done.
  const planned = planning.items.filter((item) => item.activities_catalog.id === id);
  const occurrence = planned.find((item) => item.status !== 'realise' && item.date >= planning.today) ?? planned.find((item) => item.status === 'realise');
  const done = occurrence?.status === 'realise';

  return (
    <Screen
      footer={
        occurrence ? (
          <Button
            label={done ? 'Done ✓ · Undo' : 'Mark as done'}
            variant={done ? 'outline' : 'primary'}
            icon={done ? undefined : 'checkmark'}
            loading={planning.isToggling(occurrence)}
            onPress={() => planning.toggle(occurrence)}
          />
        ) : undefined
      }
    >
      <ScreenHeader title={activity?.title ?? 'Activity'} onBack={() => goBack('/(tabs)/planning')} size="headline" />

      {activityQuery.isLoading ? (
        <LoadingSkeleton preset="hero" />
      ) : activityQuery.isError ? (
        <ErrorState onRetry={() => activityQuery.refetch()} />
      ) : !activity ? (
        <EmptyState title="Activity not found" />
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

          {/* The first action comes before everything else: it is the one thing someone with no
              appetite for any of this can hold on to. The stop rule sits right underneath, so the
              activity has an announced end instead of turning into an open commitment. */}
          {activity.first_action ? (
            <Appear index={1}>
              <Card variant="tinted" style={{ marginTop: 20 }}>
                <Text variant="label" style={{ marginBottom: 6 }}>
                  How to start
                </Text>
                <Text variant="body">{activity.first_action}</Text>
                {activity.stop_rule ? (
                  <View style={{ marginTop: 14 }}>
                    <Text variant="overline" tone="ink3">
                      When to stop
                    </Text>
                    <Text variant="caption" tone="ink2" style={{ marginTop: 2 }}>
                      {activity.stop_rule}
                    </Text>
                  </View>
                ) : null}
              </Card>
            </Appear>
          ) : null}

          {fit ? (
            <Appear index={1}>
              <Card variant="tinted" style={{ marginTop: 20 }}>
                <Text variant="label" style={{ marginBottom: 6 }}>
                  Why this one
                </Text>
                <ListRow
                  icon="flag-outline"
                  compact
                  title={fit.matchedGoalLabels.length > 0 ? `Serves your goals: ${fit.matchedGoalLabels.join(', ').toLowerCase()}` : 'Worth a try if you feel like it'}
                />
                <ListRow
                  icon="flash-outline"
                  compact
                  title={
                    fit.goodEnergySlotLabels.length === 3
                      ? 'Fits your energy at any time of day'
                      : fit.goodEnergySlotLabels.length > 0
                        ? `Better suited to the ${fit.goodEnergySlotLabels.join(', ').toLowerCase()}`
                        : 'Asks for a bit more energy — better on a good day'
                  }
                />
                <ListRow icon="wallet-outline" compact title={fit.budgetFits ? 'Within your budget' : 'A little above your usual budget'} />
              </Card>
            </Appear>
          ) : null}

          {activity.steps.length > 0 ? (
            <View style={{ marginTop: 28 }}>
              <SectionHeader title="How to do it" />
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
              <SectionHeader title="In the same vein" />
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
