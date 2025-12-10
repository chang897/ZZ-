import React, { useLayoutEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CONFIG, COLORS } from '../constants';
import { TreeMorphState, ParticleData } from '../types';
import { easing } from 'maath';

interface LuxuryParticlesProps {
  mode: TreeMorphState;
}

const tempObject = new THREE.Object3D();
const tempColor = new THREE.Color();
const vec3A = new THREE.Vector3();
const vec3B = new THREE.Vector3();

export const LuxuryParticles: React.FC<LuxuryParticlesProps> = ({ mode }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Generate data once
  const data = useMemo(() => {
    const particles: ParticleData[] = [];
    const { particleCount, treeHeight, treeRadius, scatterRadius } = CONFIG;

    for (let i = 0; i < particleCount; i++) {
      // 1. Scatter Position (Random inside sphere)
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const r = Math.cbrt(Math.random()) * scatterRadius;
      
      const sx = r * Math.sin(phi) * Math.cos(theta);
      const sy = r * Math.sin(phi) * Math.sin(theta);
      const sz = r * Math.cos(phi);

      // 2. Tree Position (Cone Spiral)
      // Normalized height 0 (bottom) to 1 (top)
      const hNorm = Math.random(); 
      const y = (hNorm - 0.5) * treeHeight; // Centered vertically
      
      // Cone radius at this height (tapering to top)
      const currentRadius = (1 - hNorm) * treeRadius;
      
      // Spiral angle
      const angle = i * 0.5; // Golden angle-ish approximation creates nice distribution
      const tx = Math.cos(angle) * currentRadius;
      const tz = Math.sin(angle) * currentRadius;

      // Add some random jitter to tree position so it's not a perfect geometric cone
      const jitter = 0.3;
      
      particles.push({
        scatterPos: [sx, sy, sz],
        treePos: [tx + (Math.random()-0.5)*jitter, y, tz + (Math.random()-0.5)*jitter],
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
        scale: 0.5 + Math.random() * 0.8,
        colorType: Math.random() < CONFIG.goldRatio ? 'GOLD' : 'EMERALD'
      });
    }
    return particles;
  }, []);

  // Initialize Instance Colors and Transforms
  useLayoutEffect(() => {
    if (!meshRef.current) return;

    data.forEach((particle, i) => {
      // Set Color
      if (particle.colorType === 'GOLD') {
        // Vary gold shades slightly for richness
        tempColor.copy(Math.random() > 0.5 ? COLORS.gold : COLORS.goldDark);
      } else {
        tempColor.copy(Math.random() > 0.5 ? COLORS.emerald : COLORS.emeraldDark);
      }
      meshRef.current!.setColorAt(i, tempColor);
      
      // Initial Position (start at scatter)
      tempObject.position.set(...particle.scatterPos);
      tempObject.rotation.set(...particle.rotation);
      tempObject.scale.setScalar(particle.scale);
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [data]);

  // Animation Loop
  // We use a ref to track the current animation progress (0 = scattered, 1 = tree)
  const progress = useRef(0); 

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Target value based on state
    const target = mode === TreeMorphState.TREE_SHAPE ? 1 : 0;
    
    // Smooth transition using maath damping
    // The last argument is the 'smooth time'. Adjust for speed.
    easing.damp(progress, 'current', target, 1.5, delta);

    const t = progress.current;

    // If we are very close to the target and not moving much, we could optimize,
    // but for smooth floating effects, we keep calculating.

    data.forEach((particle, i) => {
      // Interpolate position
      vec3A.set(...particle.scatterPos);
      vec3B.set(...particle.treePos);
      
      // Add a slight "curl" or noise to the motion path for cinematic feel
      // Simple arc: lift y slightly during transition
      const midPointY = (vec3A.y + vec3B.y) / 2 + 5 * Math.sin(t * Math.PI);
      
      // Linear interpolation for base
      const x = THREE.MathUtils.lerp(vec3A.x, vec3B.x, t);
      const z = THREE.MathUtils.lerp(vec3A.z, vec3B.z, t);
      
      // Custom Y interpolation with a slight curve if t is in the middle (optional, keeping simple lerp for stability here)
      // Actually, standard Lerp is more predictable for a shape formation
      const y = THREE.MathUtils.lerp(vec3A.y, vec3B.y, t);

      // Rotate the object slowly for liveliness
      const time = state.clock.getElapsedTime();
      
      // In Tree mode, particles float slightly in place
      const hoverY = mode === TreeMorphState.TREE_SHAPE 
        ? Math.sin(time * 2 + i) * 0.1 
        : Math.sin(time * 0.5 + i) * 0.5; // Wider float in scatter

      tempObject.position.set(x, y + hoverY, z);
      
      // Rotation interpolation
      // Spin faster when scattered, stabilize when tree
      const rotSpeed = mode === TreeMorphState.TREE_SHAPE ? 0.2 : 0.5;
      tempObject.rotation.set(
        particle.rotation[0] + time * rotSpeed,
        particle.rotation[1] + time * rotSpeed,
        particle.rotation[2]
      );
      
      tempObject.scale.setScalar(particle.scale * (1 + Math.sin(time * 3 + i) * 0.1)); // Pulse scale slightly

      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, CONFIG.particleCount]}
      castShadow
      receiveShadow
    >
      {/* 
        Using a Tetrahedron for a sharp, jewel-like "shard" look. 
        Better than a Box for luxury aesthetic. 
      */}
      <tetrahedronGeometry args={[0.15, 0]} />
      <meshStandardMaterial
        roughness={0.1}
        metalness={1.0}
        envMapIntensity={2.5}
      />
    </instancedMesh>
  );
};
