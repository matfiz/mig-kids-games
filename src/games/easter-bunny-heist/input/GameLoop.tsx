'use client';

import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useKeyboardInput } from './keyboard';
import { playSfx } from '../audio/AudioManager';

export function GameLoop() {
  const keysRef = useKeyboardInput();

  // Handle keyboard actions
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const store = useGameStore.getState();
      const key = e.key.toLowerCase();

      if (store.screen === 'playing') {
        if (key === ' ' || key === 'spacebar') {
          e.preventDefault();
          store.doJump();
          playSfx('jump');
        }
        if (key === 'e') {
          store.doInteract();
        }
        if (key === 'escape') {
          store.setScreen('paused');
        }
        if (key === 'p') {
          store.setScreen('help');
        }
      } else if (store.screen === 'paused') {
        if (key === 'escape') {
          store.setScreen('playing');
        }
      } else if (store.screen === 'help') {
        if (key === 'escape' || key === 'p') {
          store.setScreen('playing');
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Main game loop
  useEffect(() => {
    let animId: number;
    let lastHopTime = 0;

    const loop = () => {
      const now = Date.now();
      const store = useGameStore.getState();

      // Tick game logic
      store.tick(now);

      // Movement from keyboard
      if (store.screen === 'playing') {
        const keys = keysRef.current;
        let dx = 0;
        let dz = 0;

        if (keys.has('w') || keys.has('arrowup')) dz -= 1;
        if (keys.has('s') || keys.has('arrowdown')) dz += 1;
        if (keys.has('a') || keys.has('arrowleft')) dx -= 1;
        if (keys.has('d') || keys.has('arrowright')) dx += 1;

        // Add touch joystick input
        const touch = (window as unknown as Record<string, unknown>).__bunnyTouch as
          | { dx: number; dz: number }
          | undefined;
        if (touch) {
          dx += touch.dx;
          dz += touch.dz;
        }

        // Normalize
        const len = Math.sqrt(dx * dx + dz * dz);
        if (len > 1) {
          dx /= len;
          dz /= len;
        }

        store.setMovement(dx, dz);
        store.setSprinting(keys.has('shift'));
        store.setSneaking(keys.has('control'));

        // Hop sound effect
        if ((dx !== 0 || dz !== 0) && store.player.isGrounded) {
          const hopInterval = store.isSprinting ? 150 : 250;
          if (now - lastHopTime > hopInterval) {
            lastHopTime = now;
            playSfx('hop');
          }
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [keysRef]);

  return null;
}
