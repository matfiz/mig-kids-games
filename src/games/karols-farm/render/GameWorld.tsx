'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@/games/karols-farm/store/gameStore';
import { SEEDS } from '@/games/karols-farm/core/data/seeds';
import { BUILDINGS } from '@/games/karols-farm/core/data/world';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

// Color mappings
const SEED_COLORS: Record<string, string> = {
  apple: '#ff3333',
  carrot: '#ff8800',
  tomato: '#ff4444',
  corn: '#ffcc00',
  strawberry: '#ff3366',
  pumpkin: '#ff8833',
  grape: '#9933ff',
  melon: '#33cc66',
};

const TREE_CANOPY_COLORS: Record<string, string> = {
  appleTree: '#228B22',
  cherryTree: '#DC143C',
  orangeTree: '#FF8C00',
  lemonTree: '#FFD700',
};

const SEASON_GROUND_COLORS = ['#4a7c3f', '#3d8c2a', '#7a6b3a', '#8a8a8a'];
const SEASON_TREE_TINT = ['#22aa22', '#228822', '#aa8833', '#889988'];

function PlayerModel() {
  const meshRef = useRef<THREE.Group>(null);
  const bobTimer = useRef(0);

  useFrame((_, delta) => {
    const state = useGameStore.getState();
    if (!meshRef.current) return;
    meshRef.current.position.set(state.player.x, 0, state.player.z);
    meshRef.current.rotation.y = state.player.direction;
    bobTimer.current += delta * 5;
    meshRef.current.position.y = Math.sin(bobTimer.current) * 0.05;
  });

  return (
    <group ref={meshRef}>
      {/* Body */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <capsuleGeometry args={[0.25, 0.5, 8, 16]} />
        <meshStandardMaterial color="#4488ff" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.35, 0]} castShadow>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#ffcc88" />
      </mesh>
      {/* Hat */}
      <mesh position={[0, 1.55, 0]} castShadow>
        <coneGeometry args={[0.25, 0.3, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0, 1.45, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.05, 16]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
    </group>
  );
}

function WorkerModel({ workerId }: { workerId: number }) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const state = useGameStore.getState();
    const worker = state.workers[workerId];
    if (!meshRef.current || !worker) return;
    meshRef.current.position.set(worker.x, 0, worker.z);
  });

  const color = useGameStore((s) => s.workers[workerId]?.color ?? '#ffffff');

  return (
    <group ref={meshRef}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <capsuleGeometry args={[0.2, 0.4, 8, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 1.1, 0]} castShadow>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#ffcc88" />
      </mesh>
    </group>
  );
}

