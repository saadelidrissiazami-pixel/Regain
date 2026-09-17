import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';

import { Appear, Skeleton } from '../../src/components/motion';
import { Text } from '../../src/components/typography';
import { averageMood, moodOption } from '../../src/features/wellbeing/reflection';
import { formatDateTimeLabel } from '../../src/lib/formatDate';
import { fetchWellbeingJournal, type JournalEntry } from '../../src/lib/wellbeing';
import { useAuthStore } from '../../src/store/authStore';

function EntryCard({ entry }: { entry: JournalEntry }) {
  const mood = moodOption(entry.mood);
  return (
    <View className="mb-3 rounded-2xl border border-line bg-surface p-4 shadow-sm">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-sm text-ink">
            {entry.program?.title ?? 'Séance'}
          </Text>
          <Text className="mt-0.5 text-xs text-ink-soft">{formatDateTimeLabel(entry.completed_at)}</Text>
        </View>
        {mood ? (
          <View className="items-center">
            <Text className="text-2xl">{mood.emoji}</Text>
            <Text className="text-[10px] text-ink-soft">{mood.label}</Text>
          </View>
        ) : null}
      </View>

      {entry.reflections.map((reflection) => (
        <View key={reflection.prompt} className="mt-3">
          <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-[11px] uppercase tracking-wide text-ink-soft">
            {reflection.prompt}
          </Text>
          <Text className="mt-0.5 text-sm leading-5 text-ink">{reflection.answer}</Text>
        </View>
      ))}

      {entry.note ? (
        <View className="mt-3 rounded-xl bg-paper p-3">
          <Text className="text-sm leading-5 text-ink">{entry.note}</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function WellbeingJournalScreen() {
  const userId = useAuthStore((s) => s.session?.user.id);

  const journalQuery = useQuery({
    queryKey: ['wellbeingJournal', userId],
    queryFn: () => fetchWellbeingJournal(userId!),
    enabled: !!userId,
  });

  const entries = journalQuery.data ?? [];
  const written = entries.filter((entry) => entry.note || entry.reflections.length > 0).length;
  const average = averageMood(entries.map((entry) => entry.mood));
  const averageEmoji = moodOption(average === null ? null : Math.round(average))?.emoji;

  return (
    <ScrollView className="flex-1 bg-paper px-5 pt-16" contentContainerStyle={{ paddingBottom: 40 }}>
      <Pressable onPress={() => router.back()} className="mb-5">
        <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-sm text-ink-soft">
          ← Retour
        </Text>
      </Pressable>

      <Appear>
        <Text style={{ fontFamily: 'Nunito_700Bold' }} className="mb-1 text-sm text-calm">
          Bien-être
        </Text>
        <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-6 text-[28px] leading-8 text-ink">
          Mon journal
        </Text>
      </Appear>

      {journalQuery.isLoading ? (
        <View>
          <Skeleton height={120} />
          <Skeleton height={120} />
        </View>
      ) : journalQuery.isError ? (
        <View className="rounded-2xl border border-line bg-surface p-4">
          <Text className="text-sm text-ink">Impossible de charger votre journal pour le moment.</Text>
          <Pressable onPress={() => journalQuery.refetch()} className="mt-2">
            <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-sm text-primary">
              Réessayer
            </Text>
          </Pressable>
        </View>
      ) : entries.length === 0 ? (
        <View className="rounded-2xl border border-line bg-surface p-5">
          <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-1 text-base text-ink">
            Rien à relire pour l'instant
          </Text>
          <Text className="text-sm leading-5 text-ink-soft">
            À la fin de chaque séance de bien-être, vous notez votre ressenti et répondez à deux questions. Tout
            se retrouve ici.
          </Text>
        </View>
      ) : (
        <>
          <Appear index={1}>
            <View className="mb-5 flex-row items-center rounded-2xl border border-line bg-surface p-4 shadow-sm">
              <Text className="mr-3 text-3xl">{averageEmoji ?? '🌱'}</Text>
              <View className="flex-1">
                <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-sm text-ink">
                  {entries.length} séance{entries.length > 1 ? 's' : ''} terminée{entries.length > 1 ? 's' : ''}
                </Text>
                <Text className="text-xs text-ink-soft">
                  {average === null
                    ? 'Aucun ressenti noté pour le moment.'
                    : `Ressenti moyen : ${average} sur 5`}
                  {written > 0 ? ` · ${written} avec vos mots` : ''}
                </Text>
              </View>
            </View>
          </Appear>

          {entries.map((entry, i) => (
            <Appear key={entry.id} index={i + 2}>
              <EntryCard entry={entry} />
            </Appear>
          ))}
        </>
      )}
    </ScrollView>
  );
}
