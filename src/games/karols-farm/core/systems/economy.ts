import type { SeedKey, TreeKey } from '@/games/karols-farm/core/types';
import { SEEDS } from '@/games/karols-farm/core/data/seeds';
import { TREES } from '@/games/karols-farm/core/data/trees';
import { FIELD_DEFS } from '@/games/karols-farm/core/data/world';

/**
 * Calculate the total sell value for an inventory of seeds.
 * Applies a combo multiplier: min(1 + combo * 0.05, 1.5).
 */
export function calculateSellValue(
  inventory: Partial<Record<SeedKey, number>>,
  combo: number,
): number {
  let baseValue = 0;
  for (const key of Object.keys(inventory) as SeedKey[]) {
    const count = inventory[key] ?? 0;
    const seedDef = SEEDS[key];
    if (seedDef && count > 0) {
      baseValue += count * seedDef.sellPrice;
    }
  }

  const comboMultiplier = Math.min(1 + combo * 0.05, 1.5);
  return Math.floor(baseValue * comboMultiplier);
}

/**
 * Check whether the player can afford a given cost.
 */
export function canAfford(money: number, cost: number): boolean {
  return money >= cost;
}

/**
 * Calculate bonus money awarded at combo milestones.
 * combo 5: +50, combo 10: +200.
 */
export function calculateComboBonus(combo: number): number {
  if (combo === 10) return 200;
  if (combo === 5) return 50;
  return 0;
}

/**
 * Get the cost of a field by its id. Returns 0 if cheat is active.
 */
export function getFieldCost(fieldId: number, cheatActive: boolean): number {
  if (cheatActive) return 0;
  const fieldDef = FIELD_DEFS.find((f) => f.id === fieldId);
  return fieldDef?.cost ?? 0;
}

/**
 * Get the cost of a seed. Returns 0 if cheat is active.
 */
export function getSeedCost(seedKey: SeedKey, cheatActive: boolean): number {
  if (cheatActive) return 0;
  return SEEDS[seedKey].cost;
}

/**
 * Get the cost of a tree. Returns 0 if cheat is active.
 */
export function getTreeCost(treeKey: TreeKey, cheatActive: boolean): number {
  if (cheatActive) return 0;
  return TREES[treeKey].cost;
}
