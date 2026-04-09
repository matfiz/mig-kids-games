'use client';

import type { Vec3 } from '../../core/types';

interface Props {
  position: Vec3;
}

export function BenchModel({ position }: Props) {
  return (
    <group position={[position.x, 0, position.z]}>
      {/* Seat */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[1.8, 0.1, 0.6]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Back */}
      <mesh position={[0, 0.9, -0.25]} castShadow>
        <boxGeometry args={[1.8, 0.7, 0.08]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Legs */}
      {[-0.7, 0.7].map((x) => (
        <mesh key={x} position={[x, 0.25, 0]} castShadow>
          <boxGeometry args={[0.08, 0.5, 0.5]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
      ))}
    </group>
  );
}
