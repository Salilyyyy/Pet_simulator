import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store';
import { soundManager } from '../../utils/sounds';

interface Position {
  x: number;
  y: number;
}

interface Pellet {
  id: string;
  x: number;
  y: number;
  size: number;
}

interface Player {
  id: string;
  segments: Position[];
  direction: number; // angle in radians
  speed: number;
  size: number;
  color: string;
  isPlayer: boolean;
}

interface GameState {
  player: Player;
  pellets: Pellet[];
  enemies: Player[];
  score: number;
  gameOver: boolean;
  isPlaying: boolean;
  boost: boolean;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PLAYER_SPEED = 2;
const BOOST_SPEED = 4;
const INITIAL_SIZE = 10;
const PELLET_COUNT = 200;
const ENEMY_COUNT = 5;
const GROWTH_RATE = 0.5;

const SlitherGame: React.FC = () => {
  const { setMessage, completeMiniGame, currentPet } = useGameStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const mouseRef = useRef({ x: 0, y: 0 });

  const [gameState, setGameState] = useState<GameState>({
    player: {
      id: 'player',
      segments: [{ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 }],
      direction: 0,
      speed: PLAYER_SPEED,
      size: INITIAL_SIZE,
      color: '#4ade80',
      isPlayer: true
    },
    pellets: [],
    enemies: [],
    score: 0,
    gameOver: false,
    isPlaying: false,
    boost: false
  });

  const generatePellets = useCallback((): Pellet[] => {
    const pellets: Pellet[] = [];
    for (let i = 0; i < PELLET_COUNT; i++) {
      pellets.push({
        id: `pellet-${i}`,
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        size: 2 + Math.random() * 3
      });
    }
    return pellets;
  }, []);

  const generateEnemies = useCallback((): Player[] => {
    const enemies: Player[] = [];
    const colors = ['#ef4444', '#f97316', '#eab308', '#8b5cf6', '#ec4899'];

    for (let i = 0; i < ENEMY_COUNT; i++) {
      enemies.push({
        id: `enemy-${i}`,
        segments: [{
          x: Math.random() * CANVAS_WIDTH,
          y: Math.random() * CANVAS_HEIGHT
        }],
        direction: Math.random() * Math.PI * 2,
        speed: PLAYER_SPEED * 0.8,
        size: INITIAL_SIZE + Math.random() * 20,
        color: colors[i % colors.length],
        isPlayer: false
      });
    }
    return enemies;
  }, []);

  const checkCollision = useCallback((pos: Position, size: number, otherPos: Position, otherSize: number): boolean => {
    const dx = pos.x - otherPos.x;
    const dy = pos.y - otherPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (size + otherSize) / 2;
  }, []);

  const updatePlayerDirection = useCallback((mouseX: number, mouseY: number, playerX: number, playerY: number) => {
    const dx = mouseX - playerX;
    const dy = mouseY - playerY;
    return Math.atan2(dy, dx);
  }, []);

  const movePlayer = useCallback((player: Player, targetDirection?: number): Player => {
    const direction = targetDirection !== undefined ? targetDirection : player.direction;
    const speed = gameState.boost ? BOOST_SPEED : player.speed;

    const head = { ...player.segments[0] };
    head.x += Math.cos(direction) * speed;
    head.y += Math.sin(direction) * speed;

    // Wrap around edges
    if (head.x < 0) head.x = CANVAS_WIDTH;
    if (head.x > CANVAS_WIDTH) head.x = 0;
    if (head.y < 0) head.y = CANVAS_HEIGHT;
    if (head.y > CANVAS_HEIGHT) head.y = 0;

    const newSegments = [head, ...player.segments];

    // Remove tail segments if not growing
    if (newSegments.length > Math.floor(player.size)) {
      newSegments.pop();
    }

    return {
      ...player,
      segments: newSegments,
      direction
    };
  }, [gameState.boost]);

  const moveEnemies = useCallback((enemies: Player[]): Player[] => {
    return enemies.map(enemy => {
      // Simple AI: move in random directions occasionally
      let newDirection = enemy.direction;
      if (Math.random() < 0.02) {
        newDirection = Math.random() * Math.PI * 2;
      }

      return movePlayer(enemy, newDirection);
    });
  }, [movePlayer]);

  const checkPelletCollisions = useCallback((player: Player, pellets: Pellet[]): { newPellets: Pellet[], newSize: number, newScore: number } => {
    let newPellets = [...pellets];
    let newSize = player.size;
    let newScore = gameState.score;

    player.segments.forEach(segment => {
      newPellets = newPellets.filter(pellet => {
        if (checkCollision(segment, player.size, { x: pellet.x, y: pellet.y }, pellet.size)) {
          newSize += GROWTH_RATE;
          newScore += 10;
          soundManager.playMatchSuccess();
          return false;
        }
        return true;
      });
    });

    // Regenerate pellets if needed
    while (newPellets.length < PELLET_COUNT) {
      newPellets.push({
        id: Date.now() + Math.random(),
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        size: 2 + Math.random() * 3
      });
    }

    return { newPellets, newSize, newScore };
  }, [gameState.score, checkCollision]);

  const checkEnemyCollisions = useCallback((player: Player, enemies: Player[], pellets: Pellet[]): { newEnemies: Player[], newPellets: Pellet[], gameOver: boolean, newSize: number, newScore: number } => {
    let newEnemies = [...enemies];
    let newPellets = [...pellets];
    let gameOver = false;
    let newSize = player.size;
    let newScore = gameState.score;

    // Check if player eats enemies (head-on collision)
    newEnemies = newEnemies.filter(enemy => {
      if (player.size > enemy.size * 1.2) {
        const headCollision = checkCollision(player.segments[0], player.size, enemy.segments[0], enemy.size);
        if (headCollision) {
          newSize += enemy.size * 0.5;
          newScore += Math.floor(enemy.size);
          soundManager.playMatchSuccess();
          return false;
        }
      }
      return true;
    });

    // Check if player hits enemy bodies
    for (const enemy of newEnemies) {
      for (const segment of enemy.segments) {
        if (checkCollision(player.segments[0], player.size, segment, enemy.size)) {
          gameOver = true;
          // Convert player to food pellets
          const pelletCount = Math.floor(player.size / 2);
          for (let i = 0; i < pelletCount; i++) {
            newPellets.push({
              id: `food-${Date.now()}-${i}`,
              x: player.segments[0].x + (Math.random() - 0.5) * 50,
              y: player.segments[0].y + (Math.random() - 0.5) * 50,
              size: 3 + Math.random() * 4
            });
          }
          break;
        }
      }
      if (gameOver) break;
    }

    // Check if enemies eat player (head-on)
    for (const enemy of newEnemies) {
      if (enemy.size > player.size * 1.2) {
        const headCollision = checkCollision(enemy.segments[0], enemy.size, player.segments[0], player.size);
        if (headCollision) {
          gameOver = true;
          // Convert player to food pellets
          const pelletCount = Math.floor(player.size / 2);
          for (let i = 0; i < pelletCount; i++) {
            newPellets.push({
              id: `food-${Date.now()}-${i}`,
              x: player.segments[0].x + (Math.random() - 0.5) * 50,
              y: player.segments[0].y + (Math.random() - 0.5) * 50,
              size: 3 + Math.random() * 4
            });
          }
          break;
        }
      }
    }

    // Check if enemies hit each other's bodies or player bodies
    newEnemies = newEnemies.filter(enemy => {
      // Check if enemy hits player body
      for (const playerSegment of player.segments.slice(1)) {
        if (checkCollision(enemy.segments[0], enemy.size, playerSegment, player.size)) {
          // Convert enemy to food
          const pelletCount = Math.floor(enemy.size / 2);
          for (let i = 0; i < pelletCount; i++) {
            newPellets.push({
              id: `food-enemy-${Date.now()}-${i}`,
              x: enemy.segments[0].x + (Math.random() - 0.5) * 50,
              y: enemy.segments[0].y + (Math.random() - 0.5) * 50,
              size: 3 + Math.random() * 4
            });
          }
          return false;
        }
      }

      // Check if enemy hits other enemy bodies
      for (const otherEnemy of newEnemies) {
        if (otherEnemy.id !== enemy.id) {
          for (const segment of otherEnemy.segments.slice(1)) {
            if (checkCollision(enemy.segments[0], enemy.size, segment, otherEnemy.size)) {
              // Convert enemy to food
              const pelletCount = Math.floor(enemy.size / 2);
              for (let i = 0; i < pelletCount; i++) {
                newPellets.push({
                  id: `food-enemy-${Date.now()}-${i}`,
                  x: enemy.segments[0].x + (Math.random() - 0.5) * 50,
                  y: enemy.segments[0].y + (Math.random() - 0.5) * 50,
                  size: 3 + Math.random() * 4
                });
              }
              return false;
            }
          }
        }
      }

      return true;
    });

    // Regenerate enemies if needed
    while (newEnemies.length < ENEMY_COUNT) {
      newEnemies.push({
        id: `enemy-${Date.now()}-${Math.random()}`,
        segments: [{
          x: Math.random() * CANVAS_WIDTH,
          y: Math.random() * CANVAS_HEIGHT
        }],
        direction: Math.random() * Math.PI * 2,
        speed: PLAYER_SPEED * 0.8,
        size: INITIAL_SIZE + Math.random() * 20,
        color: ['#ef4444', '#f97316', '#eab308', '#8b5cf6', '#ec4899'][newEnemies.length % 5],
        isPlayer: false
      });
    }

    return { newEnemies, newPellets, gameOver, newSize, newScore };
  }, [gameState.score, checkCollision]);

  const gameLoop = useCallback(() => {
    setGameState(prevState => {
      if (prevState.gameOver || !prevState.isPlaying) return prevState;

      const mousePos = mouseRef.current;
      const playerHead = prevState.player.segments[0];
      const newDirection = updatePlayerDirection(mousePos.x, mousePos.y, playerHead.x, playerHead.y);

      const updatedPlayer = movePlayer({ ...prevState.player, direction: newDirection });
      const updatedEnemies = moveEnemies(prevState.enemies);

      const pelletResult = checkPelletCollisions(updatedPlayer, prevState.pellets);
      const enemyResult = checkEnemyCollisions(
        { ...updatedPlayer, size: pelletResult.newSize },
        updatedEnemies,
        pelletResult.newPellets
      );

      return {
        ...prevState,
        player: { ...updatedPlayer, size: enemyResult.newSize },
        pellets: pelletResult.newPellets,
        enemies: enemyResult.newEnemies,
        score: enemyResult.newScore,
        gameOver: enemyResult.gameOver
      };
    });
  }, [movePlayer, moveEnemies, checkPelletCollisions, checkEnemyCollisions, updatePlayerDirection]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw pellets
    gameState.pellets.forEach(pellet => {
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(pellet.x, pellet.y, pellet.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw enemies
    gameState.enemies.forEach(enemy => {
      ctx.strokeStyle = enemy.color;
      ctx.lineWidth = Math.max(2, enemy.size / 4);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      enemy.segments.forEach((segment, index) => {
        if (index === 0) {
          ctx.moveTo(segment.x, segment.y);
        } else {
          ctx.lineTo(segment.x, segment.y);
        }
      });
      ctx.stroke();

      // Draw enemy head
      ctx.fillStyle = enemy.color;
      ctx.beginPath();
      ctx.arc(enemy.segments[0].x, enemy.segments[0].y, enemy.size / 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw player
    ctx.strokeStyle = gameState.player.color;
    ctx.lineWidth = Math.max(2, gameState.player.size / 4);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    gameState.player.segments.forEach((segment, index) => {
      if (index === 0) {
        ctx.moveTo(segment.x, segment.y);
      } else {
        ctx.lineTo(segment.x, segment.y);
      }
    });
    ctx.stroke();

    // Draw player head with pet emoji
    const head = gameState.player.segments[0];
    ctx.fillStyle = gameState.player.color;
    ctx.beginPath();
    ctx.arc(head.x, head.y, gameState.player.size / 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw pet emoji on head
    ctx.fillStyle = '#ffffff';
    ctx.font = `${gameState.player.size}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(currentPet?.typeData.emoji || '🐍', head.x, head.y);
  }, [gameState, currentPet]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const handleMouseDown = () => {
      setGameState(prev => ({ ...prev, boost: true }));
    };

    const handleMouseUp = () => {
      setGameState(prev => ({ ...prev, boost: false }));
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, [gameState.isPlaying]);

  useEffect(() => {
    if (gameState.isPlaying && !gameState.gameOver) {
      const loop = () => {
        gameLoop();
        animationRef.current = requestAnimationFrame(loop);
      };
      animationRef.current = requestAnimationFrame(loop);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState.isPlaying, gameState.gameOver, gameLoop]);

  useEffect(() => {
    if (gameState.isPlaying) {
      draw();
    }
  }, [gameState, draw]);

  useEffect(() => {
    if (gameState.gameOver) {
      soundManager.playMatchFailure();
      completeMiniGame('slither-game', gameState.score, Math.floor(gameState.score / 50));
      setMessage(`🐍 Game Over! Final Score: ${gameState.score}`);
    }
  }, [gameState.gameOver, gameState.score, completeMiniGame, setMessage]);

  const startGame = useCallback(() => {
    const initialPellets = generatePellets();
    const initialEnemies = generateEnemies();

    setGameState({
      player: {
        id: 'player',
        segments: [{ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 }],
        direction: 0,
        speed: PLAYER_SPEED,
        size: INITIAL_SIZE,
        color: '#4ade80',
        isPlayer: true
      },
      pellets: initialPellets,
      enemies: initialEnemies,
      score: 0,
      gameOver: false,
      isPlaying: true,
      boost: false
    });

    soundManager.playGameStart();
  }, [generatePellets, generateEnemies]);

  const resetGame = useCallback(() => {
    setGameState({
      player: {
        id: 'player',
        segments: [{ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 }],
        direction: 0,
        speed: PLAYER_SPEED,
        size: INITIAL_SIZE,
        color: '#4ade80',
        isPlayer: true
      },
      pellets: [],
      enemies: [],
      score: 0,
      gameOver: false,
      isPlaying: false,
      boost: false
    });
  }, []);

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
          initial={{ scale: 1 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          🐍 Slither Game
        </motion.h2>
        <p className="text-gray-300 mb-4">
          Control your pet worm! Eat pellets and smaller enemies to grow bigger!
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
              <span className="text-white font-semibold">Size: {Math.floor(gameState.player.size)}</span>
            </div>
            <div className="glass-card px-4 py-2 rounded-lg">
              <span className="text-white font-semibold">Boost: {gameState.boost ? 'ON' : 'OFF'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Game Canvas */}
      <motion.div
        className="relative mb-6 flex justify-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-2 border-gray-600 rounded-xl bg-slate-900 cursor-none"
          style={{ maxWidth: '100%', height: 'auto' }}
        />

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
                  Final Size: {Math.floor(gameState.player.size)}
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
              <div>🖱️ Move: Mouse</div>
              <div>⚡ Boost: Click & Hold</div>
              <div>🍎 Pellets: +10 points</div>
              <div>🐛 Enemies: Size bonus</div>
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
              <span className="text-2xl">🖱️</span>
              <div>
                <strong className="text-white">Mouse Control:</strong> Move mouse to steer your worm
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <strong className="text-white">Boost:</strong> Click and hold to move faster
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🍎</span>
              <div>
                <strong className="text-white">Pellets:</strong> Eat yellow pellets to grow
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🐛</span>
              <div>
                <strong className="text-white">Enemies:</strong> Eat smaller worms to grow big
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔄</span>
              <div>
                <strong className="text-white">World:</strong> Edges wrap around
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">💀</span>
              <div>
                <strong className="text-white">Danger:</strong> Don't get eaten by bigger worms
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SlitherGame;
