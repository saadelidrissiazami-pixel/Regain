import { EmptyState } from './EmptyState';

/** Échec de chargement : ce qui s'est passé, puis ce que l'on peut faire. */
export function ErrorState({
  title = 'Impossible de charger pour le moment',
  body = 'La connexion semble interrompue. Vérifie ton réseau, puis réessaie.',
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
      actionLabel={onRetry ? 'Réessayer' : undefined}
      onAction={onRetry}
      actionLoading={retrying}
    />
  );
}
