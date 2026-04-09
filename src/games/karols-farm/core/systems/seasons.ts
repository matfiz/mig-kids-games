import type { SeasonIndex, SeedKey } from '@/games/karols-farm/core/types';
import { SEASON_GROW_MOD } from '@/games/karols-farm/core/data/weather';
import { SEEDS } from '@/games/karols-farm/core/data/seeds';

/**
 * Determine the season for a given day.
 * Seasons change every 7 days in a 28-day cycle.
 */
export function getSeasonForDay(day: number): SeasonIndex {
  return Math.floor((day % 28) / 7) as SeasonIndex;
}

/**
 * Get the growth rate modifier for a season.
 */
export function getSeasonGrowMod(season: SeasonIndex): number {
  return SEASON_GROW_MOD[season];
}

/**
 * Returns 1.3 if the seed's bonus season matches the current season, else 1.0.
 */
export function getSeasonBonusForSeed(seed: SeedKey, season: SeasonIndex): number {
  const seedDef = SEEDS[seed];
  if (seedDef.bonusSeason === season) {
    return 1.3;
  }
  return 1.0;
}
