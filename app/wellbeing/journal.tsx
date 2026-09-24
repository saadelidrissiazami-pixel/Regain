import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';

import { goBack } from '../../src/lib/navigation';
import { View } from 'react-native';

import { EmptyState, ErrorState, LoadingSkeleton } from '../../src/components/feedback';
import { Appear, Card, Screen, ScreenHeader, Text } from '../../src/components/ui';
import { averageMood, moodOption } from '../../src/features/wellbeing/reflection';
import { formatDateTimeLabel } from '../../src/lib/formatDate';
import { fetchWellbeingJournal, type JournalEntry } from '../../src/lib/wellbeing';
import { useAuthStore } from '../../src/store/authStore';
import { useTheme } from '../../src/theme/ThemeProvider';

function EntryCard({ entry }: { entry: JournalEntry }) {
  const theme = useTheme();
  const mood = moodOption(entry.mood);
  return (
    <Card style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text variant="label">{entry.program?.title ?? 'Session'}</Text>
          <Text variant="caption" tone="ink2" style={{ marginTop: 2 }}>
            {formatDateTimeLabel(entry.completed_at)}
          </Text>
        </View>
        {mood ? (
          <View style={{ alignItems: 'center', maxWidth: 96 }}>
            <Text variant="section">{mood.emoji}</Text>
            <Text variant="caption" tone="ink2" center style={{ fontSize: 11, lineHeight: 14 }}>
              {mood.label}
            </Text>
          </View>
        ) : null}
      </View>
      {entry.reflections.map((reflection) => (
        <View key={reflection.prompt} style={{ marginTop: 12 }}>
          <Text variant="caption" tone="ink2">
            {reflection.prompt}
          </Text>
          <Text variant="bodySm" style={{ marginTop: 2 }}>
            {reflection.answer}
          </Text>
        </View>
      ))}
      {entry.note ? (
        <View style={{ marginTop: 12, borderRadius: 12, padding: 12, backgroundColor: theme.sage100 }}>
          <Text variant="bodySm">{entry.note}</Text>
        </View>
      ) : null}
    </Card>
  );
}

export default function WellbeingJournalScreen() {
  const userId = useAuthStore((s) => s.session?.user.id);
  const journalQuery = useQuery({ queryKey: ['wellbeingJournal', userId], queryFn: () => fetchWellbeingJournal(userId!), enabled: !!userId });

  const entries = journalQuery.data ?? [];
  const written = entries.filter((entry) => entry.note || entry.reflections.length > 0).length;
  const average = averageMood(entries.map((entry) => entry.mood));
  const averageEmoji = moodOption(average === null ? null : Math.round(average))?.emoji;

  return (
    <Screen refreshing={journalQuery.isRefetching} onRefresh={() => journalQuery.refetch()}>
      <ScreenHeader overline="Wellbeing" title="My journal" subtitle="How you felt and what you wrote, session after session." onBack={() => goBack('/(tabs)/wellbeing')} />
      {journalQuery.isLoading ? (
        <LoadingSkeleton preset="list" />
      ) : journalQuery.isError ? (
        <ErrorState title="Ton journal n'a pas pu se charger" onRetry={() => journalQuery.refetch()} />
      ) : entries.length === 0 ? (
        <EmptyState
          icon="book-outline"
          title="Nothing to read back yet"
          body="At the end of each session you note how it felt and answer two questions. It all ends up here."
          actionLabel="Pick a session"
          onAction={() => router.navigate('/(tabs)/wellbeing')}
        />
      ) : (
        <>
          <Appear>
            <Card variant="tinted" style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Text variant="headline">{averageEmoji ?? '🌱'}</Text>
                <View style={{ flex: 1 }}>
                  <Text variant="label">
                    {entries.length} session{entries.length > 1 ? 's' : ''} finished
                  </Text>
                  <Text variant="caption" tone="ink2">
                    {average === null ? 'Nothing noted yet.' : `Average feeling: ${average} out of 5`}
                    {written > 0 ? ` · ${written} in your own words` : ''}
                  </Text>
                </View>
              </View>
            </Card>
          </Appear>
          {entries.map((entry, i) => (
            <Appear key={entry.id} index={i + 1}>
              <EntryCard entry={entry} />
            </Appear>
          ))}
        </>
      )}
    </Screen>
  );
}
