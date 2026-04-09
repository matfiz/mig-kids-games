'use client';

interface Props {
  x1: number;
  z1: number;
  x2: number;
  z2: number;
}

export function PathModel({ x1, z1, x2, z2 }: Props) {
  const cx = (x1 + x2) / 2;
  const cz = (z1 + z2) / 2;
  const dx = x2 - x1;
  const dz = z2 - z1;
  const len = Math.sqrt(dx * dx + dz * dz);
  const angle = Math.atan2(dx, dz);

  return (
    <mesh
      position={[cx, 0.02, cz]}
      rotation={[- Math.PI / 2, 0, -angle]}
      receiveShadow
    >
      <planeGeometry args={[2, len]} />
      <meshStandardMaterial color="#c4a96a" />
    </mesh>
  );
}
