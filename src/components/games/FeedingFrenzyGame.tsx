import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store';

interface FallingFood {
  id: number;
  x: number;
  y: number;
  type: '🍎' | '🍌' | '🥕' | '🍇';
  speed: number;
  caught: boolean;
}

const FOOD_TYPES = ['🍎', '🍌', '🥕', '🍇'] as const;

const FeedingFrenzyGame: React.FC = () => {
  const { currentPet, completeMiniGame } = useGameStore();
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const [catcherPosition, setCatcherPosition] = useState(50); // 0-100 percentage
  const [fallingFoods, setFallingFoods] = useState<FallingFood[]>([]);
  const [lives, setLives] = useState(3);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Game constants
  const GAME_WIDTH = 400;
  const GAME_HEIGHT = 500;
  const CATCHER_WIDTH = 60;
  const FOOD_SIZE = 30;
  const FALL_SPEED_BASE = 2;

  // Initialize game
  const startGame = () => {
    setGameStarted(true);
    setGameCompleted(false);
    setScore(0);
    setLives(3);
    setCatcherPosition(50);
    setFallingFoods([]);
  };

  // Mouse/touch movement handler
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!gameAreaRef.current || !gameStarted) return;

    const rect = gameAreaRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setCatcherPosition(Math.max(0, Math.min(100, percentage)));
  }, [gameStarted]);

  // Create new falling food
  const createFood = useCallback(() => {
    if (!gameStarted) return;

    const newFood: FallingFood = {
      id: Date.now() + Math.random(),
      x: Math.random() * (GAME_WIDTH - FOOD_SIZE),
      y: -FOOD_SIZE,
      type: FOOD_TYPES[Math.floor(Math.random() * FOOD_TYPES.length)],
      speed: FALL_SPEED_BASE + Math.random() * 2,
      caught: false
    };

    setFallingFoods(prev => [...prev, newFood]);
  }, [gameStarted]);

  // Update game state
  const updateGame = useCallback(() => {
    if (!gameStarted || gameCompleted) return;

    setFallingFoods(prev => prev.map(food => {
      if (food.caught) return food;

      const newY = food.y + food.speed;

      // Check if food is caught
      const catcherX = (catcherPosition / 100) * (GAME_WIDTH - CATCHER_WIDTH);
      if (
        newY + FOOD_SIZE >= GAME_HEIGHT - 40 &&
        newY <= GAME_HEIGHT - 10 &&
        food.x >= catcherX &&
        food.x <= catcherX + CATCHER_WIDTH
      ) {
        setScore(prev => prev + 10);
        return { ...food, caught: true };
      }

      // Check if food hits ground
      if (newY + FOOD_SIZE >= GAME_HEIGHT) {
        // Subtract 1 life immediately when food hits ground
        setLives(prevLives => {
          const newLives = prevLives - 1;
          if (newLives <= 0) {
            setGameCompleted(true);
            // Get current score for completion
            setScore(currentScore => {
              completeMiniGame('feeding-frenzy', currentScore, 0);
              return currentScore;
            });
          }
          return Math.max(0, newLives); // Ensure lives don't go below 0
        });
        return { ...food, caught: true }; // Remove from screen
      }

      return { ...food, y: newY };
    }).filter(food => !food.caught));
  }, [gameStarted, gameCompleted, catcherPosition, completeMiniGame]);

  // Game loop
  useEffect(() => {
    if (!gameStarted) return;

    const gameLoop = () => {
      updateGame();
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameStarted, updateGame]);

  // Food spawning timer
  useEffect(() => {
    if (!gameStarted) return;

    const foodInterval = setInterval(() => {
      if (Math.random() < 0.7) { // 70% chance to spawn food each second
        createFood();
      }
    }, 1000);

    return () => clearInterval(foodInterval);
  }, [gameStarted, createFood]);



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
          🍎 Feeding Frenzy
        </motion.h2>
        <p className="text-gray-300 mb-4">
          Catch falling food to feed your pet! Don't let any hit the ground!
        </p>

        {!gameStarted ? (
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
              <span className="text-white font-semibold">Score: {score}</span>
            </div>
            <div className="glass-card px-4 py-2 rounded-lg">
              <span className="text-white font-semibold">Lives: {'❤️'.repeat(lives)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Game Area */}
      {gameStarted && !gameCompleted && (
        <motion.div
          className="relative mx-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div
            ref={gameAreaRef}
            className="relative bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 rounded-2xl shadow-2xl overflow-hidden cursor-crosshair"
            style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
            onMouseMove={handleMouseMove}
          >
            {/* Background elements */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-10 left-10 w-16 h-16 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="absolute top-20 right-20 w-12 h-12 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
              <div className="absolute bottom-20 left-1/4 w-8 h-8 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '2s' }} />
            </div>

            {/* Falling Foods */}
            <AnimatePresence>
              {fallingFoods.map((food) => (
                <motion.div
                  key={food.id}
                  className="absolute text-2xl"
                  style={{
                    left: food.x,
                    top: food.y,
                    width: FOOD_SIZE,
                    height: FOOD_SIZE
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.span
                    animate={{
                      rotate: [0, 5, -5, 0],
                      y: [0, -2, 0]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    {food.type}
                  </motion.span>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Catcher (Pet) */}
            <motion.div
              className="absolute bottom-4 text-4xl"
              style={{
                left: `${catcherPosition}%`,
                transform: 'translateX(-50%)'
              }}
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 2, -2, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {currentPet?.typeData.emoji || '🐱'}
            </motion.div>

            {/* Ground line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />

            {/* Lives indicator */}
            <div className="absolute top-4 left-4 flex gap-1">
              {Array.from({ length: 3 }, (_, i) => (
                <motion.span
                  key={i}
                  className="text-xl"
                  animate={{
                    scale: i < lives ? [1, 1.2, 1] : [1, 0.8, 1],
                    opacity: i < lives ? 1 : 0.3
                  }}
                  transition={{ duration: 0.5 }}
                >
                  ❤️
                </motion.span>
              ))}
            </div>

            {/* Score display */}
            <div className="absolute top-4 right-4 glass-card px-3 py-1 rounded-lg">
              <span className="text-white font-bold text-sm">{score}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Game Completion - Moved outside game area */}
      {gameCompleted && (
        <motion.div
          className="text-center mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="glass-card p-6 rounded-2xl inline-block">
            <h3 className="text-2xl font-bold text-white mb-2">
              💔 Game Over!
            </h3>
            <p className="text-gray-300 mb-4">
              Final Score: {score}<br />
              Better luck next time!
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
                <strong className="text-white">Objective:</strong> Catch falling food with your pet
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🖱️</span>
              <div>
                <strong className="text-white">Controls:</strong> Move mouse to control your pet
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">❤️</span>
              <div>
                <strong className="text-white">Lives:</strong> You have 3 lives, don't let food hit the ground
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🏆</span>
              <div>
                <strong className="text-white">Goal:</strong> Survive as long as possible!
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default FeedingFrenzyGame;
