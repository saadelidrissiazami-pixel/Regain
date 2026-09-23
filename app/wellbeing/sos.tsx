import { router } from 'expo-router';
import { View } from 'react-native';

import { ProgramRow } from '../../src/components/cards/ProgramRow';
import { LoadingSkeleton } from '../../src/components/feedback';
import { Card, Screen, ScreenHeader, Text } from '../../src/components/ui';
import { SOS_CATEGORY, SOS_SLUGS, SOS_URGENCE } from '../../src/features/wellbeing/sos';
import { useWellbeing } from '../../src/hooks/useWellbeing';
import { goBack } from '../../src/lib/navigation';

/** Les quatre séances d'urgence, dans l'ordre, sans rien à choisir de plus. */
export default function SosScreen() {
  const { programs, programsQuery, completed } = useWellbeing();
  const sos = SOS_SLUGS.map((slug) => programs.find((p) => p.slug === slug && p.category === SOS_CATEGORY)).filter(
    (program) => program !== undefined
  );

  return (
    <Screen>
      <ScreenHeader
        overline="Deux minutes"
        title="Ça ne va pas là, maintenant"
        subtitle="Une consigne à la fois, les yeux ouverts. Rien à préparer."
        onBack={() => goBack('/(tabs)/wellbeing')}
      />

      {/* Placée avant les séances, pas après : l'application n'a pas à décider que ce qui se
          passe est de l'angoisse, et une séance de respiration ne remplace pas un appel. */}
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
        Ces séances ne remplacent pas un professionnel. Si ces moments reviennent souvent, en
        parler à un médecin change généralement plus de choses que n&apos;importe quel exercice.
      </Text>
    </Screen>
  );
}
