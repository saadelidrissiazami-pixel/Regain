import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { View } from 'react-native';

import { errorMessage, InlineNotice, LoadingSkeleton } from '../../src/components/feedback';
import { Button, ChoiceChip, Field, haptic, Screen, ScreenHeader, SegmentedControl, Select, SelectMulti, Text } from '../../src/components/ui';
import { affectsPlan } from '../../src/features/fitness/planGenerator';
import { trainingDays } from '../../src/features/fitness/schedule';
import {
  ACTIVITY_LEVELS,
  DIET_OPTIONS,
  EQUIPMENT_OPTIONS,
  EXPERIENCE_LEVELS,
  FITNESS_GOALS,
  SEX_OPTIONS,
} from '../../src/features/fitness/options';
import {
  fitnessQuestionnaireSchema,
  profileToQuestionnaire,
  questionnaireToProfile,
  type FitnessQuestionnaireValues,
} from '../../src/features/fitness/schema';
import type { FitnessProfile } from '../../src/features/fitness/types';
import {
  countFitnessPlans,
  createFitnessPlan,
  fetchFitnessProfile,
  fetchTrainingSchedule,
  saveFitnessProfile,
  saveTrainingSchedule,
  type TimeSlot,
  type TrainingSchedule,
} from '../../src/lib/fitness';
import { useAuthStore } from '../../src/store/authStore';

