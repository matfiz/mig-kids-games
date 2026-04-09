'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { useGameStore } from '../store/gameStore';

interface JoystickState {
  active: boolean;
  dx: number;
  dz: number;
}

export function TouchControls() {
  const screen = useGameStore((s) => s.screen);
  const [isMobile, setIsMobile] = useState(false);
  const joystickRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef<HTMLDivElement>(null);
  const joystickState = useRef<JoystickState>({ active: false, dx: 0, dz: 0 });
  const touchIdRef = useRef<number | null>(null);
  const originRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Keep global touch state for GameLoop
  useEffect(() => {
    const update = () => {
      (window as unknown as Record<string, unknown>).__bunnyTouch = joystickState.current.active
        ? { dx: joystickState.current.dx, dz: joystickState.current.dz }
        : null;
    };

    const interval = setInterval(update, 16);
    return () => {
      clearInterval(interval);
      (window as unknown as Record<string, unknown>).__bunnyTouch = null;
    };
  }, []);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    const rect = joystickRef.current?.getBoundingClientRect();
    if (!rect) return;
    originRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    joystickState.current = { active: true, dx: 0, dz: 0 };
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier !== touchIdRef.current) continue;

      const maxRadius = 35;
      let dx = touch.clientX - originRef.current.x;
      let dy = touch.clientY - originRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > maxRadius) {
        dx = (dx / dist) * maxRadius;
        dy = (dy / dist) * maxRadius;
      }

      if (stickRef.current) {
        stickRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
      }

      joystickState.current = {
        active: true,
        dx: dx / maxRadius,
        dz: dy / maxRadius,
      };
    }
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        touchIdRef.current = null;
        joystickState.current = { active: false, dx: 0, dz: 0 };
        if (stickRef.current) {
          stickRef.current.style.transform = 'translate(0px, 0px)';
        }
      }
    }
  }, []);

  if (!isMobile || screen !== 'playing') return null;

  const store = useGameStore.getState();

  return (
    <div className="absolute inset-0 pointer-events-none z-40" data-ui>
      {/* Virtual joystick (left bottom) */}
      <div
        ref={joystickRef}
        className="absolute bottom-8 left-8 w-28 h-28 pointer-events-auto"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="w-full h-full rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center">
          <div
            ref={stickRef}
            className="w-12 h-12 rounded-full bg-white/50 border-2 border-white/60 transition-none"
          />
        </div>
      </div>

      {/* Action buttons (right bottom) */}
      <div className="absolute bottom-8 right-6 pointer-events-auto space-y-2">
        {/* Jump */}
        <button
          className="w-14 h-14 rounded-full bg-yellow-500/70 border-2 border-yellow-300/50 text-white font-bold text-xs flex items-center justify-center active:scale-90"
          onTouchStart={() => {
            useGameStore.getState().doJump();
          }}
        >
          ⬆
        </button>

        <div className="flex gap-2">
          {/* Sprint toggle */}
          <button
            className={`w-14 h-14 rounded-full border-2 text-white font-bold text-xs flex items-center justify-center active:scale-90 ${
              store.isSprinting
                ? 'bg-orange-500/80 border-orange-300/50'
                : 'bg-white/20 border-white/30'
            }`}
            onTouchStart={() => {
              const s = useGameStore.getState();
              s.setSprinting(!s.isSprinting);
              if (!s.isSprinting) s.setSneaking(false);
            }}
          >
            💨
          </button>

          {/* Sneak toggle */}
          <button
            className={`w-14 h-14 rounded-full border-2 text-white font-bold text-xs flex items-center justify-center active:scale-90 ${
              store.isSneaking
                ? 'bg-blue-500/80 border-blue-300/50'
                : 'bg-white/20 border-white/30'
            }`}
            onTouchStart={() => {
              const s = useGameStore.getState();
              s.setSneaking(!s.isSneaking);
              if (!s.isSneaking) s.setSprinting(false);
            }}
          >
            🐾
          </button>
        </div>

        {/* Interact (E) */}
        <button
          className="w-full h-14 rounded-xl bg-green-500/70 border-2 border-green-300/50 text-white font-bold text-lg flex items-center justify-center active:scale-90"
          onTouchStart={() => {
            useGameStore.getState().doInteract();
          }}
        >
          E
        </button>
      </div>

      {/* Top buttons */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 flex gap-3 pointer-events-auto">
        <button
          className="w-10 h-10 rounded-full bg-black/30 text-white flex items-center justify-center"
          onClick={() => useGameStore.getState().setScreen('paused')}
        >
          ⏸
        </button>
        <button
          className="w-10 h-10 rounded-full bg-black/30 text-white flex items-center justify-center"
          onClick={() => useGameStore.getState().setScreen('help')}
        >
          ❓
        </button>
      </div>
    </div>
  );
}
