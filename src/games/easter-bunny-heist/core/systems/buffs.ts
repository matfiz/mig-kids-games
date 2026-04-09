import type { BuffState, BuffType } from '../types';
import { BUFF_DURATION } from '../config';

export function activateBuff(buffs: BuffState, type: BuffType): BuffState {
  return {
    ...buffs,
    [type]: BUFF_DURATION,
  };
}

export function updateBuffs(buffs: BuffState, dt: number): BuffState {
  return {
    gold: Math.max(0, buffs.gold - dt),
    blue: Math.max(0, buffs.blue - dt),
    green: Math.max(0, buffs.green - dt),
    pink: Math.max(0, buffs.pink - dt),
  };
}

export function hasAnyBuff(buffs: BuffState): boolean {
  return buffs.gold > 0 || buffs.blue > 0 || buffs.green > 0 || buffs.pink > 0;
}

export function getBuffLabel(type: BuffType): string {
  switch (type) {
    case 'gold': return 'buff_gold';
    case 'blue': return 'buff_blue';
    case 'green': return 'buff_green';
    case 'pink': return 'buff_pink';
  }
}

export function getBuffColor(type: BuffType): string {
  switch (type) {
    case 'gold': return '#ffd700';
    case 'blue': return '#42a5f5';
    case 'green': return '#66bb6a';
    case 'pink': return '#f48fb1';
  }
}
