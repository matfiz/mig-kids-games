import type { Obstacle, Gift, DeliveryPoint, Egg, NPC, BuffType, Vec3 } from '../types';
import {
  WORLD,
  HOUSE,
  DELIVERY_POSITIONS,
  NPC_CONFIGS,
  NPC_MULTIPLIERS,
  NPC_PATROLS,
  DIFFICULTY_CONFIGS,
} from '../config';
import type { Difficulty } from '../types';
import { createRNG, distXZ } from '../math';

const SEED = 42069;

export interface WorldData {
  obstacles: Obstacle[];
  gifts: Gift[];
  deliveryPoints: DeliveryPoint[];
  eggs: Egg[];
  npcs: NPC[];
  flowers: Array<{ x: number; z: number; type: number }>;
  paths: Array<{ x1: number; z1: number; x2: number; z2: number }>;
}

export function generateWorld(difficulty: Difficulty): WorldData {
  const rng = createRNG(SEED);
  const diffConfig = DIFFICULTY_CONFIGS[difficulty];
  const obstacles: Obstacle[] = [];

  // House obstacle
  obstacles.push({
    position: { x: HOUSE.position.x, y: 0, z: HOUSE.position.z },
    radius: 6,
    height: HOUSE.height,
    blocksVision: true,
    isHidingSpot: false,
    type: 'house',
  });

  // Fence (4 walls as obstacles along borders)
  const half = WORLD.halfSize;
  for (let i = -half; i < half; i += 4) {
    // North wall
    obstacles.push(makeFence(i, -half));
    // South wall (with gap for gate)
    if (Math.abs(i) > 4) obstacles.push(makeFence(i, half));
    // East wall
    obstacles.push(makeFence(half, i));
    // West wall
    obstacles.push(makeFence(-half, i));
  }

  // Trees
  const treePositions: Vec3[] = [];
  for (let i = 0; i < WORLD.treeCount; i++) {
    const pos = randomPos(rng, 8, obstacles, treePositions);
    treePositions.push(pos);
    obstacles.push({
      position: pos,
      radius: 1.8,
      height: 6,
      blocksVision: true,
      isHidingSpot: false,
      type: 'tree',
    });
  }

  // Bushes
  const bushPositions: Vec3[] = [];
  for (let i = 0; i < WORLD.bushCount; i++) {
    const pos = randomPos(rng, 5, obstacles, bushPositions);
    bushPositions.push(pos);
    obstacles.push({
      position: pos,
      radius: 1.2,
      height: 1.5,
      blocksVision: true,
      isHidingSpot: true,
      type: 'bush',
    });
  }

  // Benches
  for (let i = 0; i < WORLD.benchCount; i++) {
    const pos = randomPos(rng, 6, obstacles, []);
    obstacles.push({
      position: pos,
      radius: 1.0,
      height: 1,
      blocksVision: false,
      isHidingSpot: false,
      type: 'bench',
    });
  }

  // Barrels
  for (let i = 0; i < WORLD.barrelCount; i++) {
    const pos = randomPos(rng, 6, obstacles, []);
    obstacles.push({
      position: pos,
      radius: 0.7,
      height: 1.2,
      blocksVision: true,
      isHidingSpot: false,
      type: 'barrel',
    });
  }

  // Decorative eggs
  for (let i = 0; i < WORLD.decorativeEggCount; i++) {
    const pos = randomPos(rng, 8, obstacles, []);
    obstacles.push({
      position: pos,
      radius: 1.0,
      height: 2,
      blocksVision: false,
      isHidingSpot: false,
      type: 'decorativeEgg',
    });
  }

  // Gifts (all start at porch)
  const gifts: Gift[] = [];
  for (let i = 0; i < WORLD.giftCount; i++) {
    gifts.push({
      id: `gift-${i}`,
      position: { x: HOUSE.porchPosition.x, y: 0, z: HOUSE.porchPosition.z },
      state: 'available',
    });
  }

  // Delivery points
  const deliveryPoints: DeliveryPoint[] = DELIVERY_POSITIONS.map((pos, i) => ({
    id: `dp-${i}`,
    position: { x: pos.x, y: 0, z: pos.z },
    delivered: false,
    giftId: null,
  }));

  // Eggs (power-ups)
  const buffTypes: BuffType[] = ['gold', 'blue', 'green', 'pink'];
  const eggs: Egg[] = [];
  for (let i = 0; i < WORLD.eggCount; i++) {
    const pos = randomPos(rng, 5, obstacles, []);
    eggs.push({
      id: `egg-${i}`,
      position: pos,
      type: buffTypes[i % 4],
      collected: false,
    });
  }

  // NPCs
  const npcTypes = ['grandma', 'dad', 'kid'] as const;
  const npcs: NPC[] = npcTypes.map((type) => {
    const mult = NPC_MULTIPLIERS[type];
    const patrol = NPC_PATROLS[type];
    return {
      id: `npc-${type}`,
      type,
      position: { x: patrol[0].x, y: 0, z: patrol[0].z },
      facing: { x: 0, y: 0, z: 1 },
      state: 'patrol' as const,
      patrolPoints: patrol.map((p) => ({ x: p.x, y: 0, z: p.z })),
      patrolIndex: 0,
      stateTimer: 0,
      lastKnownPlayerPos: null,
      config: {
        ...NPC_CONFIGS[type],
        speed: diffConfig.npcSpeed * mult.speed,
        chaseSpeed: diffConfig.npcChaseSpeed * mult.chaseSpeed,
        viewRange: diffConfig.npcViewRange * mult.viewRange,
        viewAngle: (diffConfig.npcViewAngle * mult.viewAngle * Math.PI) / 180,
      },
    };
  });

  // Flowers (decorative only)
  const flowers: WorldData['flowers'] = [];
  for (let i = 0; i < WORLD.flowerCount; i++) {
    flowers.push({
      x: (rng() - 0.5) * (WORLD.size - 10),
      z: (rng() - 0.5) * (WORLD.size - 10),
      type: Math.floor(rng() * 4),
    });
  }

  // Paths
  const paths: WorldData['paths'] = [
    { x1: HOUSE.porchPosition.x, z1: HOUSE.porchPosition.z, x2: 0, z2: 0 },
    { x1: 0, z1: 0, x2: -20, z2: 15 },
    { x1: 0, z1: 0, x2: 20, z2: 10 },
    { x1: 0, z1: 0, x2: 0, z2: 25 },
  ];

  return { obstacles, gifts, deliveryPoints, eggs, npcs, flowers, paths };
}

