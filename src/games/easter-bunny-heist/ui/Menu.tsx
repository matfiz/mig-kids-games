'use client';

import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { t } from '../i18n';
import type { Difficulty } from '../core/types';

export function Menu() {
  const screen = useGameStore((s) => s.screen);
  const language = useGameStore((s) => s.language);
  const startGame = useGameStore((s) => s.startGame);
  const setScreen = useGameStore((s) => s.setScreen);
  const bestScores = useGameStore((s) => s.bestScores);
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');

  if (screen !== 'menu') return null;

  const difficulties: Difficulty[] = ['easy', 'normal', 'hard'];
  const diffColors: Record<Difficulty, string> = {
    easy: 'bg-green-500 hover:bg-green-600',
    normal: 'bg-yellow-500 hover:bg-yellow-600',
    hard: 'bg-red-500 hover:bg-red-600',
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-sky-300 via-green-200 to-green-400 z-50">
      <div className="text-center max-w-md w-full px-6">
        {/* Title */}
        <div className="mb-8">
          <div className="text-7xl mb-4">🐰</div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-2">
            {t('title', language)}
          </h1>
          <p className="text-lg text-white/80 drop-shadow">
            {t('subtitle', language)}
          </p>
        </div>

        {/* Difficulty selector */}
        <div className="mb-6">
          <p className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">
            {t('difficulty', language)}
          </p>
          <div className="flex gap-2 justify-center">
            {difficulties.map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-4 py-2 rounded-xl text-white font-bold transition-all text-sm ${
                  difficulty === d
                    ? `${diffColors[d]} ring-4 ring-white/50 scale-110`
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                {t(d, language)}
                {bestScores[d] > 0 && (
                  <span className="block text-xs opacity-80 mt-0.5">
                    {t('bestScore', language)}: {bestScores[d]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Play button */}
        <button
          onClick={() => startGame(difficulty)}
          className="w-full py-4 bg-green-500 hover:bg-green-600 text-white text-2xl font-extrabold rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 mb-4"
        >
          {t('play', language)} 🎮
        </button>

        {/* Secondary buttons */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => setScreen('help')}
            className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold transition-all"
          >
            {t('help', language)} ❓
          </button>
          <button
            onClick={() => setScreen('settings')}
            className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold transition-all"
          >
            {t('settings', language)} ⚙️
          </button>
        </div>

        {/* Easter eggs decorative */}
        <div className="mt-8 flex justify-center gap-3 text-3xl opacity-60">
          🥚🌷🐣🌸🥚
        </div>
      </div>
    </div>
  );
}
