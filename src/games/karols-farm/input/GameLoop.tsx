'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/games/karols-farm/store/gameStore';
import { useKeyboardInput } from './keyboard';

export function GameLoop() {
  const keysRef = useKeyboardInput();
  const lastSave = useRef(Date.now());

  useEffect(() => {
    let animId: number;

    const loop = () => {
      const now = Date.now();
      const store = useGameStore.getState();

      // Tick game logic
      store.tick(now);

      // Movement from keyboard
      const keys = keysRef.current;
      if (!store.isSleeping && !store.shopOpen && !store.helpOpen) {
        let dx = 0;
        let dz = 0;
        if (keys.has('w') || keys.has('W')) dz -= 1;
        if (keys.has('s') || keys.has('S')) dz += 1;
        if (keys.has('a') || keys.has('A')) dx -= 1;
        if (keys.has('d') || keys.has('D')) dx += 1;

        // Normalize diagonal movement
        if (dx !== 0 && dz !== 0) {
          dx *= 0.707;
          dz *= 0.707;
        }

        // Touch input
        const touch = (window as unknown as Record<string, unknown>).__karolsFarmTouch as { dx: number; dz: number } | null;
        if (touch) {
          dx += touch.dx;
          dz += touch.dz;
        }

        if (dx !== 0 || dz !== 0) {
          store.movePlayer(dx, dz, 1 / 60);
        }
      }

      // Auto-save every 60 seconds
      if (now - lastSave.current > 60000) {
        lastSave.current = now;
        try {
          const state = useGameStore.getState();
          const saveData = {
            version: '1.0',
            timestamp: now,
            state: extractSaveState(state),
          };
          localStorage.setItem('karols-farm-save', JSON.stringify(saveData));
        } catch {
          // localStorage might not be available
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [keysRef]);

  return null;
}

function extractSaveState(state: ReturnType<typeof useGameStore.getState>) {
  // Only save game state, not actions
  return {
    money: state.money,
    earned: state.earned,
    energy: state.energy,
    maxEnergy: state.maxEnergy,
    waterLevel: state.waterLevel,
    waterMax: state.waterMax,
    inventory: state.inventory,
    inventoryCount: state.inventoryCount,
    bagMax: state.bagMax,
    level: state.level,
    xp: state.xp,
    day: state.day,
    time: state.time,
    season: state.season,
    harvested: state.harvested,
    fields: state.fields,
    player: state.player,
    workers: state.workers,
    selectedItem: state.selectedItem,
    selectionType: state.selectionType,
    weather: state.weather,
    weatherTimer: state.weatherTimer,
    weatherForecast: state.weatherForecast,
    combo: state.combo,
    comboTimer: state.comboTimer,
    upgrades: state.upgrades,
    advancedUpgrades: state.advancedUpgrades,
    sprinklerTimer: state.sprinklerTimer,
    cheatActive: state.cheatActive,
  };
}
