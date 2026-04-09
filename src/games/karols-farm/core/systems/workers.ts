import type {
  SeedKey,
  WorkerTier,
  WorkerState,
  Worker,
  Field,
  Building,
} from '@/games/karols-farm/core/types';
import { WORKER_TIERS } from '@/games/karols-farm/core/data/workers';

export type WorkerAction =
  | { type: 'water'; plotX: number; plotY: number; fieldId: number }
  | { type: 'harvest'; plotX: number; plotY: number; fieldId: number; seedKey: SeedKey }
  | { type: 'sell'; value: number }
  | { type: 'refillWater' };

/**
 * Get the next worker to hire and its cost.
 * Workers are hired sequentially through the tiers.
 * Returns null if all tiers are exhausted.
 */
export function getNextWorkerCost(
  workers: Worker[],
): { tier: WorkerTier; cost: number } | null {
  const nextIndex = workers.length;
  if (nextIndex >= WORKER_TIERS.length) return null;

  const tierDef = WORKER_TIERS[nextIndex];
  return { tier: tierDef.tier, cost: tierDef.cost };
}

/**
 * Create a new worker from a tier definition.
 */
export function createWorker(id: number, tier: WorkerTier): Worker {
  const tierDef = WORKER_TIERS.find((t) => t.tier === tier);
  if (!tierDef) {
    throw new Error(`Unknown worker tier: ${tier}`);
  }

  return {
    id,
    tier,
    x: 0,
    z: 0,
    state: 'idle' as WorkerState,
    targetX: 0,
    targetZ: 0,
    inventory: {},
    inventoryCount: 0,
    waterLevel: tierDef.waterMax,
    waterMax: tierDef.waterMax,
    carryCapacity: tierDef.carryCapacity,
    speed: tierDef.speed,
    color: tierDef.color,
    actionCooldown: 0,
  };
}

/**
 * Move a position towards a target at a given speed over deltaTime.
 * Returns the new position and whether the target has been reached.
 */
export function moveTowards(
  x: number,
  z: number,
  targetX: number,
  targetZ: number,
  speed: number,
  dt: number,
): { x: number; z: number; arrived: boolean } {
  const dx = targetX - x;
  const dz = targetZ - z;
  const dist = Math.sqrt(dx * dx + dz * dz);

  if (dist <= speed * dt) {
    return { x: targetX, z: targetZ, arrived: true };
  }

  const nx = dx / dist;
  const nz = dz / dist;
  return {
    x: x + nx * speed * dt,
    z: z + nz * speed * dt,
    arrived: false,
  };
}

/**
 * Find an unwatered plot with a plant/tree that needs watering.
 * Returns the field id, plot coords, and world position, or null if none found.
 */
function findUnwateredPlot(
  fields: Field[],
): { fieldId: number; plotX: number; plotY: number; worldX: number; worldZ: number } | null {
  for (const field of fields) {
    if (!field.owned) continue;
    for (const plot of field.plots) {
      if ((plot.plant !== null || plot.tree !== null) && !plot.watered) {
        return {
          fieldId: field.id,
          plotX: plot.x,
          plotY: plot.y,
          worldX: plot.x + 0.5,
          worldZ: plot.y + 0.5,
        };
      }
    }
  }
  return null;
}

/**
 * Find a grown (harvestable) plot.
 * Returns the field id, plot coords, seed key, and world position, or null if none found.
 */
function findHarvestablePlot(
  fields: Field[],
): {
  fieldId: number;
  plotX: number;
  plotY: number;
  seedKey: SeedKey;
  worldX: number;
  worldZ: number;
} | null {
  for (const field of fields) {
    if (!field.owned) continue;
    for (const plot of field.plots) {
      if (plot.plant !== null && plot.isGrown) {
        return {
          fieldId: field.id,
          plotX: plot.x,
          plotY: plot.y,
          seedKey: plot.plant,
          worldX: plot.x + 0.5,
          worldZ: plot.y + 0.5,
        };
      }
    }
  }
  return null;
}

/**
 * Find the well building position.
 */
function findWellPosition(buildings: Building[]): { x: number; z: number } | null {
  const well = buildings.find((b) => b.id === 'well');
  if (!well) return null;
  return { x: well.x + well.width / 2, z: well.y + well.height / 2 };
}

/**
 * Find the market/sell building position.
 */
function findMarketPosition(buildings: Building[]): { x: number; z: number } | null {
  const market = buildings.find((b) => b.id === 'market' || b.id === 'sellBox');
  if (!market) return null;
  return { x: market.x + market.width / 2, z: market.y + market.height / 2 };
}

