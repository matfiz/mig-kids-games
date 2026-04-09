import type { Player, Obstacle, BuffState } from '../types';
import { PLAYER, WORLD, BUFF_EFFECTS } from '../config';
import { distXZ, clamp } from '../math';

export function updatePlayerPhysics(
  player: Player,
  dt: number,
  obstacles: Obstacle[],
  buffs: BuffState,
): Player {
  const next = { ...player, position: { ...player.position }, velocity: { ...player.velocity } };

  // Apply gravity
  if (!next.isGrounded) {
    next.velocity.y -= PLAYER.gravity * dt;
  }

  // Calculate speed
  let speed = PLAYER.baseSpeed;
  if (next.isSprinting) speed *= PLAYER.sprintMultiplier;
  if (next.isSneaking) speed *= PLAYER.sneakMultiplier;
  if (buffs.gold > 0) speed *= BUFF_EFFECTS.gold.speedMultiplier;

  // Apply horizontal velocity
  next.position.x += next.velocity.x * speed * dt;
  next.position.z += next.velocity.z * speed * dt;

  // Apply vertical velocity
  next.position.y += next.velocity.y * dt;

  // Ground check
  if (next.position.y <= 0) {
    next.position.y = 0;
    next.velocity.y = 0;
    next.isGrounded = true;
  } else {
    next.isGrounded = false;
  }

  // Collision with obstacles
  for (const obs of obstacles) {
    if (obs.type === 'bush') continue; // bushes don't block movement
    const d = distXZ(next.position, obs.position);
    const minDist = obs.radius + 0.5; // player radius ~0.5
    if (d < minDist && d > 0.001) {
      // Push player out
      const pushX = (next.position.x - obs.position.x) / d;
      const pushZ = (next.position.z - obs.position.z) / d;
      next.position.x = obs.position.x + pushX * minDist;
      next.position.z = obs.position.z + pushZ * minDist;
    }
  }

  // World bounds
  const half = WORLD.halfSize - 1;
  next.position.x = clamp(next.position.x, -half, half);
  next.position.z = clamp(next.position.z, -half, half);

  // Update hop phase
  const horizontalSpeed = Math.sqrt(
    next.velocity.x * next.velocity.x + next.velocity.z * next.velocity.z,
  );
  if (horizontalSpeed > 0.01 && next.isGrounded) {
    next.hopPhase += PLAYER.hopFrequency * dt * (next.isSprinting ? 1.5 : 1);
  } else {
    // Gentle idle bob
    next.hopPhase += 1.5 * dt;
  }

  // Check if player is in a bush
  next.inBush = false;
  for (const obs of obstacles) {
    if (obs.isHidingSpot && distXZ(next.position, obs.position) < obs.radius) {
      next.inBush = true;
      break;
    }
  }

  // Update state
  if (!next.isGrounded) {
    next.state = next.velocity.y > 0 ? 'jumping' : 'falling';
  } else if (buffs.pink > 0) {
    next.state = 'invisible';
  } else if (horizontalSpeed > 0.01) {
    if (next.isSneaking) next.state = 'sneaking';
    else if (next.isSprinting) next.state = 'sprinting';
    else next.state = 'hopping';
  } else {
    next.state = 'idle';
  }

  return next;
}

export function tryJump(player: Player, buffs: BuffState): Player {
  if (!player.isGrounded) return player;
  let jumpForce = PLAYER.jumpForce;
  if (buffs.green > 0) jumpForce *= BUFF_EFFECTS.green.jumpMultiplier;
  return {
    ...player,
    velocity: { ...player.velocity, y: jumpForce },
    isGrounded: false,
  };
}
