'use client';

import { useGameStore } from '../store/gameStore';
import { t } from '../i18n';
import { formatTime } from '../core/systems/scoring';
import { useEffect } from 'react';
import { playSfx } from '../audio/AudioManager';

export function GameOver() {
  const screen = useGameStore((s) => s.screen);
  const language = useGameStore((s) => s.language);
  const gameOverReason = useGameStore((s) => s.gameOverReason);
  const scoreResult = useGameStore((s) => s.scoreResult);
  const restartGame = useGameStore((s) => s.restartGame);
  const goToMenu = useGameStore((s) => s.goToMenu);

  useEffect(() => {
    if (screen === 'gameover') {
      playSfx('gameOver');
    }
  }, [screen]);

  if (screen !== 'gameover') return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4 text-center">
        <div className="text-6xl mb-4">😿</div>
        <h2 className="text-3xl font-extrabold text-red-500 mb-2">
          {t('gameOver', language)}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {t(gameOverReason, language)}
        </p>

        {scoreResult && (
          <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 mb-6 space-y-2 text-sm">
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>{t('time', language)}:</span>
              <span className="font-bold">{formatTime(scoreResult.time)}</span>
            </div>
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>{t('detections', language)}:</span>
              <span className="font-bold">{scoreResult.detections}</span>
            </div>
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>{t('eggs', language)}:</span>
              <span className="font-bold">{scoreResult.eggsCollected}</span>
            </div>
            <div className="flex justify-between text-gray-700 dark:text-gray-300 border-t pt-2 dark:border-gray-600">
              <span>{t('score', language)}:</span>
              <span className="font-extrabold text-lg">{scoreResult.score}</span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={restartGame}
            className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all hover:scale-105"
          >
            {t('tryAgain', language)} 🔄
          </button>
          <button
            onClick={goToMenu}
            className="w-full py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-xl transition-all hover:scale-105"
          >
            {t('menu', language)}
          </button>
        </div>
      </div>
    </div>
  );
}
