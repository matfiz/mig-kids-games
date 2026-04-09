'use client';

export function GameLighting() {
  return (
    <>
      {/* Hemisphere light for ambient fill */}
      <hemisphereLight args={['#b0e0ff', '#8fbc8f', 0.6]} />

      {/* Main directional light (sun) */}
      <directionalLight
        position={[30, 40, 20]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={120}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        shadow-bias={-0.001}
      />

      {/* Soft fill light */}
      <ambientLight intensity={0.3} />
    </>
  );
}
