import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store';

interface FallingFruit {
  id: number;
  x: number;
  y: number;
  type: '🍎' | '🍌' | '🍇' | '🍑';
  speed: number;
  hit: boolean;
}

interface LaserBeam {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  progress: number;
  hit: boolean;
}

const FRUIT_TYPES = ['🍎', '🍌', '🍇', '🍑'] as const;

const CatchGame: React.FC = () => {
  const { currentPet, setMessage, completeMiniGame } = useGameStore();
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);

  const [petPosition, setPetPosition] = useState(200); // Pet position on bottom
  const [fallingFruits, setFallingFruits] = useState<FallingFruit[]>([]);
  const [laserBeams, setLaserBeams] = useState<LaserBeam[]>([]);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Game constants
  const GAME_WIDTH = 400;
  const GAME_HEIGHT = 500;
  const PET_SIZE = 40;
  const FRUIT_SIZE = 30;
  const FALL_SPEED_BASE = 2;
  const LASER_SPEED = 8;

  // Initialize game
  const startGame = () => {
    setGameStarted(true);
    setGameCompleted(false);
    setScore(0);
    setLives(3);
    setPetPosition(200);
    setFallingFruits([]);
    setLaserBeams([]);
  };

  // Mouse movement handler for pet
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!gameAreaRef.current || !gameStarted) return;

    const rect = gameAreaRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    setPetPosition(Math.max(PET_SIZE/2, Math.min(GAME_WIDTH - PET_SIZE/2, x)));
  }, [gameStarted]);



  // Create new falling fruit
  const createFruit = useCallback(() => {
    if (!gameStarted) return;

    const newFruit: FallingFruit = {
      id: Date.now() + Math.random(),
      x: Math.random() * (GAME_WIDTH - FRUIT_SIZE),
      y: -FRUIT_SIZE,
      type: FRUIT_TYPES[Math.floor(Math.random() * FRUIT_TYPES.length)],
      speed: FALL_SPEED_BASE + Math.random() * 1.5,
      hit: false
    };

    setFallingFruits(prev => [...prev, newFruit]);
  }, [gameStarted]);

  // Update game state
  const updateGame = useCallback(() => {
    if (!gameStarted || gameCompleted) return;

    // Update falling fruits
    setFallingFruits(prev => prev.map(fruit => {
      if (fruit.hit) return fruit;

      const newY = fruit.y + fruit.speed;

      // Check if fruit hits ground (lose life)
      if (newY + FRUIT_SIZE >= GAME_HEIGHT) {
        setLives(prevLives => {
          const newLives = prevLives - 1;
          if (newLives <= 0) {
            setGameCompleted(true);
            completeMiniGame('catch-game', score, Math.floor(score / 10));
            setMessage(`💔 Game Over! Final Score: ${score}`);
          }
          return Math.max(0, newLives);
        });
        return { ...fruit, hit: true };
      }

      return { ...fruit, y: newY };
    }).filter(fruit => !fruit.hit));

    // Update laser beams
    setLaserBeams(prev => prev.map(beam => {
      if (beam.hit) return beam;

      const newProgress = beam.progress + LASER_SPEED / 100;
      if (newProgress >= 1) {
        return { ...beam, hit: true };
      }

      return { ...beam, progress: newProgress };
    }).filter(beam => !beam.hit));

    // Check collisions between lasers and fruits
    setFallingFruits(prevFruits => {
      return prevFruits.map(fruit => {
        if (fruit.hit) return fruit;

        const fruitCenterX = fruit.x + FRUIT_SIZE / 2;
        const fruitCenterY = fruit.y + FRUIT_SIZE / 2;

        const hitBeam = laserBeams.find(beam => {
          if (beam.hit) return false;

          const beamX = beam.x + (beam.targetX - beam.x) * beam.progress;
          const beamY = beam.y + (beam.targetY - beam.y) * beam.progress;

          const distance = Math.sqrt(
            Math.pow(beamX - fruitCenterX, 2) + Math.pow(beamY - fruitCenterY, 2)
          );

          return distance < FRUIT_SIZE / 2;
        });

        if (hitBeam) {
          // Mark beam as hit
          setLaserBeams(prevBeams =>
            prevBeams.map(b => b.id === hitBeam.id ? { ...b, hit: true } : b)
          );

          // Give points based on fruit type
          const points = fruit.type === '🍎' ? 10 : fruit.type === '🍌' ? 15 : fruit.type === '🍇' ? 20 : 25;
          setScore(prev => prev + points);

          return { ...fruit, hit: true };
        }

        return fruit;
      });
    });
  }, [gameStarted, gameCompleted, score, laserBeams, completeMiniGame, setMessage]);

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

  // Fruit spawning timer
  useEffect(() => {
    if (!gameStarted) return;

    const fruitInterval = setInterval(() => {
      if (Math.random() < 0.7) { // 70% chance to spawn fruit each second
        createFruit();
      }
    }, 1000);

    return () => clearInterval(fruitInterval);
  }, [gameStarted, createFruit]);

  // Automatic shooting timer
  useEffect(() => {
    if (!gameStarted || gameCompleted) return;

    const shootInterval = setInterval(() => {
      // Shoot straight upwards from pet position
      const targetX = petPosition; // Shoot straight from pet position
      const targetY = -100; // Shoot even higher for truly continuous effect

      const newBeam: LaserBeam = {
        id: Date.now() + Math.random(),
        x: petPosition,
        y: GAME_HEIGHT - 60, // Start from pet position
        targetX,
        targetY,
        progress: 0,
        hit: false
      };

      setLaserBeams(prev => [...prev, newBeam]);
    }, 50); // Shoot every 50ms for maximum continuity

    return () => clearInterval(shootInterval);
  }, [gameStarted, gameCompleted, petPosition]);

  // Get pet emoji
  const petEmoji = currentPet?.typeData.emoji || '🐱';

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
          🔫 Fruit Shooter
        </motion.h2>
        <p className="text-gray-300 mb-4">
          Control your pet to shoot falling fruits! Don't let them hit the ground!
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
            className="relative bg-gradient-to-b from-green-400 via-blue-500 to-purple-600 rounded-2xl shadow-2xl overflow-hidden cursor-crosshair"
            style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
            onMouseMove={handleMouseMove}
          >
            {/* Background elements */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-20 h-20 bg-white/30 rounded-full animate-pulse" style={{ animationDelay: '0s' }} />
              <div className="absolute top-20 right-20 w-16 h-16 bg-white/30 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/30 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Falling Fruits */}
            <AnimatePresence>
              {fallingFruits.map((fruit) => (
                <motion.div
                  key={fruit.id}
                  className="absolute text-2xl"
                  style={{
                    left: fruit.x,
                    top: fruit.y,
                    width: FRUIT_SIZE,
                    height: FRUIT_SIZE
                  }}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, opacity: 0, rotate: 180 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.span
                    animate={{
                      y: [0, -3, 0],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    {fruit.type}
                  </motion.span>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Laser Beams */}
            <AnimatePresence>
              {laserBeams.map((beam) => (
                <motion.div
                  key={beam.id}
                  className="absolute w-2 bg-yellow-400 rounded-full shadow-lg shadow-yellow-400/50"
                  style={{
                    left: beam.x + (beam.targetX - beam.x) * beam.progress,
                    top: beam.y + (beam.targetY - beam.y) * beam.progress,
                    height: '12px',
                    transform: 'translate(-50%, -50%)'
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.1 }}
                />
              ))}
            </AnimatePresence>

            {/* Pet (Shooter) */}
            <motion.div
              className="absolute bottom-4 text-4xl"
              style={{
                left: petPosition,
                transform: 'translateX(-50%)'
              }}
              animate={{
                scale: [1, 1.05, 1],
                y: [0, -2, 0]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {petEmoji}
            </motion.div>

            {/* Ground line */}
            <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-red-500 via-red-600 to-red-500" />

            {/* Score display */}
            <div className="absolute top-4 right-4 glass-card px-3 py-1 rounded-lg">
              <span className="text-white font-bold text-sm">{score}</span>
            </div>

            {/* Lives display */}
            <div className="absolute top-4 left-4 flex gap-1">
              {Array.from({ length: 3 }, (_, i) => (
                <motion.span
                  key={i}
                  className="text-2xl"
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
          </div>
        </motion.div>
      )}

      {/* Game Over */}
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
              {lives > 0 ? 'Time\'s up!' : 'All lives lost!'}
            </p>
            <div className="flex gap-3 justify-center">
              <motion.button
                className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-2 rounded-xl font-bold btn-modern"
                onClick={startGame}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🔄 Play Again
              </motion.button>
              <motion.button
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-xl font-bold btn-modern"
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
                <strong className="text-white">Objective:</strong> Shoot falling fruits before they hit the ground
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🖱️</span>
              <div>
                <strong className="text-white">Controls:</strong> Move mouse left/right to control your pet - lasers shoot automatically!
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🍎🍌🍇🍑</span>
              <div>
                <strong className="text-white">Fruits:</strong> Different fruits give different points
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">❤️</span>
              <div>
                <strong className="text-white">Lives:</strong> Lose a heart when fruits hit the ground
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CatchGame;