function makeFence(x: number, z: number): Obstacle {
  return {
    position: { x, y: 0, z },
    radius: 2,
    height: 1.5,
    blocksVision: false,
    isHidingSpot: false,
    type: 'fence',
  };
}

function randomPos(
  rng: () => number,
  minDistFromCenter: number,
  existing: Obstacle[],
  extraPositions: Vec3[],
): Vec3 {
  const margin = 6;
  const half = WORLD.halfSize - margin;

  for (let attempt = 0; attempt < 50; attempt++) {
    const x = (rng() - 0.5) * half * 2;
    const z = (rng() - 0.5) * half * 2;
    const pos = { x, y: 0, z };

    // Avoid house area
    if (
      Math.abs(x - HOUSE.position.x) < HOUSE.width &&
      Math.abs(z - HOUSE.position.z) < HOUSE.depth + 4
    ) {
      continue;
    }

    // Avoid existing obstacles
    let tooClose = false;
    for (const obs of existing) {
      if (distXZ(pos, obs.position) < obs.radius + 3) {
        tooClose = true;
        break;
      }
    }
    if (tooClose) continue;

    // Avoid extra positions
    for (const ep of extraPositions) {
      if (distXZ(pos, ep) < 4) {
        tooClose = true;
        break;
      }
    }
    if (tooClose) continue;

    return pos;
  }

  // Fallback
  return { x: (rng() - 0.5) * 20, y: 0, z: (rng() - 0.5) * 20 };
}
