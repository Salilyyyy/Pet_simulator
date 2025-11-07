import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store';
import { soundManager } from '../../utils/sounds';

interface GoldNugget {
  id: number;
  x: number;
  y: number;
  value: number;
  size: 'small' | 'medium' | 'large';
  collected: boolean;
}

interface GameState {
  goldNuggets: GoldNugget[];
  hookAngle: number;
  hookLength: number;
  hookExtended: boolean;
  hookReturning: boolean;
  hookX: number;
  hookY: number;
  score: number;
  isPlaying: boolean;
  gameOver: boolean;
  timeLeft: number;
  goldCollected: number;
}

const GAME_WIDTH = 600;
const GAME_HEIGHT = 400;
const HOOK_BASE_X = GAME_WIDTH / 2;
const HOOK_BASE_Y = 50;
const HOOK_SPEED = 2;
const MAX_HOOK_LENGTH = 300;
const GAME_TIME = 60;

const GoldMiningGame: React.FC = () => {
  const { setMessage, completeMiniGame, currentPet } = useGameStore();

  const [gameState, setGameState] = useState<GameState>({
    goldNuggets: [],
    hookAngle: 0,
    hookLength: 50,
    hookExtended: false,
    hookReturning: false,
    hookX: HOOK_BASE_X,
    hookY: HOOK_BASE_Y,
    score: 0,
    isPlaying: false,
    gameOver: false,
    timeLeft: GAME_TIME,
    goldCollected: 0
  });

  const generateGoldNuggets = useCallback((): GoldNugget[] => {
    const nuggets: GoldNugget[] = [];
    const numNuggets = 8 + Math.floor(Math.random() * 5); // 8-12 nuggets

    for (let i = 0; i < numNuggets; i++) {
      const size = Math.random() < 0.6 ? 'small' : Math.random() < 0.85 ? 'medium' : 'large';
      const value = size === 'small' ? 25 : size === 'medium' ? 50 : 100;

      nuggets.push({
        id: i,
        x: 50 + Math.random() * (GAME_WIDTH - 100),
        y: 150 + Math.random() * (GAME_HEIGHT - 200),
        value,
        size,
        collected: false
      });
    }

    return nuggets;
  }, []);

  const startGame = useCallback(() => {
    const nuggets = generateGoldNuggets();
    setGameState({
      goldNuggets: nuggets,
      hookAngle: 0,
      hookLength: 50,
      hookExtended: false,
      hookReturning: false,
      hookX: HOOK_BASE_X,
      hookY: HOOK_BASE_Y,
      score: 0,
      isPlaying: true,
      gameOver: false,
      timeLeft: GAME_TIME,
      goldCollected: 0
    });
    soundManager.playGameStart();
  }, [generateGoldNuggets]);

  const resetGame = useCallback(() => {
    setGameState({
      goldNuggets: [],
      hookAngle: 0,
      hookLength: 50,
      hookExtended: false,
      hookReturning: false,
      hookX: HOOK_BASE_X,
      hookY: HOOK_BASE_Y,
      score: 0,
      isPlaying: false,
      gameOver: false,
      timeLeft: GAME_TIME,
      goldCollected: 0
    });
  }, []);

  const releaseHook = useCallback(() => {
    if (!gameState.isPlaying || gameState.hookExtended || gameState.hookReturning) return;

    setGameState(prevState => ({
      ...prevState,
      hookExtended: true
    }));
  }, [gameState.isPlaying, gameState.hookExtended, gameState.hookReturning]);

  // Hook swinging animation
  useEffect(() => {
    if (!gameState.isPlaying || gameState.hookExtended || gameState.hookReturning) return;

    const swingInterval = setInterval(() => {
      setGameState(prevState => {
        let newAngle = prevState.hookAngle + 2;
        if (newAngle > 90) newAngle = -90;
        if (newAngle < -90) newAngle = 90;

        const angleRad = (-newAngle * Math.PI) / 180; // Negate angle for correct direction
        const hookX = HOOK_BASE_X + Math.sin(angleRad) * prevState.hookLength;
        const hookY = HOOK_BASE_Y + Math.cos(angleRad) * prevState.hookLength;

        return {
          ...prevState,
          hookAngle: newAngle,
          hookX,
          hookY
        };
      });
    }, 50);

    return () => clearInterval(swingInterval);
  }, [gameState.isPlaying, gameState.hookExtended, gameState.hookReturning]);

  // Update hook position when swinging (not extended)
  useEffect(() => {
    if (!gameState.isPlaying || gameState.hookExtended || gameState.hookReturning) return;

    const angleRad = (-gameState.hookAngle * Math.PI) / 180; // Negate angle for correct direction
    const hookX = HOOK_BASE_X + Math.sin(angleRad) * gameState.hookLength;
    const hookY = HOOK_BASE_Y + Math.cos(angleRad) * gameState.hookLength;

    setGameState(prevState => ({
      ...prevState,
      hookX,
      hookY
    }));
  }, [gameState.hookAngle, gameState.hookLength, gameState.isPlaying, gameState.hookExtended, gameState.hookReturning]);

  // Hook extension and collection logic
  useEffect(() => {
    if (!gameState.hookExtended) return;

    const extendInterval = setInterval(() => {
      setGameState(prevState => {
        if (prevState.hookReturning) {
          // Returning hook
          const newLength = prevState.hookLength - HOOK_SPEED * 2;
          if (newLength <= 50) {
            return {
              ...prevState,
              hookExtended: false,
              hookReturning: false,
              hookLength: 50
            };
          }
          return {
            ...prevState,
            hookLength: newLength
          };
        } else {
          // Extending hook
          const newLength = prevState.hookLength + HOOK_SPEED;
          if (newLength >= MAX_HOOK_LENGTH) {
            return {
              ...prevState,
              hookReturning: true
            };
          }

          // Check for gold collection
          const angleRad = (-prevState.hookAngle * Math.PI) / 180; // Negate angle for correct direction
          const hookX = HOOK_BASE_X + Math.sin(angleRad) * newLength;
          const hookY = HOOK_BASE_Y + Math.cos(angleRad) * newLength;

          let collectedNugget: GoldNugget | null = null;
          const updatedNuggets = prevState.goldNuggets.map(nugget => {
            if (!nugget.collected &&
                Math.abs(hookX - nugget.x) < 25 &&
                Math.abs(hookY - nugget.y) < 25) {
              collectedNugget = nugget;
              return { ...nugget, collected: true };
            }
            return nugget;
          });

          if (collectedNugget !== null) {
            soundManager.playMatchSuccess();
            return {
              ...prevState,
              goldNuggets: updatedNuggets,
              hookReturning: true,
              score: prevState.score + (collectedNugget as GoldNugget).value,
              goldCollected: prevState.goldCollected + 1
            };
          }

          return {
            ...prevState,
            hookLength: newLength,
            hookX,
            hookY
          };
        }
      });
    }, 16); // ~60fps

    return () => clearInterval(extendInterval);
  }, [gameState.hookExtended]);

  // Timer effect
  useEffect(() => {
    if (!gameState.isPlaying || gameState.gameOver) return;

    const timer = setInterval(() => {
      setGameState(prevState => {
        const newTimeLeft = prevState.timeLeft - 1;
        if (newTimeLeft <= 0) {
          return {
            ...prevState,
            timeLeft: 0,
            isPlaying: false,
            gameOver: true
          };
        }
        return {
          ...prevState,
          timeLeft: newTimeLeft
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.isPlaying, gameState.gameOver]);

  // Game over effect
  useEffect(() => {
    if (gameState.gameOver) {
      completeMiniGame('gold-mining', gameState.score, Math.floor(gameState.score / 10));
      setMessage(`⛏️ Time's up! You collected ${gameState.goldCollected} gold nuggets! Score: ${gameState.score}`);
    }
  }, [gameState.gameOver, gameState.score, gameState.goldCollected, completeMiniGame, setMessage]);

  const getNuggetEmoji = (size: string) => {
    switch (size) {
      case 'small': return '🪙';
      case 'medium': return '💰';
      case 'large': return '💎';
      default: return '🪙';
    }
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
          initial={{ scale: 1 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          ⛏️ Gold Mining
        </motion.h2>
        <p className="text-gray-300 mb-4">
          Use your hook to collect gold nuggets! Time the release perfectly to grab the valuable ones!
        </p>

        {!gameState.isPlaying && !gameState.gameOver ? (
          <motion.button
            className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-yellow-500/30 transition-all duration-300 btn-modern"
            onClick={startGame}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ⛏️ Start Mining
          </motion.button>
        ) : (
          <div className="flex justify-center gap-6 mb-4">
            <div className="glass-card px-4 py-2 rounded-lg">
              <span className="text-white font-semibold">Score: {gameState.score}</span>
            </div>
            <div className="glass-card px-4 py-2 rounded-lg">
              <span className="text-white font-semibold">Gold: {gameState.goldCollected}</span>
            </div>
            <div className="glass-card px-4 py-2 rounded-lg">
              <span className="text-white font-semibold">Time: {gameState.timeLeft}s</span>
            </div>
          </div>
        )}
      </div>

      {/* Game Area */}
      <motion.div
        className="relative mb-6 flex justify-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div
          className="relative rounded-xl border-2 border-gray-600 bg-gradient-to-b from-blue-900/50 to-amber-900/50 overflow-hidden cursor-pointer"
          style={{
            width: GAME_WIDTH,
            height: GAME_HEIGHT
          }}
          onClick={releaseHook}
        >
          {/* Ground */}
          <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-amber-800 to-amber-600"></div>

          {/* Hook base */}
          <div className="absolute w-4 h-4 bg-gray-600 rounded-full border-2 border-gray-400"
               style={{ left: HOOK_BASE_X - 8, top: HOOK_BASE_Y - 8 }}></div>

          {/* Hook line with claw at end */}
          <div className="absolute" style={{ left: HOOK_BASE_X, top: HOOK_BASE_Y }}>
            <motion.div
              className="bg-gray-400 relative"
              style={{
                width: 2,
                height: gameState.hookLength,
                transformOrigin: 'top center',
                transform: `rotate(${gameState.hookAngle}deg)`
              }}
            >
              {/* Hook claw at the end of the line */}
              <motion.div
                className="absolute w-3 h-3 bg-gray-600 rounded-full border border-gray-400"
                style={{
                  left: -6,
                  top: gameState.hookLength - 6
                }}
                animate={{
                  scale: gameState.hookExtended ? [1, 1.2, 1] : 1
                }}
                transition={{ duration: 0.3, repeat: gameState.hookExtended ? Infinity : 0 }}
              />


            </motion.div>
          </div>

          {/* Gold nuggets */}
          <AnimatePresence>
            {gameState.goldNuggets.map((nugget) => (
              !nugget.collected && (
                <motion.div
                  key={nugget.id}
                  className="absolute text-2xl"
                  style={{
                    left: nugget.x - 12,
                    top: nugget.y - 12
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{
                    scale: 0,
                    opacity: 0,
                    y: -50
                  }}
                  transition={{
                    duration: 0.3,
                    delay: nugget.id * 0.1
                  }}
                >
                  <motion.span
                    animate={{
                      y: [0, -5, 0],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: nugget.id * 0.2
                    }}
                  >
                    {getNuggetEmoji(nugget.size)}
                  </motion.span>
                </motion.div>
              )
            ))}
          </AnimatePresence>

          {/* Click prompt */}
          {gameState.isPlaying && !gameState.hookExtended && !gameState.hookReturning && (
            <motion.div
              className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white text-center"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <div className="text-2xl">👆</div>
              <div className="text-sm font-bold">Click to release hook!</div>
            </motion.div>
          )}
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
                <h3 className="text-2xl font-bold text-white mb-2">⏰ Time's Up!</h3>
                <p className="text-gray-300 mb-4">
                  Gold Collected: {gameState.goldCollected}<br />
                  Final Score: {gameState.score}
                </p>
                <div className="flex gap-3 justify-center">
                  <motion.button
                    className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-6 py-2 rounded-xl font-bold btn-modern"
                    onClick={startGame}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🔄 Mine Again
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
              <span className="text-2xl">⛏️</span>
              <div>
                <strong className="text-white">Hook:</strong> Swings back and forth automatically
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🪙</span>
              <div>
                <strong className="text-white">Small Gold:</strong> 25 points
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">💰</span>
              <div>
                <strong className="text-white">Medium Gold:</strong> 50 points
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">💎</span>
              <div>
                <strong className="text-white">Large Gold:</strong> 100 points
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">👆</span>
              <div>
                <strong className="text-white">Timing:</strong> Click when hook is near gold!
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">⏰</span>
              <div>
                <strong className="text-white">Time:</strong> {GAME_TIME} seconds to collect as much as possible!
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default GoldMiningGame;
