import React, { useState } from 'react';
import Grid from './components/Grid';
import StartupScreen from './components/StartupScreen';

function App() {
  const [gameState, setGameState] = useState('startup'); // 'startup' | 'playing'
  const [gameConfig, setGameConfig] = useState({
    videoSrc: null,
    rows: 3,
    cols: 3,
  });

  const handleStartGame = (videoSrc, rows, cols) => {
    setGameConfig({ videoSrc, rows, cols });
    setGameState('playing');
  };

  const handleReset = () => {
    setGameState('startup');
    setGameConfig({ videoSrc: null, rows: 4, cols: 4 });
  };

  return (
    <div className="App">
      {gameState === 'startup' ? (
        <StartupScreen onStart={handleStartGame} />
      ) : (
        <div className="relative">
          <Grid
            videoSrc={gameConfig.videoSrc}
            rows={gameConfig.rows}
            cols={gameConfig.cols}
          />
          <button
            onClick={handleReset}
            className="fixed top-4 right-4 px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg backdrop-blur-sm z-50 transition-colors"
          >
            Exit Game
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
