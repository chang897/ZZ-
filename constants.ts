import * as THREE from 'three';

// Visual Palette
export const COLORS = {
  bg: '#000502', // Very dark green/black
  gold: new THREE.Color('#FFD700').convertSRGBToLinear(),
  goldDark: new THREE.Color('#B8860B').convertSRGBToLinear(),
  emerald: new THREE.Color('#046307').convertSRGBToLinear(),
  emeraldDark: new THREE.Color('#002400').convertSRGBToLinear(),
};

// Logic Configuration
export const CONFIG = {
  particleCount: 2500,
  treeHeight: 9,
  treeRadius: 3.5,
  scatterRadius: 18,
  goldRatio: 0.6, // 60% gold, 40% emerald
};
