import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { Appear, Chevron, haptic, Pop, PressableScale, Skeleton, useAnimatedNumber } from '../../src/components/motion';
import { Text } from '../../src/components/typography';
import type { NutritionTargets } from '../../src/features/fitness/nutrition';
import type { FitnessPlan, MealDay, ShoppingItem, WorkoutSession } from '../../src/features/fitness/types';
import { createFitnessPlan, fetchFitnessProfile, fetchLatestFitnessPlan, targetsForProfile } from '../../src/lib/fitness';
import { usePremium } from '../../src/lib/premium';
import { useAuthStore } from '../../src/store/authStore';

const STRATEGY_LABELS: Record<NutritionTargets['strategy'], string> = {
  deficit: 'Léger déficit — perte progressive',
  surplus: 'Léger surplus — prise de masse',
  maintien: 'Équilibre',
};

function GradientButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <PressableScale onPress={onPress} disabled={disabled} feedback="medium" className="overflow-hidden rounded-full shadow-sm">
      <LinearGradient colors={['#F0A324', '#FF6B57']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingVertical: 15 }}>
        <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-center text-white">
          {label}
        </Text>
      </LinearGradient>
    </PressableScale>
  );
}

function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  return (
    <>
      {Math.round(useAnimatedNumber(value))}
      {suffix}
    </>
  );
}

function TargetsCard({ targets }: { targets: NutritionTargets }) {
  return (
    <View className="mb-4 rounded-2xl border border-line bg-surface p-4 shadow-sm">
      <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-[11px] uppercase tracking-wide text-primary">
        Vos cibles quotidiennes
      </Text>
      <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mt-1 text-2xl text-ink">
        <CountUp value={targets.calories} suffix=" kcal" />
      </Text>
      <Text className="text-xs text-ink-soft">{STRATEGY_LABELS[targets.strategy]}</Text>
      <View className="mt-3 flex-row justify-between">
        {[
          { label: 'Protéines', value: targets.proteinG },
          { label: 'Glucides', value: targets.carbsG },
          { label: 'Lipides', value: targets.fatG },
        ].map((macro) => (
          <View key={macro.label} className="flex-1 items-center rounded-xl bg-paper py-2">
            <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-base text-ink">
              <CountUp value={macro.value} suffix=" g" />
            </Text>
            <Text className="text-[11px] text-ink-soft">{macro.label}</Text>
          </View>
        ))}
      </View>
      {targets.floorApplied ? (
        <Text className="mt-2 text-[11px] text-ink-soft">
          Cible relevée au seuil de sécurité : on ne descend jamais sous votre métabolisme de base.
        </Text>
      ) : null}
    </View>
  );
}

function SessionCard({ session }: { session: WorkoutSession }) {
  const [open, setOpen] = useState(false);
  return (
    <View className="mb-2.5 overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
      <Pressable
        onPress={() => {
          haptic.selection();
          setOpen((v) => !v);
        }}
        className="flex-row items-center justify-between px-4 py-3.5"
      >
        <View className="flex-1 pr-3">
          <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-sm text-ink">
            {session.day_label} · {session.focus}
          </Text>
          <Text className="mt-0.5 text-xs text-ink-soft">
            {session.duration_minutes} min · {session.exercises.length} exercices
          </Text>
        </View>
        <Chevron open={open}>
          <Text className="text-base text-ink-soft">›</Text>
        </Chevron>
      </Pressable>
      {open ? (
        <Animated.View entering={FadeIn.duration(220)} exiting={FadeOut.duration(140)}>
        <View className="px-4 pb-4">
          <Text className="mb-2 text-xs text-ink-soft">🔥 Échauffement : {session.warmup}</Text>
          {session.exercises.map((exercise, i) => (
            <View key={i} className="mb-2 rounded-xl bg-paper p-3">
              <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-sm text-ink">
                {exercise.name}
              </Text>
              <Text className="text-xs text-ink-soft">
                {exercise.sets} × {exercise.reps} · repos {exercise.rest_seconds} s
              </Text>
              <Text className="mt-1 text-xs text-ink-soft">💡 {exercise.tip}</Text>
            </View>
          ))}
          <Text className="text-xs text-ink-soft">🧘 Retour au calme : {session.cooldown}</Text>
        </View>
        </Animated.View>
      ) : null}
    </View>
  );
}

