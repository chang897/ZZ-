import React, { useState, useCallback } from 'react';
import { Scene } from './components/Scene';
import { UIOverlay } from './components/UIOverlay';
import { TreeMorphState } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<TreeMorphState>(TreeMorphState.SCATTERED);

  const toggleMode = useCallback(() => {
    setMode((prev) => 
      prev === TreeMorphState.TREE_SHAPE 
        ? TreeMorphState.SCATTERED 
        : TreeMorphState.TREE_SHAPE
    );
  }, []);

  return (
    <div className="relative w-full h-screen bg-[#000502]">
      <Scene mode={mode} />
      <UIOverlay mode={mode} onToggle={toggleMode} />
    </div>
  );
};

export default App;
