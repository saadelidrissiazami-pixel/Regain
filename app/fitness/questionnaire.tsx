import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';

import { goBack } from '../../src/lib/navigation';
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
import { t } from '../../src/lib/i18n';

const DAYS_OPTIONS = [1, 2, 3, 4, 5, 6].map((days) => ({ value: days, label: days > 1 ? t('{count} sessions per week', { count: days }) : t('{count} session per week', { count: days }) }));
const SESSION_MINUTES_OPTIONS = [30, 45, 60, 75, 90].map((minutes) => ({
  value: minutes,
  label: `${minutes} minutes`,
  hint: minutes <= 30 ? t('Short, efficient sessions') : minutes >= 75 ? t('Long sessions, warm-up included') : undefined,
}));
const WEEK_DAYS = [t('Mon'), t('Tue'), t('Wed'), t('Thu'), t('Fri'), t('Sat'), t('Sun')];
const SLOTS: { value: TimeSlot; label: string }[] = [
  { value: 'matin', label: t('Morning') },
  { value: 'apres_midi', label: t('Afternoon') },
  { value: 'soir', label: t('Evening') },
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
  // useWatch rather than watch(): watch is not compatible with the React compiler's memoisation.
  const daysPerWeek = useWatch({ control, name: 'daysPerWeek' });

  const saveMutation = useMutation({
    mutationFn: async (values: FitnessQuestionnaireValues) => {
      const profile = questionnaireToProfile(values);
      await saveFitnessProfile(userId, profile);
      await saveTrainingSchedule(userId, { training_slot: slot, training_days: [...days].sort() });

      // A plan already saved describes the old profile. Without this recalculation, somebody who
      // has just declared an allergy would keep seeing meals that contain it, and a shopping list
      // that buys them. The current variation is kept: it is their week, corrected.
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
      // The shopping list gets read in the supermarket: better to say so than to change it
      // silently under the eyes of somebody who has already copied it down.
      if (planRefreshed) router.replace({ pathname: '/(tabs)/fitness', params: { recalcule: '1' } });
      else goBack('/(tabs)/fitness');
    },
  });

  const toggleDay = (day: number) => setDays((current) => (current.includes(day) ? current.filter((d) => d !== day) : [...current, day]));

  return (
    <Screen
      keyboard
      footer={<Button label={t('Save')} loading={saveMutation.isPending} onPress={handleSubmit((values) => saveMutation.mutate(values))} />}
    >
      <ScreenHeader overline={t('Your fitness coach')} title={t('Your profile')} subtitle={t('So the programme is genuinely built for you.')} onBack={() => goBack('/(tabs)/fitness')} />

      <Section title={t('Your goals')}>
        <Controller
          control={control}
          name="goals"
          render={({ field: { value, onChange } }) => (
            <SelectMulti label={t('Goals')} title={t('What are you after?')} placeholder={t('Pick one or more goals')} values={value} options={[...FITNESS_GOALS]} onChange={onChange} />
          )}
        />
        <FieldError message={errors.goals?.message} />
      </Section>

      <Section title={t('You')} hint={t('Sex, age, height and weight are used only to work out your calorie needs.')}>
        <Controller
          control={control}
          name="sex"
          render={({ field: { value, onChange } }) => (
            <View style={{ marginBottom: 16 }}>
              <SegmentedControl label={t('Sex')} tone="surface" value={value} onChange={onChange} options={[...SEX_OPTIONS]} />
            </View>
          )}
        />
        <Controller
          control={control}
          name="birthYear"
          render={({ field: { value, onChange } }) => (
            <Field label={t('Year of birth')} placeholder={t('e.g. 1990')} keyboardType="number-pad" maxLength={4} value={value} onChangeText={onChange} error={errors.birthYear?.message} />
          )}
        />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="heightCm"
              render={({ field: { value, onChange } }) => (
                <Field label={t('Height (cm)')} placeholder="170" keyboardType="number-pad" value={value} onChangeText={onChange} error={errors.heightCm?.message} />
              )}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="weightKg"
              render={({ field: { value, onChange } }) => (
                <Field label={t('Weight (kg)')} placeholder="65" keyboardType="decimal-pad" value={value} onChangeText={onChange} error={errors.weightKg?.message} />
              )}
            />
          </View>
        </View>
        <Controller
          control={control}
          name="activityLevel"
          render={({ field: { value, onChange } }) => (
            <Select label={t('Everyday activity')} title={t('Your everyday activity')} value={value} options={[...ACTIVITY_LEVELS]} onChange={onChange} />
          )}
        />
      </Section>

      <Section title={t('Your training')}>
        <Text variant="label" style={{ marginBottom: 8 }}>
          {t('Strength-training level')}
        </Text>
        <Controller
          control={control}
          name="experience"
          render={({ field: { value, onChange } }) => (
            <View style={{ marginBottom: 16 }}>
              <SegmentedControl label={t('Level')} tone="surface" value={value} onChange={onChange} options={[...EXPERIENCE_LEVELS]} />
            </View>
          )}
        />
        <Controller
          control={control}
          name="equipment"
          render={({ field: { value, onChange } }) => (
            <Select label={t('Equipment')} title={t('What do you train with?')} value={value} options={[...EQUIPMENT_OPTIONS]} onChange={onChange} />
          )}
        />
        <Controller
          control={control}
          name="daysPerWeek"
          render={({ field: { value, onChange } }) => (
            <Select label={t('Sessions per week')} title={t('How many sessions a week?')} value={value} options={DAYS_OPTIONS} onChange={onChange} />
          )}
        />
        <Controller
          control={control}
          name="sessionMinutes"
          render={({ field: { value, onChange } }) => (
            <Select label={t('Session length')} title={t('How long per session?')} value={value} options={SESSION_MINUTES_OPTIONS} onChange={onChange} />
          )}
        />
      </Section>

      <Section title={t('When do you train?')} hint={t('So the right session is offered at the right time.')}>
        <SegmentedControl label={t('Time of day')} tone="surface" value={slot} onChange={setSlot} options={SLOTS} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
          {WEEK_DAYS.map((label, day) => (
            <ChoiceChip key={label} label={label} selected={days.includes(day)} onPress={() => toggleDay(day)} />
          ))}
        </View>
        <Text variant="caption" tone={days.length === daysPerWeek ? 'ink2' : 'danger'} style={{ marginTop: 8 }}>
          {days.length === daysPerWeek
            ? days.length > 1
              ? t('{count} days chosen.', { count: days.length })
              : t('{count} day chosen.', { count: days.length })
            : daysPerWeek > 1
              ? t('Choose {count} days ({chosen} so far).', { count: daysPerWeek, chosen: days.length })
              : t('Choose {count} day ({chosen} so far).', { count: daysPerWeek, chosen: days.length })}
        </Text>
      </Section>

      <Section title={t('How you eat')}>
        <Controller
          control={control}
          name="diet"
          render={({ field: { value, onChange } }) => (
            <Select label={t('Diet')} title={t('How you eat')} value={value} options={[...DIET_OPTIONS]} onChange={onChange} />
          )}
        />
        <Controller
          control={control}
          name="allergies"
          render={({ field: { value, onChange } }) => (
            <Field label={t('Allergies or intolerances (optional)')} placeholder={t('e.g. peanuts, lactose')} value={value} onChangeText={onChange} error={errors.allergies?.message} />
          )}
        />
      </Section>

      <Section title={t('Health')}>
        <Controller
          control={control}
          name="healthNotes"
          render={({ field: { value, onChange } }) => (
            <Field
              label={t('Anything we should know? (optional)')}
              multiline
              placeholder={t('An injury, a pain, medication, pregnancy… so your coach can adapt the programme')}
              value={value}
              onChangeText={onChange}
              error={errors.healthNotes?.message}
              hint={t('Your coach is not a health professional. For anything medical, ask your doctor before you start.')}
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
        <ScreenHeader title={t('Your profile')} onBack={() => goBack('/(tabs)/fitness')} />
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
