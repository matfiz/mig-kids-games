'use client';

import { useGameStore } from '@/games/karols-farm/store/gameStore';

export function Toasts() {
  const toasts = useGameStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-black/80 text-white px-4 py-2 rounded-lg text-sm font-medium animate-fade-in shadow-lg"
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
