'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function SkyDome() {
  return (
    <>
      {/* Sky sphere */}
      <mesh>
        <sphereGeometry args={[140, 16, 16]} />
        <meshBasicMaterial color="#87CEEB" side={THREE.BackSide} />
      </mesh>

      {/* Clouds */}
      <Clouds />
    </>
  );
}

function Clouds() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, dt) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += dt * 0.005;
    }
  });

  const clouds = [];
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const r = 80 + Math.sin(i * 7.3) * 20;
    const y = 35 + Math.sin(i * 3.7) * 8;
    const scale = 1.5 + Math.sin(i * 5.1) * 0.8;
    clouds.push(
      <Cloud key={i} position={[Math.cos(angle) * r, y, Math.sin(angle) * r]} scale={scale} />,
    );
  }

  return <group ref={groupRef}>{clouds}</group>;
}

function Cloud({ position, scale }: { position: [number, number, number]; scale: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[3, 8, 6]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.85} />
      </mesh>
      <mesh position={[2.5, -0.3, 0]}>
        <sphereGeometry args={[2.2, 8, 6]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.85} />
      </mesh>
      <mesh position={[-2.2, -0.2, 0.5]}>
        <sphereGeometry args={[2.5, 8, 6]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.85} />
      </mesh>
      <mesh position={[1, 0.8, -0.5]}>
        <sphereGeometry args={[2, 8, 6]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.85} />
      </mesh>
    </group>
  );
}
