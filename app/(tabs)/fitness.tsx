import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

import { Text } from '../../src/components/typography';
import type { NutritionTargets } from '../../src/features/fitness/nutrition';
import type { FitnessPlan, ShoppingItem, WorkoutSession } from '../../src/features/fitness/types';
import { fetchFitnessProfile, fetchLatestFitnessPlan, requestFitnessPlan, targetsForProfile } from '../../src/lib/fitness';
import { usePremium } from '../../src/lib/premium';
import { useAuthStore } from '../../src/store/authStore';

const STRATEGY_LABELS: Record<NutritionTargets['strategy'], string> = {
  deficit: 'Léger déficit — perte progressive',
  surplus: 'Léger surplus — prise de masse',
  maintien: 'Équilibre',
};

function GradientButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} className="overflow-hidden rounded-full shadow-sm">
      <LinearGradient colors={['#F0A324', '#FF6B57']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingVertical: 15 }}>
        <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-center text-white">
          {label}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

function TargetsCard({ targets }: { targets: NutritionTargets }) {
  return (
    <View className="mb-4 rounded-2xl border border-line bg-surface p-4 shadow-sm">
      <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-[11px] uppercase tracking-wide text-primary">
        Vos cibles quotidiennes
      </Text>
      <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mt-1 text-2xl text-ink">
        {targets.calories} kcal
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
              {macro.value} g
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
      <Pressable onPress={() => setOpen((v) => !v)} className="flex-row items-center justify-between px-4 py-3.5">
        <View className="flex-1 pr-3">
          <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-sm text-ink">
            {session.day_label} · {session.focus}
          </Text>
          <Text className="mt-0.5 text-xs text-ink-soft">
            {session.duration_minutes} min · {session.exercises.length} exercices
          </Text>
        </View>
        <Text style={{ transform: [{ rotate: open ? '90deg' : '0deg' }] }} className="text-base text-ink-soft">
          ›
        </Text>
      </Pressable>
      {open ? (
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
      ) : null}
    </View>
  );
}

function ShoppingList({ items }: { items: ShoppingItem[] }) {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const categories = Array.from(new Set(items.map((item) => item.category)));

  const toggle = (index: number) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });

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
                <View
                  className={`mr-3 h-5 w-5 items-center justify-center rounded-md border ${
                    checked.has(index) ? 'border-calm bg-calm' : 'border-line'
                  }`}
                >
                  {checked.has(index) ? <Text className="text-[11px] text-white">✓</Text> : null}
                </View>
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

function PlanView({ plan }: { plan: FitnessPlan }) {
  return (
    <>
      <TargetsCard targets={plan.targets} />

      {plan.coach_notes ? (
        <View className="mb-5 rounded-2xl bg-calm-soft p-4">
          <Text style={{ fontFamily: 'Nunito_700Bold' }} className="mb-1 text-xs text-calm">
            Le mot de votre coach
          </Text>
          <Text className="text-sm leading-5 text-ink">{plan.coach_notes}</Text>
        </View>
      ) : null}

      <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-2.5 text-sm text-ink-soft">
        🏋️ Vos séances de la semaine
      </Text>
      {plan.program.map((session, i) => (
        <SessionCard key={i} session={session} />
      ))}

      <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-2.5 mt-4 text-sm text-ink-soft">
        🍽️ Vos journées types
      </Text>
      {plan.meals.map((day, i) => (
        <View key={i} className="mb-2.5 rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-2 text-sm text-ink">
            {day.day_label} · {day.total_calories} kcal
          </Text>
          {day.meals.map((meal, j) => (
            <View key={j} className="mb-1.5">
              <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-sm text-ink">
                {meal.name} <Text className="text-xs text-ink-soft">· {meal.calories} kcal · {meal.protein_g} g prot.</Text>
              </Text>
              <Text className="text-xs text-ink-soft">{meal.description}</Text>
            </View>
          ))}
        </View>
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
    mutationFn: () => requestFitnessPlan('generate_plan', targets!),
    onSuccess: (plan) => queryClient.setQueryData(['fitnessPlan', userId], plan),
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
      <Text style={{ fontFamily: 'Nunito_700Bold' }} className="mb-1 text-sm text-primary">
        Votre coach IA
      </Text>
      <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-6 text-[28px] leading-8 text-ink">
        Forme
      </Text>

      {!isPremium ? (
        <View className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <Text className="mb-2 text-3xl">🏋️</Text>
          <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-2 text-lg text-ink">
            Un coach forme rien que pour vous
          </Text>
          <Text className="mb-4 text-sm leading-5 text-ink-soft">
            Programme de musculation personnalisé, menus et liste de courses calés sur vos calories, bilan
            chaque semaine et un coach à qui poser vos questions. Réservé aux membres Premium.
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
        <ActivityIndicator color="#FF6B57" />
      ) : profileQuery.isError || planQuery.isError ? (
        // Sans cet état, une panne réseau ferait croire à l'utilisateur qu'il n'a pas de profil.
        <View className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
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
        <View className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
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
                <View className="mb-4 flex-row items-center rounded-2xl bg-surface p-4">
                  <ActivityIndicator color="#FF6B57" />
                  <Text className="ml-3 flex-1 text-sm text-ink-soft">
                    Votre coach prépare vos séances, vos menus et votre liste de courses… Cela peut prendre
                    jusqu&apos;à une minute.
                  </Text>
                </View>
              ) : (
                <View className="mb-4">
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
                <Pressable className="mb-2.5 items-center rounded-full bg-primary px-4 py-3.5 shadow-sm">
                  <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-white">
                    📋 Faire mon bilan de la semaine
                  </Text>
                </Pressable>
              </Link>
              <Link href="/fitness/chat" asChild>
                <Pressable className="items-center rounded-full border border-line bg-surface px-4 py-3.5">
                  <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-ink">
                    💬 Parler à mon coach
                  </Text>
                </Pressable>
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
