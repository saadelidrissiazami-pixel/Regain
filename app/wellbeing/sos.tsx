import { router } from 'expo-router';
import { View } from 'react-native';

import { ProgramRow } from '../../src/components/cards/ProgramRow';
import { LoadingSkeleton } from '../../src/components/feedback';
import { Card, Screen, ScreenHeader, Text } from '../../src/components/ui';
import { SOS_CATEGORY, SOS_SLUGS, SOS_URGENCE } from '../../src/features/wellbeing/sos';
import { useWellbeing } from '../../src/hooks/useWellbeing';
import { goBack } from '../../src/lib/navigation';

/** The four emergency sessions, in order, with nothing else to choose. */
export default function SosScreen() {
  const { programs, programsQuery, completed } = useWellbeing();
  const sos = SOS_SLUGS.map((slug) => programs.find((p) => p.slug === slug && p.category === SOS_CATEGORY)).filter(
    (program) => program !== undefined
  );

  return (
    <Screen>
      <ScreenHeader
        overline="Deux minutes"
        title="Not okay right now"
        subtitle="One instruction at a time, eyes open. Nothing to prepare."
        onBack={() => goBack('/(tabs)/wellbeing')}
      />

      {/* Placed before the sessions, not after: the app does not get to decide that what is
          happening is anxiety, and a breathing session is no substitute for a phone call. */}
      <Card variant="tinted" style={{ marginBottom: 20 }}>
        <Text variant="bodySm">{SOS_URGENCE}</Text>
      </Card>

      {programsQuery.isLoading ? <LoadingSkeleton preset="list" /> : null}

      <View>
        {sos.map((program) => (
          <ProgramRow
            key={program.id}
            program={program}
            done={completed.has(program.id)}
            locked={false}
            onPress={() => router.push(`/wellbeing/${program.slug}`)}
          />
        ))}
      </View>

      <Text variant="caption" tone="ink3" style={{ marginTop: 24 }}>
        These sessions are not a substitute for a professional. If these moments keep coming back,
        talking to a doctor usually changes more than any exercise will.
      </Text>
    </Screen>
  );
}
