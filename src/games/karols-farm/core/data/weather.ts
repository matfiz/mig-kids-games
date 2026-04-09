import type { WeatherType, WeatherDef, SeasonIndex } from '../types';

export const WEATHER: Record<WeatherType, WeatherDef> = {
  sunny: {
    id: 'sunny',
    name: 'Słonecznie',
    emoji: '\u2600\uFE0F',
    growMod: 1.0,
  },
  cloudy: {
    id: 'cloudy',
    name: 'Pochmurno',
    emoji: '\u2601\uFE0F',
    growMod: 0.9,
  },
  rain: {
    id: 'rain',
    name: 'Deszcz',
    emoji: '\uD83C\uDF27\uFE0F',
    growMod: 1.2,
  },
  storm: {
    id: 'storm',
    name: 'Burza',
    emoji: '\u26C8\uFE0F',
    growMod: 0.5,
  },
  drought: {
    id: 'drought',
    name: 'Susza',
    emoji: '\uD83C\uDFDC\uFE0F',
    growMod: 0.6,
  },
  fog: {
    id: 'fog',
    name: 'Mgła',
    emoji: '\uD83C\uDF2B\uFE0F',
    growMod: 0.8,
  },
};

export const SEASON_WEATHER_POOL: Record<SeasonIndex, WeatherType[]> = {
  0: ['sunny', 'sunny', 'cloudy', 'rain'],
  1: ['sunny', 'sunny', 'drought', 'rain', 'storm'],
  2: ['cloudy', 'rain', 'fog', 'storm'],
  3: ['cloudy', 'fog', 'storm'],
};

export const SEASON_GROW_MOD: Record<SeasonIndex, number> = {
  0: 1.1,
  1: 1.2,
  2: 0.9,
  3: 0.4,
};

export const SEASON_NAMES: Record<SeasonIndex, { name: string; emoji: string }> = {
  0: { name: 'Wiosna', emoji: '\uD83C\uDF38' },
  1: { name: 'Lato', emoji: '\u2600\uFE0F' },
  2: { name: 'Jesień', emoji: '\uD83C\uDF42' },
  3: { name: 'Zima', emoji: '\u2744\uFE0F' },
};
