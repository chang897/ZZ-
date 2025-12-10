import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls, ContactShadows, Float, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { LuxuryParticles } from './LuxuryParticles';
import { TreeMorphState } from '../types';
import { COLORS } from '../constants';
import * as THREE from 'three';

interface SceneProps {
  mode: TreeMorphState;
}

const Rig = () => {
  useFrame((state) => {
    // Subtle mouse parallax
    state.camera.position.lerp(
      new THREE.Vector3(
        state.pointer.x * 2, 
        state.pointer.y * 2 + 2, // Slight offset Y
        20 // Base Z distance
      ), 
      0.02
    );
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

export const Scene: React.FC<SceneProps> = ({ mode }) => {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 0, 20], fov: 45 }}
      gl={{ 
        antialias: false, 
        toneMapping: THREE.ReinhardToneMapping, 
        toneMappingExposure: 1.5,
        alpha: false 
      }}
    >
      {/* Background */}
      <color attach="background" args={[COLORS.bg]} />
      
      {/* Lighting */}
      <ambientLight intensity={0.5} color="#ffffff" />
      <spotLight 
        position={[10, 10, 10]} 
        angle={0.5} 
        penumbra={1} 
        intensity={20} 
        color={COLORS.gold} 
        castShadow 
        shadow-bias={-0.0001}
      />
      <pointLight position={[-10, -5, -10]} intensity={10} color={COLORS.emerald} />
      
      {/* Environment Map for metallic reflections */}
      <Environment preset="city" />

      {/* Main Content */}
      <group position={[0, -1, 0]}>
         {/* Particles */}
         <LuxuryParticles mode={mode} />
         
         {/* Extra Atmosphere */}
         <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
            <Sparkles 
              count={200} 
              scale={12} 
              size={4} 
              speed={0.4} 
              opacity={0.5} 
              color={COLORS.gold} 
            />
         </Float>
      </group>

      {/* Floor Shadows */}
      <ContactShadows 
        resolution={1024} 
        scale={50} 
        blur={2} 
        opacity={0.5} 
        far={10} 
        color="#000000" 
      />

      {/* Camera Controller (Interactive but damped) */}
      <OrbitControls 
        enablePan={false} 
        enableZoom={true} 
        minPolarAngle={Math.PI / 3} 
        maxPolarAngle={Math.PI / 1.8}
        minDistance={10}
        maxDistance={30}
      />
      
      {/* Disable Rig if user is controlling orbit, usually Rig conflicts with OrbitControls 
          unless managed carefully. Let's rely on OrbitControls autoRotate for cinematic feel if idle.
      */}
      <OrbitControls 
        makeDefault 
        autoRotate 
        autoRotateSpeed={0.5}
        enableDamping
        dampingFactor={0.05}
      />

      {/* Post Processing */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={1.2} 
          mipmapBlur 
          intensity={1.5} 
          radius={0.6}
        />
        <Vignette eskil={false} offset={0.1} darkness={0.6} />
        <Noise opacity={0.02} /> 
      </EffectComposer>
    </Canvas>
  );
};
