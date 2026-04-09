'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Vec3 } from '../../core/types';

interface Props {
  position: Vec3;
}

export function DecorativeEggModel({ position }: Props) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.3 + position.x;
  });

  // Large decorative Easter egg
  return (
    <group position={[position.x, 0, position.z]}>
      <mesh ref={ref} position={[0, 1, 0]} castShadow scale={[1, 1.3, 1]}>
        <sphereGeometry args={[0.8, 12, 10]} />
        <meshStandardMaterial color="#e8b4e8" />
      </mesh>

      {/* Stripe decoration */}
      <mesh position={[0, 1, 0]} scale={[1.01, 1.31, 1.01]}>
        <torusGeometry args={[0.6, 0.06, 6, 16]} />
        <meshStandardMaterial color="#ffd700" />
      </mesh>

      {/* Base */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.6, 0.2, 8]} />
        <meshStandardMaterial color="#d4a574" />
      </mesh>
    </group>
  );
}
