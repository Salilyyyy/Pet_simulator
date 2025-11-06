import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store';
import { soundManager } from '../../utils/sounds';

interface LetterCell {
  letter: string;
  x: number;
  y: number;
  isSelected: boolean;
  isFound: boolean;
}

interface FoundWord {
  word: string;
  points: number;
  path: { x: number; y: number }[];
}

const GRID_SIZE = 8;
const PET_WORDS = [
  'CAT', 'DOG', 'BIRD', 'FISH', 'RABBIT', 'HAMSTER', 'TURTLE', 'PARROT',
  'GOLDFISH', 'FERRET', 'GUINEA', 'PIG', 'HORSE', 'COW', 'SHEEP', 'CHICKEN',
  'DUCK', 'GOOSE', 'MOUSE', 'RAT', 'SNAKE', 'LIZARD', 'FROG', 'TOAD',
  'PET', 'ANIMAL', 'FURRY', 'CUTE', 'PAW', 'TAIL', 'WHISKERS', 'BARK',
  'MEOW', 'SQUEAK', 'CHIRP', 'NEIGH', 'MOO', 'BAA', 'CLUCK', 'QUACK'
];

const PetWordPuzzleGame: React.FC = () => {
  const { setMessage, completeMiniGame } = useGameStore();
  const [grid, setGrid] = useState<LetterCell[][]>([]);
  const [selectedPath, setSelectedPath] = useState<{ x: number; y: number }[]>([]);
  const [foundWords, setFoundWords] = useState<FoundWord[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [currentWord, setCurrentWord] = useState('');

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const isSelectingRef = useRef(false);

  const generateGrid = useCallback(() => {
    // Create empty grid
    const newGrid: LetterCell[][] = Array(GRID_SIZE).fill(null).map(() =>
      Array(GRID_SIZE).fill(null).map(() => ({
        letter: '',
        x: 0,
        y: 0,
        isSelected: false,
        isFound: false
      }))
    );

    // Place words randomly
    const placedWords: string[] = [];
    const availableWords = [...PET_WORDS];

    for (let attempts = 0; attempts < 50 && placedWords.length < 15; attempts++) {
      const word = availableWords[Math.floor(Math.random() * availableWords.length)];
      if (placedWords.includes(word)) continue;

      const direction = Math.random() < 0.5 ? 'horizontal' : 'vertical';
      const startX = Math.floor(Math.random() * GRID_SIZE);
      const startY = Math.floor(Math.random() * GRID_SIZE);

      if (canPlaceWord(newGrid, word, startX, startY, direction)) {
        placeWord(newGrid, word, startX, startY, direction);
        placedWords.push(word);
      }
    }

    // Fill remaining cells with random letters
    const vowels = 'AEIOU';
    const consonants = 'BCDFGHJKLMNPQRSTVWXYZ';

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (newGrid[y][x].letter === '') {
          const useVowel = Math.random() < 0.4;
          const letterPool = useVowel ? vowels : consonants;
          newGrid[y][x].letter = letterPool[Math.floor(Math.random() * letterPool.length)];
        }
        newGrid[y][x].x = x;
        newGrid[y][x].y = y;
      }
    }

    return newGrid;
  }, []);

  const canPlaceWord = (grid: LetterCell[][], word: string, startX: number, startY: number, direction: string): boolean => {
    if (direction === 'horizontal') {
      if (startX + word.length > GRID_SIZE) return false;
      for (let i = 0; i < word.length; i++) {
        const cell = grid[startY][startX + i];
        if (cell.letter !== '' && cell.letter !== word[i]) return false;
      }
    } else {
      if (startY + word.length > GRID_SIZE) return false;
      for (let i = 0; i < word.length; i++) {
        const cell = grid[startY + i][startX];
        if (cell.letter !== '' && cell.letter !== word[i]) return false;
      }
    }
    return true;
  };

  const placeWord = (grid: LetterCell[][], word: string, startX: number, startY: number, direction: string) => {
    if (direction === 'horizontal') {
      for (let i = 0; i < word.length; i++) {
        grid[startY][startX + i].letter = word[i];
      }
    } else {
      for (let i = 0; i < word.length; i++) {
        grid[startY + i][startX].letter = word[i];
      }
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setGameCompleted(false);
    setScore(0);
    setTimeLeft(180);
    setFoundWords([]);
    setSelectedPath([]);
    setCurrentWord('');
    setGrid(generateGrid());
    soundManager.playGameStart();
  };

  const isAdjacent = (pos1: { x: number; y: number }, pos2: { x: number; y: number }): boolean => {
    const dx = Math.abs(pos1.x - pos2.x);
    const dy = Math.abs(pos1.y - pos2.y);
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1) || (dx === 1 && dy === 1);
  };

  const handleCellMouseDown = (x: number, y: number) => {
    if (gameCompleted || grid[y][x].isFound) return;

    isSelectingRef.current = true;
    setSelectedPath([{ x, y }]);
    setCurrentWord(grid[y][x].letter);
    soundManager.playTileSelect();
  };

  const handleCellMouseEnter = (x: number, y: number) => {
    if (!isSelectingRef.current || gameCompleted || grid[y][x].isFound) return;

    const lastPos = selectedPath[selectedPath.length - 1];
    if (!lastPos) return;

    // Check if this cell is adjacent to the last selected cell
    if (isAdjacent(lastPos, { x, y })) {
      // Check if this cell is already in the path
      const isAlreadySelected = selectedPath.some(pos => pos.x === x && pos.y === y);
      if (!isAlreadySelected) {
        const newPath = [...selectedPath, { x, y }];
        setSelectedPath(newPath);
        setCurrentWord(newPath.map(pos => grid[pos.y][pos.x].letter).join(''));
      }
    }
  };

  const handleCellMouseUp = () => {
    if (!isSelectingRef.current) return;

    isSelectingRef.current = false;

    // Check if the selected word is valid
    if (currentWord.length >= 3 && PET_WORDS.includes(currentWord.toUpperCase())) {
      const isAlreadyFound = foundWords.some(fw => fw.word === currentWord.toUpperCase());
      if (!isAlreadyFound) {
        // Mark cells as found
        const newGrid = grid.map(row => [...row]);
        selectedPath.forEach(pos => {
          newGrid[pos.y][pos.x].isFound = true;
        });
        setGrid(newGrid);

        // Add to found words
        const points = currentWord.length * 10;
        const newFoundWord: FoundWord = {
          word: currentWord.toUpperCase(),
          points,
          path: [...selectedPath]
        };
        setFoundWords(prev => [...prev, newFoundWord]);
        setScore(prev => prev + points);

        soundManager.playMatchSuccess();

        // Check win condition
        const totalPossibleWords = PET_WORDS.filter(word =>
          word.length >= 3 && grid.some(row =>
            row.some(cell => cell.letter && !cell.isFound)
          )
        ).length;

        if (foundWords.length + 1 >= Math.min(10, totalPossibleWords)) {
          setGameCompleted(true);
          setGameStarted(false);
          completeMiniGame('pet-word-puzzle', score + points, foundWords.length + 1);
          setMessage(`🎉 Puzzle Complete! Score: ${score + points}, Words: ${foundWords.length + 1}`);
        }
      } else {
        soundManager.playMatchFailure();
      }
    } else {
      soundManager.playMatchFailure();
    }

    setSelectedPath([]);
    setCurrentWord('');
  };

  // Handle mouse events globally
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isSelectingRef.current) {
        handleCellMouseUp();
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [currentWord, selectedPath, foundWords, score, grid]);

  // Timer
  useEffect(() => {
    if (!gameStarted || gameCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameCompleted(true);
          setGameStarted(false);
          completeMiniGame('pet-word-puzzle', score, foundWords.length);
          setMessage(`⏰ Time's up! Score: ${score}, Words found: ${foundWords.length}`);
          soundManager.playMatchFailure();
          return 0;
        }
        if (prev === 11) {
          soundManager.playTimerWarning();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameCompleted, score, foundWords.length, completeMiniGame, setMessage]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isCellInPath = (x: number, y: number) => {
    return selectedPath.some(pos => pos.x === x && pos.y === y);
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
          📝 Pet Word Puzzle
        </motion.h2>
        <p className="text-gray-300 mb-4">
          Find words related to pets by connecting adjacent letters!
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
              <span className="text-white font-semibold">Words: {foundWords.length}</span>
            </div>
            <div className="glass-card px-4 py-2 rounded-lg">
              <span className="text-white font-semibold">Time: {formatTime(timeLeft)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Game Area */}
      {gameStarted && (
        <div className="flex justify-center gap-8">
          {/* Game Grid */}
          <motion.div
            className="relative"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div
              ref={gameAreaRef}
              className="grid gap-1 bg-black/20 p-4 rounded-2xl backdrop-blur-sm select-none"
              style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
            >
              {grid.map((row, y) =>
                row.map((cell, x) => (
                  <motion.div
                    key={`${x}-${y}`}
                    className={`aspect-square rounded-lg cursor-pointer transition-all duration-200 relative flex items-center justify-center text-xl font-bold select-none ${
                      cell.isFound
                        ? 'bg-green-500/30 ring-2 ring-green-400'
                        : isCellInPath(x, y)
                        ? 'bg-blue-500/50 ring-2 ring-blue-400 scale-110'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                    onMouseDown={() => handleCellMouseDown(x, y)}
                    onMouseEnter={() => handleCellMouseEnter(x, y)}
                    whileHover={!cell.isFound ? { scale: 1.05 } : {}}
                    whileTap={!cell.isFound ? { scale: 0.95 } : {}}
                  >
                    <span className={`${
                      cell.isFound ? 'text-green-200' :
                      isCellInPath(x, y) ? 'text-blue-200' :
                      'text-white'
                    } filter drop-shadow-lg`}>
                      {cell.letter}
                    </span>

                    {/* Selection indicator */}
                    {isCellInPath(x, y) && (
                      <motion.div
                        className="absolute inset-0 border-2 border-blue-400 rounded-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.1 }}
                      />
                    )}
                  </motion.div>
                ))
              )}
            </div>

            {/* Current Word Display */}
            {currentWord && (
              <motion.div
                className="text-center mt-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="glass-card px-6 py-3 rounded-xl inline-block">
                  <span className="text-white text-2xl font-bold">{currentWord}</span>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Found Words List */}
          <div className="flex flex-col gap-4">
            <div className="glass-card p-4 rounded-2xl min-w-64">
              <h3 className="text-lg font-bold text-white mb-3 text-center">📚 Found Words</h3>
              <div className="max-h-80 overflow-y-auto space-y-2">
                <AnimatePresence>
                  {foundWords.map((foundWord, index) => (
                    <motion.div
                      key={foundWord.word}
                      className="flex justify-between items-center bg-green-500/20 rounded-lg px-3 py-2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <span className="text-green-200 font-semibold">{foundWord.word}</span>
                      <span className="text-yellow-400 font-bold">+{foundWord.points}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {foundWords.length === 0 && (
                  <div className="text-gray-400 text-center py-4">
                    No words found yet...
                  </div>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="glass-card p-4 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-3 text-center">🎯 How to Play</h3>
              <div className="text-sm text-gray-300 space-y-2">
                <div>• Click and drag to select letters</div>
                <div>• Connect adjacent letters (including diagonally)</div>
                <div>• Find words 3+ letters long</div>
                <div>• Words must be pet/animal related</div>
                <div>• Longer words = more points!</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game Completion */}
      {gameCompleted && (
        <motion.div
          className="text-center mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="glass-card p-6 rounded-2xl inline-block">
            <h3 className="text-2xl font-bold text-white mb-2">
              {timeLeft > 0 ? '🎉 Puzzle Complete!' : '⏰ Time\'s Up!'}
            </h3>
            <p className="text-gray-300 mb-4">
              Score: {score} | Words Found: {foundWords.length}
              {timeLeft > 0 && <span> | Time Bonus: {timeLeft * 2}</span>}
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
          <h3 className="text-xl font-bold text-white mb-4 text-center">📋 Game Rules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <strong className="text-white">Objective:</strong> Find as many pet-related words as possible
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <strong className="text-white">Controls:</strong> Click and drag to connect adjacent letters
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📝</span>
              <div>
                <strong className="text-white">Words:</strong> Must be 3+ letters, pet/animal themed
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">⏰</span>
              <div>
                <strong className="text-white">Time:</strong> 3 minutes to find as many words as possible
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default PetWordPuzzleGame;