function PlotMesh({ fieldId, plotIndex }: { fieldId: number; plotIndex: number }) {
  const plantRef = useRef<THREE.Group>(null);

  const { plot, season } = useGameStore((s) => {
    const field = s.fields.find(f => f.id === fieldId);
    return { plot: field?.plots[plotIndex], season: s.season };
  });

  if (!plot) return null;

  const groundColor = plot.watered ? '#553322' : '#886644';

  return (
    <group position={[plot.x + 0.5, 0, plot.y + 0.5]}>
      {/* Plot ground */}
      <mesh position={[0, 0.01, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.9, 0.9]} />
        <meshStandardMaterial color={groundColor} />
      </mesh>

      {/* Plant */}
      {plot.plant && (
        <group ref={plantRef}>
          {/* Stem */}
          <mesh position={[0, 0.15 * (plot.growthProgress || 0.1), 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.04, 0.3 * (plot.growthProgress || 0.1), 8]} />
            <meshStandardMaterial color="#33aa33" />
          </mesh>
          {/* Fruit (when grown or growing) */}
          {plot.growthProgress > 0.3 && (
            <mesh position={[0, 0.3 * plot.growthProgress + 0.1, 0]} castShadow>
              <sphereGeometry args={[0.12 * plot.growthProgress, 12, 12]} />
              <meshStandardMaterial
                color={plot.isGolden ? '#FFD700' : (SEED_COLORS[plot.plant] || '#33cc33')}
                emissive={plot.isGolden ? '#FFD700' : '#000000'}
                emissiveIntensity={plot.isGolden ? 0.5 : 0}
              />
            </mesh>
          )}
          {/* Golden glow */}
          {plot.isGolden && plot.isGrown && (
            <pointLight position={[0, 0.5, 0]} color="#FFD700" intensity={0.8} distance={2} />
          )}
        </group>
      )}

      {/* Tree */}
      {plot.tree && (
        <group>
          {/* Trunk */}
          <mesh position={[0, 0.4 * (plot.growthProgress || 0.1), 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.1, 0.8 * (plot.growthProgress || 0.1), 8]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          {/* Canopy */}
          {plot.growthProgress > 0.3 && (
            <mesh position={[0, 0.8 * plot.growthProgress + 0.2, 0]} castShadow>
              <sphereGeometry args={[0.4 * plot.growthProgress, 12, 12]} />
              <meshStandardMaterial
                color={TREE_CANOPY_COLORS[plot.tree] || SEASON_TREE_TINT[season]}
              />
            </mesh>
          )}
        </group>
      )}
    </group>
  );
}

function FieldMesh({ fieldId }: { fieldId: number }) {
  const field = useGameStore((s) => s.fields.find(f => f.id === fieldId));
  if (!field || !field.owned) return null;

  return (
    <group>
      {/* Field border */}
      <mesh
        position={[field.x + field.width / 2, 0.005, field.y + field.height / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[field.width + 0.1, field.height + 0.1]} />
        <meshStandardMaterial color="#664422" />
      </mesh>
      {field.plots.map((_, i) => (
        <PlotMesh key={i} fieldId={fieldId} plotIndex={i} />
      ))}
    </group>
  );
}

function BuildingMesh({ building }: { building: typeof BUILDINGS[number] }) {
  const colors: Record<string, string> = {
    well: '#4488cc',
    market: '#cc8844',
    shop: '#44aa44',
    bed: '#8844aa',
  };

  const roofColors: Record<string, string> = {
    well: '#2266aa',
    market: '#aa6622',
    shop: '#228822',
    bed: '#662288',
  };

  return (
    <group position={[building.x + building.width / 2, 0, building.y + building.height / 2]}>
      {/* Base */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[building.width * 0.8, 1, building.height * 0.8]} />
        <meshStandardMaterial color={colors[building.id] || '#888888'} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 1.3, 0]} castShadow>
        <coneGeometry args={[building.width * 0.6, 0.8, 4]} />
        <meshStandardMaterial color={roofColors[building.id] || '#666666'} />
      </mesh>
      {/* Label */}
      <Html position={[0, 2.2, 0]} center distanceFactor={10} sprite>
        <div className="text-center pointer-events-none select-none">
          <div className="text-2xl">{building.emoji}</div>
          <div className="text-xs text-white font-bold" style={{ textShadow: '0 0 4px black' }}>
            {building.name}
          </div>
        </div>
      </Html>
    </group>
  );
}

function Ground() {
  const season = useGameStore((s) => s.season);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[9, -0.01, 9]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial color={SEASON_GROUND_COLORS[season]} />
    </mesh>
  );
}

function Path() {
  // Simple path between buildings and fields
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[9, 0.005, 3.5]} receiveShadow>
        <planeGeometry args={[16, 1.5]} />
        <meshStandardMaterial color="#c4a66a" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[5, 0.005, 5]} receiveShadow>
        <planeGeometry args={[1.5, 3]} />
        <meshStandardMaterial color="#c4a66a" />
      </mesh>
    </group>
  );
}

export function GameWorld() {
  const fields = useGameStore((s) => s.fields);
  const workerCount = useGameStore((s) => s.workers.length);

  return (
    <>
      <Ground />
      <Path />

      {/* Buildings */}
      {BUILDINGS.map((b) => (
        <BuildingMesh key={b.id} building={b} />
      ))}

      {/* Fields */}
      {fields.map((f) => (
        <FieldMesh key={f.id} fieldId={f.id} />
      ))}

      {/* Player */}
      <PlayerModel />

      {/* Workers */}
      {Array.from({ length: workerCount }, (_, i) => (
        <WorkerModel key={i} workerId={i} />
      ))}

      {/* Unowned field markers */}
      {fields.filter(f => !f.owned).map((f) => (
        <group key={`marker-${f.id}`} position={[f.x + f.width / 2, 0, f.y + f.height / 2]}>
          <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[f.width, f.height]} />
            <meshStandardMaterial color="#997755" transparent opacity={0.3} />
          </mesh>
          <Html position={[0, 0.5, 0]} center distanceFactor={10} sprite>
            <div className="text-white text-xs font-bold pointer-events-none select-none whitespace-nowrap" style={{ textShadow: '0 0 4px black' }}>
              🔒 Pole #{f.id}
            </div>
          </Html>
        </group>
      ))}
    </>
  );
}
