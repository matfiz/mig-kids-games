'use client';

import { create } from 'zustand';
import type {
  GameScreen,
  Difficulty,
  Player,
  NPC,
  Obstacle,
  Gift,
  DeliveryPoint,
  Egg,
  BuffState,
  Toast,
  Language,
} from '../core/types';
import { FIXED_DT, DIFFICULTY_CONFIGS, HOUSE } from '../core/config';
import { updatePlayerPhysics, tryJump } from '../core/systems/physics';
import { updateNPCAI } from '../core/systems/ai';
import { updateDetectionLevel } from '../core/systems/detection';
import { updateBuffs } from '../core/systems/buffs';
import {
  checkEggPickups,
  tryPickupGift,
  tryDeliverGift,
} from '../core/systems/interaction';
import { createScoreResult } from '../core/systems/scoring';
import type { ScoreResult } from '../core/types';
import { generateWorld, type WorldData } from '../core/systems/world';

interface GameStore {
  // Lifecycle
  screen: GameScreen;
  difficulty: Difficulty;

  // World
  obstacles: Obstacle[];
  flowers: WorldData['flowers'];
  paths: WorldData['paths'];

  // Entities
  player: Player;
  npcs: NPC[];
  gifts: Gift[];
  deliveryPoints: DeliveryPoint[];
  eggs: Egg[];

  // State
  buffs: BuffState;
  detectionLevel: number;
  giftsDelivered: number;
  eggsCollected: number;
  detections: number;
  gameTime: number;
  accumulator: number;
  lastTickTime: number;

  // UI
  toasts: Toast[];
  scoreResult: ScoreResult | null;
  gameOverReason: string;

  // Settings (persisted separately)
  language: Language;
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  reduceMotion: boolean;
  bestScores: Record<Difficulty, number>;

  // Input state
  moveX: number;
  moveZ: number;
  isSprinting: boolean;
  isSneaking: boolean;

  // Actions
  startGame: (difficulty: Difficulty) => void;
  setScreen: (screen: GameScreen) => void;
  goToMenu: () => void;
  restartGame: () => void;
  tick: (now: number) => void;
  setMovement: (x: number, z: number) => void;
  setSprinting: (v: boolean) => void;
  setSneaking: (v: boolean) => void;
  doJump: () => void;
  doInteract: () => void;
  addToast: (message: string, type?: Toast['type']) => void;
  setLanguage: (lang: Language) => void;
  setMasterVolume: (v: number) => void;
  setMusicVolume: (v: number) => void;
  setSfxVolume: (v: number) => void;
  setReduceMotion: (v: boolean) => void;
  loadSettings: () => void;
}

function createInitialPlayer(): Player {
  return {
    position: { x: HOUSE.porchPosition.x, y: 0, z: HOUSE.porchPosition.z + 3 },
    velocity: { x: 0, y: 0, z: 0 },
    rotation: 0,
    state: 'idle',
    isSprinting: false,
    isSneaking: false,
    isCarrying: false,
    isGrounded: true,
    hopPhase: 0,
    inBush: false,
  };
}

