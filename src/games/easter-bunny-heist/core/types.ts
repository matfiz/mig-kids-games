// ── Vector & Math ──
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

// ── Player ──
export type PlayerState =
  | 'idle'
  | 'hopping'
  | 'sprinting'
  | 'sneaking'
  | 'jumping'
  | 'falling'
  | 'invisible';

export interface Player {
  position: Vec3;
  velocity: Vec3;
  rotation: number;
  state: PlayerState;
  isSprinting: boolean;
  isSneaking: boolean;
  isCarrying: boolean;
  isGrounded: boolean;
  hopPhase: number;
  inBush: boolean;
}

// ── NPC ──
export type NPCType = 'grandma' | 'dad' | 'kid';
export type NPCState = 'patrol' | 'suspicious' | 'alert' | 'chase';

export interface NPCConfig {
  speed: number;
  chaseSpeed: number;
  viewRange: number;
  viewAngle: number; // radians
  name: string;
  namePl: string;
  color: number;
}

export interface NPC {
  id: string;
  type: NPCType;
  position: Vec3;
  facing: Vec3;
  state: NPCState;
  patrolPoints: Vec3[];
  patrolIndex: number;
  stateTimer: number;
  lastKnownPlayerPos: Vec3 | null;
  config: NPCConfig;
}

// ── World Objects ──
export interface Obstacle {
  position: Vec3;
  radius: number;
  height: number;
  blocksVision: boolean;
  isHidingSpot: boolean;
  type: 'tree' | 'bush' | 'bench' | 'barrel' | 'decorativeEgg' | 'house' | 'fence';
}

export interface Gift {
  id: string;
  position: Vec3;
  state: 'available' | 'carried' | 'delivered';
}

export interface DeliveryPoint {
  id: string;
  position: Vec3;
  delivered: boolean;
  giftId: string | null;
}

export type BuffType = 'gold' | 'blue' | 'green' | 'pink';

export interface Egg {
  id: string;
  position: Vec3;
  type: BuffType;
  collected: boolean;
}

// ── Difficulty ──
export type Difficulty = 'easy' | 'normal' | 'hard';

export interface DifficultyConfig {
  detectionRate: number;
  maxDetections: number;
  npcSpeed: number;
  npcChaseSpeed: number;
  npcViewRange: number;
  npcViewAngle: number; // degrees
  timePenaltyPerDetection: number;
}

// ── Game State ──
export type GameScreen =
  | 'menu'
  | 'playing'
  | 'paused'
  | 'help'
  | 'settings'
  | 'gameover'
  | 'victory';

export interface BuffState {
  gold: number;
  blue: number;
  green: number;
  pink: number;
}

export interface WorldState {
  obstacles: Obstacle[];
  gifts: Gift[];
  deliveryPoints: DeliveryPoint[];
  eggs: Egg[];
  npcs: NPC[];
  player: Player;
  buffs: BuffState;
}

// ── Input ──
export interface InputState {
  moveX: number;
  moveZ: number;
  jump: boolean;
  sprint: boolean;
  sneak: boolean;
  interact: boolean;
  pause: boolean;
  help: boolean;
  cameraRotX: number;
  cameraRotY: number;
}

// ── Scoring ──
export interface ScoreResult {
  score: number;
  stars: number;
  time: number;
  detections: number;
  eggsCollected: number;
  bestScore: number;
  isNewBest: boolean;
}

// ── Language ──
export type Language = 'pl' | 'en';

// ── Toast ──
export interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
}
