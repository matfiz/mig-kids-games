import type { Player, Gift, DeliveryPoint, Egg, BuffState, BuffType } from '../types';
import { PLAYER, HOUSE } from '../config';
import { distXZ } from '../math';

export interface InteractionResult {
  gifts: Gift[];
  deliveryPoints: DeliveryPoint[];
  eggs: Egg[];
  player: Player;
  buffs: BuffState;
  giftPickedUp: boolean;
  giftDelivered: boolean;
  eggCollected: BuffType | null;
}

/**
 * Check for egg auto-pickups (no E press needed)
 */
export function checkEggPickups(
  player: Player,
  eggs: Egg[],
  buffs: BuffState,
): { eggs: Egg[]; buffs: BuffState; collected: BuffType | null } {
  let collected: BuffType | null = null;
  const updatedEggs = eggs.map((egg) => {
    if (egg.collected) return egg;
    if (distXZ(player.position, egg.position) < PLAYER.eggPickupRadius) {
      collected = egg.type;
      return { ...egg, collected: true };
    }
    return egg;
  });

  let updatedBuffs = buffs;
  if (collected) {
    updatedBuffs = { ...buffs, [collected]: 8 }; // BUFF_DURATION
  }

  return { eggs: updatedEggs, buffs: updatedBuffs, collected };
}

/**
 * Try to pick up a gift from the porch (requires E press)
 */
export function tryPickupGift(
  player: Player,
  gifts: Gift[],
): { player: Player; gifts: Gift[]; success: boolean } {
  if (player.isCarrying) return { player, gifts, success: false };

  // Check distance to porch
  const porchDist = distXZ(player.position, {
    x: HOUSE.porchPosition.x,
    y: 0,
    z: HOUSE.porchPosition.z,
  });
  if (porchDist > PLAYER.pickupRadius) return { player, gifts, success: false };

  // Find first available gift
  const giftIndex = gifts.findIndex((g) => g.state === 'available');
  if (giftIndex === -1) return { player, gifts, success: false };

  const updatedGifts = gifts.map((g, i) =>
    i === giftIndex ? { ...g, state: 'carried' as const } : g,
  );

  return {
    player: { ...player, isCarrying: true },
    gifts: updatedGifts,
    success: true,
  };
}

/**
 * Try to deliver a gift to a delivery point (requires E press)
 */
export function tryDeliverGift(
  player: Player,
  gifts: Gift[],
  deliveryPoints: DeliveryPoint[],
): { player: Player; gifts: Gift[]; deliveryPoints: DeliveryPoint[]; success: boolean } {
  if (!player.isCarrying) return { player, gifts, deliveryPoints, success: false };

  // Find nearest undelivered delivery point within range
  let nearestIdx = -1;
  let nearestDist = Infinity;
  for (let i = 0; i < deliveryPoints.length; i++) {
    const dp = deliveryPoints[i];
    if (dp.delivered) continue;
    const dist = distXZ(player.position, dp.position);
    if (dist < PLAYER.deliveryRadius && dist < nearestDist) {
      nearestDist = dist;
      nearestIdx = i;
    }
  }

  if (nearestIdx === -1) return { player, gifts, deliveryPoints, success: false };

  // Find the carried gift
  const carriedIdx = gifts.findIndex((g) => g.state === 'carried');
  if (carriedIdx === -1) return { player, gifts, deliveryPoints, success: false };

  const updatedGifts = gifts.map((g, i) =>
    i === carriedIdx ? { ...g, state: 'delivered' as const } : g,
  );
  const updatedDPs = deliveryPoints.map((dp, i) =>
    i === nearestIdx ? { ...dp, delivered: true, giftId: gifts[carriedIdx].id } : dp,
  );

  return {
    player: { ...player, isCarrying: false },
    gifts: updatedGifts,
    deliveryPoints: updatedDPs,
    success: true,
  };
}

/**
 * Check if player is near enough to pick up from porch
 */
export function isNearPorch(player: Player): boolean {
  return distXZ(player.position, {
    x: HOUSE.porchPosition.x,
    y: 0,
    z: HOUSE.porchPosition.z,
  }) < PLAYER.pickupRadius;
}

/**
 * Check if player is near any active delivery point
 */
export function isNearDeliveryPoint(
  player: Player,
  deliveryPoints: DeliveryPoint[],
): DeliveryPoint | null {
  for (const dp of deliveryPoints) {
    if (dp.delivered) continue;
    if (distXZ(player.position, dp.position) < PLAYER.deliveryRadius) {
      return dp;
    }
  }
  return null;
}
