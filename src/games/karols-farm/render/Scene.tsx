'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, useState, useEffect } from 'react';
import { GameWorld } from './GameWorld';
import { GameCamera } from './GameCamera';
import { GameLighting } from './GameLighting';
import { WeatherEffects } from './WeatherEffects';

function checkWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      canvas.getContext('webgl2') || canvas.getContext('webgl')
    );
  } catch {
    return false;
  }
}

function NoWebGL() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-sky-700 to-green-800 text-white">
      <div className="text-center p-8">
        <div className="text-6xl mb-4">😿</div>
        <h2 className="text-2xl font-bold mb-2">WebGL niedostępny</h2>
        <p className="text-lg opacity-75">
          Twoja przeglądarka nie wspiera WebGL.<br />
          Spróbuj Chrome, Firefox lub Edge.
        </p>
      </div>
    </div>
  );
}

export function Scene() {
  const [webglOk, setWebglOk] = useState(true);

  useEffect(() => {
    setWebglOk(checkWebGLSupport());
  }, []);

  if (!webglOk) return <NoWebGL />;

  return (
    <Canvas
      shadows
      camera={{ fov: 55, near: 0.1, far: 200, position: [10, 12, 10] }}
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: true }}
      onCreated={({ gl }) => {
        gl.setClearColor('#87CEEB');
      }}
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
