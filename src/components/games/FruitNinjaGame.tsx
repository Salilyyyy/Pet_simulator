import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store';
import { soundManager } from '../../utils/sounds';

interface Fruit {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  type: 'apple' | 'banana' | 'orange' | 'grape' | 'watermelon' | 'bomb';
  emoji: string;
  size: number;
  sliced: boolean;
  sliceTime?: number;
}

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface SliceTrail {
  id: string;
  points: { x: number; y: number; time: number }[];
  life: number;
}

const FRUIT_TYPES = {
  apple: { emoji: '🍎', points: 10, color: '#ff4444' },
  banana: { emoji: '🍌', points: 15, color: '#ffdd44' },
  orange: { emoji: '🍊', points: 12, color: '#ff8844' },
  grape: { emoji: '🍇', points: 8, color: '#8844ff' },
  watermelon: { emoji: '🍉', points: 20, color: '#44ff44' },
  bomb: { emoji: '💣', points: -50, color: '#444444' }
};

const FruitNinjaGame: React.FC = () => {
  const { setMessage, completeMiniGame } = useGameStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds
  const [lives, setLives] = useState(3);

  const [fruits, setFruits] = useState<Fruit[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [sliceTrails, setSliceTrails] = useState<SliceTrail[]>([]);

  const [isSlicing, setIsSlicing] = useState(false);
  const [sliceStart, setSliceStart] = useState<{ x: number; y: number } | null>(null);
  const [currentTrail, setCurrentTrail] = useState<SliceTrail | null>(null);

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const GRAVITY = 0.3;
  const FRUIT_SPAWN_RATE = 0.02;

  const createFruit = useCallback((x?: number, y?: number): Fruit => {
    const types = Object.keys(FRUIT_TYPES) as (keyof typeof FRUIT_TYPES)[];
    const type = types[Math.floor(Math.random() * types.length)]!;
    const fruitData = FRUIT_TYPES[type];

    return {
      id: `fruit-${Date.now()}-${Math.random()}`,
      x: x ?? Math.random() * CANVAS_WIDTH,
      y: y ?? CANVAS_HEIGHT + 50,
      vx: (Math.random() - 0.5) * 8,
      vy: -(Math.random() * 8 + 12),
      rotation: 0,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
      type,
      emoji: fruitData.emoji,
      size: 40 + Math.random() * 20,
      sliced: false
    };
  }, []);

  const createParticles = (fruit: Fruit) => {
    const newParticles: Particle[] = [];
    const particleCount = 8;

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: `particle-${Date.now()}-${i}`,
        x: fruit.x,
        y: fruit.y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 30,
        maxLife: 30,
        color: FRUIT_TYPES[fruit.type].color,
        size: 4 + Math.random() * 4
      });
    }

    setParticles(prev => [...prev, ...newParticles]);
  };

  const sliceFruit = (fruit: Fruit) => {
    if (fruit.sliced) return;

    const fruitData = FRUIT_TYPES[fruit.type];
    const points = fruitData.points * (combo > 0 ? combo + 1 : 1);

    if (fruit.type === 'bomb') {
      // Bomb explodes - game over immediately
      soundManager.playMatchFailure();
      createParticles(fruit);
      setGameCompleted(true);
      completeMiniGame('fruit-ninja', score, 2); // 2 = bomb hit
    } else {
      // Normal fruit sliced
      setScore(prev => prev + points);
      setCombo(prev => prev + 1);
      soundManager.playMatchSuccess();
      createParticles(fruit);
    }

    setFruits(prev => prev.map(f =>
      f.id === fruit.id ? { ...f, sliced: true, sliceTime: Date.now() } : f
    ));
  };

  const checkSliceCollision = (start: { x: number; y: number }, end: { x: number; y: number }) => {
    fruits.forEach(fruit => {
      if (fruit.sliced) return;

      // Simple line-circle collision detection
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const length = Math.sqrt(dx * dx + dy * dy);

      if (length === 0) return;

      const ux = dx / length;
      const uy = dy / length;

      const cx = fruit.x - start.x;
      const cy = fruit.y - start.y;

      const proj = cx * ux + cy * uy;
      const projX = start.x + proj * ux;
      const projY = start.y + proj * uy;

      const distToLine = Math.sqrt((fruit.x - projX) ** 2 + (fruit.y - projY) ** 2);

      if (distToLine <= fruit.size / 2 && proj >= 0 && proj <= length) {
        sliceFruit(fruit);
      }
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!gameStarted || gameCompleted) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsSlicing(true);
    setSliceStart({ x, y });

    const trail: SliceTrail = {
      id: `trail-${Date.now()}`,
      points: [{ x, y, time: Date.now() }],
      life: 10
    };
    setCurrentTrail(trail);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSlicing || !gameStarted || gameCompleted) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (sliceStart) {
      checkSliceCollision(sliceStart, { x, y });
    }

    setCurrentTrail(prev => prev ? {
      ...prev,
      points: [...prev.points, { x, y, time: Date.now() }]
    } : null);
  };

  const handleMouseUp = () => {
    setIsSlicing(false);
    setSliceStart(null);
    if (currentTrail) {
      setSliceTrails(prev => [...prev, currentTrail]);
    }
    setCurrentTrail(null);
  };

  const updateGame = useCallback(() => {
    // Update fruits
    setFruits(prev => prev.map(fruit => {
      if (fruit.sliced && fruit.sliceTime && Date.now() - fruit.sliceTime > 500) {
        return null; // Remove sliced fruits after animation
      }

      return {
        ...fruit,
        x: fruit.x + fruit.vx,
        y: fruit.y + fruit.vy,
        vy: fruit.vy + GRAVITY,
        rotation: fruit.rotation + fruit.rotationSpeed
      };
    }).filter(Boolean) as Fruit[]);

    // Update particles
    setParticles(prev => prev.map(particle => ({
      ...particle,
      x: particle.x + particle.vx,
      y: particle.y + particle.vy,
      vy: particle.vy + 0.1,
      life: particle.life - 1
    })).filter(particle => particle.life > 0));

    // Update slice trails
    setSliceTrails(prev => prev.map(trail => ({
      ...trail,
      life: trail.life - 1
    })).filter(trail => trail.life > 0));

    // Spawn new fruits
    if (Math.random() < FRUIT_SPAWN_RATE) {
      setFruits(prev => [...prev, createFruit()]);
    }

    // Remove fruits that are off screen
    setFruits(prev => prev.filter(fruit =>
      fruit.y < CANVAS_HEIGHT + 100 && fruit.x > -100 && fruit.x < CANVAS_WIDTH + 100
    ));

    // Check for missed fruits - lose 1 life for each missed fruit
    const missedFruits = fruits.filter(fruit =>
      !fruit.sliced && fruit.y > CANVAS_HEIGHT + 50
    );

    if (missedFruits.length > 0) {
      setCombo(0); // Reset combo when missing fruits
      setLives(prev => Math.max(0, prev - missedFruits.length)); // Lose 1 life per missed fruit
    }
  }, [fruits, createFruit]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw slice trails
    sliceTrails.forEach(trail => {
      if (trail.points.length < 2) return;

      ctx.strokeStyle = `rgba(255, 255, 255, ${trail.life / 10})`;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(trail.points[0].x, trail.points[0].y);
      for (let i = 1; i < trail.points.length; i++) {
        ctx.lineTo(trail.points[i].x, trail.points[i].y);
      }
      ctx.stroke();
    });

    // Draw current trail
    if (currentTrail && currentTrail.points.length > 1) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(currentTrail.points[0].x, currentTrail.points[0].y);
      for (let i = 1; i < currentTrail.points.length; i++) {
        ctx.lineTo(currentTrail.points[i].x, currentTrail.points[i].y);
      }
      ctx.stroke();
    }

    // Draw particles
    particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      ctx.fillStyle = particle.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw fruits
    fruits.forEach(fruit => {
      if (fruit.sliced && fruit.sliceTime && Date.now() - fruit.sliceTime > 200) {
        return; // Don't draw sliced fruits after a delay
      }

      ctx.save();
      ctx.translate(fruit.x, fruit.y);
      ctx.rotate(fruit.rotation);

      // Draw fruit emoji
      ctx.font = `${fruit.size}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (fruit.sliced) {
        // Draw sliced effect
        ctx.globalAlpha = 0.7;
        ctx.fillText(fruit.emoji, -10, 0);
        ctx.fillText(fruit.emoji, 10, 0);
      } else {
        ctx.fillText(fruit.emoji, 0, 0);
      }

      ctx.restore();
    });
  }, [fruits, particles, sliceTrails, currentTrail]);

  const gameLoop = useCallback(() => {
    updateGame();
    draw();
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [updateGame, draw]);

  useEffect(() => {
    if (gameStarted && !gameCompleted) {
      animationRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameStarted, gameCompleted, gameLoop]);

  useEffect(() => {
    if (!gameStarted || gameCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameCompleted(true);
          completeMiniGame('fruit-ninja', score, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameCompleted, score, completeMiniGame]);

  useEffect(() => {
    if (lives <= 0) {
      setGameCompleted(true);
      completeMiniGame('fruit-ninja', score, 1);
    }
  }, [lives, score, completeMiniGame]);

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setCombo(0);
    setTimeLeft(60);
    setLives(3);
    setFruits([]);
    setParticles([]);
    setSliceTrails([]);
    setGameCompleted(false);
    soundManager.playGameStart();
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
          🗡️ Fruit Ninja
        </motion.h2>
        <p className="text-gray-300 mb-4">
          Slice fruits by dragging your mouse! Avoid the bombs!
        </p>

        {!gameStarted ? (
          <motion.button
            className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-red-500/30 transition-all duration-300 btn-modern"
            onClick={startGame}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🎮 Start Slicing!
          </motion.button>
        ) : (
          <div className="flex justify-center gap-6 mb-4">
            <div className="glass-card px-4 py-2 rounded-lg">
              <span className="text-white font-semibold">Score: {score}</span>
            </div>
            <div className="glass-card px-4 py-2 rounded-lg">
              <span className="text-white font-semibold">Combo: {combo}x</span>
            </div>
            <div className="glass-card px-4 py-2 rounded-lg">
              <span className="text-white font-semibold">Lives: {lives}</span>
            </div>
            <div className="glass-card px-4 py-2 rounded-lg">
              <span className="text-white font-semibold">Time: {timeLeft}s</span>
            </div>
          </div>
        )}
      </div>

      {/* Game Canvas */}
      {gameStarted && (
        <motion.div
          className="flex justify-center mb-6"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="border-2 border-gray-600 rounded-xl bg-gradient-to-b from-blue-900 to-blue-950 cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </motion.div>
      )}

      {/* Game Completion */}
      {gameCompleted && (
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="glass-card p-6 rounded-2xl inline-block">
            <h3 className="text-3xl font-bold text-white mb-4">
              {lives <= 0 ? '💥 Game Over!' : '⏰ Time\'s Up!'}
            </h3>
            <p className="text-xl text-yellow-400 mb-4">
              Final Score: {score}
            </p>
            <p className="text-gray-300 mb-6">
              {lives <= 0 ? 'You hit a bomb!' : 'Great slicing!'}
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
              <span className="text-2xl">🗡️</span>
              <div>
                <strong className="text-white">Slice:</strong> Click and drag to slice fruits
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🍎</span>
              <div>
                <strong className="text-white">Fruits:</strong> Different fruits give different points
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">💣</span>
              <div>
                <strong className="text-white">Bombs:</strong> Avoid slicing bombs or lose a life
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔥</span>
              <div>
                <strong className="text-white">Combo:</strong> Chain slices for bonus points
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default FruitNinjaGame;
