'use client';

import { create } from 'zustand';
import type {
  GameState,
  SeedKey,
  TreeKey,
  SeasonIndex,
  Plot,
  Field,
  Worker,
  Toast,
  WeatherType,
} from '@/games/karols-farm/core/types';
import { SEEDS } from '@/games/karols-farm/core/data/seeds';
import { TREES } from '@/games/karols-farm/core/data/trees';
import { FIELD_DEFS, BUILDINGS } from '@/games/karols-farm/core/data/world';
import { BASIC_UPGRADES, ADVANCED_UPGRADES } from '@/games/karols-farm/core/data/upgrades';
import { WORKER_TIERS } from '@/games/karols-farm/core/data/workers';
import {
  getRandomWeather,
  generateForecast,
  applyRainEffect,
  applyStormDamage,
  applyDroughtEffect,
} from '@/games/karols-farm/core/systems/weather';
import { getSeasonForDay, getSeasonGrowMod } from '@/games/karols-farm/core/systems/seasons';
import {
  calculateSellValue,
  canAfford,
  getSeedCost,
  getTreeCost,
  getFieldCost,
} from '@/games/karols-farm/core/systems/economy';
import {
  canPerformAction,
  getActionCost,
  getMaxEnergy,
} from '@/games/karols-farm/core/systems/energy';
import {
  calculateGrowthRate,
  getGrowthProgress,
  rollGoldenChance,
  getHarvestValue,
  getXpForLevel,
} from '@/games/karols-farm/core/systems/plants';
import { createWorker, getNextWorkerCost, updateWorkerAI } from '@/games/karols-farm/core/systems/workers';

function createPlot(x: number, y: number): Plot {
  return {
    x, y,
    plant: null, tree: null,
    watered: false,
    growthStartTime: 0,
    growthProgress: 0,
    isGrown: false,
    isGolden: false,
    isFertilized: false,
    lastTreeDropTime: 0,
  };
}

function createField(def: typeof FIELD_DEFS[number], owned: boolean): Field {
  const plots: Plot[] = [];
  for (let py = 0; py < def.height; py++) {
    for (let px = 0; px < def.width; px++) {
      plots.push(createPlot(def.x + px, def.y + py));
    }
  }
  return {
    id: def.id,
    x: def.x, y: def.y,
    width: def.width, height: def.height,
    plots,
    owned,
  };
}

function createInitialState(): GameState {
  const now = Date.now();
  return {
    money: 50,
    earned: 0,
    energy: 100,
    maxEnergy: 100,
    waterLevel: 5,
    waterMax: 5,
    inventory: {},
    inventoryCount: 0,
    bagMax: 5,
    level: 1,
    xp: 0,
    day: 1,
    time: 0.25,
    season: 0,
    harvested: 0,
    fields: FIELD_DEFS.map((def, i) => createField(def, i === 0)),
    player: { x: 5, z: 4, direction: 0 },
    workers: [],
    selectedItem: 'apple' as SeedKey,
    selectionType: 'seed',
    weather: 'sunny',
    weatherTimer: 0,
    weatherForecast: generateForecast(0, 3),
    combo: 0,
    comboTimer: 0,
    upgrades: { waterLevel: 0, bagLevel: 0, speedLevel: 0 },
    advancedUpgrades: {
      sprinkler: false,
      greenhouse: false,
      fertilizerCharges: 0,
      scarecrow: false,
      silo: false,
      irrigation: false,
      goldSeeds: false,
    },
    sprinklerTimer: 0,
    isSleeping: false,
    sleepTimer: 0,
    cheatActive: false,
    toasts: [],
    shopOpen: false,
    helpOpen: false,
    lastTickTime: now,
  };
}

let toastIdCounter = 0;

export interface GameActions {
  // Core loop
  tick: (now: number) => void;

  // Player actions
  movePlayer: (dx: number, dz: number, dt: number) => void;
  performAction: () => void;
  massHarvest: () => void;
  selectSeed: (key: SeedKey) => void;
  selectTree: (key: TreeKey) => void;