const DAYS_OPTIONS = [1, 2, 3, 4, 5, 6].map((days) => ({ value: days, label: `${days} séance${days > 1 ? 's' : ''} par semaine` }));
const SESSION_MINUTES_OPTIONS = [30, 45, 60, 75, 90].map((minutes) => ({
  value: minutes,
  label: `${minutes} minutes`,
  hint: minutes <= 30 ? 'Séances courtes et efficaces' : minutes >= 75 ? 'Séances longues, échauffement compris' : undefined,
}));
const WEEK_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const SLOTS: { value: TimeSlot; label: string }[] = [
  { value: 'matin', label: 'Matin' },
  { value: 'apres_midi', label: 'Après-midi' },
  { value: 'soir', label: 'Soir' },
];

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <View style={{ marginTop: 24 }}>
      <Text variant="section" accessibilityRole="header" style={{ marginBottom: hint ? 4 : 12 }}>
        {title}
      </Text>
      {hint ? (
        <Text variant="caption" tone="ink2" style={{ marginBottom: 12 }}>
          {hint}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? (
    <Text variant="caption" tone="danger" style={{ marginTop: -6, marginBottom: 10 }}>
      {message}
    </Text>
  ) : null;
}

function QuestionnaireForm({
  userId,
  initialProfile,
  initialSchedule,
}: {
  userId: string;
  initialProfile: FitnessProfile | null;
  initialSchedule: TrainingSchedule;
}) {
  const queryClient = useQueryClient();
  const defaults = profileToQuestionnaire(initialProfile);
  const [slot, setSlot] = useState<TimeSlot>(initialSchedule.training_slot ?? 'soir');
  const [days, setDays] = useState<number[]>(() => trainingDays(initialSchedule.training_days, defaults.daysPerWeek));
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FitnessQuestionnaireValues>({
    resolver: zodResolver(fitnessQuestionnaireSchema),
    defaultValues: defaults,
  });
  // useWatch plutôt que watch() : watch n'est pas compatible avec la mémoïsation du compilateur React.
  const daysPerWeek = useWatch({ control, name: 'daysPerWeek' });

  const saveMutation = useMutation({
    mutationFn: async (values: FitnessQuestionnaireValues) => {
      const profile = questionnaireToProfile(values);
      await saveFitnessProfile(userId, profile);
      await saveTrainingSchedule(userId, { training_slot: slot, training_days: [...days].sort() });

      // Un plan déjà enregistré décrit l'ancien profil. Sans ce recalcul, quelqu'un qui vient de
      // déclarer une allergie continuerait de voir des repas qui la contiennent, et une liste de
      // courses qui les achète. On garde la variation en cours : c'est sa semaine, corrigée.
      if (!initialProfile || !affectsPlan(initialProfile, profile)) return false;
      if ((await countFitnessPlans(userId)) === 0) return false;
      await createFitnessPlan(userId, profile, undefined, { keepVariation: true });
      return true;
    },
    onSuccess: async (planRefreshed) => {
      haptic.success();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['fitnessProfile', userId] }),
        queryClient.invalidateQueries({ queryKey: ['trainingSchedule', userId] }),
        queryClient.invalidateQueries({ queryKey: ['fitnessPlans', userId] }),
        queryClient.invalidateQueries({ queryKey: ['fitnessPlanCount', userId] }),
      ]);
      // La liste de courses se lit au supermarché : on prévient plutôt que de la changer en
      // silence sous les yeux de quelqu'un qui l'a déjà notée.
      if (planRefreshed) router.replace({ pathname: '/(tabs)/fitness', params: { recalcule: '1' } });
      else router.back();
    },
  });

  const toggleDay = (day: number) => setDays((current) => (current.includes(day) ? current.filter((d) => d !== day) : [...current, day]));

  return (
    <Screen
      keyboard
      footer={<Button label="Enregistrer" loading={saveMutation.isPending} onPress={handleSubmit((values) => saveMutation.mutate(values))} />}
    >
      <ScreenHeader overline="Ton coach forme" title="Ton profil" subtitle="Pour un programme vraiment fait pour toi." onBack={() => router.back()} />

      <Section title="Tes objectifs">
        <Controller
          control={control}
          name="goals"
          render={({ field: { value, onChange } }) => (
            <SelectMulti label="Objectifs" title="Que cherches-tu ?" placeholder="Choisir un ou plusieurs objectifs" values={value} options={[...FITNESS_GOALS]} onChange={onChange} />
          )}
        />
        <FieldError message={errors.goals?.message} />
      </Section>

      <Section title="Toi" hint="Sexe, âge, taille et poids servent uniquement au calcul de tes besoins caloriques.">
        <Controller
          control={control}
          name="sex"
          render={({ field: { value, onChange } }) => (
            <View style={{ marginBottom: 16 }}>
              <SegmentedControl label="Sexe" tone="surface" value={value} onChange={onChange} options={[...SEX_OPTIONS]} />
            </View>
          )}
        />
        <Controller
          control={control}
          name="birthYear"
          render={({ field: { value, onChange } }) => (
            <Field label="Année de naissance" placeholder="Ex. : 1990" keyboardType="number-pad" maxLength={4} value={value} onChangeText={onChange} error={errors.birthYear?.message} />
          )}
        />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="heightCm"
              render={({ field: { value, onChange } }) => (
                <Field label="Taille (cm)" placeholder="170" keyboardType="number-pad" value={value} onChangeText={onChange} error={errors.heightCm?.message} />
              )}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="weightKg"
              render={({ field: { value, onChange } }) => (
                <Field label="Poids (kg)" placeholder="65" keyboardType="decimal-pad" value={value} onChangeText={onChange} error={errors.weightKg?.message} />
              )}
            />
          </View>
        </View>
        <Controller
          control={control}
          name="activityLevel"
          render={({ field: { value, onChange } }) => (
            <Select label="Activité au quotidien" title="Ton activité au quotidien" value={value} options={[...ACTIVITY_LEVELS]} onChange={onChange} />
          )}
        />
      </Section>

      <Section title="Ton entraînement">
        <Text variant="label" style={{ marginBottom: 8 }}>
          Niveau en musculation
        </Text>
        <Controller
          control={control}
          name="experience"
          render={({ field: { value, onChange } }) => (
            <View style={{ marginBottom: 16 }}>
              <SegmentedControl label="Niveau" tone="surface" value={value} onChange={onChange} options={[...EXPERIENCE_LEVELS]} />
            </View>
          )}
        />
        <Controller
          control={control}
          name="equipment"
          render={({ field: { value, onChange } }) => (
            <Select label="Matériel" title="Avec quoi t'entraînes-tu ?" value={value} options={[...EQUIPMENT_OPTIONS]} onChange={onChange} />
          )}
        />
        <Controller
          control={control}
          name="daysPerWeek"
          render={({ field: { value, onChange } }) => (
            <Select label="Séances par semaine" title="Combien de séances par semaine ?" value={value} options={DAYS_OPTIONS} onChange={onChange} />
          )}
        />
        <Controller
          control={control}
          name="sessionMinutes"
          render={({ field: { value, onChange } }) => (
            <Select label="Durée d'une séance" title="Combien de temps par séance ?" value={value} options={SESSION_MINUTES_OPTIONS} onChange={onChange} />
          )}
        />
      </Section>

      <Section title="Quand t'entraînes-tu ?" hint="Pour te proposer la bonne séance, au bon moment.">
        <SegmentedControl label="Moment de la journée" tone="surface" value={slot} onChange={setSlot} options={SLOTS} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
          {WEEK_DAYS.map((label, day) => (
            <ChoiceChip key={label} label={label} selected={days.includes(day)} onPress={() => toggleDay(day)} />
          ))}
        </View>
        <Text variant="caption" tone={days.length === daysPerWeek ? 'ink2' : 'danger'} style={{ marginTop: 8 }}>
          {days.length === daysPerWeek
            ? `${days.length} jour${days.length > 1 ? 's' : ''} choisi${days.length > 1 ? 's' : ''}.`
            : `Choisis ${daysPerWeek} jour${daysPerWeek > 1 ? 's' : ''} (${days.length} pour l'instant).`}
        </Text>
      </Section>

      <Section title="Ton alimentation">
        <Controller
          control={control}
          name="diet"
          render={({ field: { value, onChange } }) => (
            <Select label="Régime alimentaire" title="Ton alimentation" value={value} options={[...DIET_OPTIONS]} onChange={onChange} />
          )}
        />
        <Controller
          control={control}
          name="allergies"
          render={({ field: { value, onChange } }) => (
            <Field label="Allergies ou intolérances (facultatif)" placeholder="Ex. : arachides, lactose" value={value} onChangeText={onChange} error={errors.allergies?.message} />
          )}
        />
      </Section>

      <Section title="Santé">
        <Controller
          control={control}
          name="healthNotes"
          render={({ field: { value, onChange } }) => (
            <Field
              label="Quelque chose à signaler ? (facultatif)"
              multiline
              placeholder="Blessure, douleur, traitement, grossesse… pour que ton coach adapte le programme"
              value={value}
              onChangeText={onChange}
              error={errors.healthNotes?.message}
              hint="Ton coach n'est pas un professionnel de santé : en cas de problème médical, demande l'avis de ton médecin avant de commencer."
            />
          )}
        />
      </Section>

      {saveMutation.isError ? <InlineNotice tone="error" message={errorMessage(saveMutation.error)} /> : null}
    </Screen>
  );
}

export default function FitnessQuestionnaireScreen() {
  const userId = useAuthStore((s) => s.session?.user.id);
  const profileQuery = useQuery({ queryKey: ['fitnessProfile', userId], queryFn: () => fetchFitnessProfile(userId!), enabled: !!userId });
  const scheduleQuery = useQuery({ queryKey: ['trainingSchedule', userId], queryFn: () => fetchTrainingSchedule(userId!), enabled: !!userId });

  if (!userId || profileQuery.isLoading || scheduleQuery.isLoading) {
    return (
      <Screen>
        <ScreenHeader title="Ton profil" onBack={() => router.back()} />
        <LoadingSkeleton preset="list" />
      </Screen>
    );
  }
  return (
    <QuestionnaireForm
      userId={userId}
      initialProfile={profileQuery.data ?? null}
      initialSchedule={scheduleQuery.data ?? { training_slot: null, training_days: null }}
    />
  );
}
