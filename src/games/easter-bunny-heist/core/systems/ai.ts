import type { NPC, Player, Obstacle, BuffState, Vec3 } from '../types';
import { AI } from '../config';
import { distXZ, angleBetweenXZ, lerpAngle } from '../math';
import { canNPCSeePlayer } from './vision';

export interface AIUpdateResult {
  npc: NPC;
  newDetection: boolean; // true if transition suspicious→alert happened
  playerCaught: boolean;
}

export function updateNPCAI(
  npc: NPC,
  player: Player,
  obstacles: Obstacle[],
  buffs: BuffState,
  dt: number,
): AIUpdateResult {
  const n = deepCloneNPC(npc);
  n.stateTimer += dt;

  const canSee = canNPCSeePlayer(n, player, obstacles, buffs);
  let newDetection = false;
  let playerCaught = false;

  switch (n.state) {
    case 'patrol':
      newDetection = updatePatrol(n, player, canSee, dt);
      break;
    case 'suspicious':
      newDetection = updateSuspicious(n, player, canSee, dt);
      break;
    case 'alert':
      updateAlert(n, player, canSee, dt);
      break;
    case 'chase':
      playerCaught = updateChase(n, player, canSee, dt);
      break;
  }

  return { npc: n, newDetection, playerCaught };
}

function updatePatrol(npc: NPC, player: Player, canSee: boolean, dt: number): boolean {
  if (canSee) {
    npc.state = 'suspicious';
    npc.stateTimer = 0;
    npc.lastKnownPlayerPos = { ...player.position };
    return false;
  }

  // Move toward current patrol point
  const target = npc.patrolPoints[npc.patrolIndex];
  if (!target) return false;

  const dist = distXZ(npc.position, target);
  if (dist < 1) {
    // Arrived at patrol point, pause then move to next
    if (npc.stateTimer > AI.patrolPauseDuration) {
      npc.patrolIndex = (npc.patrolIndex + 1) % npc.patrolPoints.length;
      npc.stateTimer = 0;
    }
    // Look around while paused
    const lookAngle = Math.sin(npc.stateTimer * 1.5) * 0.8;
    const baseAngle = angleBetweenXZ(npc.position, target);
    npc.facing = {
      x: Math.sin(baseAngle + lookAngle),
      y: 0,
      z: Math.cos(baseAngle + lookAngle),
    };
  } else {
    moveToward(npc, target, npc.config.speed, dt);
  }

  return false;
}

function updateSuspicious(npc: NPC, player: Player, canSee: boolean, dt: number): boolean {
  // Turn toward player
  if (npc.lastKnownPlayerPos) {
    const angle = angleBetweenXZ(npc.position, npc.lastKnownPlayerPos);
    const currentAngle = Math.atan2(npc.facing.x, npc.facing.z);
    const newAngle = lerpAngle(currentAngle, angle, 3 * dt);
    npc.facing = { x: Math.sin(newAngle), y: 0, z: Math.cos(newAngle) };
  }

  if (canSee) {
    npc.lastKnownPlayerPos = { ...player.position };
    // After enough time suspicious, go alert
    if (npc.stateTimer >= AI.suspiciousTimeout) {
      npc.state = 'alert';
      npc.stateTimer = 0;
      return true; // new detection!
    }
  } else {
    // Lost sight, wait a bit then return to patrol
    if (npc.stateTimer >= AI.suspiciousTimeout + AI.suspiciousCooldown) {
      npc.state = 'patrol';
      npc.stateTimer = 0;
    }
  }

  return false;
}

function updateAlert(npc: NPC, player: Player, canSee: boolean, _dt: number): void {
  // Transition to chase
  npc.state = 'chase';
  npc.stateTimer = 0;
  if (canSee) {
    npc.lastKnownPlayerPos = { ...player.position };
  }
}

function updateChase(npc: NPC, player: Player, canSee: boolean, dt: number): boolean {
  if (canSee) {
    npc.lastKnownPlayerPos = { ...player.position };
    npc.stateTimer = 0;
  }

  // Move toward last known position
  const target = npc.lastKnownPlayerPos;
  if (target) {
    moveToward(npc, target, npc.config.chaseSpeed, dt);

    // Check if caught player
    const dist = distXZ(npc.position, player.position);
    if (dist < 1.5) {
      return true; // caught!
    }
  }

  // Lost player for too long
  if (npc.stateTimer >= AI.chaseLoseTimeout) {
    npc.state = 'patrol';
    npc.stateTimer = 0;
    npc.lastKnownPlayerPos = null;
  }

  return false;
}

function moveToward(npc: NPC, target: Vec3, speed: number, dt: number): void {
  const dx = target.x - npc.position.x;
  const dz = target.z - npc.position.z;
  const dist = Math.sqrt(dx * dx + dz * dz);
  if (dist < 0.1) return;

  const nx = dx / dist;
  const nz = dz / dist;

  npc.position.x += nx * speed * dt;
  npc.position.z += nz * speed * dt;

  // Face movement direction
  const targetAngle = Math.atan2(nx, nz);
  const currentAngle = Math.atan2(npc.facing.x, npc.facing.z);
  const newAngle = lerpAngle(currentAngle, targetAngle, 5 * dt);
  npc.facing = { x: Math.sin(newAngle), y: 0, z: Math.cos(newAngle) };
}

function deepCloneNPC(npc: NPC): NPC {
  return {
    ...npc,
    position: { ...npc.position },
    facing: { ...npc.facing },
    lastKnownPlayerPos: npc.lastKnownPlayerPos ? { ...npc.lastKnownPlayerPos } : null,
    config: { ...npc.config },
    patrolPoints: npc.patrolPoints,
  };
}
