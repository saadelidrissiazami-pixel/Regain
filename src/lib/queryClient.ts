import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient, type Query } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      // Kept for a day so a restart without network still has yesterday's answer to show. Shorter
      // than gcTime would quietly defeat the persister: it only ever writes what is still in cache.
      gcTime: 24 * 60 * 60 * 1000,
    },
  },
});

/**
 * The cache, kept across restarts.
 *
 * The food table is already in the bundle because "a meal gets noted on a train or in a canteen" —
 * that is, where the network is worst. The day's own entries were not: the cache lived in memory,
 * so closing the app emptied it and the same train showed a spinner. This closes that gap.
 *
 * What it writes is health data, on the device, unencrypted beyond what the OS already does for an
 * app's sandbox. That is the usual bargain for an app that works offline, and it is worth saying
 * out loud rather than slipping in: the privacy policy should mention a local cache.
 */
export const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'regain-query-cache',
  // A write per mutation would thrash the disk on a screen that saves as you type.
  throttleTime: 2_000,
});

/**
 * Whether a query is allowed to outlive the process.
 *
 * Premium is the one that must not. A persisted `true` would keep a lapsed subscription unlocked
 * for as long as somebody stays offline, which is both a billing hole and a promise the app cannot
 * keep. It is cheap to re-ask and it has its own 60-second staleTime, so it re-asks on launch.
 */
export function shouldPersist(query: Query): boolean {
  if (query.queryKey[0] === 'premium') return false;
  // A failed read must not be replayed tomorrow as though it were an answer.
  return query.state.status === 'success';
}

export const PERSIST_OPTIONS = {
  persister,
  maxAge: 24 * 60 * 60 * 1000,
  // Bumped whenever a cached shape changes, so an old entry is dropped instead of being handed to
  // code that no longer understands it.
  buster: 'v1',
  dehydrateOptions: { shouldDehydrateQuery: shouldPersist },
};
