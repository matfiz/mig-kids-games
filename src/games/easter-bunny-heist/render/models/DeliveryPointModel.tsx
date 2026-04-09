'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { DeliveryPoint } from '../../core/types';

interface Props {
  point: DeliveryPoint;
}

export function DeliveryPointModel({ point }: Props) {
  const markerRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (point.delivered) return;
    const t = state.clock.elapsedTime;
    if (markerRef.current) {
      markerRef.current.position.y = 2 + Math.sin(t * 2) * 0.5;
      markerRef.current.rotation.y = t * 1.5;
      markerRef.current.rotation.x = t * 0.8;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.5;
    }
  });

  const color = point.delivered ? '#66bb6a' : '#42a5f5';
  const emissiveIntensity = point.delivered ? 0.2 : 0.6;

  return (
    <group position={[point.position.x, 0, point.position.z]}>
      {/* Ground ring */}
      <mesh ref={ringRef} rotation-x={-Math.PI / 2} position={[0, 0.05, 0]}>
        <ringGeometry args={[1.5, 2, 24]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={point.delivered ? 0.3 : 0.6}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Floating octahedron marker */}
      {!point.delivered && (
        <mesh ref={markerRef} castShadow>
          <octahedronGeometry args={[0.4, 0]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.5}
          />
        </mesh>
      )}

      {/* Light pillar */}
      {!point.delivered && (
        <mesh position={[0, 4, 0]}>
          <cylinderGeometry args={[0.15, 0.5, 8, 8]} />
          <meshStandardMaterial
            color={color}
            transparent
            opacity={0.1}
            emissive={color}
            emissiveIntensity={0.3}
          />
        </mesh>
      )}

      {/* Delivered checkmark placeholder */}
      {point.delivered && (
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.4, 8, 8]} />
          <meshStandardMaterial
            color="#66bb6a"
            emissive="#66bb6a"
            emissiveIntensity={0.3}
          />
        </mesh>
      )}
    </group>
  );
}
