import type { Equipment, ExperienceLevel } from './options';

export type MuscleGroup =
  | 'jambes'
  | 'fessiers'
  | 'pectoraux'
  | 'dos'
  | 'epaules'
  | 'biceps'
  | 'triceps'
  | 'abdos'
  | 'cardio';

/** Articulation fortement sollicitée : l'exercice est retiré si la personne y signale une gêne. */
export type JointStress = 'genou' | 'dos' | 'epaule';

export type ExerciseDef = {
  name: string;
  group: MuscleGroup;
  /** Matériel minimum : un exercice au poids du corps reste possible à la maison comme en salle. */
  equipment: Equipment;
  minLevel: ExperienceLevel;
  stress: JointStress[];
  tip: string;
  /** Exercice tenu dans le temps plutôt qu'en répétitions. */
  timed?: string;
};

export const EXERCISES: ExerciseDef[] = [
  // Jambes
  { name: 'Squat au poids du corps', group: 'jambes', equipment: 'poids_du_corps', minLevel: 'debutant', stress: [], tip: "Pieds largeur d'épaules, poitrine haute : descendez comme pour vous asseoir." },
  { name: 'Chaise contre un mur', group: 'jambes', equipment: 'poids_du_corps', minLevel: 'debutant', stress: [], tip: 'Dos plaqué au mur, cuisses parallèles au sol, respirez calmement.', timed: '30-45 s' },
  { name: 'Fentes alternées', group: 'jambes', equipment: 'poids_du_corps', minLevel: 'debutant', stress: ['genou'], tip: 'Le genou avant reste au-dessus de la cheville, buste droit.' },
  { name: 'Squat sauté', group: 'jambes', equipment: 'poids_du_corps', minLevel: 'intermediaire', stress: ['genou'], tip: 'Réception souple sur l’avant du pied, genoux dans l’axe.' },
  { name: 'Goblet squat', group: 'jambes', equipment: 'halteres_maison', minLevel: 'debutant', stress: [], tip: "Tenez l'haltère contre la poitrine, coudes entre les genoux en bas du mouvement." },
  { name: 'Fentes bulgares aux haltères', group: 'jambes', equipment: 'halteres_maison', minLevel: 'intermediaire', stress: ['genou'], tip: 'Pied arrière posé sur une chaise, descendez à la verticale.' },
  { name: 'Presse à cuisses', group: 'jambes', equipment: 'salle', minLevel: 'debutant', stress: [], tip: "Ne verrouillez pas les genoux en fin de poussée." },
  { name: 'Squat à la barre', group: 'jambes', equipment: 'salle', minLevel: 'intermediaire', stress: ['dos', 'genou'], tip: 'Gainage serré, barre sur le haut du dos, regard droit devant.' },
  { name: 'Leg curl à la machine', group: 'jambes', equipment: 'salle', minLevel: 'debutant', stress: [], tip: 'Mouvement lent, surtout à la descente.' },

  // Fessiers
  { name: 'Pont fessier', group: 'fessiers', equipment: 'poids_du_corps', minLevel: 'debutant', stress: [], tip: "Serrez les fessiers en haut, sans cambrer le bas du dos." },
  { name: 'Kickbacks au sol', group: 'fessiers', equipment: 'poids_du_corps', minLevel: 'debutant', stress: [], tip: 'À quatre pattes, poussez le talon vers le plafond sans tourner le bassin.' },
  { name: 'Pont fessier sur une jambe', group: 'fessiers', equipment: 'poids_du_corps', minLevel: 'intermediaire', stress: [], tip: 'Bassin bien horizontal, poussez sur le talon au sol.' },
  { name: 'Soulevé de terre roumain aux haltères', group: 'fessiers', equipment: 'halteres_maison', minLevel: 'intermediaire', stress: ['dos'], tip: 'Dos plat, hanches vers l’arrière, haltères frôlant les cuisses.' },
  { name: 'Kickback à la poulie', group: 'fessiers', equipment: 'salle', minLevel: 'debutant', stress: [], tip: 'Buste stable, amplitude contrôlée.' },
  { name: 'Hip thrust à la barre', group: 'fessiers', equipment: 'salle', minLevel: 'intermediaire', stress: [], tip: 'Haut du dos sur le banc, menton rentré, verrouillez les fessiers en haut.' },

  // Pectoraux
  { name: 'Pompes sur les genoux', group: 'pectoraux', equipment: 'poids_du_corps', minLevel: 'debutant', stress: [], tip: 'Corps aligné des genoux aux épaules, coudes à 45°.' },
  { name: 'Pompes', group: 'pectoraux', equipment: 'poids_du_corps', minLevel: 'intermediaire', stress: [], tip: 'Gainage serré, la poitrine descend jusqu’à frôler le sol.' },
  { name: 'Développé au sol aux haltères', group: 'pectoraux', equipment: 'halteres_maison', minLevel: 'debutant', stress: [], tip: 'Allongé, coudes qui touchent le sol en douceur, poussez vers le plafond.' },
  { name: 'Écarté aux haltères au sol', group: 'pectoraux', equipment: 'halteres_maison', minLevel: 'intermediaire', stress: ['epaule'], tip: 'Bras légèrement fléchis, ouvrez lentement sans forcer en bas.' },
  { name: 'Écarté à la machine', group: 'pectoraux', equipment: 'salle', minLevel: 'debutant', stress: [], tip: 'Épaules basses, serrez les pectoraux au centre.' },
  { name: 'Développé couché à la barre', group: 'pectoraux', equipment: 'salle', minLevel: 'intermediaire', stress: ['epaule'], tip: 'Omoplates serrées, pieds ancrés au sol, barre sous contrôle.' },

  // Dos
  { name: 'Bird dog', group: 'dos', equipment: 'poids_du_corps', minLevel: 'debutant', stress: [], tip: 'À quatre pattes, tendez bras et jambe opposés sans bouger le bassin.' },
  { name: 'Superman', group: 'dos', equipment: 'poids_du_corps', minLevel: 'debutant', stress: ['dos'], tip: 'Allongé sur le ventre, décollez bras et jambes doucement, regard au sol.' },
  { name: 'Rowing inversé sous une table solide', group: 'dos', equipment: 'poids_du_corps', minLevel: 'intermediaire', stress: [], tip: 'Corps gainé, tirez la poitrine vers le bord de la table.' },
  { name: "Rowing un bras à l'haltère", group: 'dos', equipment: 'halteres_maison', minLevel: 'debutant', stress: [], tip: 'Main et genou en appui, tirez le coude vers la hanche.' },
  { name: 'Rowing buste penché aux haltères', group: 'dos', equipment: 'halteres_maison', minLevel: 'intermediaire', stress: ['dos'], tip: 'Dos plat, buste incliné, serrez les omoplates en haut.' },
  { name: 'Tirage vertical à la poulie', group: 'dos', equipment: 'salle', minLevel: 'debutant', stress: [], tip: 'Tirez la barre vers le haut de la poitrine, sans vous balancer.' },
  { name: 'Rowing assis à la poulie', group: 'dos', equipment: 'salle', minLevel: 'debutant', stress: [], tip: 'Buste droit, ramenez les coudes le long du corps.' },
  { name: 'Tractions assistées', group: 'dos', equipment: 'salle', minLevel: 'intermediaire', stress: ['epaule'], tip: 'Montez le menton au-dessus de la barre, redescendez lentement.' },
  { name: 'Soulevé de terre', group: 'dos', equipment: 'salle', minLevel: 'confirme', stress: ['dos'], tip: 'Barre contre les tibias, dos neutre, poussez le sol avec les jambes.' },

  // Épaules
  { name: 'Élévations en Y au sol', group: 'epaules', equipment: 'poids_du_corps', minLevel: 'debutant', stress: [], tip: 'Sur le ventre, bras en Y, décollez-les en serrant les omoplates.' },
  { name: 'Pompes piquées', group: 'epaules', equipment: 'poids_du_corps', minLevel: 'intermediaire', stress: ['epaule'], tip: 'Bassin haut, descendez la tête entre les mains.' },
  { name: 'Élévations latérales aux haltères', group: 'epaules', equipment: 'halteres_maison', minLevel: 'debutant', stress: [], tip: "Montez jusqu'à hauteur d'épaules, charge légère et contrôlée." },
  { name: 'Oiseau aux haltères', group: 'epaules', equipment: 'halteres_maison', minLevel: 'debutant', stress: [], tip: 'Buste penché, ouvrez les bras sur les côtés, coudes légèrement fléchis.' },
  { name: 'Développé militaire aux haltères', group: 'epaules', equipment: 'halteres_maison', minLevel: 'intermediaire', stress: ['epaule'], tip: 'Assis, dos droit, poussez au-dessus de la tête sans cambrer.' },
  { name: 'Face pull à la poulie', group: 'epaules', equipment: 'salle', minLevel: 'debutant', stress: [], tip: 'Tirez la corde vers le visage, coudes hauts.' },
  { name: 'Développé épaules à la machine', group: 'epaules', equipment: 'salle', minLevel: 'debutant', stress: ['epaule'], tip: 'Dos calé contre le dossier, amplitude confortable.' },

  // Biceps
  { name: 'Curl isométrique avec une serviette', group: 'biceps', equipment: 'poids_du_corps', minLevel: 'debutant', stress: [], tip: 'Pied sur la serviette, tirez vers le haut et maintenez la tension.', timed: '20-30 s' },
  { name: 'Curl biceps aux haltères', group: 'biceps', equipment: 'halteres_maison', minLevel: 'debutant', stress: [], tip: 'Coudes collés au corps, sans élan.' },
  { name: 'Curl marteau', group: 'biceps', equipment: 'halteres_maison', minLevel: 'debutant', stress: [], tip: 'Pouces vers le haut, montée et descente contrôlées.' },
  { name: 'Curl à la poulie', group: 'biceps', equipment: 'salle', minLevel: 'debutant', stress: [], tip: 'Tension constante, poignets neutres.' },

  // Triceps
  { name: 'Pompes serrées sur les genoux', group: 'triceps', equipment: 'poids_du_corps', minLevel: 'debutant', stress: [], tip: 'Mains sous les épaules, coudes qui frôlent le buste.' },
  { name: 'Dips sur une chaise', group: 'triceps', equipment: 'poids_du_corps', minLevel: 'intermediaire', stress: ['epaule'], tip: 'Chaise stable, descendez sans dépasser 90° aux coudes.' },
  { name: 'Extension triceps aux haltères', group: 'triceps', equipment: 'halteres_maison', minLevel: 'debutant', stress: [], tip: 'Coudes fixes et serrés, seule l’avant-bras bouge.' },
  { name: 'Extension triceps à la poulie', group: 'triceps', equipment: 'salle', minLevel: 'debutant', stress: [], tip: 'Coudes collés au corps, verrouillez en bas.' },

  // Abdos
  { name: 'Gainage planche', group: 'abdos', equipment: 'poids_du_corps', minLevel: 'debutant', stress: [], tip: 'Corps aligné, fessiers serrés, respirez normalement.', timed: '30-45 s' },
  { name: 'Gainage latéral', group: 'abdos', equipment: 'poids_du_corps', minLevel: 'debutant', stress: [], tip: 'Hanche haute, épaule au-dessus du coude.', timed: '20-30 s par côté' },
  { name: 'Dead bug', group: 'abdos', equipment: 'poids_du_corps', minLevel: 'debutant', stress: [], tip: 'Bas du dos plaqué au sol, bras et jambe opposés s’allongent.' },
  { name: 'Crunchs', group: 'abdos', equipment: 'poids_du_corps', minLevel: 'debutant', stress: [], tip: 'Enroulez le buste sans tirer sur la nuque.' },
  { name: 'Mountain climbers', group: 'abdos', equipment: 'poids_du_corps', minLevel: 'intermediaire', stress: [], tip: 'Bassin stable, genoux vers la poitrine en alternance.' },
  { name: 'Relevés de jambes allongé', group: 'abdos', equipment: 'poids_du_corps', minLevel: 'intermediaire', stress: ['dos'], tip: 'Mains sous les fessiers, dos collé au sol.' },

  // Cardio
  { name: 'Marche rapide sur place', group: 'cardio', equipment: 'poids_du_corps', minLevel: 'debutant', stress: [], tip: 'Genoux mi-hauteur, bras actifs, sans impact.' },
  { name: 'Jumping jacks', group: 'cardio', equipment: 'poids_du_corps', minLevel: 'debutant', stress: ['genou'], tip: 'Réception souple, rythme régulier.' },
  { name: 'Montées de genoux', group: 'cardio', equipment: 'poids_du_corps', minLevel: 'debutant', stress: ['genou'], tip: 'Sur l’avant du pied, genoux à hauteur de hanches.' },
  { name: 'Burpees', group: 'cardio', equipment: 'poids_du_corps', minLevel: 'intermediaire', stress: ['genou', 'dos'], tip: 'Enchaînez sans vous presser, gardez le dos gainé.' },
  { name: "Vélo ou rameur d'intérieur", group: 'cardio', equipment: 'salle', minLevel: 'debutant', stress: [], tip: 'Rythme soutenu mais où vous pouvez encore parler.', timed: '8-10 min' },
];
