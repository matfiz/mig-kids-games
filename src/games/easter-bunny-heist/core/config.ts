import type { Difficulty, DifficultyConfig, NPCConfig, NPCType } from './types';

// ── Player constants ──
export const PLAYER = {
  baseSpeed: 7,
  sprintMultiplier: 1.7,
  sneakMultiplier: 0.45,
  jumpForce: 9,
  gravity: 22,
  hopFrequency: 8,
  pickupRadius: 5,
  deliveryRadius: 3.5,
  eggPickupRadius: 2,
  catchRadius: 1.5,
} as const;

// ── World constants ──
export const WORLD = {
  size: 80,
  halfSize: 40,
  giftCount: 6,
  eggCount: 12,
  treeCount: 10,
  bushCount: 14,
  flowerCount: 60,
  benchCount: 3,
  barrelCount: 2,
  decorativeEggCount: 3,
} as const;

// ── Buff durations ──
export const BUFF_DURATION = 8; // seconds

export const BUFF_EFFECTS = {
  gold: { speedMultiplier: 1.5 },
  blue: { visionReduction: 0.5 },
  green: { jumpMultiplier: 1.6 },
  pink: { invisible: true },
} as const;

// ── NPC base configs ──
export const NPC_CONFIGS: Record<NPCType, NPCConfig> = {
  grandma: {
    speed: 1,
    chaseSpeed: 1,
    viewRange: 1,
    viewAngle: 1,
    name: 'Grandma',
    namePl: 'Babcia',
    color: 0xc084fc, // purple
  },
  dad: {
    speed: 1,
    chaseSpeed: 1,
    viewRange: 1,
    viewAngle: 1,
    name: 'Dad',
    namePl: 'Tata',
    color: 0x60a5fa, // blue
  },
  kid: {
    speed: 1,
    chaseSpeed: 1,
    viewRange: 1,
    viewAngle: 1,
    name: 'Kid',
    namePl: 'Dziecko',
    color: 0xfbbf24, // yellow
  },
} as const;

// ── NPC multipliers (applied on top of difficulty) ──
export const NPC_MULTIPLIERS: Record<NPCType, {
  speed: number;
  chaseSpeed: number;
  viewRange: number;
  viewAngle: number;
}> = {
  grandma: { speed: 0.7, chaseSpeed: 0.7, viewRange: 0.8, viewAngle: 1.2 },
  dad: { speed: 1.0, chaseSpeed: 1.0, viewRange: 1.2, viewAngle: 1.0 },
  kid: { speed: 1.3, chaseSpeed: 1.3, viewRange: 0.7, viewAngle: 0.9 },
};

// ── Difficulty configs ──
export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    detectionRate: 0.3,
    maxDetections: 5,
    npcSpeed: 2.2,
    npcChaseSpeed: 3.5,
    npcViewRange: 14,
    npcViewAngle: 55,
    timePenaltyPerDetection: 5,
  },
  normal: {
    detectionRate: 0.55,
    maxDetections: 3,
    npcSpeed: 3.0,
    npcChaseSpeed: 5.0,
    npcViewRange: 18,
    npcViewAngle: 65,
    timePenaltyPerDetection: 10,
  },
  hard: {
    detectionRate: 0.9,
    maxDetections: 2,
    npcSpeed: 3.8,
    npcChaseSpeed: 6.5,
    npcViewRange: 24,
    npcViewAngle: 80,
    timePenaltyPerDetection: 20,
  },
};

// ── Detection system ──
export const DETECTION = {
  suspiciousTarget: 0.5,
  alertTarget: 1.0,
  decayRate: 0.4,      // per second
  sneakViewReduction: 0.6,
  bushDetectionRange: 3,
} as const;

// ── AI timers ──
export const AI = {
  patrolPauseDuration: 2,
  suspiciousTimeout: 1.5,
  suspiciousCooldown: 2,
  chaseSpeedMultiplier: 1.6,
  chaseLoseTimeout: 6,
} as const;

// ── NPC patrol points ──
export const NPC_PATROLS: Record<NPCType, Array<{ x: number; z: number }>> = {
  grandma: [
    { x: -10, z: -10 },
    { x: -10, z: 10 },
    { x: 10, z: 10 },
    { x: 10, z: -10 },
  ],
  dad: [
    { x: -20, z: 0 },
    { x: 0, z: -20 },
    { x: 20, z: 0 },
    { x: 0, z: 20 },
  ],
  kid: [
    { x: -15, z: -15 },
    { x: 15, z: -5 },
    { x: -5, z: 15 },
    { x: 15, z: 15 },
    { x: -15, z: 5 },
  ],
};

// ── House position (porch is the gift spawn) ──
export const HOUSE = {
  position: { x: 0, z: -32 },
  porchPosition: { x: 0, z: -27 },
  width: 12,
  depth: 8,
  height: 8,
} as const;

// ── Fixed timestep ──
export const FIXED_DT = 1 / 60;

// ── Scoring ──
export const SCORING = {
  baseScore: 1000,
  detectionPenalty: 50,
  eggBonus: 20,
  threeStarThreshold: 900,
  twoStarThreshold: 600,
} as const;

// ── Delivery point locations ──
export const DELIVERY_POSITIONS = [
  { x: -25, z: 15 },
  { x: 25, z: 10 },
  { x: -15, z: -10 },
  { x: 20, z: -20 },
  { x: -30, z: -5 },
  { x: 10, z: 25 },
];