/**
 * Update worker AI using a finite state machine.
 * Returns the updated worker and a list of actions it performed.
 *
 * States:
 * - idle: decide what to do next (water, harvest, refill, sell)
 * - toPlot: moving to a plot to water it
 * - toHarvest: moving to a plot to harvest it
 * - toWell: moving to the well to refill water
 * - toSell: moving to market to sell harvested goods
 */
export function updateWorkerAI(
  worker: Worker,
  fields: Field[],
  buildings: Building[],
  deltaTime: number,
): { worker: Worker; actions: WorkerAction[] } {
  const actions: WorkerAction[] = [];
  let w = { ...worker };

  // Reduce cooldown
  if (w.actionCooldown > 0) {
    w.actionCooldown = Math.max(0, w.actionCooldown - deltaTime);
    return { worker: w, actions };
  }

  switch (w.state) {
    case 'idle': {
      // Priority 1: If inventory is full, go sell
      if (w.inventoryCount >= w.carryCapacity) {
        const market = findMarketPosition(buildings);
        if (market) {
          w.state = 'toSell';
          w.targetX = market.x;
          w.targetZ = market.z;
          break;
        }
      }

      // Priority 2: If we have water, look for unwatered plots
      if (w.waterLevel > 0) {
        const unwatered = findUnwateredPlot(fields);
        if (unwatered) {
          w.state = 'toPlot';
          w.targetX = unwatered.worldX;
          w.targetZ = unwatered.worldZ;
          break;
        }
      }

      // Priority 3: Look for harvestable plots
      const harvestable = findHarvestablePlot(fields);
      if (harvestable) {
        w.state = 'toHarvest';
        w.targetX = harvestable.worldX;
        w.targetZ = harvestable.worldZ;
        break;
      }

      // Priority 4: If water is low, go refill
      if (w.waterLevel < w.waterMax) {
        const well = findWellPosition(buildings);
        if (well) {
          w.state = 'toWell';
          w.targetX = well.x;
          w.targetZ = well.z;
          break;
        }
      }

      // Nothing to do, stay idle
      break;
    }

    case 'toPlot': {
      const result = moveTowards(w.x, w.z, w.targetX, w.targetZ, w.speed, deltaTime);
      w.x = result.x;
      w.z = result.z;

      if (result.arrived) {
        // Find the plot we arrived at
        const unwatered = findUnwateredPlot(fields);
        if (unwatered && w.waterLevel > 0) {
          actions.push({
            type: 'water',
            plotX: unwatered.plotX,
            plotY: unwatered.plotY,
            fieldId: unwatered.fieldId,
          });
          w.waterLevel--;
          w.actionCooldown = 0.5;
        }
        w.state = 'idle';
      }
      break;
    }

    case 'toHarvest': {
      const result = moveTowards(w.x, w.z, w.targetX, w.targetZ, w.speed, deltaTime);
      w.x = result.x;
      w.z = result.z;

      if (result.arrived) {
        const harvestable = findHarvestablePlot(fields);
        if (harvestable && w.inventoryCount < w.carryCapacity) {
          actions.push({
            type: 'harvest',
            plotX: harvestable.plotX,
            plotY: harvestable.plotY,
            fieldId: harvestable.fieldId,
            seedKey: harvestable.seedKey,
          });
          const currentCount = w.inventory[harvestable.seedKey] ?? 0;
          w.inventory = {
            ...w.inventory,
            [harvestable.seedKey]: currentCount + 1,
          };
          w.inventoryCount++;
          w.actionCooldown = 0.5;
        }
        w.state = 'idle';
      }
      break;
    }

    case 'toWell': {
      const result = moveTowards(w.x, w.z, w.targetX, w.targetZ, w.speed, deltaTime);
      w.x = result.x;
      w.z = result.z;

      if (result.arrived) {
        actions.push({ type: 'refillWater' });
        w.waterLevel = w.waterMax;
        w.actionCooldown = 1.0;
        w.state = 'idle';
      }
      break;
    }

    case 'toSell': {
      const result = moveTowards(w.x, w.z, w.targetX, w.targetZ, w.speed, deltaTime);
      w.x = result.x;
      w.z = result.z;

      if (result.arrived) {
        // Calculate sell value from inventory
        let totalValue = 0;
        for (const key of Object.keys(w.inventory) as SeedKey[]) {
          const count = w.inventory[key] ?? 0;
          // We just track the count here; the caller applies actual sell prices
          totalValue += count;
        }

        if (w.inventoryCount > 0) {
          actions.push({ type: 'sell', value: w.inventoryCount });
          w.inventory = {};
          w.inventoryCount = 0;
          w.actionCooldown = 1.0;
        }
        w.state = 'idle';
      }
      break;
    }
  }

  return { worker: w, actions };
}
