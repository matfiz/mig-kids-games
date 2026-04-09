// Seed types
export type SeedKey = 'apple' | 'carrot' | 'tomato' | 'corn' | 'strawberry' | 'pumpkin' | 'grape' | 'melon';
export type TreeKey = 'appleTree' | 'cherryTree' | 'orangeTree' | 'lemonTree';
export type WeatherType = 'sunny' | 'cloudy' | 'rain' | 'storm' | 'drought' | 'fog';
export type SeasonIndex = 0 | 1 | 2 | 3; // spring, summer, autumn, winter
export type SeasonName = 'spring' | 'summer' | 'autumn' | 'winter';
export type WorkerTier = 0 | 1 | 2 | 3 | 4;
export type WorkerState = 'idle' | 'toPlot' | 'toHarvest' | 'toWell' | 'toSell';

// Seed data definition
export interface SeedDef {
  id: SeedKey;
  name: string;
  emoji: string;
  cost: number;
  sellPrice: number;
  growTime: number; // seconds
  bonusSeason: SeasonIndex | null;
  hotkey: string;
}

// Tree data definition
export interface TreeDef {
  id: TreeKey;
  name: string;
  emoji: string;
  cost: number;
  growTime: number;
  drops: SeedKey;
  dropCount: number;
  dropInterval: number;
  hotkey: string | null;
}

// Weather data definition
export interface WeatherDef {
  id: WeatherType;
  name: string;
  emoji: string;
  growMod: number;
}

// Worker tier definition
export interface WorkerTierDef {
  tier: WorkerTier;
  name: string;
  cost: number;
  speed: number;
  waterMax: number;
  carryCapacity: number;
  color: string;
}

// Plot state
export interface Plot {
  x: number;
  y: number;
  plant: SeedKey | null;
  tree: TreeKey | null;
  watered: boolean;
  growthStartTime: number;
  growthProgress: number; // 0-1
  isGrown: boolean;
  isGolden: boolean;
  isFertilized: boolean;
  lastTreeDropTime: number;
}

// Field state
export interface Field {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  plots: Plot[];
  owned: boolean;
}

// Worker state
export interface Worker {
  id: number;
  tier: WorkerTier;
  x: number;
  z: number;
  state: WorkerState;
  targetX: number;
  targetZ: number;
  inventory: Partial<Record<SeedKey, number>>;
  inventoryCount: number;
  waterLevel: number;
  waterMax: number;
  carryCapacity: number;
  speed: number;
  color: string;
  actionCooldown: number;
}

// Building
export interface Building {
  id: string;
  name: string;
  emoji: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

// Field definition (for purchase)
export interface FieldDef {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  cost: number;
}

// Upgrades
export interface BasicUpgrades {
  waterLevel: number;  // 0-3
  bagLevel: number;    // 0-3
  speedLevel: number;  // 0-3
}

export interface AdvancedUpgrades {
  sprinkler: boolean;
  greenhouse: boolean;
  fertilizerCharges: number;
  scarecrow: boolean;
  silo: boolean;
  irrigation: boolean;
  goldSeeds: boolean;
}

// Basic upgrade definition
export interface BasicUpgradeDef {
  id: keyof BasicUpgrades;
  name: string;
  emoji: string;
  costs: number[];
  values: number[];
}

// Advanced upgrade definition
export interface AdvancedUpgradeDef {
  id: keyof AdvancedUpgrades;
  name: string;
  emoji: string;
  cost: number;
  description: string;
}

// Toast message
export interface Toast {
  id: number;
  message: string;
  timestamp: number;
}

// Full game state
export interface GameState {
  // Economy
  money: number;
  earned: number;

  // Player resources
  energy: number;
  maxEnergy: number;
  waterLevel: number;
  waterMax: number;
  inventory: Partial<Record<SeedKey, number>>;
  inventoryCount: number;
  bagMax: number;

  // Progress
  level: number;
  xp: number;
  day: number;
  time: number;       // 0-1
  season: SeasonIndex;
  harvested: number;

  // World
  fields: Field[];
  player: { x: number; z: number; direction: number };
  workers: Worker[];

  // Selection
  selectedItem: SeedKey | TreeKey;
  selectionType: 'seed' | 'tree';

  // Weather
  weather: WeatherType;
  weatherTimer: number;
  weatherForecast: WeatherType[];

  // Combo
  combo: number;
  comboTimer: number;

  // Upgrades
  upgrades: BasicUpgrades;
  advancedUpgrades: AdvancedUpgrades;
  sprinklerTimer: number;

  // Sleep
  isSleeping: boolean;
  sleepTimer: number;

  // Cheat
  cheatActive: boolean;

  // UI
  toasts: Toast[];
  shopOpen: boolean;
  helpOpen: boolean;

  // Timing
  lastTickTime: number;
}
