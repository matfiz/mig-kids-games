'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, useSyncExternalStore } from 'react';
import { GameWorld } from './GameWorld';
import { GameCamera } from './GameCamera';
import { GameLighting } from './GameLighting';
import { SkyDome } from './SkyDome';

function checkWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

// Compute once, cache the result
let webglResult: boolean | null = null;
function getWebGLSupport() {
  if (webglResult === null) webglResult = checkWebGLSupport();
  return webglResult;
}
function subscribeNoop() {
  return () => {};
}

function NoWebGL() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-sky-400 to-green-600 text-white">
      <div className="text-center p-8">
        <div className="text-6xl mb-4">😿</div>
        <h2 className="text-2xl font-bold mb-2">WebGL niedostępny</h2>
        <p className="text-lg opacity-75">
          Twoja przeglądarka nie wspiera WebGL.
          <br />
          Spróbuj Chrome, Firefox lub Edge.
        </p>
      </div>
    </div>
  );
}

export function Scene() {
  const webglOk = useSyncExternalStore(subscribeNoop, getWebGLSupport, () => true);

  if (!webglOk) return <NoWebGL />;

  return (
    <Canvas
      shadows
      camera={{ fov: 50, near: 0.1, far: 300, position: [0, 20, 20] }}
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
        <SkyDome />
        <fog attach="fog" args={['#c8e6ff', 60, 150]} />
      </Suspense>
    </Canvas>
  );
}
