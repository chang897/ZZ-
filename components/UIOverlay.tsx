import React from 'react';
import { TreeMorphState } from '../types';

interface UIOverlayProps {
  mode: TreeMorphState;
  onToggle: () => void;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({ mode, onToggle }) => {
  const isTree = mode === TreeMorphState.TREE_SHAPE;

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col justify-between p-8 z-10">
      {/* Header */}
      <header className="flex flex-col items-center mt-4">
        <h1 className="font-serif text-3xl md:text-5xl text-yellow-500 tracking-widest uppercase drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
          Arix Signature
        </h1>
        <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-yellow-600 to-transparent my-4"></div>
        <p className="font-sans text-xs md:text-sm text-emerald-200 tracking-[0.2em] opacity-80">
          THE INTERACTIVE HOLIDAY COLLECTION
        </p>
      </header>

      {/* Controls */}
      <div className="flex flex-col items-center mb-12 pointer-events-auto">
        <div className="backdrop-blur-md bg-black/30 border border-white/10 p-1 rounded-full shadow-2xl transition-transform duration-500 hover:scale-105">
          <button
            onClick={onToggle}
            className={`
              relative overflow-hidden px-10 py-4 rounded-full font-serif text-lg tracking-widest transition-all duration-700
              ${isTree 
                ? 'bg-gradient-to-r from-yellow-700 to-yellow-500 text-black shadow-[0_0_30px_rgba(255,215,0,0.4)]' 
                : 'bg-transparent text-yellow-500 hover:bg-white/5 border border-yellow-500/30'
              }
            `}
          >
            <span className="relative z-10 font-bold">
              {isTree ? "RELEASE MAGIC" : "ASSEMBLE TREE"}
            </span>
          </button>
        </div>
        
        <div className="mt-4 text-emerald-500/50 text-[10px] font-mono tracking-widest">
           {isTree ? "STATUS: CONVERGED" : "STATUS: SCATTERED"}
        </div>
      </div>
    </div>
  );
};
