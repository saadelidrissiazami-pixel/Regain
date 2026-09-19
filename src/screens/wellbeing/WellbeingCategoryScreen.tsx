import { router, useLocalSearchParams } from 'expo-router';

import { ProgramRow } from '../../components/cards/ProgramRow';
import { EmptyState, ErrorState, LoadingSkeleton } from '../../components/feedback';
import { Appear, Screen, ScreenHeader } from '../../components/ui';
import { useWellbeing } from '../../hooks/useWellbeing';

const SUBTITLES: Record<string, string> = {
  Respiration: 'Quelques minutes pour relâcher la pression.',
  Méditation: 'Revenir au moment présent, à ton rythme.',
  Journaling: 'Poser tes pensées pour y voir plus clair.',
  'Confiance en soi': 'Te parler avec plus de bienveillance.',
  Sommeil: 'Ralentir pour mieux dormir.',
  'En public': 'Des exercices discrets, où que tu sois.',
};

/** Toutes les séances d'un thème, de la plus courte à la plus longue. */
export default function WellbeingCategoryScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const wellbeing = useWellbeing();
  const programs = wellbeing.programs.filter((p) => p.category === name).sort((a, b) => a.duration_minutes - b.duration_minutes);

  return (
    <Screen>
      <ScreenHeader title={name ?? 'Séances'} subtitle={SUBTITLES[name ?? ''] ?? `${programs.length} séances`} onBack={() => router.back()} />
      {wellbeing.programsQuery.isLoading ? (
        <LoadingSkeleton preset="list" />
      ) : wellbeing.programsQuery.isError ? (
        <ErrorState onRetry={() => wellbeing.programsQuery.refetch()} />
      ) : programs.length === 0 ? (
        <EmptyState title="Aucune séance dans ce thème pour l'instant" />
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
