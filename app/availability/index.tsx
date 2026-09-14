import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { Text, TextInput } from '../../src/components/typography';
import { LinearGradient } from 'expo-linear-gradient';

import { Chip } from '../../src/components/Chip';
import { createAvailabilitySlots, deleteAvailabilitySlot, fetchAvailabilitySlots } from '../../src/lib/availability';
import { DAYS_OF_WEEK } from '../../src/lib/days';
import { scheduleActivityReminders } from '../../src/lib/notifications';
import { generateAndSaveWeekPlan } from '../../src/lib/planning';
import { formatTimeRange, TIME_OPTIONS, timeSlotFromStartTime } from '../../src/lib/time';
import { useUpcomingDates, useWeekStart } from '../../src/lib/useCurrentDate';
import { useAuthStore } from '../../src/store/authStore';


export default function AvailabilityScreen() {
  const session = useAuthStore((s) => s.session);
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  const weekStart = useWeekStart();
  const upcomingDates = useUpcomingDates(14);

  const [kind, setKind] = useState<'recurring' | 'specific'>('recurring');
  const [selectedDays, setSelectedDays] = useState<Set<number>>(new Set([0]));
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('19:00');
  const [label, setLabel] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const slotsQuery = useQuery({
    queryKey: ['availability', userId],
    queryFn: () => fetchAvailabilitySlots(userId!),
    enabled: !!userId,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const selection = kind === 'recurring' ? Array.from(selectedDays) : Array.from(selectedDates);
      if (selection.length === 0) throw new Error('Choisissez au moins un jour.');
      if (endTime <= startTime) throw new Error("L'heure de fin doit être après l'heure de début.");

      const timeSlot = timeSlotFromStartTime(startTime);
      const slots = selection.map((value) => ({
        label: label.trim() || null,
        is_recurring: kind === 'recurring',
        day_of_week: kind === 'recurring' ? (value as number) : null,
        specific_date: kind === 'specific' ? (value as string) : null,
        time_slot: timeSlot,
        start_time: startTime,
        end_time: endTime,
      }));
      return createAvailabilitySlots(userId!, slots);
    },
    onSuccess: () => {
      setLabel('');
      setFormError(null);
      queryClient.invalidateQueries({ queryKey: ['availability', userId] });
    },
    onError: (e: Error) => setFormError(e.message),
  });

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (slotId: string) => deleteAvailabilitySlot(slotId),
    onSuccess: () => {
      setPendingDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ['availability', userId] });
    },
  });

  const generateMutation = useMutation({
    mutationFn: () => generateAndSaveWeekPlan(userId!, weekStart),
    onSuccess: (data) => {
      queryClient.setQueryData(['weekPlan', userId, weekStart], data);
      scheduleActivityReminders(data).catch(() => {});
      router.push('/(tabs)/planning');
    },
  });

  const toggleDay = (value: number) => {
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  };

  const toggleDate = (value: string) => {
    setSelectedDates((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  };

  return (
    <ScrollView className="flex-1 bg-paper px-6 pt-16" contentContainerStyle={{ paddingBottom: 60 }}>
      <Pressable onPress={() => router.back()} className="mb-5">
        <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-sm text-ink-soft">
          ← Retour
        </Text>
      </Pressable>

      <Text style={{ fontFamily: 'Nunito_700Bold' }} className="mb-1 text-sm text-primary">
        Planning
      </Text>
      <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-7 text-[28px] leading-8 text-ink">
        Mes disponibilités
      </Text>

      <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-2.5 text-sm text-ink">
        Type de créneau
      </Text>
      <View className="mb-4 flex-row flex-wrap">
        <Chip label="Chaque semaine" selected={kind === 'recurring'} onPress={() => setKind('recurring')} />
        <Chip label="Dates précises" selected={kind === 'specific'} onPress={() => setKind('specific')} />
      </View>

      {kind === 'recurring' ? (
        <>
          <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-1 text-sm text-ink">
            Jours
          </Text>
          <Text className="mb-2.5 text-xs text-ink-soft">Vous pouvez en choisir plusieurs à la fois.</Text>
          <View className="mb-4 flex-row flex-wrap">
            {DAYS_OF_WEEK.map((day) => (
              <Chip
                key={day.value}
                label={day.label}
                selected={selectedDays.has(day.value)}
                onPress={() => toggleDay(day.value)}
              />
            ))}
          </View>
        </>
      ) : (
        <>
          <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-1 text-sm text-ink">
            Dates
          </Text>
          <Text className="mb-2.5 text-xs text-ink-soft">Vous pouvez en choisir plusieurs à la fois.</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            <View className="flex-row">
              {upcomingDates.map((d) => (
                <Chip
                  key={d.value}
                  label={d.label}
                  selected={selectedDates.has(d.value)}
                  onPress={() => toggleDate(d.value)}
                />
              ))}
            </View>
          </ScrollView>
        </>
      )}

      <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-1 text-sm text-ink">
        De
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
        <View className="flex-row">
          {TIME_OPTIONS.map((t) => (
            <Chip key={t} label={t} selected={startTime === t} onPress={() => setStartTime(t)} />
          ))}
        </View>
      </ScrollView>

      <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-1 text-sm text-ink">
        À
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
        <View className="flex-row">
          {TIME_OPTIONS.map((t) => (
            <Chip key={t} label={t} selected={endTime === t} onPress={() => setEndTime(t)} />
          ))}
        </View>
      </ScrollView>

      <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-2.5 text-sm text-ink">
        Note (optionnel)
      </Text>
      <TextInput
        className="mb-4 rounded-2xl border border-line bg-surface px-4 py-3.5 text-ink"
        placeholder="Ex. Sport, libre pour sorties…"
        placeholderTextColor="#B5AB9A"
        value={label}
        onChangeText={setLabel}
      />

      {formError ? <Text className="mb-3 text-xs text-red-700">{formError}</Text> : null}

      <Pressable
        onPress={() => createMutation.mutate()}
        disabled={createMutation.isPending}
        className="mb-8 overflow-hidden rounded-full shadow-sm"
      >
        <LinearGradient colors={['#F0A324', '#FF6B57']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingVertical: 15 }}>
          {createMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-center text-white">
              Ajouter ce{kind === 'recurring' && selectedDays.size > 1 ? 's' : ''} créneau
              {kind === 'recurring' && selectedDays.size > 1 ? 'x' : kind === 'specific' && selectedDates.size > 1 ? 'x' : ''}
            </Text>
          )}
        </LinearGradient>
      </Pressable>

      <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-3 text-sm text-ink-soft">
        Créneaux enregistrés
      </Text>
      {deleteMutation.isError ? (
        <Text className="mb-2 text-xs text-red-700">
          Suppression impossible : {(deleteMutation.error as Error).message}
        </Text>
      ) : null}
      {slotsQuery.isLoading ? <ActivityIndicator color="#FF6B57" /> : null}
      {slotsQuery.data?.length === 0 ? (
        <Text className="text-sm text-ink-soft">Aucun créneau pour l'instant.</Text>
      ) : null}
      {slotsQuery.data?.map((slot) => {
        const when = slot.is_recurring
          ? DAYS_OF_WEEK.find((d) => d.value === slot.day_of_week)?.label
          : upcomingDates.find((d) => d.value === slot.specific_date)?.label ?? slot.specific_date;
        return (
          <View
            key={slot.id}
            className="mb-2.5 flex-row items-center justify-between rounded-2xl border border-line bg-surface p-4 shadow-sm"
          >
            <View className="flex-1 pr-3">
              <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-sm text-ink">
                {when} · {formatTimeRange(slot.start_time, slot.end_time)}
                {slot.is_recurring ? ' (chaque semaine)' : ''}
              </Text>
              {slot.label ? <Text className="mt-0.5 text-xs text-ink-soft">{slot.label}</Text> : null}
            </View>
            {deleteMutation.isPending && deleteMutation.variables === slot.id ? (
              <ActivityIndicator size="small" color="#FF6B57" />
            ) : pendingDeleteId === slot.id ? (
              <View className="flex-row items-center">
                <Pressable onPress={() => deleteMutation.mutate(slot.id)} className="mr-3">
                  <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-sm text-red-700">
                    Confirmer
                  </Text>
                </Pressable>
                <Pressable onPress={() => setPendingDeleteId(null)}>
                  <Text className="text-sm text-ink-soft">Annuler</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable onPress={() => setPendingDeleteId(slot.id)}>
                <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-sm text-accent">
                  Supprimer
                </Text>
              </Pressable>
            )}
          </View>
        );
      })}

      {(slotsQuery.data?.length ?? 0) > 0 ? (
        <>
          <Pressable
            onPress={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="mb-2 mt-6 items-center rounded-full bg-primary px-4 py-3.5 shadow-sm"
          >
            {generateMutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-white">
                ✨ Générer mon planning
              </Text>
            )}
          </Pressable>
          {generateMutation.isError ? (
            <Text className="text-xs text-red-700">{(generateMutation.error as Error).message}</Text>
          ) : null}
        </>
      ) : null}
    </ScrollView>
  );
}
