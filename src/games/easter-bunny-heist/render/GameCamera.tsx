'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';

const CAM_DISTANCE = 22;
const CAM_HEIGHT = 14;
const CAM_LERP = 4;

export function GameCamera() {
  const { camera } = useThree();
  const angleRef = useRef(0);
  const pitchRef = useRef(0.3);
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0 || e.button === 2) {
        isDragging.current = true;
        lastMouse.current = { x: e.clientX, y: e.clientY };
      }
    };
    const onMouseUp = () => {
      isDragging.current = false;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const screen = useGameStore.getState().screen;
      if (screen !== 'playing') return;
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      lastMouse.current = { x: e.clientX, y: e.clientY };
      angleRef.current -= dx * 0.005;
      pitchRef.current = Math.max(0.05, Math.min(0.8, pitchRef.current + dy * 0.003));
    };
    const onContextMenu = (e: Event) => e.preventDefault();

    // Touch camera rotation (right side of screen)
    let touchId: number | null = null;
    const onTouchStart = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.clientX > window.innerWidth * 0.4 && touchId === null) {
          // Only use right side of screen touches that aren't on UI elements
          const target = touch.target as HTMLElement;
          if (target.closest?.('button') || target.closest?.('[data-ui]')) continue;
          touchId = touch.identifier;
          lastMouse.current = { x: touch.clientX, y: touch.clientY };
        }
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      const screen = useGameStore.getState().screen;
      if (screen !== 'playing') return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === touchId) {
          const dx = touch.clientX - lastMouse.current.x;
          const dy = touch.clientY - lastMouse.current.y;
          lastMouse.current = { x: touch.clientX, y: touch.clientY };
          angleRef.current -= dx * 0.008;
          pitchRef.current = Math.max(0.05, Math.min(0.8, pitchRef.current + dy * 0.005));
        }
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchId) {
          touchId = null;
        }
      }
    };

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('contextmenu', onContextMenu);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  useFrame((_, dt) => {
    const player = useGameStore.getState().player;
    const screen = useGameStore.getState().screen;
    if (screen !== 'playing') return;

    const angle = angleRef.current;
    const pitch = pitchRef.current;

    const targetX = player.position.x + Math.sin(angle) * CAM_DISTANCE;
    const targetZ = player.position.z + Math.cos(angle) * CAM_DISTANCE;
    const targetY = CAM_HEIGHT + pitch * 10;

    const t = 1 - Math.exp(-CAM_LERP * dt);
    camera.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), t);
    camera.lookAt(player.position.x, player.position.y + 1.5, player.position.z);
  });

  return null;
}