  // Shop
  buySeed: (key: SeedKey, count: number) => void;
  buyTree: (key: TreeKey) => void;
  buyField: (fieldId: number) => void;
  buyBasicUpgrade: (upgradeId: 'waterLevel' | 'bagLevel' | 'speedLevel') => void;
  buyAdvancedUpgrade: (upgradeId: string) => void;
  buyWorker: () => void;

  // Buildings
  sellInventory: () => void;
  refillWater: () => void;
  goToSleep: () => void;

  // UI
  toggleShop: () => void;
  toggleHelp: () => void;
  addToast: (message: string) => void;
  activateCheat: () => void;

  // Persistence
  resetGame: () => void;
  loadState: (state: Partial<GameState>) => void;
}

export type GameStore = GameState & GameActions;

export const useGameStore = create<GameStore>((set, get) => ({
  ...createInitialState(),

  tick: (now: number) => {
    const state = get();
    const dt = Math.min((now - state.lastTickTime) / 1000, 0.1); // cap at 100ms
    if (dt <= 0) return;

    set((s) => {
      const newState = { ...s, lastTickTime: now };

      // Sleep animation
      if (s.isSleeping) {
        newState.sleepTimer = s.sleepTimer - dt;
        if (newState.sleepTimer <= 0) {
          newState.isSleeping = false;
          newState.day = s.day + 1;
          newState.time = 0.25;
          newState.energy = getMaxEnergy(s.level);
          newState.season = getSeasonForDay(newState.day);
          newState.weather = getRandomWeather(newState.season);
          newState.weatherForecast = generateForecast(newState.season, 3);
        }
        return newState;
      }

      // Time passes
      newState.time = Math.min(s.time + dt * 0.008, 0.95); // ~2 min real = 1 game day

      // Night energy drain
      if (newState.time > 0.65) {
        newState.energy = Math.max(0, s.energy - dt * 0.5);
      }

      // Weather timer
      newState.weatherTimer = s.weatherTimer + dt;
      if (newState.weatherTimer > 30 + Math.random() * 20) {
        newState.weatherTimer = 0;
        newState.weather = getRandomWeather(s.season);
      }

      // Weather effects (every tick)
      let updatedFields = [...s.fields.map(f => ({ ...f, plots: [...f.plots] }))];
      for (const field of updatedFields) {
        if (!field.owned) continue;
        if (s.weather === 'rain') {
          field.plots = applyRainEffect(field.plots, s.advancedUpgrades.irrigation);
        } else if (s.weather === 'storm') {
          field.plots = applyStormDamage(field.plots, s.advancedUpgrades.scarecrow, s.advancedUpgrades.greenhouse);
        } else if (s.weather === 'drought') {
          field.plots = applyDroughtEffect(field.plots);
        }
      }

      // Sprinkler
      if (s.advancedUpgrades.sprinkler) {
        newState.sprinklerTimer = s.sprinklerTimer + dt;
        if (newState.sprinklerTimer >= 10) {
          newState.sprinklerTimer = 0;
          for (const field of updatedFields) {
            if (!field.owned) continue;
            field.plots = field.plots.map(p => ({
              ...p,
              watered: (p.plant || p.tree) ? true : p.watered,
            }));
          }
        }
      }

      // Plant growth
      for (const field of updatedFields) {
        if (!field.owned) continue;
        field.plots = field.plots.map(plot => {
          if (!plot.plant && !plot.tree) return plot;
          if (plot.isGrown) return plot;

          const seedKey = plot.plant || (plot.tree ? null : null);
          if (plot.plant && plot.watered) {
            const rate = calculateGrowthRate(
              s.weather, s.season, plot.plant, plot.isFertilized, s.advancedUpgrades.greenhouse
            );
            const progress = getGrowthProgress(plot, now, rate);
            return {
              ...plot,
              growthProgress: Math.min(progress, 1),
              isGrown: progress >= 1,
            };
          }

          if (plot.tree && plot.watered) {
            const elapsed = (now - plot.growthStartTime) / 1000;
            const treeData = TREES[plot.tree];
            const seasonMod = getSeasonGrowMod(s.season);
            const growTime = treeData.growTime / seasonMod;
            const progress = Math.min(elapsed / growTime, 1);
            return {
              ...plot,
              growthProgress: progress,
              isGrown: progress >= 1,
            };
          }

          return plot;
        });
      }

      // Tree drops
      for (const field of updatedFields) {
        if (!field.owned) continue;
        for (let i = 0; i < field.plots.length; i++) {
          const plot = field.plots[i];
          if (!plot.tree || !plot.isGrown) continue;
          const treeData = TREES[plot.tree];
          const timeSinceDrop = (now - plot.lastTreeDropTime) / 1000;
          if (timeSinceDrop >= treeData.dropInterval) {
            field.plots[i] = { ...plot, lastTreeDropTime: now };
            // Drop seeds on neighboring plots
            let dropped = 0;
            for (const f of updatedFields) {
              if (!f.owned) continue;
              for (let j = 0; j < f.plots.length; j++) {
                const np = f.plots[j];
                if (Math.abs(np.x - plot.x) <= 1 && Math.abs(np.y - plot.y) <= 1 && !(np.x === plot.x && np.y === plot.y)) {
                  if (!np.plant && !np.tree && dropped < treeData.dropCount) {
                    f.plots[j] = {
                      ...np,
                      plant: treeData.drops,
                      watered: true,
                      growthStartTime: now,
                      growthProgress: 0,
                      isGrown: false,
                      isGolden: rollGoldenChance(s.advancedUpgrades.goldSeeds),
                      isFertilized: false,
                    };
                    dropped++;
                  }
                }
              }
            }
          }
        }
      }

      newState.fields = updatedFields;

      // Combo timer
      if (s.combo > 0) {
        newState.comboTimer = s.comboTimer - dt;
        if (newState.comboTimer <= 0) {
          newState.combo = 0;
          newState.comboTimer = 0;
        }
      }

      // Worker AI
      const updatedWorkers: Worker[] = [];
      for (const worker of s.workers) {
        const result = updateWorkerAI(worker, newState.fields, BUILDINGS, dt);
        updatedWorkers.push(result.worker);
        for (const action of result.actions) {
          if (action.type === 'water') {
            for (const field of newState.fields) {
              for (let i = 0; i < field.plots.length; i++) {
                if (field.plots[i].x === action.plotX && field.plots[i].y === action.plotY) {
                  field.plots[i] = { ...field.plots[i], watered: true };
                }
              }
            }
          } else if (action.type === 'harvest') {
            for (const field of newState.fields) {
              for (let i = 0; i < field.plots.length; i++) {
                const p = field.plots[i];
                if (p.x === action.plotX && p.y === action.plotY && p.isGrown && p.plant) {
                  field.plots[i] = { ...p, plant: null, watered: false, growthProgress: 0, isGrown: false, isGolden: false, isFertilized: false, growthStartTime: 0 };
                }
              }
            }
          } else if (action.type === 'sell') {
            newState.money = (newState.money || s.money) + action.value;
            newState.earned = (newState.earned || s.earned) + action.value;
          }
        }
      }
      newState.workers = updatedWorkers;

      // Clean old toasts
      newState.toasts = s.toasts.filter(t => now - t.timestamp < 2200);

      return newState;
    });
  },

  movePlayer: (dx: number, dz: number, dt: number) => {
    set((s) => {
      if (s.isSleeping || s.shopOpen || s.helpOpen) return s;
      const speed = (BASIC_UPGRADES.find(u => u.id === 'speedLevel')?.values[s.upgrades.speedLevel] ?? 5);
      const energyMult = s.energy < 20 ? 0.5 : 1;
      const moveSpeed = speed * energyMult * dt;
      return {
        player: {
          x: s.player.x + dx * moveSpeed,
          z: s.player.z + dz * moveSpeed,
          direction: dx !== 0 || dz !== 0 ? Math.atan2(dx, dz) : s.player.direction,
        },
      };
    });
  },

  performAction: () => {
    const state = get();
    if (state.isSleeping || state.shopOpen || state.helpOpen) return;

    const px = state.player.x;
    const pz = state.player.z;

    // Check buildings
    for (const b of BUILDINGS) {
      if (px >= b.x && px < b.x + b.width && pz >= b.y && pz < b.y + b.height) {
        if (b.id === 'well') { get().refillWater(); return; }
        if (b.id === 'market') { get().sellInventory(); return; }
        if (b.id === 'shop') { get().toggleShop(); return; }
        if (b.id === 'bed') { get().goToSleep(); return; }
      }
    }

    // Find nearest plot
    let nearestPlot: { plot: Plot; fieldIdx: number; plotIdx: number; dist: number } | null = null;
    for (let fi = 0; fi < state.fields.length; fi++) {
      const field = state.fields[fi];
      if (!field.owned) continue;
      for (let pi = 0; pi < field.plots.length; pi++) {
        const plot = field.plots[pi];
        const dist = Math.sqrt((plot.x + 0.5 - px) ** 2 + (plot.y + 0.5 - pz) ** 2);
        if (dist < 2 && (!nearestPlot || dist < nearestPlot.dist)) {
          nearestPlot = { plot, fieldIdx: fi, plotIdx: pi, dist };
        }
      }
    }

    if (!nearestPlot) {
      get().addToast('Nic tu nie ma!');
      return;
    }

    const { plot, fieldIdx, plotIdx } = nearestPlot;
    const now = Date.now();

    // Harvest grown plant
    if (plot.plant && plot.isGrown) {
      if (!canPerformAction(state.energy, getActionCost('harvest'))) {
        get().addToast('Brak energii! Idź spać [B]');
        return;
      }
      if (state.inventoryCount >= state.bagMax) {
        get().addToast('Plecak pełny! Idź na targ');
        return;
      }
      const { money, xp } = getHarvestValue(plot.plant, plot.isGolden, state.combo);
      set((s) => {
        const fields = s.fields.map((f, fi) => fi !== fieldIdx ? f : {
          ...f,
          plots: f.plots.map((p, pi) => pi !== plotIdx ? p : {
            ...p, plant: null, watered: false, growthProgress: 0, isGrown: false, isGolden: false, isFertilized: false, growthStartTime: 0,
          }),
        });
        const inv = { ...s.inventory };
        inv[plot.plant!] = (inv[plot.plant!] || 0) + 1;
        const newXp = s.xp + xp;
        const xpNeeded = getXpForLevel(s.level);
        const levelUp = newXp >= xpNeeded;
        return {
          fields,
          inventory: inv,
          inventoryCount: s.inventoryCount + 1,
          energy: s.energy - getActionCost('harvest'),
          xp: levelUp ? newXp - xpNeeded : newXp,
          level: levelUp ? s.level + 1 : s.level,
          maxEnergy: levelUp ? getMaxEnergy(s.level + 1) : s.maxEnergy,
          harvested: s.harvested + 1,
          combo: s.combo + 1,
          comboTimer: 3,
        };
      });
      const harvestMsg = plot.isGolden ? `Złote ${SEEDS[plot.plant].emoji}! +${xp} XP` : `Zebrano ${SEEDS[plot.plant].emoji}`;
      get().addToast(harvestMsg);
      return;
    }

    // Water unwatered plant
    if ((plot.plant || plot.tree) && !plot.watered) {
      if (!canPerformAction(state.energy, getActionCost('water'))) {
        get().addToast('Brak energii!');
        return;
      }
      if (state.waterLevel <= 0) {
        get().addToast('Brak wody! Idź do studni');
        return;
      }
      set((s) => ({
        fields: s.fields.map((f, fi) => fi !== fieldIdx ? f : {
          ...f,
          plots: f.plots.map((p, pi) => pi !== plotIdx ? p : {
            ...p, watered: true, growthStartTime: p.growthStartTime || now,
          }),
        }),
        energy: s.energy - getActionCost('water'),
        waterLevel: s.waterLevel - 1,
      }));
      get().addToast('Podlano!');
      return;
    }

    // Plant on empty plot
    if (!plot.plant && !plot.tree) {
      if (state.selectionType === 'seed') {
        const seedKey = state.selectedItem as SeedKey;
        const cost = getSeedCost(seedKey, state.cheatActive);
        if (cost > 0 && !canAfford(state.money, cost)) {
          get().addToast(`Za mało pieniędzy na ${SEEDS[seedKey].emoji}`);
          return;
        }
        if (!canPerformAction(state.energy, getActionCost('plant_seed'))) {
          get().addToast('Brak energii!');
          return;
        }
        const isGolden = rollGoldenChance(state.advancedUpgrades.goldSeeds);
        const useFertilizer = state.advancedUpgrades.fertilizerCharges > 0;
        set((s) => ({
          fields: s.fields.map((f, fi) => fi !== fieldIdx ? f : {
            ...f,
            plots: f.plots.map((p, pi) => pi !== plotIdx ? p : {
              ...p,
              plant: seedKey,
              watered: false,
              growthStartTime: 0,
              growthProgress: 0,
              isGrown: false,
              isGolden,
              isFertilized: useFertilizer,
            }),
          }),
          energy: s.energy - getActionCost('plant_seed'),
          money: seedKey === 'apple' ? s.money : s.money - cost,
          advancedUpgrades: useFertilizer
            ? { ...s.advancedUpgrades, fertilizerCharges: s.advancedUpgrades.fertilizerCharges - 1 }
            : s.advancedUpgrades,
        }));
        get().addToast(`Posadzono ${SEEDS[seedKey].emoji}${isGolden ? ' (ZŁOTE!)' : ''}${useFertilizer ? ' +nawóz' : ''}`);
        return;
      } else {
        const treeKey = state.selectedItem as TreeKey;
        const cost = getTreeCost(treeKey, state.cheatActive);
        if (!canAfford(state.money, cost)) {
          get().addToast(`Za mało pieniędzy na ${TREES[treeKey].emoji}`);
          return;
        }
        if (!canPerformAction(state.energy, getActionCost('plant_tree'))) {
          get().addToast('Brak energii!');
          return;
        }
        set((s) => ({
          fields: s.fields.map((f, fi) => fi !== fieldIdx ? f : {
            ...f,
            plots: f.plots.map((p, pi) => pi !== plotIdx ? p : {
              ...p,
              tree: treeKey,
              watered: false,
              growthStartTime: 0,
              growthProgress: 0,
              isGrown: false,
              lastTreeDropTime: now,
            }),
          }),
          energy: s.energy - getActionCost('plant_tree'),
          money: s.money - cost,
        }));
        get().addToast(`Posadzono ${TREES[treeKey].emoji}`);
        return;
      }
    }

    get().addToast('Nic do zrobienia tutaj');
  },

  massHarvest: () => {
    const state = get();
    if (state.isSleeping) return;
    const px = state.player.x;
    const pz = state.player.z;
    let harvestedCount = 0;
    const now = Date.now();

    set((s) => {
      let energy = s.energy;
      let inv = { ...s.inventory };
      let invCount = s.inventoryCount;
      let xpTotal = s.xp;
      let combo = s.combo;
      let level = s.level;
      let harvested = s.harvested;

      const fields = s.fields.map(f => {
        if (!f.owned) return f;
        return {
          ...f,
          plots: f.plots.map(p => {
            if (!p.plant || !p.isGrown) return p;
            if (Math.abs(p.x + 0.5 - px) > 2.5 || Math.abs(p.y + 0.5 - pz) > 2.5) return p;
            if (!canPerformAction(energy, getActionCost('harvest'))) return p;
            if (invCount >= s.bagMax) return p;

            const { money, xp } = getHarvestValue(p.plant, p.isGolden, combo);
            energy -= getActionCost('harvest');
            inv[p.plant] = (inv[p.plant] || 0) + 1;
            invCount++;
            xpTotal += xp;
            combo++;
            harvested++;
            harvestedCount++;

            return { ...p, plant: null, watered: false, growthProgress: 0, isGrown: false, isGolden: false, isFertilized: false, growthStartTime: 0 };
          }),
        };
      });

      const xpNeeded = getXpForLevel(level);
      while (xpTotal >= xpNeeded) {
        xpTotal -= getXpForLevel(level);
        level++;
      }

      return {
        fields,
        energy,
        inventory: inv,
        inventoryCount: invCount,
        xp: xpTotal,
        level,
        maxEnergy: getMaxEnergy(level),
        harvested,
        combo,
        comboTimer: combo > 0 ? 3 : 0,
      };
    });

    if (harvestedCount > 0) {
      get().addToast(`Masowy zbiór: ${harvestedCount} roślin!`);
    } else {
      get().addToast('Nic do zebrania w pobliżu');
    }
  },

  selectSeed: (key: SeedKey) => set({ selectedItem: key, selectionType: 'seed' }),
  selectTree: (key: TreeKey) => set({ selectedItem: key, selectionType: 'tree' }),

  buySeed: (key: SeedKey, count: number) => {
    const state = get();
    const cost = getSeedCost(key, state.cheatActive) * count;
    if (!canAfford(state.money, cost)) {
      get().addToast('Za mało pieniędzy!');
      return;
    }
    set((s) => ({
      money: s.money - cost,
    }));
    get().addToast(`Kupiono ${count}× ${SEEDS[key].emoji}`);
  },

  buyTree: (key: TreeKey) => {
    const state = get();
    const cost = getTreeCost(key, state.cheatActive);
    if (!canAfford(state.money, cost)) {
      get().addToast('Za mało pieniędzy!');
      return;
    }
    set((s) => ({ money: s.money - cost }));
    get().selectTree(key);
    get().addToast(`Kupiono ${TREES[key].emoji}`);
  },

  buyField: (fieldId: number) => {
    const state = get();
    const field = state.fields.find(f => f.id === fieldId);
    if (!field || field.owned) return;
    // Check sequential purchase
    const prevField = state.fields.find(f => f.id === fieldId - 1);
    if (prevField && !prevField.owned) {
      get().addToast('Kup najpierw poprzednie pole!');
      return;
    }
    const cost = getFieldCost(fieldId, state.cheatActive);
    if (!canAfford(state.money, cost)) {
      get().addToast('Za mało pieniędzy!');
      return;
    }
    set((s) => ({
      money: s.money - cost,
      fields: s.fields.map(f => f.id === fieldId ? { ...f, owned: true } : f),
    }));
    get().addToast(`Kupiono pole #${fieldId}!`);
  },

  buyBasicUpgrade: (upgradeId: 'waterLevel' | 'bagLevel' | 'speedLevel') => {
    const state = get();
    const currentLevel = state.upgrades[upgradeId];
    const upgradeDef = BASIC_UPGRADES.find(u => u.id === upgradeId);
    if (!upgradeDef || currentLevel >= upgradeDef.costs.length - 1) {
      get().addToast('Maksymalny poziom!');
      return;
    }
    const cost = state.cheatActive ? 0 : upgradeDef.costs[currentLevel + 1];
    if (!canAfford(state.money, cost)) {
      get().addToast('Za mało pieniędzy!');
      return;
    }
    set((s) => {
      const newUpgrades = { ...s.upgrades, [upgradeId]: currentLevel + 1 };
      const result: Partial<GameState> = {
        money: s.money - cost,
        upgrades: newUpgrades,
      };
      if (upgradeId === 'waterLevel') {
        result.waterMax = upgradeDef.values[currentLevel + 1];
        result.waterLevel = upgradeDef.values[currentLevel + 1];
      }
      if (upgradeId === 'bagLevel') {
        result.bagMax = upgradeDef.values[currentLevel + 1] * (s.advancedUpgrades.silo ? 2 : 1);
      }
      return result;
    });
    get().addToast(`Ulepszono ${upgradeDef.emoji} ${upgradeDef.name}!`);
  },

  buyAdvancedUpgrade: (upgradeId: string) => {
    const state = get();
    const def = ADVANCED_UPGRADES.find(u => u.id === upgradeId);
    if (!def) return;
    const cost = state.cheatActive ? 0 : def.cost;
    if (!canAfford(state.money, cost)) {
      get().addToast('Za mało pieniędzy!');
      return;
    }
    set((s) => {
      const adv = { ...s.advancedUpgrades };
      if (upgradeId === 'fertilizerCharges') {
        adv.fertilizerCharges += 20;
      } else {
        (adv as unknown as Record<string, boolean>)[upgradeId] = true;
      }
      const result: Partial<GameState> = {
        money: s.money - cost,
        advancedUpgrades: adv,
      };
      if (upgradeId === 'silo') {
        result.bagMax = s.bagMax * 2;
      }
      return result;
    });
    get().addToast(`Kupiono ${def.emoji} ${def.name}!`);
  },

  buyWorker: () => {
    const state = get();
    const next = getNextWorkerCost(state.workers);
    if (!next) {
      get().addToast('Wszystkich pracowników zatrudniono!');
      return;
    }
    const cost = state.cheatActive ? 0 : next.cost;
    if (!canAfford(state.money, cost)) {
      get().addToast('Za mało pieniędzy!');
      return;
    }
    const worker = createWorker(state.workers.length, next.tier);
    set((s) => ({
      money: s.money - cost,
      workers: [...s.workers, worker],
    }));
    get().addToast(`Zatrudniono ${WORKER_TIERS[next.tier].name}!`);
  },

  sellInventory: () => {
    const state = get();
    if (state.inventoryCount === 0) {
      get().addToast('Plecak pusty!');
      return;
    }
    const value = calculateSellValue(state.inventory, state.combo);
    set((s) => ({
      money: s.money + value,
      earned: s.earned + value,
      inventory: {},
      inventoryCount: 0,
    }));
    get().addToast(`Sprzedano za ${value} 💰`);
  },

  refillWater: () => {
    set((s) => ({ waterLevel: s.waterMax }));
    get().addToast('Napełniono konewkę!');
  },

  goToSleep: () => {
    const state = get();
    // Check if near bed
    const bed = BUILDINGS.find(b => b.id === 'bed')!;
    const px = state.player.x;
    const pz = state.player.z;
    if (px < bed.x - 1 || px > bed.x + bed.width + 1 || pz < bed.y - 1 || pz > bed.y + bed.height + 1) {
      get().addToast('Podejdź do łóżka!');
      return;
    }
    set({ isSleeping: true, sleepTimer: 3 });
    get().addToast('Dobranoc! 💤');
  },

  toggleShop: () => set((s) => ({ shopOpen: !s.shopOpen, helpOpen: false })),
  toggleHelp: () => set((s) => ({ helpOpen: !s.helpOpen, shopOpen: false })),

  addToast: (message: string) => {
    const id = toastIdCounter++;
    set((s) => ({
      toasts: [...s.toasts.slice(-4), { id, message, timestamp: Date.now() }],
    }));
  },

  activateCheat: () => {
    set((s) => ({
      cheatActive: true,
      money: s.money + 99999,
    }));
    get().addToast('CHEAT ACTIVATED! 🎉');
  },

  resetGame: () => set(createInitialState()),
  loadState: (state: Partial<GameState>) => set(state),
}));
