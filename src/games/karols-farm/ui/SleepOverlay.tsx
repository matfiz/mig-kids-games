'use client';

import { useGameStore } from '@/games/karols-farm/store/gameStore';

export function SleepOverlay() {
  const isSleeping = useGameStore((s) => s.isSleeping);

  if (!isSleeping) return null;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/90 pointer-events-none">
      <div className="text-center animate-pulse">
        <div className="text-8xl mb-4">💤</div>
        <div className="text-white text-2xl font-bold">Śpisz...</div>
        <div className="text-gray-400 mt-2">Energia się regeneruje</div>
      </div>
    </div>
  );
}
