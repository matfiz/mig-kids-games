'use client';

import { useGameStore } from '../store/gameStore';

export function DetectionBar() {
  const detectionLevel = useGameStore((s) => s.detectionLevel);

  if (detectionLevel < 0.01) return null;

  const pct = detectionLevel * 100;
  const color =
    detectionLevel > 0.7
      ? '#ef5350'
      : detectionLevel > 0.4
        ? '#ffa726'
        : '#ffd54f';

  return (
    <div className="absolute top-14 left-1/2 -translate-x-1/2 w-48">
      <div className="bg-black/40 backdrop-blur-sm rounded-full h-3 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-100"
          style={{
            width: `${pct}%`,
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}`,
          }}
        />
      </div>
      {detectionLevel > 0.5 && (
        <div className="text-center text-xs font-bold mt-0.5" style={{ color }}>
          👁 !!!
        </div>
      )}
    </div>
  );
}
