import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store';
import { PET_TYPES } from '../../constants';
import { soundManager } from '../../utils/sounds';

interface GameTile {
  id: number;
  petType: string;
  emoji: string;
  isMatched: boolean;
  isSelected: boolean;
}

const PikachuMatchGame: React.FC = () => {
  const { setMessage, completeMiniGame } = useGameStore();
  const [gameBoard, setGameBoard] = useState<GameTile[]>([]);
  const [selectedTiles, setSelectedTiles] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes

  const BOARD_SIZE = 8; // 8x8 grid
  const TOTAL_TILES = BOARD_SIZE * BOARD_SIZE;

  // Initialize game board
  const initializeBoard = useCallback(() => {
    const tiles: GameTile[] = [];
    const petKeys = Object.keys(PET_TYPES);
    let tileId = 0;

    // Create pairs of each pet type
    for (let i = 0; i < TOTAL_TILES / 2; i++) {
      const petType = petKeys[i % petKeys.length];
      const petData = PET_TYPES[petType];

      // Add two tiles of the same pet
      tiles.push({
        id: tileId++,
        petType,
        emoji: petData.emoji,
        isMatched: false,
        isSelected: false
      });
      tiles.push({
        id: tileId++,
        petType,
        emoji: petData.emoji,
        isMatched: false,
        isSelected: false
      });
    }

    // Shuffle the tiles
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }

    setGameBoard(tiles);
    setSelectedTiles([]);
    setScore(0);
    setMoves(0);
    setGameCompleted(false);
    setTimeLeft(120);
  }, []);

  // Start game
  const startGame = () => {
    setGameStarted(true);
    initializeBoard();
    soundManager.playGameStart();
  };

  // Check if path exists between two tiles (Pikachu-style logic)
  const canConnectTiles = (tile1: GameTile, tile2: GameTile): boolean => {
    if (tile1.id === tile2.id) return false;

    // Get positions
    const pos1 = getTilePosition(tile1.id);
    const pos2 = getTilePosition(tile2.id);

    if (!pos1 || !pos2) return false;

    // Check direct horizontal path
    if (pos1.row === pos2.row) {
      const startCol = Math.min(pos1.col, pos2.col);
      const endCol = Math.max(pos1.col, pos2.col);
      let clear = true;
      for (let col = startCol + 1; col < endCol; col++) {
        const tileId = pos1.row * BOARD_SIZE + col;
        const tile = gameBoard.find(t => t.id === tileId);
        if (tile && !tile.isMatched) {
          clear = false;
          break;
        }
      }
      if (clear) return true;
    }

    // Check direct vertical path
    if (pos1.col === pos2.col) {
      const startRow = Math.min(pos1.row, pos2.row);
      const endRow = Math.max(pos1.row, pos2.row);
      let clear = true;
      for (let row = startRow + 1; row < endRow; row++) {
        const tileId = row * BOARD_SIZE + pos1.col;
        const tile = gameBoard.find(t => t.id === tileId);
        if (tile && !tile.isMatched) {
          clear = false;
          break;
        }
      }
      if (clear) return true;
    }

    // Check L-shaped path (2-direction change)
    // Try going horizontally then vertically
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (col === pos1.col || col === pos2.col) continue;

      // Check if corner tiles are empty
      const corner1Id = pos1.row * BOARD_SIZE + col;
      const corner2Id = pos2.row * BOARD_SIZE + col;

      const corner1Tile = gameBoard.find(t => t.id === corner1Id);
      const corner2Tile = gameBoard.find(t => t.id === corner2Id);

      if ((corner1Tile?.isMatched !== false) && (corner2Tile?.isMatched !== false)) {
        // Check horizontal paths to corners
        const h1Clear = checkHorizontalPath(pos1.row, pos1.col, col);
        const h2Clear = checkHorizontalPath(pos2.row, pos2.col, col);

        // Check vertical paths from corners
        const v1Clear = checkVerticalPath(pos1.row, col, pos2.row);
        const v2Clear = checkVerticalPath(pos2.row, col, pos1.row);

        if ((h1Clear && v2Clear) || (h2Clear && v1Clear)) {
          return true;
        }
      }
    }

    // Try going vertically then horizontally
    for (let row = 0; row < BOARD_SIZE; row++) {
      if (row === pos1.row || row === pos2.row) continue;

      // Check if corner tiles are empty
      const corner1Id = row * BOARD_SIZE + pos1.col;
      const corner2Id = row * BOARD_SIZE + pos2.col;

      const corner1Tile = gameBoard.find(t => t.id === corner1Id);
      const corner2Tile = gameBoard.find(t => t.id === corner2Id);

      if ((corner1Tile?.isMatched !== false) && (corner2Tile?.isMatched !== false)) {
        // Check vertical paths to corners
        const v1Clear = checkVerticalPath(pos1.row, pos1.col, row);
        const v2Clear = checkVerticalPath(pos2.row, pos2.col, row);

        // Check horizontal paths from corners
        const h1Clear = checkHorizontalPath(row, pos1.col, pos2.col);
        const h2Clear = checkHorizontalPath(row, pos2.col, pos1.col);

        if ((v1Clear && h2Clear) || (v2Clear && h1Clear)) {
          return true;
        }
      }
    }

    return false;
  };

  // Helper function to get tile position
  const getTilePosition = (tileId: number) => {
    const index = gameBoard.findIndex(t => t.id === tileId);
    if (index === -1) return null;
    return {
      row: Math.floor(index / BOARD_SIZE),
      col: index % BOARD_SIZE
    };
  };

  // Helper function to check horizontal path
  const checkHorizontalPath = (row: number, startCol: number, endCol: number): boolean => {
    const minCol = Math.min(startCol, endCol);
    const maxCol = Math.max(startCol, endCol);

    for (let col = minCol; col <= maxCol; col++) {
      const tileId = row * BOARD_SIZE + col;
      const tile = gameBoard.find(t => t.id === tileId);
      if (tile && !tile.isMatched && tileId !== row * BOARD_SIZE + startCol && tileId !== row * BOARD_SIZE + endCol) {
        return false;
      }
    }
    return true;
  };

  // Helper function to check vertical path
  const checkVerticalPath = (startRow: number, col: number, endRow: number): boolean => {
    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);

    for (let row = minRow; row <= maxRow; row++) {
      const tileId = row * BOARD_SIZE + col;
      const tile = gameBoard.find(t => t.id === tileId);
      if (tile && !tile.isMatched && tileId !== startRow * BOARD_SIZE + col && tileId !== endRow * BOARD_SIZE + col) {
        return false;
      }
    }
    return true;
  };

  // Handle tile click
  const handleTileClick = (tileId: number) => {
    if (!gameStarted || gameCompleted) return;

    const tile = gameBoard.find(t => t.id === tileId);
    if (!tile || tile.isMatched || tile.isSelected) return;

    soundManager.playTileSelect();

    const newSelectedTiles = [...selectedTiles, tileId];
    setSelectedTiles(newSelectedTiles);

    // Update tile selection state
    setGameBoard(prev => prev.map(t =>
      t.id === tileId ? { ...t, isSelected: true } : t
    ));

    if (newSelectedTiles.length === 2) {
      setMoves(prev => prev + 1);

      const [firstId, secondId] = newSelectedTiles;
      const firstTile = gameBoard.find(t => t.id === firstId);
      const secondTile = gameBoard.find(t => t.id === secondId);

      if (firstTile && secondTile && firstTile.petType === secondTile.petType && canConnectTiles(firstTile, secondTile)) {
        // Valid match found!
        setTimeout(() => {
          soundManager.playMatchSuccess();
          setGameBoard(prev => prev.map(t =>
            t.id === firstId || t.id === secondId
              ? { ...t, isMatched: true, isSelected: false }
              : { ...t, isSelected: false }
          ));
          setSelectedTiles([]);
          setScore(prev => prev + 10);

          // Check if game is completed
          const remainingTiles = gameBoard.filter(t => !t.isMatched && t.id !== firstId && t.id !== secondId);
          if (remainingTiles.length <= 2) {
            setGameCompleted(true);
            soundManager.playGameComplete();
            completeMiniGame('pikachu-match', score + 10, moves + 1);
          }
        }, 500);
      } else {
        // No valid match, deselect after delay
        setTimeout(() => {
          soundManager.playMatchFailure();
          setGameBoard(prev => prev.map(t => ({ ...t, isSelected: false })));
          setSelectedTiles([]);
        }, 1000);
      }
    }
  };

  // Timer effect
  useEffect(() => {
    if (!gameStarted || gameCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameCompleted(true);
          setMessage(`⏰ Time's up! Final score: ${score}`);
          return 0;
        }
        // Play warning sound when 10 seconds left
        if (prev === 11) {
          soundManager.playTimerWarning();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameCompleted, score, setMessage]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Game Header */}
      <div className="text-center mb-6">
        <motion.h2
          className="text-3xl font-bold gradient-text mb-4"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          🐾 Pet Match Game
        </motion.h2>
        <p className="text-gray-300 mb-4">
          Connect two identical pet images to make them disappear!
        </p>

        {!gameStarted ? (
          <motion.button
            className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-purple-500/30 transition-all duration-300 btn-modern"
            onClick={startGame}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🎮 Start Game
          </motion.button>
        ) : (
          <div className="flex justify-center gap-6 mb-4">
            <div className="glass-card px-4 py-2 rounded-lg">
              <span className="text-white font-semibold">Score: {score}</span>
            </div>
            <div className="glass-card px-4 py-2 rounded-lg">
              <span className="text-white font-semibold">Moves: {moves}</span>
            </div>
            <div className="glass-card px-4 py-2 rounded-lg">
              <span className="text-white font-semibold">Time: {formatTime(timeLeft)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Game Board */}
      {gameStarted && (
        <motion.div
          className="relative"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="grid grid-cols-8 gap-2 max-w-2xl mx-auto bg-black/20 p-4 rounded-2xl backdrop-blur-sm">
            <AnimatePresence>
              {gameBoard.map((tile, index) => (
                <motion.div
                  key={tile.id}
                  className={`aspect-square rounded-lg cursor-pointer transition-all duration-300 relative overflow-hidden ${
                    tile.isMatched
                      ? 'opacity-0 scale-0'
                      : tile.isSelected
                      ? 'ring-4 ring-yellow-400 scale-105'
                      : 'hover:scale-105'
                  }`}
                  onClick={() => handleTileClick(tile.id)}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{
                    scale: tile.isMatched ? 0 : 1,
                    rotate: 0,
                    opacity: tile.isMatched ? 0 : 1
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{
                    delay: index * 0.02,
                    type: "spring",
                    stiffness: 200
                  }}
                  whileHover={!tile.isMatched && !tile.isSelected ? { scale: 1.1 } : {}}
                  whileTap={{ scale: 0.9 }}
                >
                  {/* Tile Background */}
                  <div className={`w-full h-full glass-card flex items-center justify-center text-2xl relative ${
                    tile.isSelected ? 'bg-yellow-400/20' : ''
                  }`}>
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />

                    {/* Pet Emoji */}
                    <motion.span
                      className="relative z-10 filter drop-shadow-lg"
                      animate={tile.isSelected ? {
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0]
                      } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      {tile.emoji}
                    </motion.span>

                    {/* Selection indicator */}
                    {tile.isSelected && (
                      <motion.div
                        className="absolute inset-0 border-4 border-yellow-400 rounded-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}

                    {/* Match effect */}
                    {tile.isMatched && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.8 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Game Completion */}
          {gameCompleted && (
            <motion.div
              className="text-center mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="glass-card p-6 rounded-2xl inline-block">
                <h3 className="text-2xl font-bold text-white mb-2">
                  🎉 Game Completed!
                </h3>
                <p className="text-gray-300 mb-4">
                  Score: {score} | Moves: {moves} | Time: {formatTime(120 - timeLeft)}
                </p>
                <div className="flex gap-3 justify-center">
                  <motion.button
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-xl font-bold btn-modern"
                    onClick={startGame}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🔄 Play Again
                  </motion.button>
                  <motion.button
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-xl font-bold btn-modern"
                    onClick={() => setGameStarted(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🏠 Back to Menu
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Instructions */}
      {!gameStarted && (
        <motion.div
          className="glass-card p-6 rounded-2xl mt-6 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-xl font-bold text-white mb-4 text-center">📋 How to Play</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <strong className="text-white">Objective:</strong> Match pairs of identical pet images
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <strong className="text-white">Click:</strong> Select two tiles to try matching them
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">⏰</span>
              <div>
                <strong className="text-white">Time:</strong> Complete the game within 2 minutes
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🏆</span>
              <div>
                <strong className="text-white">Score:</strong> 10 points for each successful match
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default PikachuMatchGame;
