import type { WeatherType, SeasonIndex, Plot } from '@/games/karols-farm/core/types';
import { SEASON_WEATHER_POOL } from '@/games/karols-farm/core/data/weather';

/**
 * Pick a random weather type from the season's weather pool.
 */
export function getRandomWeather(season: SeasonIndex): WeatherType {
  const pool = SEASON_WEATHER_POOL[season];
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Generate a multi-day weather forecast for a given season.
 */
export function generateForecast(season: SeasonIndex, days: number): WeatherType[] {
  const forecast: WeatherType[] = [];
  for (let i = 0; i < days; i++) {
    forecast.push(getRandomWeather(season));
  }
  return forecast;
}

/**
 * Rain auto-waters plots: 12% chance per plot normally, 100% with irrigation upgrade.
 */
export function applyRainEffect(plots: Plot[], irrigationUpgrade: boolean): Plot[] {
  return plots.map((plot) => {
    if (plot.watered) return plot;
    if (plot.plant === null && plot.tree === null) return plot;

    const chance = irrigationUpgrade ? 1.0 : 0.12;
    if (Math.random() < chance) {
      return { ...plot, watered: true };
    }
    return plot;
  });
}

/**
 * Storm can destroy plants: 15% chance per planted plot.
 * Scarecrow and greenhouse prevent destruction.
 */
export function applyStormDamage(
  plots: Plot[],
  hasScarecrow: boolean,
  hasGreenhouse: boolean,
): Plot[] {
  if (hasScarecrow || hasGreenhouse) return plots;

  return plots.map((plot) => {
    if (plot.plant === null && plot.tree === null) return plot;

    if (Math.random() < 0.15) {
      return {
        ...plot,
        plant: null,
        tree: null,
        watered: false,
        growthStartTime: 0,
        growthProgress: 0,
        isGrown: false,
        isGolden: false,
        isFertilized: false,
        lastTreeDropTime: 0,
      };
    }
    return plot;
  });
}

/**
 * Drought can un-water plots: 5% chance per watered plot.
 */
export function applyDroughtEffect(plots: Plot[]): Plot[] {
  return plots.map((plot) => {
    if (!plot.watered) return plot;

    if (Math.random() < 0.05) {
      return { ...plot, watered: false };
    }
    return plot;
  });
}
