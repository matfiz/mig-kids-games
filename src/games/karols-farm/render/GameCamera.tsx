'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGameStore } from '@/games/karols-farm/store/gameStore';
import * as THREE from 'three';

export function GameCamera() {
  const { camera, gl } = useThree();
  const orbitAngle = useRef(0);
  const orbitTilt = useRef(0.6);
  const distance = useRef(14);
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  // Handle mouse drag for camera rotation
  useEffect(() => {
    const canvas = gl.domElement;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button === 0 || e.button === 2) {
        isDragging.current = true;
        lastMouse.current = { x: e.clientX, y: e.clientY };
      }
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      orbitAngle.current -= dx * 0.005;
      orbitTilt.current = Math.max(0.2, Math.min(1.2, orbitTilt.current + dy * 0.005));
      lastMouse.current = { x: e.clientX, y: e.clientY };
    };
    const onPointerUp = () => { isDragging.current = false; };
    const onWheel = (e: WheelEvent) => {
      distance.current = Math.max(6, Math.min(30, distance.current + e.deltaY * 0.01));
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('wheel', onWheel);

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('wheel', onWheel);
    };
  }, [gl]);

  useFrame(() => {
    const state = useGameStore.getState();
    const keys = (window as unknown as Record<string, Set<string>>).__karolsFarmKeys as Set<string> | undefined;
    if (keys) {
      if (keys.has('ArrowLeft')) orbitAngle.current += 0.03;
      if (keys.has('ArrowRight')) orbitAngle.current -= 0.03;
      if (keys.has('ArrowUp')) orbitTilt.current = Math.max(0.2, orbitTilt.current - 0.02);
      if (keys.has('ArrowDown')) orbitTilt.current = Math.min(1.2, orbitTilt.current + 0.02);
    }

    const d = distance.current;
    const angle = orbitAngle.current;
    const tilt = orbitTilt.current;

    const px = state.player.x;
    const pz = state.player.z;

    const camX = px + Math.sin(angle) * Math.cos(tilt) * d;
    const camY = Math.sin(tilt) * d;
    const camZ = pz + Math.cos(angle) * Math.cos(tilt) * d;

    camera.position.lerp(new THREE.Vector3(camX, camY, camZ), 0.08);
    camera.lookAt(new THREE.Vector3(px, 1.2, pz));
  });

  return null;
}
