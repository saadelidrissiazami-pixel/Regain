import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { ProgramRow } from '../../../src/components/cards/ProgramRow';
import { EmptyState, LoadingSkeleton } from '../../../src/components/feedback';
import { Button, Card, ProgressRing, Screen, ScreenHeader, Text } from '../../../src/components/ui';
import { courseBySlug, courseProgress } from '../../../src/features/wellbeing/courses';
import { useWellbeing } from '../../../src/hooks/useWellbeing';
import { goBack } from '../../../src/lib/navigation';

/** One course: its days, what is done, and where to pick up. */
export default function CourseScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const wellbeing = useWellbeing();
  const course = slug ? courseBySlug(slug) : undefined;

  if (!course) {
    return (
      <Screen>
        <EmptyState
          icon="search-outline"
          title="Course not found"
          body="You will find the courses in the Wellbeing tab."
          actionLabel="Go back"
          onAction={() => goBack('/(tabs)/wellbeing')}
        />
      </Screen>
    );
  }

  const progress = courseProgress(course, wellbeing.programs, wellbeing.completed);

  return (
    <Screen>
      <ScreenHeader
        overline="Course"
        title={course.title}
        subtitle={course.subtitle}
        onBack={() => goBack('/(tabs)/wellbeing')}
      />

      <Card variant="tinted" style={{ marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <ProgressRing
            progress={progress.days.length === 0 ? 0 : progress.doneCount / progress.days.length}
            size={64}
            strokeWidth={6}
            animate={false}
          >
            <Text variant="label" tabular>
              {progress.doneCount}/{course.dayCount}
            </Text>
          </ProgressRing>
          <Text variant="bodySm" style={{ flex: 1 }}>
            {course.promise}
          </Text>
        </View>
      </Card>

      {/* Pick up, never start over: a three-week gap must not cost more than a one-day gap. */}
      {progress.nextDay ? (
        <Button
          label={progress.doneCount === 0 ? 'Start day 1' : `Pick up at day ${progress.nextDay.day}`}
          icon="play"
          onPress={() => router.push(wellbeing.hrefFor(progress.nextDay!.program))}
          style={{ marginBottom: 24 }}
        />
      ) : null}

      {wellbeing.programsQuery.isLoading ? <LoadingSkeleton preset="list" /> : null}

      {progress.days.map((day) => (
        <View key={day.program.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Text variant="caption" tone="ink3" tabular style={{ width: 46 }}>
            Day {day.day}
          </Text>
          <View style={{ flex: 1 }}>
            <ProgramRow
              program={day.program}
              done={day.done}
              locked={wellbeing.isLocked(day.program)}
              onPress={() => router.push(wellbeing.hrefFor(day.program))}
            />
          </View>
        </View>
      ))}

      {progress.complete ? (
        <Text variant="bodySm" tone="ink2" style={{ marginTop: 20 }}>
          You have done all {course.dayCount} days. Nothing stops you doing one again when it
          would help — that is what they are for.
        </Text>
      ) : null}
    </Screen>
  );
}
