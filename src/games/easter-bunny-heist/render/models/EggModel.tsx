'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Egg } from '../../core/types';

const EGG_COLORS: Record<string, string> = {
  gold: '#ffd700',
  blue: '#42a5f5',
  green: '#66bb6a',
  pink: '#f48fb1',
};

interface Props {
  egg: Egg;
}

export function EggModel({ egg }: Props) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.position.y = 0.4 + Math.sin(t * 2 + egg.position.x) * 0.15;
    ref.current.rotation.y = t * 1.2;
  });

  const color = EGG_COLORS[egg.type];

  return (
    <group ref={ref} position={[egg.position.x, 0.4, egg.position.z]}>
      {/* Egg shape (scaled sphere) */}
      <mesh castShadow scale={[0.3, 0.4, 0.3]}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Glow ring */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.3, 0]}>
        <ringGeometry args={[0.3, 0.5, 16]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.4}
          emissive={color}
          emissiveIntensity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
