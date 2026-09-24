import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { goBack } from '../../lib/navigation';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { ProgramRow } from '../../components/cards/ProgramRow';
import { WELLBEING_ORDER } from '../../components/cards/wellbeingThemes';
import { ErrorState, LoadingSkeleton } from '../../components/feedback';
import { themeLabel } from '../../features/wellbeing/catalogue';
import { ChoiceChip, Screen, ScreenHeader, Text, TextInput } from '../../components/ui';
import { useWellbeing } from '../../hooks/useWellbeing';
import { useTheme } from '../../theme/ThemeProvider';
import { t } from '../../lib/i18n';

/** Every session, with a search box and a filter by theme. */
export default function WellbeingSearchScreen() {
  const theme = useTheme();
  const wellbeing = useWellbeing();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const needle = search.trim().toLowerCase();
  const categories = WELLBEING_ORDER.filter((c) => wellbeing.programs.some((p) => p.category === c));
  const results = wellbeing.programs
    .filter(
      (p) =>
        (!category || p.category === category) &&
        (!needle || `${p.title} ${themeLabel(p.category)}`.toLowerCase().includes(needle))
    )
    .sort((a, b) => WELLBEING_ORDER.indexOf(a.category) - WELLBEING_ORDER.indexOf(b.category) || a.duration_minutes - b.duration_minutes);

  return (
    <Screen keyboard>
      <ScreenHeader title={t('All sessions')} onBack={() => goBack('/(tabs)/wellbeing')} />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: 48,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: theme.line,
          backgroundColor: theme.surface,
          paddingHorizontal: 14,
          marginBottom: 12,
        }}
      >
        <Ionicons name="search" size={18} color={theme.ink3} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={t('Breathing, sleep, confidence…')}
          accessibilityLabel={t('Search sessions')}
          returnKeyType="search"
          style={{ flex: 1, marginLeft: 8, paddingVertical: 12 }}
        />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, marginBottom: 16 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
        <ChoiceChip label={t('All')} selected={category === null} multiple={false} onPress={() => setCategory(null)} />
        {categories.map((c) => (
          <ChoiceChip key={c} label={themeLabel(c)} selected={category === c} multiple={false} onPress={() => setCategory(c)} />
        ))}
      </ScrollView>

      {wellbeing.programsQuery.isLoading ? (
        <LoadingSkeleton preset="list" />
      ) : wellbeing.programsQuery.isError ? (
        <ErrorState onRetry={() => wellbeing.programsQuery.refetch()} />
      ) : results.length === 0 ? (
        <Text variant="bodySm" tone="ink2">
          {t('Nothing matches. Try another word.')}
        </Text>
      ) : (
        results.map((program) => (
          <ProgramRow
            key={program.id}
            program={program}
            showCategory
            done={wellbeing.completed.has(program.id)}
            locked={wellbeing.isLocked(program)}
            onPress={() => router.push(wellbeing.hrefFor(program) as never)}
          />
        ))
      )}
    </Screen>
  );
}
