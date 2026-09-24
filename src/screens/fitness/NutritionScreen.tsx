import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { goBack } from '../../lib/navigation';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { TargetsCard } from '../../components/cards/TargetsCard';
import { EmptyState, ErrorState, LoadingSkeleton } from '../../components/feedback';
import { Appear, Card, Chevron, haptic, Pop, Screen, ScreenHeader, SectionHeader, SegmentedControl, Text, Thumbnail } from '../../components/ui';
import type { MealDay, ShoppingItem } from '../../features/fitness/types';
import { useFitness } from '../../hooks/useFitness';
import { IMAGES } from '../../theme/images';
import { useTheme } from '../../theme/ThemeProvider';

function MealDayCard({ day, defaultOpen }: { day: MealDay; defaultOpen: boolean }) {
  const theme = useTheme();
  const [open, setOpen] = useState(defaultOpen);
  const protein = day.meals.reduce((sum, meal) => sum + meal.protein_g, 0);
  return (
    <Card padding={0} style={{ marginBottom: 10, overflow: 'hidden' }}>
      <Pressable
        onPress={() => {
          haptic.selection();
          setOpen((v) => !v);
        }}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${day.day_label}, ${day.total_calories} kilocalories, ${day.meals.length} repas`}
        style={{ flexDirection: 'row', alignItems: 'center', minHeight: 64, paddingHorizontal: 16, paddingVertical: 12 }}
      >
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text variant="label">
            {day.day_label} · {day.total_calories} kcal
          </Text>
          <Text variant="caption" tone="ink2" style={{ marginTop: 2 }}>
            {day.meals.length} meals · {protein} g protein
          </Text>
        </View>
        <Chevron open={open}>
          <Ionicons name="chevron-forward" size={18} color={theme.ink3} />
        </Chevron>
      </Pressable>
      {open ? (
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(140)}>
          <View style={{ paddingHorizontal: 16, paddingBottom: 14 }}>
            {day.meals.map((meal, j) => (
              <View key={j} style={{ paddingVertical: 8, borderTopWidth: 1, borderTopColor: theme.divider }}>
                <Text variant="label">{meal.name}</Text>
                <Text variant="caption" tone="ink2" style={{ marginTop: 2 }}>
                  {meal.calories} kcal · {meal.protein_g} g protein
                </Text>
                <Text variant="caption" tone="ink2" style={{ marginTop: 4 }}>
                  {meal.description}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>
      ) : null}
    </Card>
  );
}

function ShoppingList({ items }: { items: ShoppingItem[] }) {
  const theme = useTheme();
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const categories = Array.from(new Set(items.map((item) => item.category)));

  const toggle = (index: number) => {
    haptic.selection();
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <Card>
      <Text variant="caption" tone="ink2" style={{ marginBottom: 8 }}>
        {checked.size} of {items.length} in the basket
      </Text>
      {categories.map((category) => (
        <View key={category} style={{ marginBottom: 12 }}>
          <Text variant="overline" tone="ink2" style={{ marginBottom: 4 }}>
            {category}
          </Text>
          {items.map((item, index) => {
            if (item.category !== category) return null;
            const done = checked.has(index);
            return (
              <Pressable
                key={index}
                onPress={() => toggle(index)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: done }}
                accessibilityLabel={`${item.item}, ${item.quantity}`}
                style={{ flexDirection: 'row', alignItems: 'center', minHeight: 44 }}
              >
                <Pop trigger={done} style={{ marginRight: 12 }}>
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 7,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: done ? 0 : 1.5,
                      borderColor: theme.line,
                      backgroundColor: done ? theme.primary600 : 'transparent',
                    }}
                  >
                    {done ? <Ionicons name="checkmark" size={14} color={theme.dark ? theme.bg : '#FFFFFF'} /> : null}
                  </View>
                </Pop>
                <Text variant="bodySm" tone={done ? 'ink3' : 'ink'} style={[{ flex: 1 }, done ? { textDecorationLine: 'line-through' } : null]}>
                  {item.item}
                </Text>
                <Text variant="caption" tone="ink2">
                  {item.quantity}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </Card>
  );
}

/** Nutrition for the week: targets, sample days and the shopping list. */
export default function NutritionScreen() {
  const fitness = useFitness();
  const [tab, setTab] = useState<'meals' | 'shopping'>('meals');
  const plan = fitness.plan;

  return (
    <Screen>
      <ScreenHeader title="Nutrition" subtitle="Your meals and your shopping for the week" onBack={() => goBack('/(tabs)/fitness')} />
      {fitness.isLoading ? (
        <LoadingSkeleton preset="list" />
      ) : fitness.isError ? (
        <ErrorState onRetry={() => fitness.refetch()} />
      ) : !fitness.isPremium ? (
        // Without this case, a free account arriving here would read “build your programme”:
        // une consigne qu'il ne peut pas suivre.
        <EmptyState
          icon="cart-outline"
          title="Your meals and your shopping list"
          body="With Premium: days of meals matched to what you need, and the shopping list that goes with them, already sorted by aisle. Tick items off as you shop, and know what to cook that evening."
          actionLabel="See what Premium adds"
          onAction={() => router.push('/paywall?source=locked')}
        />
      ) : !plan ? (
        <EmptyState icon="restaurant-outline" title="No meals yet" body="Build your programme from the Fitness tab." />
      ) : (
        <>
          <View style={{ marginBottom: 24 }}>
            <Thumbnail source={IMAGES.nutrition} width="100%" height={170} radius={22} icon="restaurant-outline" />
          </View>
          {fitness.targets ? (
            <View style={{ marginBottom: 24 }}>
              <SectionHeader title="Today’s targets" />
              <TargetsCard targets={fitness.targets} />
            </View>
          ) : null}
          <SegmentedControl
            label="Nutrition"
            value={tab}
            onChange={setTab}
            options={[
              { value: 'meals', label: 'Sample days' },
              { value: 'shopping', label: 'Shopping list' },
            ]}
          />
          <View style={{ height: 16 }} />
          {tab === 'meals'
            ? plan.meals.map((day, i) => (
                <Appear key={i} index={i}>
                  <MealDayCard day={day} defaultOpen={i === 0} />
                </Appear>
              ))
            : <ShoppingList items={plan.shopping_list} />}
        </>
      )}
    </Screen>
  );
}