function ShoppingList({ items }: { items: ShoppingItem[] }) {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const categories = Array.from(new Set(items.map((item) => item.category)));

  const toggle = (index: number) => {
    haptic.selection();
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <View className="mb-4 rounded-2xl border border-line bg-surface p-4 shadow-sm">
      {categories.map((category) => (
        <View key={category} className="mb-3">
          <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-1.5 text-xs uppercase tracking-wide text-ink-soft">
            {category}
          </Text>
          {items.map((item, index) =>
            item.category === category ? (
              <Pressable key={index} onPress={() => toggle(index)} className="flex-row items-center py-1.5">
                <Pop trigger={checked.has(index)} style={{ marginRight: 12 }}>
                  <View
                    className={`h-5 w-5 items-center justify-center rounded-md border ${
                      checked.has(index) ? 'border-calm bg-calm' : 'border-line'
                    }`}
                  >
                    {checked.has(index) ? <Text className="text-[11px] text-white">✓</Text> : null}
                  </View>
                </Pop>
                <Text className={`flex-1 text-sm ${checked.has(index) ? 'text-ink-soft line-through' : 'text-ink'}`}>
                  {item.item}
                </Text>
                <Text className="text-xs text-ink-soft">{item.quantity}</Text>
              </Pressable>
            ) : null
          )}
        </View>
      ))}
    </View>
  );
}

