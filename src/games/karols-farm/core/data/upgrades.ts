import type { BasicUpgradeDef, AdvancedUpgradeDef } from '../types';

export const BASIC_UPGRADES: BasicUpgradeDef[] = [
  {
    id: 'waterLevel',
    name: 'Konewka',
    emoji: '\uD83D\uDCA7',
    costs: [0, 120, 375],
    values: [5, 10, 20],
  },
  {
    id: 'bagLevel',
    name: 'Plecak',
    emoji: '\uD83C\uDF92',
    costs: [0, 150, 450],
    values: [5, 15, 30],
  },
  {
    id: 'speedLevel',
    name: 'Buty',
    emoji: '\uD83D\uDC5F',
    costs: [0, 180, 600],
    values: [5, 7, 9],
  },
];

export const ADVANCED_UPGRADES: AdvancedUpgradeDef[] = [
  {
    id: 'sprinkler',
    name: 'Zraszacz',
    emoji: '\uD83D\uDEBF',
    cost: 750,
    description: 'Auto-podlewa co ~10 sek',
  },
  {
    id: 'greenhouse',
    name: 'Szklarnia',
    emoji: '\uD83C\uDFE0',
    cost: 1800,
    description: 'Chroni + wzrost \u00D71.2',
  },
  {
    id: 'fertilizerCharges',
    name: 'Nawóz',
    emoji: '\uD83E\uDDEA',
    cost: 450,
    description: '+20 ładunków, wzrost \u00D72',
  },
  {
    id: 'scarecrow',
    name: 'Strach na wróble',
    emoji: '\uD83C\uDF83',
    cost: 300,
    description: 'Chroni przed burzą',
  },
  {
    id: 'silo',
    name: 'Silos',
    emoji: '\uD83C\uDFD7\uFE0F',
    cost: 3000,
    description: 'Podwaja bagMax',
  },
  {
    id: 'irrigation',
    name: 'Nawadnianie',
    emoji: '\uD83D\uDD27',
    cost: 4500,
    description: 'Deszcz 100% podlewa',
  },
  {
    id: 'goldSeeds',
    name: 'Złote nasiona',
    emoji: '\u2B50',
    cost: 7500,
    description: '25% szans złotych',
  },
];
