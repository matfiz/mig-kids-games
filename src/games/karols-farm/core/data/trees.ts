import type { TreeKey, TreeDef } from '../types';

export const TREES: Record<TreeKey, TreeDef> = {
  appleTree: {
    id: 'appleTree',
    name: 'Jabłoń',
    emoji: '\uD83C\uDF33\uD83C\uDF4E',
    cost: 525,
    growTime: 28,
    drops: 'apple',
    dropCount: 2,
    dropInterval: 12,
    hotkey: '9',
  },
  cherryTree: {
    id: 'cherryTree',
    name: 'Wiśnia',
    emoji: '\uD83C\uDF33\uD83C\uDF52',
    cost: 1050,
    growTime: 38,
    drops: 'strawberry',
    dropCount: 3,
    dropInterval: 14,
    hotkey: '0',
  },
  orangeTree: {
    id: 'orangeTree',
    name: 'Pomarańcza',
    emoji: '\uD83C\uDF33\uD83C\uDF4A',
    cost: 1800,
    growTime: 50,
    drops: 'tomato',
    dropCount: 3,
    dropInterval: 16,
    hotkey: null,
  },
  lemonTree: {
    id: 'lemonTree',
    name: 'Cytryna',
    emoji: '\uD83C\uDF33\uD83C\uDF4B',
    cost: 3750,
    growTime: 65,
    drops: 'melon',
    dropCount: 2,
    dropInterval: 20,
    hotkey: null,
  },
};

export const TREE_LIST: TreeDef[] = [
  TREES.appleTree,
  TREES.cherryTree,
  TREES.orangeTree,
  TREES.lemonTree,
];
