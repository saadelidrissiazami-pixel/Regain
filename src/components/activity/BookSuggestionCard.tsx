import { View } from 'react-native';
import { Text } from '../typography';
import { pickBookForGoals } from '../../features/activities/books';

export function BookSuggestionCard({ primaryGoals }: { primaryGoals: string[] }) {
  const book = pickBookForGoals(primaryGoals);

  return (
    <View className="mb-6 rounded-2xl border border-line bg-surface p-4 shadow-sm">
      <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-2.5 text-sm text-ink">
        📖 Suggestion de lecture
      </Text>
      <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-base text-ink">
        {book.title}
      </Text>
      <Text className="mb-3 text-xs text-ink-soft">
        {book.author} · {book.year}
      </Text>
      <View className="rounded-xl bg-primary-soft p-3">
        <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-sm italic leading-5 text-ink">
          « {book.keyIdea} »
        </Text>
      </View>
      <Text className="mt-2 text-[11px] text-ink-soft">
        Idée clé reformulée à partir de ce texte du domaine public — pas une citation exacte.
      </Text>
    </View>
  );
}
