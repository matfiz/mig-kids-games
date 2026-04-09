'use client';

import { useGameStore } from '@/games/karols-farm/store/gameStore';
import { SEED_LIST } from '@/games/karols-farm/core/data/seeds';
import { TREE_LIST } from '@/games/karols-farm/core/data/trees';

export function SeedBar() {
  const selectedItem = useGameStore((s) => s.selectedItem);
  const selectionType = useGameStore((s) => s.selectionType);
  const selectSeed = useGameStore((s) => s.selectSeed);
  const selectTree = useGameStore((s) => s.selectTree);

  return (
    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 pointer-events-auto">
      <div className="flex gap-1 bg-black/60 backdrop-blur-sm rounded-lg p-1">
        {SEED_LIST.map((seed) => (
          <button
            key={seed.id}
            onClick={() => selectSeed(seed.id)}
            className={`w-10 h-10 flex items-center justify-center rounded text-lg transition-all
              ${selectedItem === seed.id && selectionType === 'seed'
                ? 'bg-green-500/80 ring-2 ring-white scale-110'
                : 'bg-white/10 hover:bg-white/20'
              }`}
            title={`${seed.name} (${seed.hotkey})`}
          >
            {seed.emoji}
          </button>
        ))}
        <div className="w-px bg-white/30 mx-1" />
        {TREE_LIST.map((tree) => (
          <button
            key={tree.id}
            onClick={() => selectTree(tree.id)}
            className={`w-10 h-10 flex items-center justify-center rounded text-lg transition-all
              ${selectedItem === tree.id && selectionType === 'tree'
                ? 'bg-green-500/80 ring-2 ring-white scale-110'
                : 'bg-white/10 hover:bg-white/20'
              }`}
            title={`${tree.name}${tree.hotkey ? ` (${tree.hotkey})` : ''}`}
          >
            {tree.emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
