'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/games/karols-farm/store/gameStore';
import { SEED_LIST } from '@/games/karols-farm/core/data/seeds';
import { TREE_LIST } from '@/games/karols-farm/core/data/trees';

export function useKeyboardInput() {
  const keysRef = useRef(new Set<string>());

  useEffect(() => {
    // Expose keys for camera system
    (window as unknown as Record<string, unknown>).__karolsFarmKeys = keysRef.current;

    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);

      const store = useGameStore.getState();

      // Skip if modals open (except ESC)
      if (e.key === 'Escape') {
        if (store.shopOpen) useGameStore.getState().toggleShop();
        else if (store.helpOpen) useGameStore.getState().toggleHelp();
        return;
      }

      if (store.shopOpen || store.helpOpen) return;

      switch (e.key.toLowerCase()) {
        case 'e':
        case ' ':
          e.preventDefault();
          store.performAction();
          break;
        case 'q':
          store.toggleShop();
          break;
        case 'p':
          store.toggleHelp();
          break;
        case 'r':
          store.massHarvest();
          break;
        case 'b':
          store.goToSleep();
          break;
        case '1': case '2': case '3': case '4':
        case '5': case '6': case '7': case '8': {
          const idx = parseInt(e.key) - 1;
          if (idx < SEED_LIST.length) {
            store.selectSeed(SEED_LIST[idx].id);
          }
          break;
        }
        case '9': case '0': {
          const treeIdx = e.key === '9' ? 0 : 1;
          if (treeIdx < TREE_LIST.length) {
            store.selectTree(TREE_LIST[treeIdx].id);
          }
          break;
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      delete (window as unknown as Record<string, unknown>).__karolsFarmKeys;
    };
  }, []);

  return keysRef;
}
