import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store';
import { soundManager } from '../../utils/sounds';

interface Block {
  shape: number[][];
  color: string;
  x: number;
  y: number;
}

interface BoardCell {
  filled: boolean;
  color: string;
}

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 30;

// Tetris shapes
const TETROMINOS = [
  // I
  {
    shape: [[1, 1, 1, 1]],
    color: '#00f5ff'
  },
  // O
  {
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: '#ffff00'
  },
  // T
  {
    shape: [
      [0, 1, 0],
      [1, 1, 1]
    ],
    color: '#800080'
  },
  // S
  {
    shape: [
      [0, 1, 1],
      [1, 1, 0]
    ],
    color: '#00ff00'
  },
  // Z
  {
    shape: [
      [1, 1, 0],
      [0, 1, 1]
    ],
    color: '#ff0000'
  },
  // J
  {
    shape: [
      [1, 0, 0],
      [1, 1, 1]
    ],
    color: '#0000ff'
  },
  // L
  {
    shape: [
      [0, 0, 1],
      [1, 1, 1]
    ],
    color: '#ffa500'
  }
];

const PuzzleGame: React.FC = () => {
  const { setMessage, completeMiniGame } = useGameStore();
  const [board, setBoard] = useState<BoardCell[][]>(() =>
    Array(BOARD_HEIGHT).fill(null).map(() =>
      Array(BOARD_WIDTH).fill(null).map(() => ({ filled: false, color: '' }))
    )
  );
  const [currentBlock, setCurrentBlock] = useState<Block | null>(null);
  const [nextBlock, setNextBlock] = useState<Block | null>(null);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const gameLoopRef = useRef<number | null>(null);
  const dropTimeRef = useRef<number>(1000);

  const createBlock = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * TETROMINOS.length);
    const tetromino = TETROMINOS[randomIndex];
    return {
      shape: tetromino.shape,
      color: tetromino.color,
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(tetromino.shape[0].length / 2),
      y: 0
    };
  }, []);

  const rotateBlock = (block: Block) => {
    const rotated = block.shape[0].map((_, index) =>
      block.shape.map(row => row[index]).reverse()
    );
    return {
      ...block,
      shape: rotated
    };
  };

  const isValidMove = (block: Block, newX: number, newY: number) => {
    for (let y = 0; y < block.shape.length; y++) {
      for (let x = 0; x < block.shape[y].length; x++) {
        if (block.shape[y][x]) {
          const boardX = newX + x;
          const boardY = newY + y;

          if (
            boardX < 0 ||
            boardX >= BOARD_WIDTH ||
            boardY >= BOARD_HEIGHT ||
            (boardY >= 0 && board[boardY][boardX].filled)
          ) {
            return false;
          }
        }
      }
    }
    return true;
  };

  const placeBlock = useCallback((block: Block) => {
    const newBoard = board.map(row => [...row]);

    for (let y = 0; y < block.shape.length; y++) {
      for (let x = 0; x < block.shape[y].length; x++) {
        if (block.shape[y][x]) {
          const boardY = block.y + y;
          const boardX = block.x + x;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = {
              filled: true,
              color: block.color
            };
          }
        }
      }
    }

    setBoard(newBoard);
    return newBoard;
  }, [board]);

  const clearLines = useCallback((board: BoardCell[][]) => {
    const linesToClear: number[] = [];

    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (board[y].every(cell => cell.filled)) {
        linesToClear.push(y);
      }
    }

    if (linesToClear.length > 0) {
      soundManager.playMatchSuccess();
      const newBoard = board.filter((_, index) => !linesToClear.includes(index));
      const emptyRows = Array(linesToClear.length).fill(null).map(() =>
        Array(BOARD_WIDTH).fill(null).map(() => ({ filled: false, color: '' }))
      );

      setBoard([...emptyRows, ...newBoard]);
      setLines(prev => prev + linesToClear.length);
      setScore(prev => prev + linesToClear.length * 100 * level);

      // Level up every 10 lines
      if ((lines + linesToClear.length) >= level * 10) {
        setLevel(prev => prev + 1);
        dropTimeRef.current = Math.max(100, dropTimeRef.current - 50);
        soundManager.playGameComplete(); // Level up sound
      }
    }
  }, [board, lines, level]);

  const startGame = () => {
    const initialBoard = Array(BOARD_HEIGHT).fill(null).map(() =>
      Array(BOARD_WIDTH).fill(null).map(() => ({ filled: false, color: '' }))
    );
    setBoard(initialBoard);
    setCurrentBlock(createBlock());
    setNextBlock(createBlock());
    setScore(0);
    setLines(0);
    setLevel(1);
    setGameOver(false);
    setGameStarted(true);
    dropTimeRef.current = 1000;
    soundManager.playGameStart();
  };

  const moveBlock = (dx: number, dy: number) => {
    if (!currentBlock || gameOver) return;

    const newX = currentBlock.x + dx;
    const newY = currentBlock.y + dy;

    if (isValidMove(currentBlock, newX, newY)) {
      setCurrentBlock({
        ...currentBlock,
        x: newX,
        y: newY
      });
      if (dx !== 0) soundManager.playTileSelect();
    } else if (dy > 0) {
      // Block can't move down, place it
      const newBoard = placeBlock(currentBlock);
      clearLines(newBoard);

      // Check game over
      if (currentBlock.y <= 0) {
        setGameOver(true);
        setGameStarted(false);
        completeMiniGame('puzzle-game', score, lines);
        setMessage(`💔 Game Over! Score: ${score}, Lines: ${lines}`);
        return;
      }

      // Spawn next block
      setCurrentBlock(nextBlock);
      setNextBlock(createBlock());
    }
  };

  const rotateCurrentBlock = () => {
    if (!currentBlock || gameOver) return;

    const rotated = rotateBlock(currentBlock);
    if (isValidMove(rotated, rotated.x, rotated.y)) {
      setCurrentBlock(rotated);
      soundManager.playTileSelect();
    }
  };

  const dropBlock = () => {
    moveBlock(0, 1);
  };

  const hardDrop = () => {
    if (!currentBlock) return;

    let dropDistance = 0;
    while (isValidMove(currentBlock, currentBlock.x, currentBlock.y + dropDistance + 1)) {
      dropDistance++;
    }

    if (dropDistance > 0) {
      setScore(prev => prev + dropDistance * 2);
      moveBlock(0, dropDistance);
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStarted || gameOver) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          moveBlock(-1, 0);
          break;
        case 'ArrowRight':
          e.preventDefault();
          moveBlock(1, 0);
          break;
        case 'ArrowDown':
          e.preventDefault();
          moveBlock(0, 1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          rotateCurrentBlock();
          break;
        case ' ':
          e.preventDefault();
          hardDrop();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted, gameOver, currentBlock]);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameLoop = () => {
      dropBlock();
      gameLoopRef.current = setTimeout(gameLoop, dropTimeRef.current);
    };

    gameLoopRef.current = setTimeout(gameLoop, dropTimeRef.current);

    return () => {
      if (gameLoopRef.current) {
        clearTimeout(gameLoopRef.current);
      }
    };
  }, [gameStarted, gameOver, dropBlock]);

  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);

    // Add current block to display
    if (currentBlock) {
      for (let y = 0; y < currentBlock.shape.length; y++) {
        for (let x = 0; x < currentBlock.shape[y].length; x++) {
          if (currentBlock.shape[y][x]) {
            const boardY = currentBlock.y + y;
            const boardX = currentBlock.x + x;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = {
                filled: true,
                color: currentBlock.color
              };
            }
          }
        }
      }
    }

    return displayBoard;
  };

  return (
    <motion.div
      className="max-w-6xl mx-auto p-6"
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
          🧩 Block Puzzle
        </motion.h2>
        <p className="text-gray-300 mb-4">
          Arrange falling blocks to complete horizontal lines!
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
              <span className="text-white font-semibold">Lines: {lines}</span>
            </div>
            <div className="glass-card px-4 py-2 rounded-lg">
              <span className="text-white font-semibold">Level: {level}</span>
            </div>
          </div>
        )}
      </div>

      {/* Game Area */}
      {gameStarted && (
        <motion.div
          className="flex justify-center gap-8"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* Game Board */}
          <div className="relative">
            <div
              className="bg-black/50 border-2 border-gray-600 rounded-lg p-2"
              style={{
                width: BOARD_WIDTH * BLOCK_SIZE + 16,
                height: BOARD_HEIGHT * BLOCK_SIZE + 16
              }}
            >
              <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)` }}>
                {renderBoard().map((row, y) =>
                  row.map((cell, x) => (
                    <motion.div
                      key={`${x}-${y}`}
                      className="border border-gray-700"
                      style={{
                        width: BLOCK_SIZE,
                        height: BLOCK_SIZE,
                        backgroundColor: cell.filled ? cell.color : 'transparent'
                      }}
                      animate={{
                        scale: cell.filled ? [1, 1.05, 1] : 1,
                      }}
                      transition={{ duration: 0.1 }}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Game Over Overlay */}
            {gameOver && (
              <motion.div
                className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-center">
                  <h3 className="text-3xl font-bold text-white mb-4">💔 Game Over!</h3>
                  <p className="text-gray-300 mb-4">Score: {score} | Lines: {lines}</p>
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
          </div>

          {/* Next Block Preview */}
          <div className="flex flex-col gap-4">
            <div className="glass-card p-4 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-3 text-center">Next Block</h3>
              {nextBlock && (
                <div className="flex justify-center">
                  <div
                    className="grid gap-0 border border-gray-600 rounded p-2 bg-black/30"
                    style={{
                      gridTemplateColumns: `repeat(${nextBlock.shape[0].length}, 1fr)`,
                      width: 'fit-content'
                    }}
                  >
                    {nextBlock.shape.map((row, y) =>
                      row.map((cell, x) => (
                        <div
                          key={`${x}-${y}`}
                          className="border border-gray-700"
                          style={{
                            width: BLOCK_SIZE * 0.8,
                            height: BLOCK_SIZE * 0.8,
                            backgroundColor: cell ? nextBlock.color : 'transparent'
                          }}
                        />
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="glass-card p-4 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-3 text-center">Controls</h3>
              <div className="text-sm text-gray-300 space-y-2">
                <div className="flex justify-between">
                  <span>Move Left:</span>
                  <kbd className="bg-gray-700 px-2 py-1 rounded text-xs">←</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Move Right:</span>
                  <kbd className="bg-gray-700 px-2 py-1 rounded text-xs">→</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Soft Drop:</span>
                  <kbd className="bg-gray-700 px-2 py-1 rounded text-xs">↓</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Rotate:</span>
                  <kbd className="bg-gray-700 px-2 py-1 rounded text-xs">↑</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Hard Drop:</span>
                  <kbd className="bg-gray-700 px-2 py-1 rounded text-xs">Space</kbd>
                </div>
              </div>
            </div>
          </div>
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
                <strong className="text-white">Objective:</strong> Complete horizontal lines by filling them completely
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <strong className="text-white">Controls:</strong> Use arrow keys to move and rotate blocks
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🏆</span>
              <div>
                <strong className="text-white">Score:</strong> Points for lines cleared, higher levels increase speed
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">💀</span>
              <div>
                <strong className="text-white">Game Over:</strong> When blocks reach the top of the board
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default PuzzleGame;
