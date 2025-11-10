import React, { useState, Suspense, lazy, memo } from 'react';
import { motion } from 'framer-motion';

// Lazy load all game components
const PikachuMatchGame = lazy(() => import('../games/PikachuMatchGame'));
const SnakeGame = lazy(() => import('../games/SnakeGame'));
const FeedingFrenzyGame = lazy(() => import('../games/FeedingFrenzyGame'));
const CatchGame = lazy(() => import('../games/CatchGame'));
const PuzzleGame = lazy(() => import('../games/PuzzleGame'));
const PetWordPuzzleGame = lazy(() => import('../games/PetWordPuzzleGame'));
const RockPaperScissorsGame = lazy(() => import('../games/RockPaperScissorsGame'));
const TicTacToeGame = lazy(() => import('../games/TicTacToeGame'));
const HangmanGame = lazy(() => import('../games/HangmanGame'));
const BreakoutGame = lazy(() => import('../games/BreakoutGame'));
const SlitherGame = lazy(() => import('../games/SlitherGame'));
const SudokuGame = lazy(() => import('../games/SudokuGame'));
const MillionaireGame = lazy(() => import('../games/MillionaireGame'));
const FruitNinjaGame = lazy(() => import('../games/FruitNinjaGame'));
const GoldMiningGame = lazy(() => import('../games/GoldMiningGame'));

