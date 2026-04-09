'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import { useGameStore } from '@/games/karols-farm/store/gameStore';

export function MobileControls() {
  const [isMobile, setIsMobile] = useState(false);
  const joystickRef = useRef<HTMLDivElement>(null);
  const joystickActive = useRef(false);
  const joystickStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const performAction = useGameStore((s) => s.performAction);
  const massHarvest = useGameStore((s) => s.massHarvest);
  const toggleShop = useGameStore((s) => s.toggleShop);
  const toggleHelp = useGameStore((s) => s.toggleHelp);
  const goToSleep = useGameStore((s) => s.goToSleep);

  const handleJoystickStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    joystickActive.current = true;
    joystickStart.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleJoystickMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (!joystickActive.current) return;
    const touch = e.touches[0];
    const dx = (touch.clientX - joystickStart.current.x) / 50;
    const dy = (touch.clientY - joystickStart.current.y) / 50;
    const clampedDx = Math.max(-1, Math.min(1, dx));
    const clampedDy = Math.max(-1, Math.min(1, dy));
    // Store for game loop to pick up
    (window as unknown as Record<string, unknown>).__karolsFarmTouch = { dx: clampedDx, dz: clampedDy };
  }, []);

  const handleJoystickEnd = useCallback(() => {
    joystickActive.current = false;
    (window as unknown as Record<string, unknown>).__karolsFarmTouch = null;
  }, []);

  if (!isMobile) return null;

  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      {/* Virtual joystick area */}
      <div
        ref={joystickRef}
        className="absolute bottom-8 left-8 w-32 h-32 rounded-full bg-white/20 border-2 border-white/40 pointer-events-auto touch-none"
        onTouchStart={handleJoystickStart}
        onTouchMove={handleJoystickMove}
        onTouchEnd={handleJoystickEnd}
      >
        <div className="absolute inset-1/4 rounded-full bg-white/40" />
      </div>

      {/* Action buttons */}
      <div className="absolute bottom-8 right-8 flex flex-col gap-2 pointer-events-auto">
        <button onClick={performAction} className="w-16 h-16 rounded-full bg-green-600/80 text-white text-2xl font-bold shadow-lg active:scale-95">
          E
        </button>
        <button onClick={massHarvest} className="w-12 h-12 rounded-full bg-yellow-600/80 text-white text-lg font-bold shadow-lg active:scale-95">
          R
        </button>
      </div>

      {/* Top buttons */}
      <div className="absolute top-20 right-2 flex flex-col gap-2 pointer-events-auto">
        <button onClick={toggleShop} className="w-10 h-10 rounded-lg bg-black/60 text-white text-lg active:scale-95">
          🛒
        </button>
        <button onClick={goToSleep} className="w-10 h-10 rounded-lg bg-black/60 text-white text-lg active:scale-95">
          🛏️
        </button>
        <button onClick={toggleHelp} className="w-10 h-10 rounded-lg bg-black/60 text-white text-lg active:scale-95">
          ❓
        </button>
      </div>
    </div>
  );
}
