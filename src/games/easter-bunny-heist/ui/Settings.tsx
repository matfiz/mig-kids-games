'use client';

import { useGameStore } from '../store/gameStore';
import { t } from '../i18n';
import type { Language } from '../core/types';

export function Settings() {
  const screen = useGameStore((s) => s.screen);
  const language = useGameStore((s) => s.language);
  const masterVolume = useGameStore((s) => s.masterVolume);
  const musicVolume = useGameStore((s) => s.musicVolume);
  const sfxVolume = useGameStore((s) => s.sfxVolume);
  const reduceMotion = useGameStore((s) => s.reduceMotion);
  const setScreen = useGameStore((s) => s.setScreen);
  const setLanguage = useGameStore((s) => s.setLanguage);
  const setMasterVolume = useGameStore((s) => s.setMasterVolume);
  const setMusicVolume = useGameStore((s) => s.setMusicVolume);
  const setSfxVolume = useGameStore((s) => s.setSfxVolume);
  const setReduceMotion = useGameStore((s) => s.setReduceMotion);

  if (screen !== 'settings') return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4">
        <h2 className="text-2xl font-extrabold text-gray-800 dark:text-white mb-5">
          ⚙️ {t('settingsTitle', language)}
        </h2>

        <div className="space-y-4">
          {/* Language */}
          <div>
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block mb-1">
              {t('language', language)}
            </label>
            <div className="flex gap-2">
              {(['pl', 'en'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                    language === lang
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {lang === 'pl' ? '🇵🇱 Polski' : '🇬🇧 English'}
                </button>
              ))}
            </div>
          </div>

          {/* Volume sliders */}
          <VolumeSlider
            label={t('masterVolume', language)}
            value={masterVolume}
            onChange={setMasterVolume}
          />
          <VolumeSlider
            label={t('musicVolume', language)}
            value={musicVolume}
            onChange={setMusicVolume}
          />
          <VolumeSlider
            label={t('sfxVolume', language)}
            value={sfxVolume}
            onChange={setSfxVolume}
          />

          {/* Reduce motion */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
              {t('reduceMotion', language)}
            </span>
            <button
              onClick={() => setReduceMotion(!reduceMotion)}
              className={`w-12 h-6 rounded-full transition-all ${
                reduceMotion ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  reduceMotion ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        <button
          onClick={() => setScreen('menu')}
          className="w-full mt-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all hover:scale-105"
        >
          {t('back', language)}
        </button>
      </div>
    </div>
  );
}

function VolumeSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block mb-1">
        {label}: {Math.round(value * 100)}%
      </label>
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-blue-500"
      />
    </div>
  );
}