const MiniGamesTab: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const games = [
    {
      id: 'pikachu-match',
      name: 'Pet Match Game',
      icon: '🐾',
      cost: 15,
      description: 'Match identical pet images to make them disappear!',
      component: PikachuMatchGame,
      featured: true
    },

    {
      id: 'pet-word-puzzle',
      name: 'Pet Word Puzzle',
      icon: '📝',
      cost: 16,
      description: 'Find pet-related words by connecting letters!',
      component: PetWordPuzzleGame
    },
    {
      id: 'puzzle-game',
      name: 'Block Puzzle',
      icon: '🧩',
      cost: 18,
      description: 'Arrange falling blocks to complete horizontal lines!',
      component: PuzzleGame
    },
    {
      id: 'snake-game',
      name: 'Snake Game',
      icon: '🐍',
      cost: 15,
      description: 'Control your pet snake and eat food to grow!',
      component: SnakeGame
    },
    {
      id: 'feeding-frenzy',
      name: 'Feeding Frenzy',
      icon: '🍎',
      cost: 25,
      description: 'Catch falling food with your pet!',
      component: FeedingFrenzyGame
    },
    {
      id: 'catch-game',
      name: 'Fruit Shooter',
      icon: '🔫',
      cost: 20,
      description: 'Shoot falling fruits with your pet!',
      component: CatchGame
    },
    {
      id: 'rock-paper-scissors',
      name: 'Rock Paper Scissors',
      icon: '✂️',
      cost: 12,
      description: 'Challenge your pet to Rock Paper Scissors!',
      component: RockPaperScissorsGame
    },
    {
      id: 'tic-tac-toe',
      name: 'Tic Tac Toe',
      icon: '⭕',
      cost: 14,
      description: 'Play Tic Tac Toe against your pet!',
      component: TicTacToeGame
    },
    {
      id: 'hangman',
      name: 'Hangman',
      icon: '🪢',
      cost: 13,
      description: 'Guess letters to save your pet from hanging!',
      component: HangmanGame
    },
    {
      id: 'breakout',
      name: 'Breakout',
      icon: '🧱',
      cost: 17,
      description: 'Break all bricks with your ball!',
      component: BreakoutGame
    },
    {
      id: 'slither-game',
      name: 'Slither.io',
      icon: '🐍',
      cost: 22,
      description: 'Grow your worm by eating pellets and other players!',
      component: SlitherGame
    },
    {
      id: 'sudoku',
      name: 'Pet Sudoku',
      icon: '🧩',
      cost: 21,
      description: 'Fill the grid with numbers 1-9. No repeats allowed!',
      component: SudokuGame,
      featured: true
    },
    {
      id: 'millionaire',
      name: 'Ai Là Triệu Phú',
      icon: '💰',
      cost: 28,
      description: 'Answer questions to win big prizes!',
      component: MillionaireGame,
      featured: true
    },
    {
      id: 'fruit-ninja',
      name: 'Fruit Ninja',
      icon: '🗡️',
      cost: 23,
      description: 'Slice flying fruits with your mouse!',
      component: FruitNinjaGame,
      featured: true
    },
    {
      id: 'gold-mining',
      name: 'Gold Mining',
      icon: '⛏️',
      cost: 19,
      description: 'Dig for gold nuggets in this exciting mining adventure!',
      component: GoldMiningGame,
      featured: true
    }
  ];

  const handleGameSelect = (gameId: string) => {
    setSelectedGame(gameId);
  };

  const handleBackToMenu = () => {
    setSelectedGame(null);
  };

  // If a game is selected, show that game
  if (selectedGame) {
    const selectedGameData = games.find(g => g.id === selectedGame);
    const GameComponent = selectedGameData?.component;

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-4">
          <motion.button
            className="bg-glass-bg/30 backdrop-blur-md border border-glass-border text-white px-4 py-2 rounded-xl hover:bg-glass-bg/50 transition-all duration-300 flex items-center gap-2"
            onClick={handleBackToMenu}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ← Back to Games
          </motion.button>
        </div>
        {GameComponent && (
          <Suspense fallback={
            <motion.div
              className="flex items-center justify-center p-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-white">Loading game...</p>
              </div>
            </motion.div>
          }>
            <GameComponent />
          </Suspense>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h3
        className="text-2xl font-bold text-white text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        🎮 Mini-Games
      </motion.h3>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {games.map((game, index) => (
          <motion.div
            key={game.name}
            className={`glass-card p-6 text-center transition-all duration-300 relative overflow-hidden ${
              game.featured ? 'ring-2 ring-yellow-400/50 shadow-yellow-400/20' : ''
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.4 }}
            whileHover={{ scale: 1.05, y: -2 }}
          >
            {/* Featured badge */}
            {game.featured && (
              <motion.div
                className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-1 rounded-full text-xs font-bold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.6, type: "spring" }}
              >
                ⭐ NEW
              </motion.div>
            )}

            {/* Game icon with animation */}
            <motion.div
              className="text-6xl mb-4 relative"
              whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.3 }}
            >
              {game.icon}
              {/* Floating particles */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                    style={{
                      top: `${20 + i * 20}%`,
                      left: `${30 + i * 20}%`,
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.3
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>

            <h4 className="text-xl font-bold text-white mb-2">{game.name}</h4>
            <p className="text-gray-300 mb-4 text-sm">{game.description}</p>

            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-yellow-400 font-bold">{game.cost}🪙</span>
              <span className="text-gray-400 text-sm">per game</span>
            </div>

            <motion.button
              className={`px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 btn-modern ${
                game.featured
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:shadow-purple-500/30'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:shadow-blue-500/30'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => game.id ? handleGameSelect(game.id) : alert(`${game.name} coming soon!`)}
            >
              {game.id ? '🎮 Play Now' : '🔒 Coming Soon'}
            </motion.button>
          </motion.div>
        ))}
      </motion.div>

      {/* Game Stats/Info */}
      <motion.div
        className="glass-card p-6 rounded-2xl max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <h4 className="text-lg font-bold text-white mb-4 text-center">🎯 Game Features</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-3">
            <span className="text-green-400">⚡</span>
            <span className="text-gray-300">Real-time scoring system</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-blue-400">⏰</span>
            <span className="text-gray-300">Time-based challenges</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-purple-400">🏆</span>
            <span className="text-gray-300">Achievement unlocks</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-yellow-400">🎨</span>
            <span className="text-gray-300">Beautiful animations</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default memo(MiniGamesTab);
