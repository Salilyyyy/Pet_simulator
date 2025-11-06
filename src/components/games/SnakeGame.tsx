import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store';
import { soundManager } from '../../utils/sounds';

interface Position {
  x: number;
  y: number;
}

interface GameState {
  snake: Position[];
  food: Position;
  direction: Position;
  gameOver: boolean;
  score: number;
  isPlaying: boolean;
}

const BOARD_WIDTH = 20;
const BOARD_HEIGHT = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const GAME_SPEED = 150;

const SnakeGame: React.FC = () => {
  const { setMessage, completeMiniGame, currentPet } = useGameStore();

  const [gameState, setGameState] = useState<GameState>({
    snake: INITIAL_SNAKE,
    food: { x: 15, y: 15 },
    direction: INITIAL_DIRECTION,
    gameOver: false,
    score: 0,
    isPlaying: false
  });

  const generateFood = useCallback((snake: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * BOARD_WIDTH),
        y: Math.floor(Math.random() * BOARD_HEIGHT)
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  const checkCollision = useCallback((head: Position, snake: Position[]): boolean => {
    if (head.x < 0 || head.x >= BOARD_WIDTH || head.y < 0 || head.y >= BOARD_HEIGHT) {
      return true;
    }
    return snake.some(segment => segment.x === head.x && segment.y === head.y);
  }, []);

  const moveSnake = useCallback(() => {
    setGameState(prevState => {
      if (prevState.gameOver || !prevState.isPlaying) return prevState;

      const newSnake = [...prevState.snake];
      const head = { ...newSnake[0] };

      head.x += prevState.direction.x;
      head.y += prevState.direction.y;

      if (checkCollision(head, newSnake)) {
        return {
          ...prevState,
          gameOver: true,
          isPlaying: false
        };
      }

      newSnake.unshift(head);

      let newFood = prevState.food;
      let newScore = prevState.score;

      if (head.x === prevState.food.x && head.y === prevState.food.y) {
        newScore += 10;
        newFood = generateFood(newSnake);
        setTimeout(() => soundManager.playMatchSuccess(), 50);
      } else {
        newSnake.pop();
      }

      return {
        ...prevState,
        snake: newSnake,
        food: newFood,
        score: newScore
      };
    });
  }, [checkCollision, generateFood]);

  const changeDirection = useCallback((newDirection: Position) => {
    setGameState(prevState => {
      if (
        (newDirection.x === -prevState.direction.x && newDirection.y === -prevState.direction.y) ||
        (newDirection.x === prevState.direction.x && newDirection.y === prevState.direction.y)
      ) {
        return prevState;
      }
      return {
        ...prevState,
        direction: newDirection
      };
    });
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameState.isPlaying) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          changeDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          changeDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          changeDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          changeDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState.isPlaying, changeDirection]);

  useEffect(() => {
    if (!gameState.isPlaying || gameState.gameOver) return;

    const gameInterval = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(gameInterval);
  }, [gameState.isPlaying, gameState.gameOver, moveSnake]);

  const startGame = useCallback(() => {
    const initialFood = generateFood(INITIAL_SNAKE);
    setGameState({
      snake: INITIAL_SNAKE,
      food: initialFood,
      direction: INITIAL_DIRECTION,
      gameOver: false,
      score: 0,
      isPlaying: true
    });
    soundManager.playGameStart();
  }, [generateFood]);

  const resetGame = useCallback(() => {
    setGameState({
      snake: INITIAL_SNAKE,
      food: { x: 15, y: 15 },
      direction: INITIAL_DIRECTION,
      gameOver: false,
      score: 0,
      isPlaying: false
    });
  }, []);

  useEffect(() => {
    if (gameState.gameOver) {
      soundManager.playMatchFailure();
      completeMiniGame('snake-game', gameState.score, Math.floor(gameState.score / 10));
      setMessage(`🐍 Game Over! Final Score: ${gameState.score}`);
    }
  }, [gameState.gameOver, gameState.score, completeMiniGame, setMessage]);

  const snakeHeadEmoji = currentPet?.typeData.emoji || '🐍';

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
          initial={{ scale: 1 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          🐍 Snake Game
        </motion.h2>
        <p className="text-gray-300 mb-4">
          Control your pet snake! Eat food to grow and avoid hitting walls or yourself!
        </p>

        {!gameState.isPlaying && !gameState.gameOver ? (
          <motion.button
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-green-500/30 transition-all duration-300 btn-modern"
            onClick={startGame}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🎮 Start Game
          </motion.button>
        ) : (
          <div className="flex justify-center gap-6 mb-4">
            <div className="glass-card px-4 py-2 rounded-lg">
              <span className="text-white font-semibold">Score: {gameState.score}</span>
            </div>
            <div className="glass-card px-4 py-2 rounded-lg">
              <span className="text-white font-semibold">Length: {gameState.snake.length}</span>
            </div>
          </div>
        )}
      </div>

      {/* Game Board */}
      <motion.div
        className="relative mb-6 flex justify-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div
          className="p-4 rounded-xl border-2 border-gray-600 bg-gray-900/50"
          style={{
            width: '520px',
            height: '520px'
          }}
        >
          <div
            className="grid gap-0.5 w-full h-full"
            style={{
              gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`,
              gridTemplateRows: `repeat(${BOARD_HEIGHT}, 1fr)`
            }}
          >
          <AnimatePresence>
            {Array.from({ length: BOARD_HEIGHT }, (_, y) =>
              Array.from({ length: BOARD_WIDTH }, (_, x) => {
                const isSnakeHead = gameState.snake[0]?.x === x && gameState.snake[0]?.y === y;
                const isSnakeBody = gameState.snake.slice(1).some(segment => segment.x === x && segment.y === y);
                const isFood = gameState.food.x === x && gameState.food.y === y;

                return (
                  <motion.div
                    key={`${x}-${y}`}
                    className={`aspect-square rounded-sm border border-gray-700/30 flex items-center justify-center text-sm ${
                      isSnakeHead ? 'bg-green-500 shadow-lg shadow-green-500/50' :
                      isSnakeBody ? 'bg-green-400' :
                      isFood ? 'bg-red-500 animate-pulse' :
                      'bg-gray-800/30'
                    }`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{
                      delay: (x + y) * 0.002,
                      duration: 0.3
                    }}
                  >
                    {isSnakeHead && (
                      <motion.span
                        animate={{
                          scale: [1, 1.1, 1],
                          rotate: gameState.direction.x > 0 ? 90 : gameState.direction.x < 0 ? -90 : gameState.direction.y > 0 ? 180 : 0
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        {snakeHeadEmoji}
                      </motion.span>
                    )}
                    {isSnakeBody && '🟢'}
                    {isFood && '🍎'}
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
          </div>
        </div>

        {/* Game Over Overlay */}
        <AnimatePresence>
          {gameState.gameOver && (
            <motion.div
              className="absolute inset-0 bg-black/80 rounded-xl flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="text-center glass-card p-6 rounded-2xl"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-2xl font-bold text-white mb-2">💀 Game Over!</h3>
                <p className="text-gray-300 mb-4">
                  Final Score: {gameState.score}<br />
                  Snake Length: {gameState.snake.length}
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
                    onClick={resetGame}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🏠 Back to Menu
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Controls */}
      {gameState.isPlaying && (
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="glass-card p-4 rounded-xl inline-block">
            <h4 className="text-white font-bold mb-2">🎮 Controls</h4>
            <div className="text-sm text-gray-300 grid grid-cols-2 gap-2">
              <div>↑/W: Up</div>
              <div>↓/S: Down</div>
              <div>←/A: Left</div>
              <div>→/D: Right</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Instructions */}
      {!gameState.isPlaying && !gameState.gameOver && (
        <motion.div
          className="glass-card p-6 rounded-2xl mt-6 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-xl font-bold text-white mb-4 text-center">📋 How to Play</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{snakeHeadEmoji}</span>
              <div>
                <strong className="text-white">Snake Head:</strong> Your pet controls the snake
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🍎</span>
              <div>
                <strong className="text-white">Food:</strong> Eat to grow and increase score
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <strong className="text-white">Objective:</strong> Grow as long as possible
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <strong className="text-white">Avoid:</strong> Walls and your own body
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SnakeGame;
