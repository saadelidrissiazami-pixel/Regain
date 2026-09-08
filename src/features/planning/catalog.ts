import type { ActivityCategory } from './types';

export type EnergyLevel = 'bas' | 'moyen' | 'eleve';
export type CostLevel = 'gratuit' | 'faible' | 'modere';
export type BudgetLevel = 'gratuit' | 'modere' | 'confortable';

export type ActivityStep = {
  icon: string;
  title: string;
  description: string;
};

export type CatalogActivity = {
  id: string;
  title: string;
  category: ActivityCategory;
  duration_minutes: number;
  energy_required: EnergyLevel;
  indoor_outdoor: 'indoor' | 'outdoor' | 'indifferent' | null;
  cost_level: CostLevel;
  instructions: string | null;
  tags: string[];
  steps: ActivityStep[];
};

const ENERGY_ORDER: Record<EnergyLevel, number> = { bas: 0, moyen: 1, eleve: 2 };
const MAX_COST_FOR_BUDGET: Record<BudgetLevel, CostLevel> = {
  gratuit: 'gratuit',
  modere: 'faible',
  confortable: 'modere',
};
const COST_ORDER: Record<CostLevel, number> = { gratuit: 0, faible: 1, modere: 2 };

export function energyMeetsRequirement(userEnergy: EnergyLevel, required: EnergyLevel) {
  return ENERGY_ORDER[required] <= ENERGY_ORDER[userEnergy];
}

export function fitsBudget(cost: CostLevel, budget: BudgetLevel) {
  return COST_ORDER[cost] <= COST_ORDER[MAX_COST_FOR_BUDGET[budget]];
}
