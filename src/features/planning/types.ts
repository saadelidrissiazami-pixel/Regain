export type ActivityCategory =
  | 'physique'
  | 'outdoor'
  | 'indoor'
  | 'social'
  | 'relaxation'
  | 'meditation'
  | 'dev_perso'
  | 'recuperation'
  | 'temps_libre';

export const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  physique: 'Physique',
  outdoor: 'Outdoor',
  indoor: 'Indoor',
  social: 'Social',
  relaxation: 'Relaxation',
  meditation: 'Méditation',
  dev_perso: 'Dév. personnel',
  recuperation: 'Récupération',
  temps_libre: 'Temps libre',
};

export const CATEGORY_COLORS: Record<ActivityCategory, string> = {
  physique: '#FF6B57',
  outdoor: '#2FA88A',
  indoor: '#D68A3C',
  social: '#E85D8A',
  relaxation: '#8B7FD6',
  meditation: '#4E9BDE',
  dev_perso: '#5B5FC7',
  recuperation: '#6FA88F',
  temps_libre: '#C9A227',
};
