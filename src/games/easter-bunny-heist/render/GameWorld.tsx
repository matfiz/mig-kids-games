'use client';

import { useGameStore } from '../store/gameStore';
import { WORLD, HOUSE } from '../core/config';
import { BunnyModel } from './models/BunnyModel';
import { NPCModel } from './models/NPCModel';
import { GiftModel } from './models/GiftModel';
import { DeliveryPointModel } from './models/DeliveryPointModel';
import { EggModel } from './models/EggModel';
import { HouseModel } from './models/HouseModel';
import { TreeModel } from './models/TreeModel';
import { BushModel } from './models/BushModel';
import { FenceModel } from './models/FenceModel';
import { FlowerModel } from './models/FlowerModel';
import { BenchModel } from './models/BenchModel';
import { BarrelModel } from './models/BarrelModel';
import { DecorativeEggModel } from './models/DecorativeEggModel';
import { PathModel } from './models/PathModel';
import { AmbientParticles } from './effects/AmbientParticles';

export function GameWorld() {
  const obstacles = useGameStore((s) => s.obstacles);
  const gifts = useGameStore((s) => s.gifts);
  const deliveryPoints = useGameStore((s) => s.deliveryPoints);
  const eggs = useGameStore((s) => s.eggs);
  const npcs = useGameStore((s) => s.npcs);
  const player = useGameStore((s) => s.player);
  const flowers = useGameStore((s) => s.flowers);
  const paths = useGameStore((s) => s.paths);
  const buffs = useGameStore((s) => s.buffs);

  // Ground
  const groundSize = WORLD.size + 20;

  return (
    <group>
      {/* Ground plane */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[groundSize, groundSize]} />
        <meshStandardMaterial color="#7ec850" />
      </mesh>

      {/* Paths */}
      {paths.map((p, i) => (
        <PathModel key={`path-${i}`} x1={p.x1} z1={p.z1} x2={p.x2} z2={p.z2} />
      ))}

      {/* House */}
      <HouseModel />

      {/* Obstacles */}
      {obstacles.map((obs, i) => {
        switch (obs.type) {
          case 'tree':
            return <TreeModel key={`tree-${i}`} position={obs.position} />;
          case 'bush':
            return <BushModel key={`bush-${i}`} position={obs.position} />;
          case 'bench':
            return <BenchModel key={`bench-${i}`} position={obs.position} />;
          case 'barrel':
            return <BarrelModel key={`barrel-${i}`} position={obs.position} />;
          case 'decorativeEgg':
            return <DecorativeEggModel key={`degg-${i}`} position={obs.position} />;
          case 'fence':
            return <FenceModel key={`fence-${i}`} position={obs.position} />;
          default:
            return null;
        }
      })}

      {/* Flowers */}
      {flowers.map((f, i) => (
        <FlowerModel key={`flower-${i}`} x={f.x} z={f.z} type={f.type} />
      ))}

      {/* Delivery points */}
      {deliveryPoints.map((dp) => (
        <DeliveryPointModel key={dp.id} point={dp} />
      ))}

      {/* Eggs */}
      {eggs.map((egg) =>
        egg.collected ? null : <EggModel key={egg.id} egg={egg} />,
      )}

      {/* Gifts (only show available ones on porch) */}
      {gifts.map((gift, i) =>
        gift.state === 'available' ? (
          <GiftModel key={gift.id} position={{ x: HOUSE.porchPosition.x - 2 + i * 0.8, y: 0.4, z: HOUSE.porchPosition.z }} />
        ) : null,
      )}

      {/* Player bunny */}
      <BunnyModel player={player} buffs={buffs} />

      {/* Carried gift (above bunny) */}
      {player.isCarrying && (
        <GiftModel
          position={{
            x: player.position.x,
            y: player.position.y + 2.2,
            z: player.position.z,
          }}
          small
        />
      )}

      {/* NPCs */}
      {npcs.map((npc) => (
        <NPCModel key={npc.id} npc={npc} />
      ))}

      {/* Ambient particles */}
      <AmbientParticles />
    </group>
  );
}
