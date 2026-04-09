'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useGameStore } from '@/games/karols-farm/store/gameStore';
import { loadGame } from '@/games/karols-farm/persistence/saveGame';
import { HUD } from '@/games/karols-farm/ui/HUD';
import { SeedBar } from '@/games/karols-farm/ui/SeedBar';
import { Shop } from '@/games/karols-farm/ui/Shop';
import { Help } from '@/games/karols-farm/ui/Help';
import { Toasts } from '@/games/karols-farm/ui/Toasts';
import { SleepOverlay } from '@/games/karols-farm/ui/SleepOverlay';
import { MobileControls } from '@/games/karols-farm/ui/MobileControls';
import { GameLoop } from '@/games/karols-farm/input/GameLoop';
import { GameErrorBoundary } from '@/games/karols-farm/ui/ErrorBoundary';

// Dynamic import for Three.js scene to avoid SSR issues
const Scene = dynamic(
  () => import('@/games/karols-farm/render/Scene').then((mod) => ({ default: mod.Scene })),
  { ssr: false, loading: () => <LoadingScreen /> }
);

function LoadingScreen() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-sky-700 to-green-800">
      <div className="text-center text-white">
        <div className="text-6xl mb-4 animate-bounce">🌾</div>
        <h1 className="text-3xl font-bold mb-2">Karol&apos;s Farm 3D</h1>
        <p className="text-lg opacity-75">Ładowanie...</p>
      </div>
    </div>
  );
}

export default function KarolsFarmPage() {
  const [loaded, setLoaded] = useState(false);
  const loadState = useGameStore((s) => s.loadState);

  useEffect(() => {
    // Try to load saved game
    const savedState = loadGame();
    if (savedState) {
      loadState({
        ...savedState,
        lastTickTime: Date.now(),
        toasts: [],
        shopOpen: false,
        helpOpen: false,
        isSleeping: false,
      });
    }
    setLoaded(true);
  }, [loadState]);

  if (!loaded) {
    return <LoadingScreen />;
  }

  return (
    <GameErrorBoundary>
    <div className="w-screen h-screen overflow-hidden relative bg-black select-none">
      {/* 3D Scene */}
      <Scene />

      {/* Game loop (handles input + ticking) */}
      <GameLoop />

      {/* UI Overlay */}
      <HUD />
      <SeedBar />
      <Toasts />
      <SleepOverlay />
      <MobileControls />

      {/* Modals */}
      <Shop />
      <Help />

      {/* Bottom controls hint */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/40 text-xs pointer-events-none hidden md:block">
        WASD: ruch | E: akcja | Q: sklep | R: masowy zbiór | P: pomoc | B: sen
      </div>
    </div>
    </GameErrorBoundary>
  );
}
