'use client';

import type { Vec3 } from '../../core/types';

interface Props {
  position: Vec3;
}

export function TreeModel({ position }: Props) {
  return (
    <group position={[position.x, 0, position.z]}>
      {/* Trunk */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.4, 3, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Foliage layers */}
      <mesh position={[0, 4, 0]} castShadow>
        <coneGeometry args={[2.2, 3, 8]} />
        <meshStandardMaterial color="#2d7d2d" />
      </mesh>
      <mesh position={[0, 5.2, 0]} castShadow>
        <coneGeometry args={[1.6, 2.5, 8]} />
        <meshStandardMaterial color="#339933" />
      </mesh>
      <mesh position={[0, 6.2, 0]} castShadow>
        <coneGeometry args={[1, 2, 8]} />
        <meshStandardMaterial color="#40b340" />
      </mesh>
    </group>
  );
}
