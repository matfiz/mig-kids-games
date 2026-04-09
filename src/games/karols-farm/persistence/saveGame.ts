import type { GameState } from '@/games/karols-farm/core/types';

const SAVE_KEY = 'karols-farm-save';

interface SaveData {
  version: string;
  timestamp: number;
  state: Partial<GameState>;
}

export function saveGame(state: Partial<GameState>): boolean {
  try {
    const saveData: SaveData = {
      version: '1.0',
      timestamp: Date.now(),
      state,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    return true;
  } catch {
    return false;
  }
}

export function loadGame(): Partial<GameState> | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const saveData: SaveData = JSON.parse(raw);
    if (saveData.version !== '1.0') return null;
    return saveData.state;
  } catch {
    return null;
  }
}

export function resetSave(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // ignore
  }
}

export function exportSave(): string | null {
  try {
    return localStorage.getItem(SAVE_KEY);
  } catch {
    return null;
  }
}

export function importSave(json: string): boolean {
  try {
    const parsed = JSON.parse(json);
    if (!parsed.version || !parsed.state) return false;
    localStorage.setItem(SAVE_KEY, json);
    return true;
  } catch {
    return false;
  }
}
