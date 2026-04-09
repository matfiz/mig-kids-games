'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { useGameStore } from '@/games/easter-bunny-heist/store/gameStore';
import { Menu } from '@/games/easter-bunny-heist/ui/Menu';
import { HUD } from '@/games/easter-bunny-heist/ui/HUD';
import { Pause } from '@/games/easter-bunny-heist/ui/Pause';
import { Help } from '@/games/easter-bunny-heist/ui/Help';
import { Settings } from '@/games/easter-bunny-heist/ui/Settings';
import { GameOver } from '@/games/easter-bunny-heist/ui/GameOver';
import { Victory } from '@/games/easter-bunny-heist/ui/Victory';
import { Minimap } from '@/games/easter-bunny-heist/ui/Minimap';
import { Toasts } from '@/games/easter-bunny-heist/ui/Toasts';
import { TouchControls } from '@/games/easter-bunny-heist/ui/TouchControls';
import { GameLoop } from '@/games/easter-bunny-heist/input/GameLoop';
import { GameErrorBoundary } from '@/games/easter-bunny-heist/ui/ErrorBoundary';

const Scene = dynamic(
  () =>
    import('@/games/easter-bunny-heist/render/Scene').then((mod) => ({
      default: mod.Scene,
    })),
  { ssr: false, loading: () => <LoadingScreen /> },
);

function LoadingScreen() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-sky-400 to-green-600">
      <div className="text-center text-white">
        <div className="text-7xl mb-4 animate-bounce">🐰</div>
        <h1 className="text-3xl font-bold mb-2">Wielkanocny Skok Zajączka</h1>
        <p className="text-lg opacity-75">Ładowanie...</p>
      </div>
    </div>
  );
}

export default function EasterBunnyHeistPage() {
  const screen = useGameStore((s) => s.screen);
  const loadSettings = useGameStore((s) => s.loadSettings);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return (
    <GameErrorBoundary>
      <div className="w-screen h-screen overflow-hidden relative bg-black select-none">
        {/* 3D Scene (always mounted when playing) */}
        {screen !== 'menu' && screen !== 'settings' && <Scene />}

        {/* Game loop */}
        <GameLoop />

        {/* UI Overlays */}
        <Menu />
        <HUD />
        <Minimap />
        <Toasts />
        <TouchControls />

        {/* Modal overlays */}
        <Pause />
        <Help />
        <Settings />
        <GameOver />
        <Victory />

        {/* Desktop controls hint */}
        {screen === 'playing' && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/30 text-xs pointer-events-none hidden md:block">
            WASD: ruch | Mysz: kamera | Spacja: skok | Shift: sprint | Ctrl:
            skradanie | E: akcja | ESC: pauza
          </div>
        )}
      </div>
    </GameErrorBoundary>
  );
}
