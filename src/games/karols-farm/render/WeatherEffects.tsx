'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@/games/karols-farm/store/gameStore';
import * as THREE from 'three';

function RainParticles() {
  const ref = useRef<THREE.Points>(null);
  const count = 1500;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 40;
      arr[i * 3 + 1] = Math.random() * 20;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    return arr;
  }, []);

  useFrame(() => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position;
    const playerState = useGameStore.getState().player;
    for (let i = 0; i < count; i++) {
      const y = pos.getY(i) - 0.5;
      if (y < 0) {
        pos.setXYZ(
          i,
          playerState.x + (Math.random() - 0.5) * 40,
          15 + Math.random() * 5,
          playerState.z + (Math.random() - 0.5) * 40
        );
      } else {
        pos.setY(i, y);
      }
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial color="#aaccff" size={0.08} transparent opacity={0.6} />
    </points>
  );
}

function FogLayer() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <mesh ref={ref} position={[9, 2, 9]}>
      <planeGeometry args={[50, 50]} />
      <meshBasicMaterial color="#cccccc" transparent opacity={0.15} side={THREE.DoubleSide} />
    </mesh>
  );
}

export function WeatherEffects() {
  const weather = useGameStore((s) => s.weather);

  return (
    <>
      {(weather === 'rain' || weather === 'storm') && <RainParticles />}
      {weather === 'storm' && <RainParticles />}
      {weather === 'fog' && (
        <>
          <FogLayer />
          <FogLayer />
        </>
      )}
    </>
  );
}
