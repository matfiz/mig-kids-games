'use client';

import type { Vec3 } from '../../core/types';

interface Props {
  position: Vec3;
}

export function BushModel({ position }: Props) {
  return (
    <group position={[position.x, 0, position.z]}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <sphereGeometry args={[0.9, 8, 6]} />
        <meshStandardMaterial color="#3a9a3a" />
      </mesh>
      <mesh position={[0.5, 0.4, 0.3]} castShadow>
        <sphereGeometry args={[0.6, 8, 6]} />
        <meshStandardMaterial color="#45a845" />
      </mesh>
      <mesh position={[-0.4, 0.35, -0.2]} castShadow>
        <sphereGeometry args={[0.7, 8, 6]} />
        <meshStandardMaterial color="#2e8b2e" />
      </mesh>
    </group>
  );
}
