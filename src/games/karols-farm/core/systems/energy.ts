/**
 * Check whether the player has enough energy to perform an action.
 */
export function canPerformAction(energy: number, cost: number): boolean {
  return energy >= cost;
}

/**
 * Get the energy cost for a specific action type.
 */
export function getActionCost(
  action: 'plant_seed' | 'plant_tree' | 'water' | 'harvest',
): number {
  switch (action) {
    case 'plant_seed':
      return 2;
    case 'plant_tree':
      return 3;
    case 'water':
      return 1;
    case 'harvest':
      return 1;
  }
}

/**
 * Get maximum energy for a given player level.
 */
export function getMaxEnergy(level: number): number {
  return 100 + level * 5;
}

/**
 * Get the movement/action speed multiplier based on current energy.
 * Below 20 energy, the player moves at half speed.
 */
export function getSpeedMultiplier(energy: number): number {
  return energy < 20 ? 0.5 : 1.0;
}

/**
 * Check if the player's energy is critically low.
 */
export function isLowEnergy(energy: number): boolean {
  return energy < 20;
}
