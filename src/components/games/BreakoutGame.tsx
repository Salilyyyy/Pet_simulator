import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store';
import { soundManager } from '../../utils/sounds';

interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
}

interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  color: string;
}

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 500;
const PADDLE_WIDTH = 80;
const PADDLE_HEIGHT = 10;
const BALL_RADIUS = 8;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_WIDTH = CANVAS_WIDTH / BRICK_COLS;
const BRICK_HEIGHT = 20;

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];

const BreakoutGame: React.FC = () => {
  const { currentPet, setMessage, completeMiniGame } = useGameStore();
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);

  const [ball, setBall] = useState<Ball>({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 50,
    dx: 3,
    dy: -3,
    radius: BALL_RADIUS
  });

  const [paddle, setPaddle] = useState<Paddle>({
    x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
    y: CANVAS_HEIGHT - 20,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    speed: 8
  });

  const [bricks, setBricks] = useState<Brick[]>(() => {
    const brickArray: Brick[] = [];
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        brickArray.push({
          x: col * BRICK_WIDTH,
          y: row * BRICK_HEIGHT + 50,
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          visible: true,
          color: COLORS[row % COLORS.length]
        });
      }
    }
    return brickArray;
  });

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Get pet emoji
  const petEmoji = currentPet?.typeData.emoji || '🐱';

  // Initialize game
  const startGame = useCallback(() => {
    setGameStarted(true);
    setGameOver(false);
    setWon(false);
    setScore(0);
    setLives(3);

    // Reset ball
    setBall({
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - 50,
      dx: 3,
      dy: -3,
      radius: BALL_RADIUS
    });

    // Reset paddle
    setPaddle({
      x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
      y: CANVAS_HEIGHT - 20,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
      speed: 8
    });

    // Reset bricks
    const brickArray: Brick[] = [];
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        brickArray.push({
          x: col * BRICK_WIDTH,
          y: row * BRICK_HEIGHT + 50,
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          visible: true,
          color: COLORS[row % COLORS.length]
        });
      }
    }
    setBricks(brickArray);

    soundManager.playGameStart();
  }, []);

  // Handle mouse movement for paddle
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!gameAreaRef.current || !gameStarted || gameOver || won) return;

    const rect = gameAreaRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const paddleX = Math.max(0, Math.min(CANVAS_WIDTH - PADDLE_WIDTH, x - PADDLE_WIDTH / 2));

    setPaddle(prev => ({
      ...prev,
      x: paddleX
    }));
  }, [gameStarted, gameOver, won]);

  // Check collision between ball and rectangle
  const checkCollision = (ball: Ball, rect: { x: number; y: number; width: number; height: number }) => {
    return ball.x + ball.radius > rect.x &&
           ball.x - ball.radius < rect.x + rect.width &&
           ball.y + ball.radius > rect.y &&
           ball.y - ball.radius < rect.y + rect.height;
  };

  // Update game state
  const updateGame = useCallback(() => {
    if (!gameStarted || gameOver || won) return;

    setBall(prevBall => {
      let newBall = { ...prevBall };
      let brickHit = false;

      // Move ball
      newBall.x += newBall.dx;
      newBall.y += newBall.dy;

      // Ball collision with walls
      if (newBall.x - newBall.radius <= 0 || newBall.x + newBall.radius >= CANVAS_WIDTH) {
        newBall.dx = -newBall.dx;
        soundManager.playTileSelect();
      }

      if (newBall.y - newBall.radius <= 0) {
        newBall.dy = -newBall.dy;
        soundManager.playTileSelect();
      }

      // Ball collision with paddle
      if (checkCollision(newBall, paddle)) {
        // Calculate angle based on where ball hits paddle
        const hitPos = (newBall.x - paddle.x) / paddle.width;
        const angle = (hitPos - 0.5) * Math.PI / 3; // Max 60 degrees
        const speed = Math.sqrt(newBall.dx * newBall.dx + newBall.dy * newBall.dy);

        newBall.dx = speed * Math.sin(angle);
        newBall.dy = -Math.abs(speed * Math.cos(angle)); // Always go up

        soundManager.playMatchSuccess();
      }

      // Ball collision with bricks - only break one brick per collision
      setBricks(prevBricks => {
        for (let i = 0; i < prevBricks.length; i++) {
          const brick = prevBricks[i];
          if (brick.visible && checkCollision(newBall, brick)) {
            // Break only this brick
            const newBricks = [...prevBricks];
            newBricks[i] = { ...brick, visible: false };
            setScore(prev => prev + 10);

            // Ball falls down after hitting brick
            newBall.dy = Math.abs(newBall.dy); // Make sure it goes down

            // Gradually increase ball speed
            const speedMultiplier = 1.02;
            newBall.dx *= speedMultiplier;
            newBall.dy *= speedMultiplier;

            soundManager.playMatchSuccess();
            brickHit = true;
            return newBricks;
          }
        }
        return prevBricks;
      });

      // Ball falls off bottom
      if (newBall.y + newBall.radius >= CANVAS_HEIGHT) {
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            setGameOver(true);
            completeMiniGame('breakout', score, 0);
            setMessage(`💔 Game Over! Final Score: ${score}`);
          } else {
            // Reset ball position
            newBall.x = CANVAS_WIDTH / 2;
            newBall.y = CANVAS_HEIGHT - 50;
            newBall.dx = 3;
            newBall.dy = -3;
          }
          return newLives;
        });
      }

      return newBall;
    });

    // Check win condition
    const remainingBricks = bricks.filter(brick => brick.visible).length;
    if (remainingBricks === 0 && !won) {
      setWon(true);
      completeMiniGame('breakout', score + 100, 1);
      setMessage(`🎉 You won! All bricks cleared! Score: ${score + 100}`);
      soundManager.playGameComplete();
    }
  }, [gameStarted, gameOver, won, paddle, bricks, score, completeMiniGame, setMessage]);

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

  return (
    <motion.div
      className="max-w-4xl mx-auto p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Game Header */}
      <div className="text-center mb-8">
        <motion.h2
          className="text-3xl font-bold gradient-text mb-4"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          🧱 Breakout
        </motion.h2>
        <p className="text-gray-300 mb-4">
          Break all the bricks with your ball! Control the paddle to keep the ball in play.
        </p>

        {/* Pet Display */}
        <motion.div
          className="text-center mb-4"
          animate={{
            scale: won ? [1, 1.1, 1] : 1,
            rotate: won ? [0, -5, 5, 0] : 0
          }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-6xl mb-2">{petEmoji}</div>
          <div className="text-gray-300">
            {won && "🎉 Amazing!"}
            {gameOver && "💔 Oh no!"}
            {!won && !gameOver && "Help me break those bricks! 🧱"}
          </div>
        </motion.div>

        {!gameStarted ? (
          <motion.button
            className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-orange-500/30 transition-all duration-300 btn-modern"
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
            <div className="glass-card px-4 py-2 rounded-lg">
              <span className="text-white font-semibold">Bricks: {bricks.filter(b => b.visible).length}</span>
            </div>
          </div>
        )}
      </div>

      {/* Game Area */}
      {gameStarted && (
        <div className="flex justify-center mb-8">
          <motion.div
            className="relative bg-gradient-to-b from-blue-900 to-purple-900 rounded-2xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div
              ref={gameAreaRef}
              className="relative cursor-crosshair"
              style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
              onMouseMove={handleMouseMove}
            >
              {/* Background */}
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-900 to-purple-900 opacity-50" />

              {/* Bricks */}
              <AnimatePresence>
                {bricks.map((brick, index) => (
                  brick.visible && (
                    <motion.div
                      key={index}
                      className="absolute rounded-sm border border-white/20"
                      style={{
                        left: brick.x,
                        top: brick.y,
                        width: brick.width - 2,
                        height: brick.height - 2,
                        backgroundColor: brick.color
                      }}
                      initial={{ scale: 1 }}
                      exit={{
                        scale: 0,
                        opacity: 0,
                        transition: { duration: 0.2 }
                      }}
                    />
                  )
                ))}
              </AnimatePresence>

              {/* Ball */}
              <motion.div
                className="absolute w-4 h-4 bg-yellow-400 rounded-full shadow-lg shadow-yellow-400/50"
                style={{
                  left: ball.x - ball.radius,
                  top: ball.y - ball.radius,
                  width: ball.radius * 2,
                  height: ball.radius * 2
                }}
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 0.3,
                  repeat: Infinity
                }}
              />

              {/* Paddle */}
              <motion.div
                className="absolute bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg shadow-lg"
                style={{
                  left: paddle.x,
                  top: paddle.y,
                  width: paddle.width,
                  height: paddle.height
                }}
                animate={{
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity
                }}
              />

              {/* Game Over Overlay */}
              <AnimatePresence>
                {(gameOver || won) && (
                  <motion.div
                    className="absolute inset-0 bg-black/80 rounded-2xl flex items-center justify-center"
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
                      <h3 className={`text-3xl font-bold mb-2 ${won ? 'text-green-400' : 'text-red-400'}`}>
                        {won ? '🎉 You Win!' : '💔 Game Over!'}
                      </h3>
                      <p className="text-gray-300 mb-4">
                        {won ? 'All bricks cleared!' : 'You ran out of lives!'}<br />
                        Final Score: {score}
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
                          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-xl font-bold btn-modern"
                          onClick={() => setGameStarted(false)}
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
            </div>
          </motion.div>
        </div>
      )}

      {/* Instructions */}
      {!gameStarted && (
        <motion.div
          className="glass-card p-6 rounded-2xl mt-8 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-xl font-bold text-white mb-4 text-center">📋 How to Play</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🏓</span>
              <div>
                <strong className="text-white">Ball:</strong> Bounces off walls, paddle, and bricks
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🏊</span>
              <div>
                <strong className="text-white">Paddle:</strong> Move mouse to control paddle position
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🧱</span>
              <div>
                <strong className="text-white">Bricks:</strong> Break them by hitting with the ball
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">❤️</span>
              <div>
                <strong className="text-white">Lives:</strong> You have 3 lives, don't let ball fall
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <strong className="text-white">Objective:</strong> Break all bricks to win
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🏆</span>
              <div>
                <strong className="text-white">Score:</strong> 10 points per brick broken
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default BreakoutGame;
