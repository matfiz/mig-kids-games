'use client';

import { HOUSE } from '../../core/config';

export function HouseModel() {
  const { position, width, depth, height } = HOUSE;

  return (
    <group position={[position.x, 0, position.z]}>
      {/* Main building */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#fff5e6" />
      </mesh>

      {/* Roof */}
      <mesh position={[0, height + 1.5, 0]} castShadow>
        <coneGeometry args={[width * 0.8, 3, 4]} />
        <meshStandardMaterial color="#c0392b" />
      </mesh>

      {/* Door */}
      <mesh position={[0, 1.5, depth / 2 + 0.01]}>
        <boxGeometry args={[1.5, 3, 0.1]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>

      {/* Windows */}
      {[-3, 3].map((x) => (
        <mesh key={x} position={[x, height * 0.6, depth / 2 + 0.01]}>
          <boxGeometry args={[1.5, 1.5, 0.1]} />
          <meshStandardMaterial color="#87CEEB" emissive="#87CEEB" emissiveIntensity={0.2} />
        </mesh>
      ))}

      {/* Porch floor */}
      <mesh position={[0, 0.1, depth / 2 + 2.5]} receiveShadow>
        <boxGeometry args={[width + 2, 0.2, 5]} />
        <meshStandardMaterial color="#deb887" />
      </mesh>

      {/* Porch columns */}
      {[-5, 5].map((x) => (
        <mesh key={x} position={[x, 2, depth / 2 + 4.5]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 4, 8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}

      {/* Porch roof */}
      <mesh position={[0, 4, depth / 2 + 2.5]}>
        <boxGeometry args={[width + 2.5, 0.2, 5.5]} />
        <meshStandardMaterial color="#a0522d" />
      </mesh>

      {/* Chimney */}
      <mesh position={[3, height + 2, -1]} castShadow>
        <boxGeometry args={[1, 3, 1]} />
        <meshStandardMaterial color="#cc6633" />
      </mesh>
    </group>
  );
}
