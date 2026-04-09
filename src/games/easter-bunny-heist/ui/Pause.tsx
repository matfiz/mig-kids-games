'use client';

import { useGameStore } from '../store/gameStore';
import { t } from '../i18n';

export function Pause() {
  const screen = useGameStore((s) => s.screen);
  const language = useGameStore((s) => s.language);
  const setScreen = useGameStore((s) => s.setScreen);
  const goToMenu = useGameStore((s) => s.goToMenu);
  const restartGame = useGameStore((s) => s.restartGame);

  if (screen !== 'paused') return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4 text-center">
        <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-6">
          ⏸ {t('paused', language)}
        </h2>

        <div className="space-y-3">
          <button
            onClick={() => setScreen('playing')}
            className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all hover:scale-105"
          >
            {t('resume', language)}
          </button>

          <button
            onClick={() => setScreen('help')}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-all hover:scale-105"
          >
            {t('help', language)} ❓
          </button>

          <button
            onClick={() => setScreen('settings')}
            className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl transition-all hover:scale-105"
          >
            {t('settings', language)} ⚙️
          </button>

          <button
            onClick={restartGame}
            className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl transition-all hover:scale-105"
          >
            {t('restart', language)}
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
