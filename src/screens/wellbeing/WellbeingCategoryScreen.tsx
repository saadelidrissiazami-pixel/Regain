import { router, useLocalSearchParams } from 'expo-router';

import { goBack } from '../../lib/navigation';

import { ProgramRow } from '../../components/cards/ProgramRow';
import { EmptyState, ErrorState, LoadingSkeleton } from '../../components/feedback';
import { Appear, Screen, ScreenHeader } from '../../components/ui';
import { themeLabel } from '../../features/wellbeing/catalogue';
import { useWellbeing } from '../../hooks/useWellbeing';
import { t } from '../../lib/i18n';

// Keyed by the stored `category`, which is an internal key rather than something to read.
const SUBTITLES: Record<string, string> = {
  Respiration: t('A few minutes to let the pressure off.'),
  Méditation: t('Coming back to the present, at your own pace.'),
  Journaling: t('Putting your thoughts down to see them more clearly.'),
  'Confiance en soi': t('Speaking to yourself more kindly.'),
  Sommeil: t('Slowing down to sleep better.'),
  'En public': t('Quiet exercises, wherever you happen to be.'),
};

/** Every session in one theme, shortest first. */
export default function WellbeingCategoryScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const wellbeing = useWellbeing();
  const programs = wellbeing.programs.filter((p) => p.category === name).sort((a, b) => a.duration_minutes - b.duration_minutes);

  return (
    <Screen>
      <ScreenHeader
        title={name ? themeLabel(name) : t('Sessions')}
        subtitle={SUBTITLES[name ?? ''] ?? t('{count} sessions', { count: programs.length })}
        onBack={() => goBack('/(tabs)/wellbeing')}
      />
      {wellbeing.programsQuery.isLoading ? (
        <LoadingSkeleton preset="list" />
      ) : wellbeing.programsQuery.isError ? (
        <ErrorState onRetry={() => wellbeing.programsQuery.refetch()} />
      ) : programs.length === 0 ? (
        <EmptyState title={t('No sessions in this theme yet')} />
      ) : (
        programs.map((program, i) => (
          <Appear key={program.id} index={i}>
            <ProgramRow
              program={program}
              done={wellbeing.completed.has(program.id)}
              locked={wellbeing.isLocked(program)}
              onPress={() => router.push(wellbeing.hrefFor(program) as never)}
            />
          </Appear>
        ))
      )}
    </Screen>
  );
}
