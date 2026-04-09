'use client';

import type { Vec3 } from '../../core/types';

interface Props {
  position: Vec3;
}

export function FenceModel({ position }: Props) {
  return (
    <group position={[position.x, 0, position.z]}>
      {/* Fence posts */}
      <mesh position={[-1.2, 0.5, 0]} castShadow>
        <boxGeometry args={[0.15, 1.2, 0.15]} />
        <meshStandardMaterial color="#deb887" />
      </mesh>
      <mesh position={[1.2, 0.5, 0]} castShadow>
        <boxGeometry args={[0.15, 1.2, 0.15]} />
        <meshStandardMaterial color="#deb887" />
      </mesh>

      {/* Horizontal bars */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[2.6, 0.12, 0.08]} />
        <meshStandardMaterial color="#d2b48c" />
      </mesh>
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[2.6, 0.12, 0.08]} />
        <meshStandardMaterial color="#d2b48c" />
      </mesh>
    </group>
  );
}
