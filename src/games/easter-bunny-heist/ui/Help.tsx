'use client';

import { useGameStore } from '../store/gameStore';
import { t } from '../i18n';

export function Help() {
  const screen = useGameStore((s) => s.screen);
  const language = useGameStore((s) => s.language);
  const setScreen = useGameStore((s) => s.setScreen);

  if (screen !== 'help') return null;

  const goBack = () => {
    // Go back to previous screen (menu or playing)
    setScreen('playing');
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto">
        <h2 className="text-2xl font-extrabold text-gray-800 dark:text-white mb-4">
          ❓ {t('helpTitle', language)}
        </h2>

        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
          {t('helpGoal', language)}
        </p>

        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
          🎮 {t('helpControls', language)}
        </h3>
        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300 mb-4 bg-gray-100 dark:bg-gray-700 rounded-xl p-3">
          <div>{t('helpMove', language)}</div>
          <div>{t('helpCamera', language)}</div>
          <div>{t('helpJump', language)}</div>
          <div>{t('helpSprint', language)}</div>
          <div>{t('helpSneak', language)}</div>
          <div>{t('helpInteract', language)}</div>
          <div>{t('helpPause', language)}</div>
        </div>

        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
          💡 {t('helpTips', language)}
        </h3>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-6">
          <li>🌿 {t('helpTip1', language)}</li>
          <li>🥚 {t('helpTip2', language)}</li>
          <li>💗 {t('helpTip3', language)}</li>
          <li>💨 {t('helpTip4', language)}</li>
        </ul>

        <button
          onClick={goBack}
          className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all hover:scale-105"
        >
          {t('back', language)}
        </button>
      </div>
    </div>
  );
}
