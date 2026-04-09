'use client';

import { useGameStore } from '@/games/karols-farm/store/gameStore';
import { SEEDS } from '@/games/karols-farm/core/data/seeds';
import { TREES } from '@/games/karols-farm/core/data/trees';
import { SEASON_NAMES, WEATHER } from '@/games/karols-farm/core/data/weather';
import type { SeedKey, TreeKey } from '@/games/karols-farm/core/types';

export function HUD() {
  const money = useGameStore((s) => s.money);
  const energy = useGameStore((s) => s.energy);
  const maxEnergy = useGameStore((s) => s.maxEnergy);
  const waterLevel = useGameStore((s) => s.waterLevel);
  const waterMax = useGameStore((s) => s.waterMax);
  const inventoryCount = useGameStore((s) => s.inventoryCount);
  const bagMax = useGameStore((s) => s.bagMax);
  const day = useGameStore((s) => s.day);
  const time = useGameStore((s) => s.time);
  const level = useGameStore((s) => s.level);
  const season = useGameStore((s) => s.season);
  const weather = useGameStore((s) => s.weather);
  const combo = useGameStore((s) => s.combo);
  const selectedItem = useGameStore((s) => s.selectedItem);
  const selectionType = useGameStore((s) => s.selectionType);
  const workers = useGameStore((s) => s.workers);
  const inventory = useGameStore((s) => s.inventory);
  const weatherForecast = useGameStore((s) => s.weatherForecast);
  const advancedUpgrades = useGameStore((s) => s.advancedUpgrades);

  const dayIcon = time < 0.3 ? '🌅' : time < 0.65 ? '☀️' : time < 0.8 ? '🌇' : '🌙';
  const seasonInfo = SEASON_NAMES[season];
  const weatherInfo = WEATHER[weather];

  // Calculate inventory value
  let invValue = 0;
  for (const [key, count] of Object.entries(inventory)) {
    if (count && SEEDS[key as SeedKey]) {
      invValue += count * SEEDS[key as SeedKey].sellPrice;
    }
  }

  const selectedEmoji = selectionType === 'seed'
    ? SEEDS[selectedItem as SeedKey]?.emoji
    : TREES[selectedItem as TreeKey]?.emoji;

  return (
    <div className="absolute top-0 left-0 right-0 pointer-events-none z-10">
      {/* Top bar */}
      <div className="bg-black/60 backdrop-blur-sm text-white px-4 py-2 flex flex-wrap gap-3 text-sm font-mono">
        <span>💰{money}</span>
        <span className={energy < 20 ? 'text-red-400 animate-pulse' : ''}>
          ⚡{Math.floor(energy)}/{maxEnergy}
        </span>
        <span>💧{waterLevel}/{waterMax}</span>
        <span>🎒{inventoryCount}/{bagMax}</span>
        <span>{dayIcon} Dzień {day}</span>
        <span>⭐Lv{level}</span>
        {workers.length > 0 && <span>👷{workers.length}</span>}
        {combo > 0 && <span className="text-orange-400">🔥×{combo}</span>}
      </div>

      {/* Second row */}
      <div className="bg-black/40 backdrop-blur-sm text-white px-4 py-1 flex flex-wrap gap-3 text-xs font-mono">
        <span>🌱 {selectedEmoji}</span>
        {inventoryCount > 0 && <span>🎒 {inventoryCount} ({invValue}💰)</span>}
        <span>{seasonInfo.emoji} {seasonInfo.name}</span>
        <span>{weatherInfo.emoji} {weatherInfo.name} (×{weatherInfo.growMod})</span>
        {advancedUpgrades.sprinkler && <span>🚿</span>}
        {advancedUpgrades.greenhouse && <span>🏠+20%</span>}
        {advancedUpgrades.scarecrow && <span>🎃</span>}
      </div>

      {/* Weather forecast panel */}
      <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white p-2 rounded-lg text-xs">
        <div>{weatherInfo.emoji} {weatherInfo.name}</div>
        <div className="text-gray-300">Wzrost: ×{weatherInfo.growMod}</div>
        {weatherForecast.map((w, i) => (
          <div key={i} className="text-gray-400">
            D{i + 2}: {WEATHER[w].emoji} {WEATHER[w].name}
          </div>
        ))}
      </div>
    </div>
  );
}