function MealDayCard({ day, defaultOpen }: { day: MealDay; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const protein = day.meals.reduce((sum, meal) => sum + meal.protein_g, 0);
  return (
    <View className="mb-2.5 overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
      <Pressable
        onPress={() => {
          haptic.selection();
          setOpen((v) => !v);
        }}
        className="flex-row items-center justify-between px-4 py-3.5"
      >
        <View className="flex-1 pr-3">
          <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-sm text-ink">
            {day.day_label} · {day.total_calories} kcal
          </Text>
          <Text className="mt-0.5 text-xs text-ink-soft">
            {day.meals.length} repas · {protein} g de protéines
          </Text>
        </View>
        <Chevron open={open}>
          <Text className="text-base text-ink-soft">›</Text>
        </Chevron>
      </Pressable>
      {open ? (
        <Animated.View entering={FadeIn.duration(220)} exiting={FadeOut.duration(140)}>
          <View className="px-4 pb-3">
            {day.meals.map((meal, j) => (
              <View key={j} className="mb-2">
                <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-sm text-ink">
                  {meal.name} <Text className="text-xs text-ink-soft">· {meal.calories} kcal · {meal.protein_g} g prot.</Text>
                </Text>
                <Text className="text-xs text-ink-soft">{meal.description}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
}

function PlanView({ plan }: { plan: FitnessPlan }) {
  return (
    <>
      <Appear index={1}>
        <TargetsCard targets={plan.targets} />
      </Appear>

      {plan.coach_notes ? (
        <Appear index={2}>
          <View className="mb-5 rounded-2xl bg-calm-soft p-4">
            <Text style={{ fontFamily: 'Nunito_700Bold' }} className="mb-1 text-xs text-calm">
              Le mot de votre coach
            </Text>
            <Text className="text-sm leading-5 text-ink">{plan.coach_notes}</Text>
          </View>
        </Appear>
      ) : null}

      <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-2.5 text-sm text-ink-soft">
        🏋️ Vos séances de la semaine
      </Text>
      {plan.program.map((session, i) => (
        <Appear key={i} index={i + 3}>
          <SessionCard session={session} />
        </Appear>
      ))}

      <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-2.5 mt-4 text-sm text-ink-soft">
        🍽️ Vos journées types
      </Text>
      {plan.meals.map((day, i) => (
        <Appear key={i} index={i + 3 + plan.program.length}>
          <MealDayCard day={day} defaultOpen={i === 0} />
        </Appear>
      ))}

      <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-2.5 mt-4 text-sm text-ink-soft">
        🛒 Liste de courses de la semaine
      </Text>
      <ShoppingList items={plan.shopping_list} />
    </>
  );
}

export default function FitnessScreen() {
  const session = useAuthStore((s) => s.session);
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  const { isPremium, isLoading: premiumLoading } = usePremium();

  const profileQuery = useQuery({
    queryKey: ['fitnessProfile', userId],
    queryFn: () => fetchFitnessProfile(userId!),
    enabled: !!userId && isPremium,
  });

  const planQuery = useQuery({
    queryKey: ['fitnessPlan', userId],
    queryFn: () => fetchLatestFitnessPlan(userId!),
    enabled: !!userId && isPremium,
  });

  const profile = profileQuery.data;
  const targets = profile ? targetsForProfile(profile) : null;

  const generateMutation = useMutation({
    mutationFn: () => createFitnessPlan(userId!, profile!),
    onSuccess: (plan) => {
      haptic.success();
      queryClient.setQueryData(['fitnessPlan', userId], plan);
    },
  });

  if (premiumLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-paper">
        <ActivityIndicator color="#FF6B57" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-paper px-5 pt-16" contentContainerStyle={{ paddingBottom: 40 }}>
      <Appear>
        <Text style={{ fontFamily: 'Nunito_700Bold' }} className="mb-1 text-sm text-primary">
          Votre coach
        </Text>
        <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-6 text-[28px] leading-8 text-ink">
          Forme
        </Text>
      </Appear>

      {/* Une clé par état : sans elle, React réutilise la même View d'un état à l'autre et NativeWind
          plante sur iOS quand une ombre (shadow-sm) apparaît sur une vue déjà affichée. */}
      {!isPremium ? (
        <View key="teaser" className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <Text className="mb-2 text-3xl">🏋️</Text>
          <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-2 text-lg text-ink">
            Un coach forme rien que pour vous
          </Text>
          <Text className="mb-4 text-sm leading-5 text-ink-soft">
            Programme de musculation personnalisé, menus et liste de courses calés sur vos calories, et un
            bilan chaque semaine pour tout ajuster. Réservé aux membres Premium.
          </Text>
          <Link href="/paywall" asChild>
            <Pressable className="items-center rounded-full bg-primary px-4 py-3">
              <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-white">
                Découvrir Premium
              </Text>
            </Pressable>
          </Link>
        </View>
      ) : profileQuery.isLoading || planQuery.isLoading ? (
        <View key="loading">
          <Skeleton height={130} />
          <Skeleton height={80} />
          <Skeleton height={60} />
          <Skeleton height={60} />
        </View>
      ) : profileQuery.isError || planQuery.isError ? (
        // Sans cet état, une panne réseau ferait croire à l'utilisateur qu'il n'a pas de profil.
        <View key="error" className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <Text className="mb-4 text-sm text-ink-soft">
            Impossible de charger votre espace forme pour le moment.
          </Text>
          <Pressable
            onPress={() => {
              profileQuery.refetch();
              planQuery.refetch();
            }}
            className="items-center rounded-full border border-line bg-paper px-4 py-3"
          >
            <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-ink">
              Réessayer
            </Text>
          </Pressable>
        </View>
      ) : !profile ? (
        <View key="welcome" className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-2 text-lg text-ink">
            Faisons connaissance
          </Text>
          <Text className="mb-4 text-sm leading-5 text-ink-soft">
            Quelques questions sur vos objectifs, votre niveau et vos habitudes alimentaires, et votre coach vous
            prépare un programme sur mesure.
          </Text>
          <Link href="/fitness/questionnaire" asChild>
            <Pressable className="items-center rounded-full bg-primary px-4 py-3">
              <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-white">
                Commencer le questionnaire
              </Text>
            </Pressable>
          </Link>
        </View>
      ) : (
        <>
          {planQuery.data ? (
            <PlanView plan={planQuery.data} />
          ) : (
            <>
              {targets ? <TargetsCard targets={targets} /> : null}
              {generateMutation.isPending ? (
                <View key="generating" className="mb-4 flex-row items-center rounded-2xl bg-surface p-4">
                  <ActivityIndicator color="#FF6B57" />
                  <Text className="ml-3 flex-1 text-sm text-ink-soft">
                    Préparation de vos séances, de vos menus et de votre liste de courses…
                  </Text>
                </View>
              ) : (
                <View key="generate" className="mb-4">
                  <GradientButton label="✨ Générer mon programme" onPress={() => generateMutation.mutate()} />
                </View>
              )}
              {generateMutation.isError ? (
                <Text className="mb-4 text-xs text-red-700">{(generateMutation.error as Error).message}</Text>
              ) : null}
            </>
          )}

          {planQuery.data ? (
            <View className="mb-3">
              <Link href="/fitness/checkin" asChild>
                <PressableScale feedback="medium" className="items-center rounded-full bg-primary px-4 py-3.5 shadow-sm">
                  <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-white">
                    📋 Faire mon bilan de la semaine
                  </Text>
                </PressableScale>
              </Link>
            </View>
          ) : null}

          <Link href="/fitness/questionnaire" asChild>
            <Pressable className="items-center py-3">
              <Text className="text-sm text-ink-soft underline">Modifier mon profil forme</Text>
            </Pressable>
          </Link>
        </>
      )}

      <Text className="mt-4 text-xs text-ink-soft">
        Regain ne remplace pas l&apos;avis d&apos;un médecin ou d&apos;un diététicien. En cas de problème de santé,
        de blessure ou de grossesse, demandez conseil à un professionnel avant de commencer.
      </Text>
    </ScrollView>
  );
}
