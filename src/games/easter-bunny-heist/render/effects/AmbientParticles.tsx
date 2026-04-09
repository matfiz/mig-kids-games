'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createRNG } from '../../core/math';

const PARTICLE_COUNT = 50;

// Pre-generate deterministic particle positions
const rng = createRNG(12345);
const INITIAL_POSITIONS = new Float32Array(PARTICLE_COUNT * 3);
for (let i = 0; i < PARTICLE_COUNT; i++) {
  INITIAL_POSITIONS[i * 3] = (rng() - 0.5) * 60;
  INITIAL_POSITIONS[i * 3 + 1] = rng() * 15 + 1;
  INITIAL_POSITIONS[i * 3 + 2] = (rng() - 0.5) * 60;
}

export function AmbientParticles() {
  const ref = useRef<THREE.Points>(null);
  const positions = INITIAL_POSITIONS;

  useFrame((state) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position;
    const arr = pos.array as Float32Array;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr[i * 3 + 1] += Math.sin(t + i) * 0.003;
      arr[i * 3] += Math.cos(t * 0.5 + i * 0.3) * 0.002;
      if (arr[i * 3 + 1] > 16) arr[i * 3 + 1] = 1;
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={PARTICLE_COUNT}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#fffde7"
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  );
}
