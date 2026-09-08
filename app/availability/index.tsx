import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Chip } from '../../src/components/Chip';
import { ENERGY_SLOTS } from '../../src/features/onboarding/options';
import type { TimeSlot } from '../../src/features/availability/types';
import { createAvailabilitySlot, deleteAvailabilitySlot, fetchAvailabilitySlots } from '../../src/lib/availability';
import { DAYS_OF_WEEK } from '../../src/lib/days';
import { getUpcomingDates } from '../../src/lib/upcomingDates';
import { useAuthStore } from '../../src/store/authStore';

const UPCOMING_DATES = getUpcomingDates(14);

export default function AvailabilityScreen() {
  const session = useAuthStore((s) => s.session);
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  const [kind, setKind] = useState<'recurring' | 'specific'>('recurring');
  const [dayOfWeek, setDayOfWeek] = useState(0);
  const [specificDate, setSpecificDate] = useState(UPCOMING_DATES[0].value);
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('soir');
  const [label, setLabel] = useState('');

  const slotsQuery = useQuery({
    queryKey: ['availability', userId],
    queryFn: () => fetchAvailabilitySlots(userId!),
    enabled: !!userId,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createAvailabilitySlot(userId!, {
        label: label.trim() || null,
        is_recurring: kind === 'recurring',
        day_of_week: kind === 'recurring' ? dayOfWeek : null,
        specific_date: kind === 'specific' ? specificDate : null,
        time_slot: timeSlot,
      }),
    onSuccess: () => {
      setLabel('');
      queryClient.invalidateQueries({ queryKey: ['availability', userId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAvailabilitySlot(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['availability', userId] }),
  });

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
        <Chip label="Une seule fois" selected={kind === 'specific'} onPress={() => setKind('specific')} />
      </View>

      {kind === 'recurring' ? (
        <>
          <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-2.5 text-sm text-ink">
            Jour
          </Text>
          <View className="mb-4 flex-row flex-wrap">
            {DAYS_OF_WEEK.map((day) => (
              <Chip key={day.value} label={day.label} selected={dayOfWeek === day.value} onPress={() => setDayOfWeek(day.value)} />
            ))}
          </View>
        </>
      ) : (
        <>
          <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-2.5 text-sm text-ink">
            Date
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            <View className="flex-row">
              {UPCOMING_DATES.map((d) => (
                <Chip key={d.value} label={d.label} selected={specificDate === d.value} onPress={() => setSpecificDate(d.value)} />
              ))}
            </View>
          </ScrollView>
        </>
      )}

      <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-2.5 text-sm text-ink">
        Moment
      </Text>
      <View className="mb-4 flex-row flex-wrap">
        {ENERGY_SLOTS.map((slot) => (
          <Chip key={slot.key} label={slot.label} selected={timeSlot === slot.key} onPress={() => setTimeSlot(slot.key)} />
        ))}
      </View>

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
              Ajouter ce créneau
            </Text>
          )}
        </LinearGradient>
      </Pressable>

      <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-3 text-sm text-ink-soft">
        Créneaux enregistrés
      </Text>
      {slotsQuery.isLoading ? <ActivityIndicator color="#FF6B57" /> : null}
      {slotsQuery.data?.length === 0 ? (
        <Text className="text-sm text-ink-soft">Aucun créneau pour l'instant.</Text>
      ) : null}
      {slotsQuery.data?.map((slot) => {
        const when = slot.is_recurring
          ? DAYS_OF_WEEK.find((d) => d.value === slot.day_of_week)?.label
          : UPCOMING_DATES.find((d) => d.value === slot.specific_date)?.label ?? slot.specific_date;
        const slotLabel = ENERGY_SLOTS.find((s) => s.key === slot.time_slot)?.label;
        return (
          <View
            key={slot.id}
            className="mb-2.5 flex-row items-center justify-between rounded-2xl border border-line bg-surface p-4 shadow-sm"
          >
            <View className="flex-1 pr-3">
              <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-sm text-ink">
                {when} · {slotLabel}
                {slot.is_recurring ? ' (chaque semaine)' : ''}
              </Text>
              {slot.label ? <Text className="mt-0.5 text-xs text-ink-soft">{slot.label}</Text> : null}
            </View>
            <Pressable onPress={() => deleteMutation.mutate(slot.id)}>
              <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-sm text-accent">
                Supprimer
              </Text>
            </Pressable>
          </View>
        );
      })}
    </ScrollView>
  );
}
