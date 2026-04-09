'use client';

import { useGameStore } from '../store/gameStore';
import { t } from '../i18n';

const TYPE_STYLES: Record<string, string> = {
  info: 'bg-blue-500/80',
  success: 'bg-green-500/80',
  warning: 'bg-yellow-500/80',
  error: 'bg-red-500/80',
};

export function Toasts() {
  const toasts = useGameStore((s) => s.toasts);
  const language = useGameStore((s) => s.language);
  const screen = useGameStore((s) => s.screen);

  if (screen !== 'playing' || toasts.length === 0) return null;

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 space-y-1.5 pointer-events-none z-30">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${TYPE_STYLES[toast.type] || TYPE_STYLES.info} backdrop-blur-sm rounded-lg px-4 py-1.5 text-white text-sm font-bold text-center shadow-lg animate-fade-in`}
        >
          {t(toast.message, language)}
        </div>
      ))}
    </div>
  );
}
