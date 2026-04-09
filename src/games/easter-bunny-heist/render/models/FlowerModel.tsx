'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const FLOWER_COLORS = ['#ff69b4', '#ffb347', '#dda0dd', '#87ceeb'];

interface Props {
  x: number;
  z: number;
  type: number;
}

export function FlowerModel({ x, z, type }: Props) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ref.current) return;
    // Gentle swaying
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.5 + x * 0.5) * 0.05;
  });

  const color = FLOWER_COLORS[type % FLOWER_COLORS.length];

  return (
    <group ref={ref} position={[x, 0, z]}>
      {/* Stem */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.4, 4]} />
        <meshStandardMaterial color="#228b22" />
      </mesh>

      {/* Petals */}
      <mesh position={[0, 0.42, 0]}>
        <sphereGeometry args={[0.1, 6, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Center */}
      <mesh position={[0, 0.45, 0.05]}>
        <sphereGeometry args={[0.04, 4, 4]} />
        <meshStandardMaterial color="#ffd700" />
      </mesh>
    </group>
  );
}
