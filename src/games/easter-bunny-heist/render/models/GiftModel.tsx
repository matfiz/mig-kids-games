'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Vec3 } from '../../core/types';

interface Props {
  position: Vec3;
  small?: boolean;
}

export function GiftModel({ position, small }: Props) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current && small) {
      ref.current.rotation.y = state.clock.elapsedTime * 2;
      ref.current.position.y = position.y + Math.sin(state.clock.elapsedTime * 3) * 0.1;
    }
  });

  const s = small ? 0.4 : 0.6;

  return (
    <group
      ref={ref}
      position={[position.x, position.y, position.z]}
    >
      {/* Box */}
      <mesh castShadow>
        <boxGeometry args={[s, s, s]} />
        <meshStandardMaterial color="#ff69b4" />
      </mesh>

      {/* Ribbon horizontal */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[s + 0.05, s * 0.12, s + 0.05]} />
        <meshStandardMaterial color="#ffd700" />
      </mesh>

      {/* Ribbon vertical */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[s * 0.12, s + 0.05, s + 0.05]} />
        <meshStandardMaterial color="#ffd700" />
      </mesh>

      {/* Bow */}
      <mesh position={[0, s / 2 + 0.08, 0]}>
        <sphereGeometry args={[s * 0.2, 6, 6]} />
        <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}
