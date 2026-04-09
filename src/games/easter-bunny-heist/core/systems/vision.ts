import type { NPC, Player, Obstacle, BuffState } from '../types';
import { DETECTION, BUFF_EFFECTS } from '../config';
import { dot2 } from '../math';

/**
 * Check if an NPC can see the player, accounting for:
 * - Cone vision (angle + range)
 * - Line of sight (obstacles blocking)
 * - Buffs (blue = reduced range, pink = invisible)
 * - Sneaking (reduced range)
 * - Bush hiding (only visible from close range)
 */
export function canNPCSeePlayer(
  npc: NPC,
  player: Player,
  obstacles: Obstacle[],
  buffs: BuffState,
): boolean {
  // Pink buff = completely invisible
  if (buffs.pink > 0) return false;

  const dx = player.position.x - npc.position.x;
  const dz = player.position.z - npc.position.z;
  const dist = Math.sqrt(dx * dx + dz * dz);

  // Calculate effective view range
  let range = npc.config.viewRange;
  if (buffs.blue > 0) range *= BUFF_EFFECTS.blue.visionReduction;
  if (player.isSneaking) range *= DETECTION.sneakViewReduction;

  // Player hidden in bush + sneaking = only visible from very close
  if (player.inBush && player.isSneaking) {
    if (dist > DETECTION.bushDetectionRange) return false;
  }

  // Distance check
  if (dist > range) return false;

  // Angle check (cone vision)
  if (dist > 0.01) {
    const dirX = dx / dist;
    const dirZ = dz / dist;
    const facingLen = Math.sqrt(
      npc.facing.x * npc.facing.x + npc.facing.z * npc.facing.z,
    );
    if (facingLen < 0.001) return false;
    const nfx = npc.facing.x / facingLen;
    const nfz = npc.facing.z / facingLen;
    const dotVal = dot2(nfx, nfz, dirX, dirZ);
    const halfAngle = npc.config.viewAngle / 2;
    if (dotVal < Math.cos(halfAngle)) return false;
  }

  // Line of sight check - any vision-blocking obstacle between NPC and player?
  if (isLineBlocked(npc.position, player.position, obstacles)) return false;

  return true;
}

function isLineBlocked(
  from: { x: number; z: number },
  to: { x: number; z: number },
  obstacles: Obstacle[],
): boolean {
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  const len = Math.sqrt(dx * dx + dz * dz);
  if (len < 0.01) return false;

  const ndx = dx / len;
  const ndz = dz / len;

  for (const obs of obstacles) {
    if (!obs.blocksVision) continue;

    // Check if obstacle is between from and to using circle-line intersection
    const ox = obs.position.x - from.x;
    const oz = obs.position.z - from.z;
    const proj = ox * ndx + oz * ndz;

    // Skip if behind or beyond target
    if (proj < 0 || proj > len) continue;

    const closestX = from.x + ndx * proj;
    const closestZ = from.z + ndz * proj;
    const obstDist = Math.sqrt(
      (closestX - obs.position.x) ** 2 + (closestZ - obs.position.z) ** 2,
    );

    if (obstDist < obs.radius) return true;
  }

  return false;
}
