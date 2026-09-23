import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { ProgramRow } from '../../../src/components/cards/ProgramRow';
import { EmptyState, LoadingSkeleton } from '../../../src/components/feedback';
import { Button, Card, ProgressRing, Screen, ScreenHeader, Text } from '../../../src/components/ui';
import { courseBySlug, courseProgress } from '../../../src/features/wellbeing/courses';
import { useWellbeing } from '../../../src/hooks/useWellbeing';
import { goBack } from '../../../src/lib/navigation';

/** Un parcours : ses jours, ce qui est fait, et où reprendre. */
export default function CourseScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const wellbeing = useWellbeing();
  const course = slug ? courseBySlug(slug) : undefined;

  if (!course) {
    return (
      <Screen>
        <EmptyState
          icon="search-outline"
          title="Parcours introuvable"
          body="Retrouve les parcours dans l'onglet Bien-être."
          actionLabel="Retour"
          onAction={() => goBack('/(tabs)/wellbeing')}
        />
      </Screen>
    );
  }

  const progress = courseProgress(course, wellbeing.programs, wellbeing.completed);

  return (
    <Screen>
      <ScreenHeader
        overline="Parcours"
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

      {/* Reprendre, jamais recommencer : une interruption de trois semaines ne doit pas coûter
          plus cher qu'une interruption d'un jour. */}
      {progress.nextDay ? (
        <Button
          label={progress.doneCount === 0 ? 'Commencer le jour 1' : `Reprendre au jour ${progress.nextDay.day}`}
          icon="play"
          onPress={() => router.push(wellbeing.hrefFor(progress.nextDay!.program))}
          style={{ marginBottom: 24 }}
        />
      ) : null}

      {wellbeing.programsQuery.isLoading ? <LoadingSkeleton preset="list" /> : null}

      {progress.days.map((day) => (
        <View key={day.program.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Text variant="caption" tone="ink3" tabular style={{ width: 46 }}>
            Jour {day.day}
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
          Tu as fait les {course.dayCount} jours. Rien ne t&apos;empêche d&apos;en refaire un
          quand il te sera utile — c&apos;est même l&apos;usage prévu.
        </Text>
      ) : null}
    </Screen>
  );
}
