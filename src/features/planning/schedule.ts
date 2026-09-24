import type { AvailabilitySlot, TimeSlot } from '../availability/types';
import { fromLocalISODate } from '../../lib/week';

/** The time used when no availability says when the slot starts. */
export const DEFAULT_SLOT_START: Record<TimeSlot, string> = { matin: '09:00', apres_midi: '14:00', soir: '19:00' };

type ScheduledItem = { date: string; time_slot: TimeSlot };

/** An activity's real start time: the one from the availability that placed it (a one-off beats
 *  a recurring one), otherwise the slot's default time. */
export function resolveStartTime(item: ScheduledItem, availability: AvailabilitySlot[]): string {
  const dayOfWeek = (fromLocalISODate(item.date).getDay() + 6) % 7; // 0 = Monday, matching day_of_week
  const matching = availability.filter(
    (slot) =>
      slot.time_slot === item.time_slot &&
      (slot.is_recurring ? slot.day_of_week === dayOfWeek : slot.specific_date === item.date)
  );
  const specific = matching.filter((slot) => !slot.is_recurring);
  const candidates = (specific.length > 0 ? specific : matching).map((slot) => slot.start_time.slice(0, 5)).sort();
  return candidates[0] ?? DEFAULT_SLOT_START[item.time_slot];
}

export function activityStartDate(item: ScheduledItem, availability: AvailabilitySlot[]): Date {
  const [hours, minutes] = resolveStartTime(item, availability).split(':').map(Number);
  const start = fromLocalISODate(item.date);
  start.setHours(hours, minutes, 0, 0);
  return start;
}

type CalendarItem = ScheduledItem & {
  status: string;
  activities_catalog: { id: string; title: string; duration_minutes: number; instructions: string | null };
};

export type CalendarEventDraft = {
  title: string;
  startDate: Date;
  endDate: Date;
  notes: string;
};

export function buildCalendarEvents(items: CalendarItem[], availability: AvailabilitySlot[]): CalendarEventDraft[] {
  return items.map((item) => {
    const activity = item.activities_catalog;
    const startDate = activityStartDate(item, availability);
    const notes = [activity.instructions?.trim(), `Open in Regain: regain://activity/${activity.id}`]
      .filter(Boolean)
      .join('\n\n');
    return {
      title: item.status === 'realise' ? `✓ ${activity.title}` : activity.title,
      startDate,
      endDate: new Date(startDate.getTime() + activity.duration_minutes * 60_000),
      notes,
    };
  });
}
