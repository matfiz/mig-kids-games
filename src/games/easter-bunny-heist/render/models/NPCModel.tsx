'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { NPC } from '../../core/types';

interface Props {
  npc: NPC;
}

const STATE_COLORS: Record<string, string> = {
  patrol: '#66bb6a',
  suspicious: '#ffa726',
  alert: '#ef5350',
  chase: '#d32f2f',
};

export function NPCModel({ npc }: Props) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.position.set(npc.position.x, 0, npc.position.z);
    const angle = Math.atan2(npc.facing.x, npc.facing.z);
    groupRef.current.rotation.y = angle;
  });

  const color = '#' + npc.config.color.toString(16).padStart(6, '0');
  const stateColor = STATE_COLORS[npc.state] || '#66bb6a';
  const isAlert = npc.state === 'alert' || npc.state === 'chase';

  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <capsuleGeometry args={[0.4, 0.8, 6, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <sphereGeometry args={[0.35, 8, 8]} />
        <meshStandardMaterial color="#ffe0bd" />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.1, 1.85, 0.3]}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0.1, 1.85, 0.3]}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      {/* State indicator (floating dot above head) */}
      <mesh position={[0, 2.4, 0]}>
        <sphereGeometry args={[0.12, 6, 6]} />
        <meshStandardMaterial
          color={stateColor}
          emissive={stateColor}
          emissiveIntensity={isAlert ? 0.8 : 0.3}
        />
      </mesh>

      {/* Alert exclamation mark */}
      {isAlert && (
        <mesh position={[0, 2.7, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.3, 6]} />
          <meshStandardMaterial
            color="#ef5350"
            emissive="#ef5350"
            emissiveIntensity={1}
          />
        </mesh>
      )}

      {/* Grandma specific: hair bun */}
      {npc.type === 'grandma' && (
        <mesh position={[0, 2.1, -0.15]}>
          <sphereGeometry args={[0.2, 6, 6]} />
          <meshStandardMaterial color="#d4d4d4" />
        </mesh>
      )}

      {/* Kid specific: cap */}
      {npc.type === 'kid' && (
        <mesh position={[0, 2.05, 0.08]} rotation={[-0.2, 0, 0]}>
          <cylinderGeometry args={[0.35, 0.38, 0.15, 8]} />
          <meshStandardMaterial color="#ef5350" />
        </mesh>
      )}

      {/* Dad specific: wider shoulders */}
      {npc.type === 'dad' && (
        <mesh position={[0, 1.35, 0]} castShadow>
          <boxGeometry args={[1, 0.3, 0.5]} />
          <meshStandardMaterial color={color} />
        </mesh>
      )}

      {/* Vision cone visualization (debug-ish, subtle) */}
      {npc.state !== 'patrol' && (
        <mesh position={[0, 0.3, 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[1.5, 4, 8, 1, true]} />
          <meshStandardMaterial
            color={stateColor}
            transparent
            opacity={0.08}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}