function emptyBuffs(): BuffState {
  return { gold: 0, blue: 0, green: 0, pink: 0 };
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  screen: 'menu',
  difficulty: 'normal',

  obstacles: [],
  flowers: [],
  paths: [],

  player: createInitialPlayer(),
  npcs: [],
  gifts: [],
  deliveryPoints: [],
  eggs: [],

  buffs: emptyBuffs(),
  detectionLevel: 0,
  giftsDelivered: 0,
  eggsCollected: 0,
  detections: 0,
  gameTime: 0,
  accumulator: 0,
  lastTickTime: 0,

  toasts: [],
  scoreResult: null,
  gameOverReason: '',

  language: 'pl',
  masterVolume: 0.7,
  musicVolume: 0.5,
  sfxVolume: 0.7,
  reduceMotion: false,
  bestScores: { easy: 0, normal: 0, hard: 0 },

  moveX: 0,
  moveZ: 0,
  isSprinting: false,
  isSneaking: false,

  // ── Actions ──

  startGame: (difficulty) => {
    const world = generateWorld(difficulty);
    set({
      screen: 'playing',
      difficulty,
      obstacles: world.obstacles,
      flowers: world.flowers,
      paths: world.paths,
      player: createInitialPlayer(),
      npcs: world.npcs,
      gifts: world.gifts,
      deliveryPoints: world.deliveryPoints,
      eggs: world.eggs,
      buffs: emptyBuffs(),
      detectionLevel: 0,
      giftsDelivered: 0,
      eggsCollected: 0,
      detections: 0,
      gameTime: 0,
      accumulator: 0,
      lastTickTime: Date.now(),
      toasts: [],
      scoreResult: null,
      gameOverReason: '',
      moveX: 0,
      moveZ: 0,
      isSprinting: false,
      isSneaking: false,
    });
  },

  setScreen: (screen) => set({ screen }),

  goToMenu: () =>
    set({
      screen: 'menu',
      toasts: [],
    }),

  restartGame: () => {
    const { difficulty } = get();
    get().startGame(difficulty);
  },

  tick: (now) => {
    const state = get();
    if (state.screen !== 'playing') {
      set({ lastTickTime: now });
      return;
    }

    let realDt = (now - state.lastTickTime) / 1000;
    if (realDt > 0.1) realDt = 0.1; // cap delta
    if (realDt <= 0) {
      set({ lastTickTime: now });
      return;
    }

    let acc = state.accumulator + realDt;
    let player = { ...state.player };
    let npcs = state.npcs;
    const gifts = state.gifts;
    const deliveryPoints = state.deliveryPoints;
    let eggs = state.eggs;
    let buffs = { ...state.buffs };
    let detectionLevel = state.detectionLevel;
    let detections = state.detections;
    let eggsCollected = state.eggsCollected;
    let giftsDelivered = state.giftsDelivered;
    let gameTime = state.gameTime;
    const diffConfig = DIFFICULTY_CONFIGS[state.difficulty];
    const newToasts: Toast[] = [];
    let gameOver = false;
    let gameOverReason = '';
    let victory = false;

    while (acc >= FIXED_DT) {
      acc -= FIXED_DT;
      gameTime += FIXED_DT;

      // Update player movement direction
      const mx = state.moveX;
      const mz = state.moveZ;
      const len = Math.sqrt(mx * mx + mz * mz);
      if (len > 0.01) {
        player.velocity.x = mx / len;
        player.velocity.z = mz / len;
        player.rotation = Math.atan2(mx, mz);
      } else {
        player.velocity.x = 0;
        player.velocity.z = 0;
      }
      player.isSprinting = state.isSprinting && len > 0.01;
      player.isSneaking = state.isSneaking;

      // Physics
      player = updatePlayerPhysics(player, FIXED_DT, state.obstacles, buffs);

      // Buffs
      buffs = updateBuffs(buffs, FIXED_DT);

      // Egg pickups
      const eggResult = checkEggPickups(player, eggs, buffs);
      if (eggResult.collected) {
        eggs = eggResult.eggs;
        buffs = eggResult.buffs;
        eggsCollected++;
        newToasts.push({
          id: `toast-egg-${Date.now()}`,
          message: 'eggCollected',
          type: 'success',
          timestamp: Date.now(),
        });
      } else {
        eggs = eggResult.eggs;
      }

      // NPC AI
      const updatedNPCs: NPC[] = [];
      for (const npc of npcs) {
        const result = updateNPCAI(npc, player, state.obstacles, buffs, FIXED_DT);
        updatedNPCs.push(result.npc);

        if (result.newDetection) {
          detections++;
          gameTime += diffConfig.timePenaltyPerDetection;
          newToasts.push({
            id: `toast-detect-${Date.now()}-${npc.id}`,
            message: 'detected',
            type: 'warning',
            timestamp: Date.now(),
          });

          if (detections >= diffConfig.maxDetections) {
            gameOver = true;
            gameOverReason = 'tooManyDetections';
          }
        }

        if (result.playerCaught) {
          gameOver = true;
          gameOverReason = 'caught';
        }
      }
      npcs = updatedNPCs;

      // Detection level
      const detResult = updateDetectionLevel(
        detectionLevel,
        npcs,
        buffs,
        diffConfig.detectionRate,
        FIXED_DT,
      );
      detectionLevel = detResult.detectionLevel;

      if (gameOver) break;
    }

    // Count delivered
    giftsDelivered = deliveryPoints.filter((dp) => dp.delivered).length;

    // Check victory
    if (giftsDelivered >= gifts.length && !gameOver) {
      victory = true;
    }

    // Merge toasts
    const allToasts = [...state.toasts, ...newToasts]
      .filter((t) => Date.now() - t.timestamp < 3000)
      .slice(-5);

    if (gameOver) {
      const scoreResult = createScoreResult(
        gameTime,
        detections,
        eggsCollected,
        state.difficulty,
        state.bestScores,
      );
      set({
        screen: 'gameover',
        player,
        npcs,
        gifts,
        deliveryPoints,
        eggs,
        buffs,
        detectionLevel,
        detections,
        eggsCollected,
        giftsDelivered,
        gameTime,
        accumulator: acc,
        lastTickTime: now,
        toasts: allToasts,
        scoreResult,
        gameOverReason,
      });
      return;
    }

    if (victory) {
      const scoreResult = createScoreResult(
        gameTime,
        detections,
        eggsCollected,
        state.difficulty,
        state.bestScores,
      );
      const bestScores = { ...state.bestScores };
      if (scoreResult.isNewBest) {
        bestScores[state.difficulty] = scoreResult.score;
        try {
          localStorage.setItem('easter-bunny-heist-best', JSON.stringify(bestScores));
        } catch { /* ignore */ }
      }
      set({
        screen: 'victory',
        player,
        npcs,
        gifts,
        deliveryPoints,
        eggs,
        buffs,
        detectionLevel,
        detections,
        eggsCollected,
        giftsDelivered,
        gameTime,
        accumulator: acc,
        lastTickTime: now,
        toasts: allToasts,
        scoreResult,
        bestScores,
      });
      return;
    }

    set({
      player,
      npcs,
      gifts,
      deliveryPoints,
      eggs,
      buffs,
      detectionLevel,
      detections,
      eggsCollected,
      giftsDelivered,
      gameTime,
      accumulator: acc,
      lastTickTime: now,
      toasts: allToasts,
    });
  },

  setMovement: (x, z) => set({ moveX: x, moveZ: z }),
  setSprinting: (v) => set({ isSprinting: v }),
  setSneaking: (v) => set({ isSneaking: v }),

  doJump: () => {
    const { player, buffs, screen } = get();
    if (screen !== 'playing') return;
    set({ player: tryJump(player, buffs) });
  },

  doInteract: () => {
    const state = get();
    if (state.screen !== 'playing') return;

    // Try pickup gift
    if (!state.player.isCarrying) {
      const pickup = tryPickupGift(state.player, state.gifts);
      if (pickup.success) {
        set({
          player: pickup.player,
          gifts: pickup.gifts,
          toasts: [
            ...state.toasts,
            {
              id: `toast-pickup-${Date.now()}`,
              message: 'giftPickedUp',
              type: 'info',
              timestamp: Date.now(),
            },
          ],
        });
        return;
      }
    }

    // Try deliver gift
    if (state.player.isCarrying) {
      const deliver = tryDeliverGift(
        state.player,
        state.gifts,
        state.deliveryPoints,
      );
      if (deliver.success) {
        set({
          player: deliver.player,
          gifts: deliver.gifts,
          deliveryPoints: deliver.deliveryPoints,
          toasts: [
            ...state.toasts,
            {
              id: `toast-deliver-${Date.now()}`,
              message: 'giftDelivered',
              type: 'success',
              timestamp: Date.now(),
            },
          ],
        });
        return;
      }
    }
  },

  addToast: (message, type = 'info') =>
    set((s) => ({
      toasts: [
        ...s.toasts,
        {
          id: `toast-${Date.now()}-${Math.random()}`,
          message,
          type,
          timestamp: Date.now(),
        },
      ].slice(-5),
    })),

  setLanguage: (language) => {
    set({ language });
    try {
      const settings = JSON.parse(localStorage.getItem('easter-bunny-heist-settings') || '{}');
      settings.language = language;
      localStorage.setItem('easter-bunny-heist-settings', JSON.stringify(settings));
    } catch { /* ignore */ }
  },

  setMasterVolume: (v) => {
    set({ masterVolume: v });
    saveSettings(get());
  },
  setMusicVolume: (v) => {
    set({ musicVolume: v });
    saveSettings(get());
  },
  setSfxVolume: (v) => {
    set({ sfxVolume: v });
    saveSettings(get());
  },
  setReduceMotion: (v) => {
    set({ reduceMotion: v });
    saveSettings(get());
  },

  loadSettings: () => {
    try {
      const raw = localStorage.getItem('easter-bunny-heist-settings');
      if (raw) {
        const s = JSON.parse(raw);
        set({
          language: s.language ?? 'pl',
          masterVolume: s.masterVolume ?? 0.7,
          musicVolume: s.musicVolume ?? 0.5,
          sfxVolume: s.sfxVolume ?? 0.7,
          reduceMotion: s.reduceMotion ?? false,
        });
      }
      const bestRaw = localStorage.getItem('easter-bunny-heist-best');
      if (bestRaw) {
        set({ bestScores: JSON.parse(bestRaw) });
      }
    } catch { /* ignore */ }
  },
}));

function saveSettings(state: GameStore) {
  try {
    localStorage.setItem(
      'easter-bunny-heist-settings',
      JSON.stringify({
        language: state.language,
        masterVolume: state.masterVolume,
        musicVolume: state.musicVolume,
        sfxVolume: state.sfxVolume,
        reduceMotion: state.reduceMotion,
      }),
    );
  } catch { /* ignore */ }
}
