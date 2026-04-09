'use client';

import { useRef, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { WORLD, HOUSE } from '../core/config';

const MAP_SIZE = 140;
const HALF_WORLD = WORLD.halfSize;

function worldToMap(x: number, z: number): [number, number] {
  return [
    ((x + HALF_WORLD) / WORLD.size) * MAP_SIZE,
    ((z + HALF_WORLD) / WORLD.size) * MAP_SIZE,
  ];
}

export function Minimap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const screen = useGameStore((s) => s.screen);

  useEffect(() => {
    if (screen !== 'playing') return;
    let animId: number;

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const store = useGameStore.getState();

      // Background
      ctx.fillStyle = '#4a8c3f';
      ctx.fillRect(0, 0, MAP_SIZE, MAP_SIZE);

      // Border
      ctx.strokeStyle = '#8B4513';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, MAP_SIZE, MAP_SIZE);

      // Paths
      ctx.strokeStyle = '#c4a96a';
      ctx.lineWidth = 2;
      for (const p of store.paths) {
        const [x1, z1] = worldToMap(p.x1, p.z1);
        const [x2, z2] = worldToMap(p.x2, p.z2);
        ctx.beginPath();
        ctx.moveTo(x1, z1);
        ctx.lineTo(x2, z2);
        ctx.stroke();
      }

      // House
      const [hx, hz] = worldToMap(HOUSE.position.x, HOUSE.position.z);
      ctx.fillStyle = '#fff5e6';
      ctx.fillRect(hx - 6, hz - 4, 12, 8);
      ctx.strokeStyle = '#c0392b';
      ctx.strokeRect(hx - 6, hz - 4, 12, 8);

      // Obstacles (trees, bushes)
      for (const obs of store.obstacles) {
        if (obs.type === 'fence') continue;
        const [ox, oz] = worldToMap(obs.position.x, obs.position.z);
        if (obs.type === 'tree') {
          ctx.fillStyle = '#2d7d2d';
          ctx.beginPath();
          ctx.arc(ox, oz, 3, 0, Math.PI * 2);
          ctx.fill();
        } else if (obs.type === 'bush') {
          ctx.fillStyle = '#3a9a3a';
          ctx.beginPath();
          ctx.arc(ox, oz, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Delivery points
      for (const dp of store.deliveryPoints) {
        const [dx, dz] = worldToMap(dp.position.x, dp.position.z);
        ctx.fillStyle = dp.delivered ? '#66bb6a' : '#42a5f5';
        ctx.beginPath();
        ctx.arc(dx, dz, 3, 0, Math.PI * 2);
        ctx.fill();
        if (!dp.delivered) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Eggs
      const eggColors: Record<string, string> = {
        gold: '#ffd700',
        blue: '#42a5f5',
        green: '#66bb6a',
        pink: '#f48fb1',
      };
      for (const egg of store.eggs) {
        if (egg.collected) continue;
        const [ex, ez] = worldToMap(egg.position.x, egg.position.z);
        ctx.fillStyle = eggColors[egg.type] || '#fff';
        ctx.beginPath();
        ctx.arc(ex, ez, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // NPCs
      const npcStateColors: Record<string, string> = {
        patrol: '#66bb6a',
        suspicious: '#ffa726',
        alert: '#ef5350',
        chase: '#d32f2f',
      };
      for (const npc of store.npcs) {
        const [nx, nz] = worldToMap(npc.position.x, npc.position.z);
        ctx.fillStyle = npcStateColors[npc.state] || '#999';
        ctx.beginPath();
        ctx.arc(nx, nz, 3, 0, Math.PI * 2);
        ctx.fill();

        // Facing direction
        const angle = Math.atan2(npc.facing.x, npc.facing.z);
        const lineLen = 5;
        ctx.strokeStyle = npcStateColors[npc.state] || '#999';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(nx, nz);
        ctx.lineTo(
          nx + Math.sin(angle) * lineLen,
          nz + Math.cos(angle) * lineLen,
        );
        ctx.stroke();
      }

      // Player
      const [px, pz] = worldToMap(store.player.position.x, store.player.position.z);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(px, pz, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Player facing direction
      const pAngle = store.player.rotation;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px, pz);
      ctx.lineTo(
        px + Math.sin(pAngle) * 6,
        pz + Math.cos(pAngle) * 6,
      );
      ctx.stroke();

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [screen]);

  if (screen !== 'playing') return null;

  return (
    <div className="absolute bottom-3 right-3 opacity-80" data-ui>
      <canvas
        ref={canvasRef}
        width={MAP_SIZE}
        height={MAP_SIZE}
        className="rounded-xl border-2 border-white/30"
        style={{ width: MAP_SIZE, height: MAP_SIZE }}
      />
    </div>
  );
}
