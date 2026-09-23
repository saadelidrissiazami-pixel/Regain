import { describe, expect, it } from 'vitest';

import { CATEGORY_LABELS } from '../src/features/planning/types';
import { parseSeededActivities } from './helpers/catalogue';

// Le catalogue vit en base, écrit à la main dans une migration. Ces tests le relisent à la source
// et vérifient ce qu'aucun type ne peut vérifier : qu'une activité se commence, qu'elle se
// termine, et qu'elle reste assez petite pour un soir où l'on n'a envie de rien.

const ENERGIES = ['bas', 'moyen', 'eleve'];
const COSTS = ['gratuit', 'faible', 'modere'];
const PLACES = ['indoor', 'outdoor', 'indifferent'];
const TAGS = [
  'plus_mouvement',
  'plus_social',
  'reduire_ecrans',
  'gerer_stress',
  'mieux_dormir',
  'routine_stable',
  'confiance_en_soi',
  'plus_energie',
];

describe('catalogue d activités', () => {
  const activities = parseSeededActivities();

  it('se lit correctement depuis la migration', () => {
    // Si ce test tombe seul, c'est le parseur qu'il faut corriger.
    expect(activities.length).toBeGreaterThan(30);
    expect(activities[0].title).toBe('Bouger sur une chanson');
    expect(activities[0].tags).toEqual(['plus_mouvement', 'plus_energie']);
  });

  it('dit toujours comment commencer', () => {
    // C'est la raison d'être de la refonte : ne plus demander à quelqu'un de concevoir
    // lui-même l'activité au moment où il manque d'élan.
    expect(activities.filter((a) => !a.first_action || a.first_action.length < 20).map((a) => a.title)).toEqual([]);
  });

  it('dit toujours quand s arrêter', () => {
    expect(activities.filter((a) => !a.stop_rule || a.stop_rule.length < 8).map((a) => a.title)).toEqual([]);
  });

  it('reste court : rien au-dessus d une demi-heure', () => {
    const longues = activities.filter((a) => a.duration_minutes > 30).map((a) => [a.title, a.duration_minutes]);
    expect(longues).toEqual([]);
  });

  it('propose surtout des formats de moins de dix minutes', () => {
    const courtes = activities.filter((a) => a.duration_minutes <= 10);
    expect(courtes.length / activities.length).toBeGreaterThan(0.75);
  });

  it('ne demande jamais une énergie élevée', () => {
    // Le programme de musculation couvre déjà l'effort soutenu. Ici, on vise les soirs sans élan.
    expect(activities.filter((a) => a.energy_required === 'eleve').map((a) => a.title)).toEqual([]);
  });

  it('n utilise que des valeurs que la base accepte', () => {
    const invalides = activities.filter(
      (a) =>
        !ENERGIES.includes(a.energy_required) ||
        !COSTS.includes(a.cost_level) ||
        !PLACES.includes(a.indoor_outdoor) ||
        !(a.category in CATEGORY_LABELS)
    );
    expect(invalides.map((a) => a.title)).toEqual([]);
  });

  it('reste parcimonieux sur les objectifs', () => {
    // Une BD répond à « réduire les écrans ». Elle n'a pas à promettre aussi de la confiance
    // en soi et de l'énergie : un catalogue qui promet tout ne recommande plus rien.
    const bavardes = activities.filter((a) => a.tags.length === 0 || a.tags.length > 2);
    expect(bavardes.map((a) => [a.title, a.tags])).toEqual([]);
    expect(activities.flatMap((a) => a.tags).filter((tag) => !TAGS.includes(tag))).toEqual([]);
  });

  it('couvre les neuf catégories', () => {
    const couvertes = new Set(activities.map((a) => a.category));
    expect([...couvertes].sort()).toEqual(Object.keys(CATEGORY_LABELS).sort());
  });

  it('ne propose jamais deux fois le même titre', () => {
    // Le titre porte l'index unique de la table : un doublon ferait échouer la migration.
    const titres = activities.map((a) => a.title);
    expect(titres.length).toBe(new Set(titres).size);
  });

  it('laisse une porte de sortie sans dépense', () => {
    const gratuites = activities.filter((a) => a.cost_level === 'gratuit');
    expect(gratuites.length / activities.length).toBeGreaterThan(0.9);
  });

  it('propose de quoi voir quelqu un sans rendez-vous', () => {
    // Le lien social exigeait jusqu'ici une personne disponible tout de suite. Quelques
    // activités doivent tenir en un message parti, sans réponse attendue.
    const sansRendezVous = activities.filter((a) => a.category === 'social' && a.duration_minutes <= 5);
    expect(sansRendezVous.length).toBeGreaterThanOrEqual(2);
  });
});
