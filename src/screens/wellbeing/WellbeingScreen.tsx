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
import { SOS_CATEGORY } from '../../features/wellbeing/sos';
import type { WellbeingProgram } from '../../features/wellbeing/types';
import { useEnergyToday } from '../../hooks/useEnergyToday';
import { useWellbeing } from '../../hooks/useWellbeing';
import { useToday } from '../../lib/useCurrentDate';
import { useTheme } from '../../theme/ThemeProvider';

/** Bien-être : « Qu'est-ce qui pourrait m'aider maintenant ? » */
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

  // Les SOS ne sont pas un thème : elles ne se parcourent pas, elles se déclenchent. Elles ont
  // leur propre accès, en haut de l'écran.
  const sos = programs.filter((program) => program.category === SOS_CATEGORY);
  const byCategory = new Map<string, WellbeingProgram[]>();
  for (const program of programs.filter((program) => program.category !== SOS_CATEGORY)) {
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
        overline="Prends un moment"
        title="Bien-être"
        subtitle="Un esprit plus calme, une vie plus riche."
        right={<IconButton icon="search" label="Rechercher une séance" onPress={() => router.push('/wellbeing/search')} />}
      />

      {programsQuery.isLoading ? (
        <LoadingSkeleton preset="hero" />
      ) : programsQuery.isError ? (
        <ErrorState title="La bibliothèque n'a pas pu se charger" onRetry={() => programsQuery.refetch()} retrying={programsQuery.isFetching} />
      ) : (
        <>
          {/* Avant tout le reste : quand ça ne va pas là, maintenant, on ne doit pas avoir à
              parcourir une bibliothèque. Discret quand tout va bien, trouvable quand il faut. */}
          {sos.length > 0 ? (
            <Appear index={0}>
              <View style={{ marginBottom: 18 }}>
                <ListRow
                  icon="pulse-outline"
                  title="Ça ne va pas là, maintenant"
                  subtitle={`${sos.length} séances de 2 minutes, tout de suite`}
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

          <Appear index={2}>
            <View style={{ marginTop: 28 }}>
              <SectionHeader
                title="Explorer par thème"
                actionLabel="Voir tout"
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
                title="Mon journal"
                subtitle={
                  lastEntry
                    ? `Dernière séance : ${lastEntry.program?.title ?? 'séance'}${lastMood ? ` · ${lastMood.label.toLowerCase()}` : ''}`
                    : 'Tes ressentis et tes réponses, séance après séance.'
                }
                onPress={() => router.push('/wellbeing/journal')}
                divider
              />
              <ListRow
                icon="chatbubbles-outline"
                title="Parler à mon coach"
                subtitle="Stress, sommeil, régularité"
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
              « {quoteOfTheDay(today)} »
            </Text>
          </View>
        </>
      )}

      <Text variant="caption" tone="ink3" style={{ marginTop: 24 }}>
        Regain ne pose pas de diagnostic médical et ne remplace pas l&apos;accompagnement d&apos;un professionnel de santé.
      </Text>
    </Screen>
  );
}
