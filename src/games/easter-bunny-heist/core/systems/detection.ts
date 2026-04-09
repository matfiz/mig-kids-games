import type { NPC, BuffState } from '../types';
import { DETECTION } from '../config';

export interface DetectionUpdate {
  detectionLevel: number;
  newDetection: boolean;
}

/**
 * Update the detection meter based on NPC states.
 * - Rises when any NPC is suspicious or alert toward the player
 * - Decays when no NPC is watching
 */
export function updateDetectionLevel(
  currentLevel: number,
  npcs: NPC[],
  buffs: BuffState,
  detectionRate: number,
  dt: number,
): DetectionUpdate {
  // Pink buff = no detection
  if (buffs.pink > 0) {
    return {
      detectionLevel: Math.max(0, currentLevel - DETECTION.decayRate * dt),
      newDetection: false,
    };
  }

  let anyWatching = false;
  let targetLevel = 0;

  for (const npc of npcs) {
    if (npc.state === 'suspicious') {
      anyWatching = true;
      targetLevel = Math.max(targetLevel, DETECTION.suspiciousTarget);
    } else if (npc.state === 'alert' || npc.state === 'chase') {
      anyWatching = true;
      targetLevel = Math.max(targetLevel, DETECTION.alertTarget);
    }
  }

  let newLevel = currentLevel;

  if (anyWatching) {
    // Rise toward target
    newLevel = Math.min(targetLevel, currentLevel + detectionRate * dt);
  } else {
    // Decay
    newLevel = Math.max(0, currentLevel - DETECTION.decayRate * dt);
  }

  return {
    detectionLevel: Math.max(0, Math.min(1, newLevel)),
    newDetection: false,
  };
}
