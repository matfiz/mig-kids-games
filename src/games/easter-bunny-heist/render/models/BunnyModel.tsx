'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Player, BuffState } from '../../core/types';

interface Props {
  player: Player;
  buffs: BuffState;
}

export function BunnyModel({ player, buffs }: Props) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.position.set(
      player.position.x,
      player.position.y,
      player.position.z,
    );
    groupRef.current.rotation.y = player.rotation;
  });

  // Squash & stretch for hopping
  const hopY = Math.abs(Math.sin(player.hopPhase)) * 0.3;
  const squash = 1 + Math.sin(player.hopPhase) * 0.1;
  const stretch = 1 - Math.sin(player.hopPhase) * 0.05;

  const isInvisible = buffs.pink > 0;
  const isSpeed = buffs.gold > 0;
  const bodyColor = isInvisible ? '#c8e6ff' : '#ffffff';
  const opacity = isInvisible ? 0.4 : 1;

  return (
    <group ref={groupRef}>
      <group position={[0, hopY, 0]} scale={[stretch, squash, stretch]}>
        {/* Body */}
        <mesh position={[0, 0.7, 0]} castShadow>
          <sphereGeometry args={[0.6, 12, 10]} />
          <meshStandardMaterial
            color={bodyColor}
            transparent={isInvisible}
            opacity={opacity}
          />
        </mesh>

        {/* Head */}
        <mesh position={[0, 1.4, 0]} castShadow>
          <sphereGeometry args={[0.4, 10, 8]} />
          <meshStandardMaterial
            color={bodyColor}
            transparent={isInvisible}
            opacity={opacity}
          />
        </mesh>

        {/* Left ear */}
        <mesh position={[-0.12, 2.0, 0]} castShadow>
          <capsuleGeometry args={[0.08, 0.5, 4, 6]} />
          <meshStandardMaterial
            color={bodyColor}
            transparent={isInvisible}
            opacity={opacity}
          />
        </mesh>
        {/* Left ear inner (pink) */}
        <mesh position={[-0.12, 2.0, 0.02]}>
          <capsuleGeometry args={[0.05, 0.4, 4, 6]} />
          <meshStandardMaterial
            color="#ffb6c1"
            transparent={isInvisible}
            opacity={opacity}
          />
        </mesh>

        {/* Right ear */}
        <mesh position={[0.12, 2.0, 0]} castShadow>
          <capsuleGeometry args={[0.08, 0.5, 4, 6]} />
          <meshStandardMaterial
            color={bodyColor}
            transparent={isInvisible}
            opacity={opacity}
          />
        </mesh>
        {/* Right ear inner (pink) */}
        <mesh position={[0.12, 2.0, 0.02]}>
          <capsuleGeometry args={[0.05, 0.4, 4, 6]} />
          <meshStandardMaterial
            color="#ffb6c1"
            transparent={isInvisible}
            opacity={opacity}
          />
        </mesh>

        {/* Nose (pink) */}
        <mesh position={[0, 1.38, 0.38]}>
          <sphereGeometry args={[0.06, 6, 6]} />
          <meshStandardMaterial color="#ff69b4" />
        </mesh>

        {/* Eyes */}
        <mesh position={[-0.12, 1.48, 0.32]}>
          <sphereGeometry args={[0.05, 6, 6]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        <mesh position={[0.12, 1.48, 0.32]}>
          <sphereGeometry args={[0.05, 6, 6]} />
          <meshStandardMaterial color="#333333" />
        </mesh>

        {/* Tail */}
        <mesh position={[0, 0.6, -0.55]}>
          <sphereGeometry args={[0.15, 8, 6]} />
          <meshStandardMaterial
            color={bodyColor}
            transparent={isInvisible}
            opacity={opacity}
          />
        </mesh>

        {/* Front paws */}
        <mesh position={[-0.25, 0.15, 0.2]} castShadow>
          <sphereGeometry args={[0.12, 6, 6]} />
          <meshStandardMaterial
            color={bodyColor}
            transparent={isInvisible}
            opacity={opacity}
          />
        </mesh>
        <mesh position={[0.25, 0.15, 0.2]} castShadow>
          <sphereGeometry args={[0.12, 6, 6]} />
          <meshStandardMaterial
            color={bodyColor}
            transparent={isInvisible}
            opacity={opacity}
          />
        </mesh>

        {/* Back paws */}
        <mesh position={[-0.3, 0.1, -0.2]} castShadow>
          <sphereGeometry args={[0.15, 6, 6]} />
          <meshStandardMaterial
            color={bodyColor}
            transparent={isInvisible}
            opacity={opacity}
          />
        </mesh>
        <mesh position={[0.3, 0.1, -0.2]} castShadow>
          <sphereGeometry args={[0.15, 6, 6]} />
          <meshStandardMaterial
            color={bodyColor}
            transparent={isInvisible}
            opacity={opacity}
          />
        </mesh>

        {/* Speed buff glow */}
        {isSpeed && (
          <mesh position={[0, 0.7, 0]}>
            <sphereGeometry args={[0.9, 10, 8]} />
            <meshStandardMaterial
              color="#ffd700"
              transparent
              opacity={0.15}
              emissive="#ffd700"
              emissiveIntensity={0.5}
            />
          </mesh>
        )}
      </group>
    </group>
  );
}
