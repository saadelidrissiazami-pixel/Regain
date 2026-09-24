import { EmptyState } from './EmptyState';

/** A failed load: what happened, then what can be done about it. */
export function ErrorState({
  title = 'Cannot load this right now',
  body = 'The connection looks interrupted. Check your network, then try again.',
  onRetry,
  retrying,
}: {
  title?: string;
  body?: string;
  onRetry?: () => void;
  retrying?: boolean;
}) {
  return (
    <EmptyState
      icon="cloud-offline-outline"
      title={title}
      body={body}
      actionLabel={onRetry ? 'Try again' : undefined}
      onAction={onRetry}
      actionLoading={retrying}
    />
  );
}
