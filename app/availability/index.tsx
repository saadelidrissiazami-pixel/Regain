import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';

import { goBack } from '../../src/lib/navigation';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';

import { EmptyState, errorMessage, InlineNotice, LoadingSkeleton } from '../../src/components/feedback';
import { Appear, Button, Card, ChoiceChip, Field, Screen, ScreenHeader, SegmentedControl, Select, Text } from '../../src/components/ui';
import { createAvailabilitySlots, deleteAllAvailabilitySlots, deleteAvailabilitySlot, fetchAvailabilitySlots } from '../../src/lib/availability';
import { DAYS_OF_WEEK } from '../../src/lib/days';
import { scheduleActivityReminders } from '../../src/lib/notifications';
import { generateAndSaveWeekPlan } from '../../src/lib/planning';
import { formatTimeRange, TIME_SELECT_OPTIONS, timeSlotFromStartTime } from '../../src/lib/time';
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
      if (selection.length === 0) throw new Error('Pick at least one day.');
      if (endTime <= startTime) throw new Error('The end time has to be after the start time.');

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

  // Tout effacer d'un coup se confirme, comme la suppression d'un seul créneau : c'est la même
  // action, en plus définitif.
  const [confirmingClearAll, setConfirmingClearAll] = useState(false);

  const clearAllMutation = useMutation({
    mutationFn: () => deleteAllAvailabilitySlots(userId!),
    onSuccess: () => {
      setConfirmingClearAll(false);
      setPendingDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ['availability', userId] });
    },
  });

  const generateMutation = useMutation({
    mutationFn: () => generateAndSaveWeekPlan(userId!, weekStart),
    onSuccess: (data) => {
      queryClient.setQueryData(['weekPlan', userId, weekStart], data);
      queryClient.invalidateQueries({ queryKey: ['planRange', userId] });
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

  const slots = slotsQuery.data ?? [];
  const count = kind === 'recurring' ? selectedDays.size : selectedDates.size;

  return (
    <Screen keyboard>
      <ScreenHeader
        title="When you are free"
        subtitle="Tell Regain when you are free, and it places your activities there."
        onBack={() => goBack('/(tabs)/planning')}
      />

      <Text variant="section" style={{ marginBottom: 12 }} accessibilityRole="header">
        Add a time
      </Text>
      <SegmentedControl
        label="Kind of time"
        tone="surface"
        value={kind}
        onChange={setKind}
        options={[
          { value: 'recurring', label: 'Every week' },
          { value: 'specific', label: 'Specific dates' },
        ]}
      />

      <Text variant="label" style={{ marginTop: 20, marginBottom: 4 }}>
        {kind === 'recurring' ? 'Jours' : 'Dates'}
      </Text>
      <Text variant="caption" tone="ink2" style={{ marginBottom: 10 }}>
        You can pick several at once.
      </Text>
      {kind === 'recurring' ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {DAYS_OF_WEEK.map((day) => (
            <ChoiceChip key={day.value} label={day.label} selected={selectedDays.has(day.value)} onPress={() => toggleDay(day.value)} />
          ))}
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginHorizontal: -20, marginBottom: 20 }}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
        >
          {upcomingDates.map((d) => (
            <ChoiceChip key={d.value} label={d.label} selected={selectedDates.has(d.value)} onPress={() => toggleDate(d.value)} />
          ))}
        </ScrollView>
      )}

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Select label="From" title="Start time" value={startTime} options={TIME_SELECT_OPTIONS} onChange={setStartTime} />
        </View>
        <View style={{ flex: 1 }}>
          <Select label="To" title="End time" value={endTime} options={TIME_SELECT_OPTIONS} onChange={setEndTime} />
        </View>
      </View>

      <Field label="Note (optional)" placeholder="e.g. gym, free to go out…" value={label} onChangeText={setLabel} />

      {formError ? <InlineNotice tone="error" message={formError} /> : null}
      <Button
        label={`Add ${count > 1 ? `these ${count} times` : 'this time'}`}
        icon="add"
        loading={createMutation.isPending}
        onPress={() => createMutation.mutate()}
        style={{ marginTop: 8 }}
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 36, marginBottom: 12 }}>
        <Text variant="section" style={{ flex: 1 }} accessibilityRole="header">
          Saved times
        </Text>
        {slots.length > 0 && !confirmingClearAll ? (
          <Button label="Tout retirer" variant="ghost" size="sm" fullWidth={false} onPress={() => setConfirmingClearAll(true)} />
        ) : null}
      </View>

      {confirmingClearAll ? (
        <Card padding={14} style={{ marginBottom: 12 }}>
          <Text variant="label">Remove all {slots.length} times?</Text>
          <Text variant="caption" tone="ink2" style={{ marginTop: 2, marginBottom: 12 }}>
            Activities already planned stay where they are. With no times left, Regain cannot prepare your week.
          </Text>
          <View style={{ flexDirection: 'row' }}>
            <Button
              label="Tout retirer"
              variant="destructive"
              size="sm"
              fullWidth={false}
              loading={clearAllMutation.isPending}
              onPress={() => clearAllMutation.mutate()}
            />
            <Button label="Cancel" variant="ghost" size="sm" fullWidth={false} onPress={() => setConfirmingClearAll(false)} />
          </View>
        </Card>
      ) : null}

      {clearAllMutation.isError ? (
        <InlineNotice tone="error" message={`Suppression impossible : ${errorMessage(clearAllMutation.error)}`} />
      ) : null}
      {deleteMutation.isError ? <InlineNotice tone="error" message={`Suppression impossible : ${errorMessage(deleteMutation.error)}`} /> : null}
      {slotsQuery.isLoading ? <LoadingSkeleton preset="list" /> : null}
      {slotsQuery.isSuccess && slots.length === 0 ? (
        <EmptyState icon="time-outline" title="No times yet" body="Add your first one above." />
      ) : null}
      {slots.map((slot, slotIndex) => {
        const when = slot.is_recurring
          ? DAYS_OF_WEEK.find((d) => d.value === slot.day_of_week)?.label
          : upcomingDates.find((d) => d.value === slot.specific_date)?.label ?? slot.specific_date;
        const confirming = pendingDeleteId === slot.id;
        return (
          <Appear key={slot.id} index={slotIndex}>
            <Card padding={14} style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text variant="label">
                    {when} · {formatTimeRange(slot.start_time, slot.end_time)}
                  </Text>
                  <Text variant="caption" tone="ink2" style={{ marginTop: 2 }}>
                    {[slot.is_recurring ? 'Every week' : 'Just once', slot.label].filter(Boolean).join(' · ')}
                  </Text>
                </View>
                {deleteMutation.isPending && deleteMutation.variables === slot.id ? (
                  <ActivityIndicator />
                ) : confirming ? (
                  <View style={{ flexDirection: 'row' }}>
                    <Button label="Supprimer" variant="destructive" size="sm" fullWidth={false} onPress={() => deleteMutation.mutate(slot.id)} />
                    <Button label="Garder" variant="ghost" size="sm" fullWidth={false} onPress={() => setPendingDeleteId(null)} />
                  </View>
                ) : (
                  <Button label="Retirer" variant="ghost" size="sm" fullWidth={false} onPress={() => setPendingDeleteId(slot.id)} />
                )}
              </View>
            </Card>
          </Appear>
        );
      })}

      {slots.length > 0 ? (
        <View style={{ marginTop: 16 }}>
          <Button
            label="Prepare my week from these times"
            variant="outline"
            icon="sparkles-outline"
            loading={generateMutation.isPending}
            onPress={() => generateMutation.mutate()}
          />
          {generateMutation.isError ? <InlineNotice tone="error" message={errorMessage(generateMutation.error)} /> : null}
        </View>
      ) : null}
    </Screen>
  );
}
