import { View } from 'react-native';

import { pickBookForGoals } from '../../features/activities/books';
import { useTheme } from '../../theme/ThemeProvider';
import { Card } from '../ui/Card';
import { Text } from '../ui/Text';

export function BookSuggestionCard({ primaryGoals }: { primaryGoals: string[] }) {
  const theme = useTheme();
  const book = pickBookForGoals(primaryGoals);
  return (
    <Card style={{ marginBottom: 16 }}>
      <Text variant="overline" tone="ink2">
        📖 Suggestion de lecture
      </Text>
      <Text variant="cardTitle" style={{ marginTop: 8 }}>
        {book.title}
      </Text>
      <Text variant="caption" tone="ink2" style={{ marginTop: 2 }}>
        {book.author} · {book.year}
      </Text>
      <View style={{ marginTop: 12, borderRadius: 14, padding: 14, backgroundColor: theme.sage100 }}>
        <Text variant="bodySm" style={{ fontStyle: 'italic' }}>
          « {book.keyIdea} »
        </Text>
      </View>
      <Text variant="caption" tone="ink3" style={{ marginTop: 8 }}>
        A key idea put in our own words from this public-domain text, not an exact quotation.
      </Text>
    </Card>
  );
}
