'use client';

import type { Vec3 } from '../../core/types';

interface Props {
  position: Vec3;
}

export function BarrelModel({ position }: Props) {
  return (
    <group position={[position.x, 0, position.z]}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.45, 1.2, 10]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Metal bands */}
      {[0.15, 0.6, 1.05].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <torusGeometry args={[0.48, 0.03, 4, 12]} />
          <meshStandardMaterial color="#555555" />
        </mesh>
      ))}
    </group>
  );
}
