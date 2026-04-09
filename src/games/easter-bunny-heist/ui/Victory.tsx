'use client';

import { useGameStore } from '../store/gameStore';
import { t } from '../i18n';
import { formatTime } from '../core/systems/scoring';
import { useEffect } from 'react';
import { playSfx } from '../audio/AudioManager';

export function Victory() {
  const screen = useGameStore((s) => s.screen);
  const language = useGameStore((s) => s.language);
  const scoreResult = useGameStore((s) => s.scoreResult);
  const restartGame = useGameStore((s) => s.restartGame);
  const goToMenu = useGameStore((s) => s.goToMenu);

  useEffect(() => {
    if (screen === 'victory') {
      playSfx('victory');
    }
  }, [screen]);

  if (screen !== 'victory' || !scoreResult) return null;

  const stars = scoreResult.stars;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4 text-center">
        <div className="text-6xl mb-2">🎉</div>
        <h2 className="text-3xl font-extrabold text-green-500 mb-1">
          {t('victory', language)}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          {t('allDelivered', language)}
        </p>

        {/* Stars */}
        <div className="text-5xl mb-4 space-x-1">
          {[1, 2, 3].map((s) => (
            <span key={s} className={s <= stars ? '' : 'opacity-20'}>
              ⭐
            </span>
          ))}
        </div>

        {/* Score details */}
        <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 mb-4 space-y-2 text-sm">
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
            <span className="font-extrabold text-2xl text-green-500">
              {scoreResult.score}
            </span>
          </div>
          <div className="flex justify-between text-gray-700 dark:text-gray-300">
            <span>{t('bestScore', language)}:</span>
            <span className="font-bold">{scoreResult.bestScore}</span>
          </div>
          {scoreResult.isNewBest && (
            <div className="text-yellow-500 font-extrabold text-center animate-pulse">
              🏆 {t('newBest', language)}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={restartGame}
            className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all hover:scale-105"
          >
            {t('restart', language)} 🔄
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
