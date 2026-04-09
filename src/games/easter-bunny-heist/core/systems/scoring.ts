import type { Difficulty, ScoreResult } from '../types';
import { SCORING } from '../config';

export function calculateScore(
  timeElapsed: number,
  detections: number,
  eggsCollected: number,
): number {
  return Math.max(
    0,
    Math.round(
      SCORING.baseScore -
        timeElapsed -
        detections * SCORING.detectionPenalty +
        eggsCollected * SCORING.eggBonus,
    ),
  );
}

export function calculateStars(score: number): number {
  if (score >= SCORING.threeStarThreshold) return 3;
  if (score >= SCORING.twoStarThreshold) return 2;
  return 1;
}

export function createScoreResult(
  timeElapsed: number,
  detections: number,
  eggsCollected: number,
  difficulty: Difficulty,
  bestScores: Record<Difficulty, number>,
): ScoreResult {
  const score = calculateScore(timeElapsed, detections, eggsCollected);
  const stars = calculateStars(score);
  const currentBest = bestScores[difficulty] ?? 0;
  const isNewBest = score > currentBest;

  return {
    score,
    stars,
    time: timeElapsed,
    detections,
    eggsCollected,
    bestScore: isNewBest ? score : currentBest,
    isNewBest,
  };
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
