import type { WeatherType, SeasonIndex, SeedKey, Plot } from '@/games/karols-farm/core/types';
import { WEATHER } from '@/games/karols-farm/core/data/weather';
import { SEEDS } from '@/games/karols-farm/core/data/seeds';
import { getSeasonGrowMod, getSeasonBonusForSeed } from './seasons';

/**
 * Calculate the combined growth rate multiplier for a plant.
 * Combines: weather mod x season mod x season bonus x fertilizer(x2) x greenhouse(x1.2).
 */
export function calculateGrowthRate(
  weather: WeatherType,
  season: SeasonIndex,
  seedKey: SeedKey,
  isFertilized: boolean,
  hasGreenhouse: boolean,
): number {
  const weatherMod = WEATHER[weather].growMod;
  const seasonMod = getSeasonGrowMod(season);
  const bonusSeason = getSeasonBonusForSeed(seedKey, season);
  const fertilizerMod = isFertilized ? 2 : 1;
  const greenhouseMod = hasGreenhouse ? 1.2 : 1;

  return weatherMod * seasonMod * bonusSeason * fertilizerMod * greenhouseMod;
}

/**
 * Determine whether a plant on a plot has finished growing.
 * Compares elapsed time against growTime / growthRate.
 */
export function isPlantGrown(plot: Plot, now: number, growthRate: number): boolean {
  if (plot.plant === null) return false;
  const seedDef = SEEDS[plot.plant];
  const elapsed = (now - plot.growthStartTime) / 1000; // ms to seconds
  const adjustedGrowTime = seedDef.growTime / growthRate;
  return elapsed >= adjustedGrowTime;
}

/**
 * Calculate the growth progress of a plant as a value between 0 and 1.
 */
export function getGrowthProgress(plot: Plot, now: number, growthRate: number): number {
  if (plot.plant === null) return 0;
  const seedDef = SEEDS[plot.plant];
  const elapsed = (now - plot.growthStartTime) / 1000; // ms to seconds
  const adjustedGrowTime = seedDef.growTime / growthRate;
  return Math.min(elapsed / adjustedGrowTime, 1);
}

/**
 * Roll whether a harvested plant turns out golden.
 * 5% normally, 25% with gold seeds upgrade.
 */
export function rollGoldenChance(hasGoldSeeds: boolean): boolean {
  const chance = hasGoldSeeds ? 0.25 : 0.05;
  return Math.random() < chance;
}

/**
 * Calculate the money and XP earned from harvesting a plant.
 * Golden: x3 money, x5 XP.
 * Combo bonus: floor(sellPrice * combo * 0.1) if combo >= 3.
 */
export function getHarvestValue(
  seedKey: SeedKey,
  isGolden: boolean,
  combo: number,
): { money: number; xp: number } {
  const seedDef = SEEDS[seedKey];
  const baseMoney = seedDef.sellPrice;
  const baseXp = Math.max(Math.floor(baseMoney / 2), 5);

  let money = isGolden ? baseMoney * 3 : baseMoney;
  let xp = isGolden ? baseXp * 5 : baseXp;

  if (combo >= 3) {
    money += Math.floor(seedDef.sellPrice * combo * 0.1);
  }

  return { money, xp };
}

/**
 * Get the total XP required to reach a specific level.
 */
export function getXpForLevel(level: number): number {
  return 100 + level * 50;
}

/**
 * Calculate the player's level from their total accumulated XP.
 * Each level requires 100 + level*50 XP.
 */
export function getLevelFromXp(totalXp: number): number {
  let level = 0;
  let remaining = totalXp;
  while (remaining >= getXpForLevel(level + 1)) {
    remaining -= getXpForLevel(level + 1);
    level++;
  }
  return level;
}
