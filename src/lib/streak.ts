import { toLocalISODate } from './week';

// Isolé de la requête (et donc de supabase/react-native) pour rester testable.
// `completedAt` contient des timestamptz :
// les tronquer donnerait la date UTC, alors que le curseur avance en dates locales —
// une activité cochée à 00h30 à Paris serait comptée la veille et casserait la série.
export function computeStreak(completedAt: string[], now = new Date()): number {
  const days = new Set(completedAt.map((value) => toLocalISODate(new Date(value))));

  const cursor = new Date(now);
  // Rien aujourd'hui n'interrompt pas la série tant qu'hier est coché.
  if (!days.has(toLocalISODate(cursor))) cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  while (days.has(toLocalISODate(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
