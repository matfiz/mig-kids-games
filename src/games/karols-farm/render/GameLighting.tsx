'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@/games/karols-farm/store/gameStore';
import * as THREE from 'three';

export function GameLighting() {
  const dirLightRef = useRef<THREE.DirectionalLight>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);

  useFrame(() => {
    const { time, weather } = useGameStore.getState();
    if (!dirLightRef.current || !hemiRef.current) return;

    // Sun position follows time of day
    const sunAngle = (time - 0.25) * Math.PI; // 0.25=sunrise, 0.75=sunset
    const sunX = Math.cos(sunAngle) * 20;
    const sunY = Math.sin(sunAngle) * 20;
    const sunZ = -10;

    dirLightRef.current.position.set(sunX, Math.max(sunY, 1), sunZ);

    // Light intensity based on time
    let intensity = Math.max(0.1, Math.sin(sunAngle));
    if (weather === 'storm') intensity *= 0.3;
    else if (weather === 'cloudy' || weather === 'fog') intensity *= 0.6;
    else if (weather === 'rain') intensity *= 0.5;

    dirLightRef.current.intensity = intensity * 1.5;
    hemiRef.current.intensity = 0.3 + intensity * 0.3;

    // Sky color by time
    const dayColor = new THREE.Color('#87CEEB');
    const sunsetColor = new THREE.Color('#FF6B35');
    const nightColor = new THREE.Color('#1a1a3e');

    let skyColor: THREE.Color;
    if (time < 0.3) skyColor = sunsetColor.lerp(dayColor, (time - 0.2) / 0.1);
    else if (time < 0.65) skyColor = dayColor;
    else if (time < 0.75) skyColor = dayColor.lerp(sunsetColor, (time - 0.65) / 0.1);
    else skyColor = sunsetColor.lerp(nightColor, (time - 0.75) / 0.2);

    if (weather === 'storm') skyColor.lerp(new THREE.Color('#2a2a3a'), 0.7);
    else if (weather === 'fog') skyColor.lerp(new THREE.Color('#cccccc'), 0.5);

    hemiRef.current.color.copy(skyColor);
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <hemisphereLight
        ref={hemiRef}
        args={['#87CEEB', '#556B2F', 0.5]}
      />
      <directionalLight
        ref={dirLightRef}
        position={[15, 20, -10]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
    </>
  );
}
