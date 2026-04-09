'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { GameWorld } from './GameWorld';
import { GameCamera } from './GameCamera';
import { GameLighting } from './GameLighting';
import { WeatherEffects } from './WeatherEffects';

export function Scene() {
  return (
    <Canvas
      shadows
      camera={{ fov: 55, near: 0.1, far: 200, position: [10, 12, 10] }}
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: true }}
    >
      <Suspense fallback={null}>
        <GameCamera />
        <GameLighting />
        <GameWorld />
        <WeatherEffects />
        <fog attach="fog" args={['#87CEEB', 30, 80]} />
      </Suspense>
    </Canvas>
  );
}
