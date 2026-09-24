import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useWindowDimensions, View } from 'react-native';

import { CategoryTile } from '../../components/cards/CategoryTile';
import { RecommendationHero } from '../../components/cards/RecommendationHero';
import { WELLBEING_ORDER } from '../../components/cards/wellbeingThemes';
import { ErrorState, LoadingSkeleton } from '../../components/feedback';
import { Appear, IconButton, ListRow, Screen, ScreenHeader, SectionHeader, Text } from '../../components/ui';
import { quoteOfTheDay } from '../../features/planning/quotes';
import { moodOption } from '../../features/wellbeing/reflection';
import { recommendWellbeing } from '../../features/wellbeing/recommend';
import { COURSE_CATEGORY, COURSES, courseProgress, courseStatusLabel } from '../../features/wellbeing/courses';
import { SOS_CATEGORY } from '../../features/wellbeing/sos';
import type { WellbeingProgram } from '../../features/wellbeing/types';
import { useEnergyToday } from '../../hooks/useEnergyToday';
import { useWellbeing } from '../../hooks/useWellbeing';
import { useToday } from '../../lib/useCurrentDate';
import { useTheme } from '../../theme/ThemeProvider';

/** Wellbeing: “What might help me right now?” */
export default function WellbeingScreen() {
  const theme = useTheme();
  const today = useToday();
  const { width } = useWindowDimensions();
  const wellbeing = useWellbeing();
  const energy = useEnergyToday();
  const [hour] = useState(() => new Date().getHours());
  const { programs, programsQuery } = wellbeing;

  const recommendations = recommendWellbeing({
    programs,
    completedIds: wellbeing.completed,
    hour,
    energy: energy.level,
    isPremium: wellbeing.isPremium,
  });

  // The SOS sessions are not a theme: you do not browse them, you reach for them. They have
  // their own way in, at the top of the screen.
  const sos = programs.filter((program) => program.category === SOS_CATEGORY);
  const byCategory = new Map<string, WellbeingProgram[]>();
  for (const program of programs.filter(
    (program) => program.category !== SOS_CATEGORY && program.category !== COURSE_CATEGORY
  )) {
    byCategory.set(program.category, [...(byCategory.get(program.category) ?? []), program]);
  }
  const categories = [...byCategory.keys()].sort((a, b) => {
    const ia = WELLBEING_ORDER.indexOf(a);
    const ib = WELLBEING_ORDER.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  const lastEntry = wellbeing.journal[0];
  const lastMood = moodOption(lastEntry?.mood);
  const heroWidth = Math.min(width, 520) - 40;

  return (
    <Screen inTabs refreshing={wellbeing.isRefetching} onRefresh={() => wellbeing.refetch()}>
      <ScreenHeader
        overline="Take a moment"
        title="Wellbeing"
        subtitle="A calmer mind, a fuller life."
        right={<IconButton icon="search" label="Search sessions" onPress={() => router.push('/wellbeing/search')} />}
      />

      {programsQuery.isLoading ? (
        <LoadingSkeleton preset="hero" />
      ) : programsQuery.isError ? (
        <ErrorState title="The library could not be loaded" onRetry={() => programsQuery.refetch()} retrying={programsQuery.isFetching} />
      ) : (
        <>
          {/* Before anything else: when things are bad right now, nobody should have to browse a
              library. Quiet when all is well, findable when it is not. */}
          {sos.length > 0 ? (
            <Appear index={0}>
              <View style={{ marginBottom: 18 }}>
                <ListRow
                  icon="pulse-outline"
                  title="Not okay right now"
                  subtitle={`${sos.length} two-minute sessions, right now`}
                  onPress={() => router.push('/wellbeing/sos')}
                />
              </View>
            </Appear>
          ) : null}

          {recommendations.length > 0 ? (
            <Appear index={1}>
              <RecommendationHero
                items={recommendations}
                width={heroWidth}
                onStart={(item) => router.push(`/wellbeing/${item.program.slug}`)}
              />
            </Appear>
          ) : null}

          {/* After the recommendation, before the grid: a course teaches something, where a theme
              only files things away. Progress reads at a glance. */}
          <Appear index={2}>
            <View style={{ marginTop: 28 }}>
              <SectionHeader title="Courses" />
              {COURSES.map((course, index) => {
                const progress = courseProgress(course, programs, wellbeing.completed);
                return (
                  <ListRow
                    key={course.slug}
                    icon={progress.complete ? 'checkmark-done-outline' : 'footsteps-outline'}
                    title={course.title}
                    subtitle={courseStatusLabel(progress, course)}
                    onPress={() => router.push(`/wellbeing/parcours/${course.slug}`)}
                    divider={index < COURSES.length - 1}
                  />
                );
              })}
            </View>
          </Appear>

          <Appear index={2}>
            <View style={{ marginTop: 28 }}>
              <SectionHeader
                title="Browse by theme"
                actionLabel="See all"
                onAction={() => router.push('/wellbeing/search')}
              />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {categories.map((category) => {
                  const list = byCategory.get(category)!;
                  return (
                    <View key={category} style={{ width: (heroWidth - 20) / 3 }}>
                      <CategoryTile
                        category={category}
                        count={list.length}
                        done={list.filter((p) => wellbeing.completed.has(p.id)).length}
                        onPress={() => router.push({ pathname: '/wellbeing/category/[name]', params: { name: category } })}
                      />
                    </View>
                  );
                })}
              </View>
            </View>
          </Appear>

          <Appear index={3}>
            <View style={{ marginTop: 20 }}>
              <ListRow
                icon="book-outline"
                title="My journal"
                subtitle={
                  lastEntry
                    ? `Last session: ${lastEntry.program?.title ?? 'a session'}${lastMood ? ` · ${lastMood.label.toLowerCase()}` : ''}`
                    : 'How you felt and what you answered, session after session.'
                }
                onPress={() => router.push('/wellbeing/journal')}
                divider
              />
              <ListRow
                icon="chatbubbles-outline"
                title="Talk to my coach"
                subtitle="Stress, sleep, consistency"
                onPress={() => router.push('/coach?sujet=bien-etre')}
              />
            </View>
          </Appear>

          <View
            style={{
              marginTop: 20,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 14,
              backgroundColor: theme.sage100,
            }}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={18} color={theme.primary600} />
            <Text variant="caption" tone="ink2" style={{ flex: 1, fontStyle: 'italic' }}>
              “{quoteOfTheDay(today)}”
            </Text>
          </View>
        </>
      )}

      <Text variant="caption" tone="ink3" style={{ marginTop: 24 }}>
        Regain does not diagnose anything and is not a substitute for care from a health professional.
      </Text>
    </Screen>
  );
}
