import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store';
import { soundManager } from '../../utils/sounds';

const WORDS_WITH_HINTS = [
  { word: 'CAT', hint: 'A furry pet that says meow' },
  { word: 'DOG', hint: 'Man\'s best friend that barks' },
  { word: 'BIRD', hint: 'A feathered pet that flies' },
  { word: 'FISH', hint: 'Swims in a tank with fins' },
  { word: 'RABBIT', hint: 'Hops around with long ears' },
  { word: 'TURTLE', hint: 'Slow reptile with a shell' },
  { word: 'HAMSTER', hint: 'Small rodent that runs on a wheel' },
  { word: 'PARROT', hint: 'Colorful bird that talks' },
  { word: 'GOLDFISH', hint: 'Orange fish in a bowl' },
  { word: 'FERRET', hint: 'Long slender pet that plays' },
  { word: 'GUINEAPIG', hint: 'Small furry pet that squeaks' },
  { word: 'CANARY', hint: 'Yellow bird that sings' },
  { word: 'MOUSE', hint: 'Tiny rodent with a tail' },
  { word: 'HEDGEHOG', hint: 'Spiky pet that curls up' },
  { word: 'CHINCHILLA', hint: 'Soft furry pet from mountains' },
  { word: 'GERBIL', hint: 'Small desert rodent' },
  { word: 'BUDGIE', hint: 'Small colorful parakeet' },
  { word: 'LOVEBIRD', hint: 'Small affectionate parrot' },
  { word: 'FINCH', hint: 'Small seed-eating bird' },
  { word: 'COCKATOO', hint: 'Large crested parrot' },
  { word: 'MACAW', hint: 'Large colorful parrot' },
  { word: 'HORSE', hint: 'Large animal you can ride' },
  { word: 'PONY', hint: 'Small horse for children' },
  { word: 'DONKEY', hint: 'Gray animal that brays' },
  { word: 'SHEEP', hint: 'Wooly farm animal' },
  { word: 'GOAT', hint: 'Farm animal that climbs' },
  { word: 'COW', hint: 'Farm animal that gives milk' },
  { word: 'PIG', hint: 'Pink farm animal' },
  { word: 'CHICKEN', hint: 'Farm bird that lays eggs' },
  { word: 'DUCK', hint: 'Water bird that quacks' },
  { word: 'GOOSE', hint: 'Large water bird' },
  { word: 'TURKEY', hint: 'Large farm bird' },
  { word: 'ROOSTER', hint: 'Male chicken that crows' },
  { word: 'LLAMA', hint: 'Long-necked South American animal' },
  { word: 'ALPACA', hint: 'Fluffy relative of the llama' },
  { word: 'ELEPHANT', hint: 'Large gray animal with a trunk' },
  { word: 'LION', hint: 'King of the jungle' },
  { word: 'TIGER', hint: 'Striped big cat' },
  { word: 'BEAR', hint: 'Large furry animal that hibernates' },
  { word: 'WOLF', hint: 'Wild dog that howls' },
  { word: 'FOX', hint: 'Cunning animal with red fur' },
  { word: 'DEER', hint: 'Forest animal with antlers' },
  { word: 'MONKEY', hint: 'Playful tree-dwelling animal' },
  { word: 'GORILLA', hint: 'Large powerful ape' },
  { word: 'PANDA', hint: 'Black and white bear from China' },
  { word: 'KOALA', hint: 'Australian tree-dwelling marsupial' },
  { word: 'KANGAROO', hint: 'Australian animal that hops' },
  { word: 'PENGUIN', hint: 'Flightless bird that swims' },
  { word: 'DOLPHIN', hint: 'Intelligent sea mammal' },
  { word: 'WHALE', hint: 'Large sea mammal' },
  { word: 'SHARK', hint: 'Predatory sea fish' },
  { word: 'OCTOPUS', hint: 'Sea creature with eight arms' },
  { word: 'SNAKE', hint: 'Long reptile without legs' },
  { word: 'LIZARD', hint: 'Small reptile with legs' },
  { word: 'FROG', hint: 'Amphibian that jumps' },
  { word: 'TOAD', hint: 'Warty amphibian' },
  { word: 'BUTTERFLY', hint: 'Colorful flying insect' },
  { word: 'BEE', hint: 'Stinging insect that makes honey' },
  { word: 'ANT', hint: 'Small hardworking insect' },
  { word: 'SPIDER', hint: 'Eight-legged arachnid' }
];

const MAX_WRONG_GUESSES = 6;

const HANGMAN_STAGES = [
  '', // 0 wrong guesses
  '😵', // 1 wrong guess
  '😵💫', // 2 wrong guesses
  '😵💫😵', // 3 wrong guesses
  '😵💫😵💀', // 4 wrong guesses
  '😵💫😵💀👻', // 5 wrong guesses
  '😵💫😵💀👻💀' // 6 wrong guesses (game over)
];

const HangmanGame: React.FC = () => {
  const { currentPet, setMessage, completeMiniGame } = useGameStore();
  const [gameStarted, setGameStarted] = useState(false);
  const [currentWord, setCurrentWord] = useState('');
  const [currentHint, setCurrentHint] = useState('');
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');

  // Get pet emoji
  const petEmoji = currentPet?.typeData.emoji || '🐱';

  // Initialize game
  const startGame = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * WORDS_WITH_HINTS.length);
    const selectedWord = WORDS_WITH_HINTS[randomIndex];
    setCurrentWord(selectedWord.word);
    setCurrentHint(selectedWord.hint);
    setGuessedLetters(new Set());
    setWrongGuesses(0);
    setGameStatus('playing');
    setGameStarted(true);
    soundManager.playGameStart();
  }, []);

  // Handle letter guess
  const guessLetter = useCallback((letter: string) => {
    if (gameStatus !== 'playing' || guessedLetters.has(letter)) return;

    const newGuessedLetters = new Set(guessedLetters);
    newGuessedLetters.add(letter);
    setGuessedLetters(newGuessedLetters);

    if (currentWord.includes(letter)) {
      soundManager.playMatchSuccess();

      // Check if player won
      const isWon = currentWord.split('').every(char => newGuessedLetters.has(char));
      if (isWon) {
        setGameStatus('won');
        const score = Math.max(0, (currentWord.length * 20) - (wrongGuesses * 10));
        completeMiniGame('hangman', score, 1);
        setMessage(`🎉 You won! Word: ${currentWord}, Score: ${score}`);
        soundManager.playGameComplete();
      }
    } else {
      soundManager.playMatchFailure();
      const newWrongGuesses = wrongGuesses + 1;
      setWrongGuesses(newWrongGuesses);

      if (newWrongGuesses >= MAX_WRONG_GUESSES) {
        setGameStatus('lost');
        const score = Math.max(0, (currentWord.length * 5) - (newWrongGuesses * 5));
        completeMiniGame('hangman', score, 0);
        setMessage(`💀 Game Over! Word was: ${currentWord}, Score: ${score}`);
      }
    }
  }, [currentWord, guessedLetters, wrongGuesses, gameStatus, completeMiniGame, setMessage]);

  // Get display word (with blanks for unguessed letters)
  const getDisplayWord = () => {
    return currentWord.split('').map(letter =>
      guessedLetters.has(letter) ? letter : '_'
    ).join(' ');
  };

  // Get available letters (A-Z)
  const getAvailableLetters = () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    return alphabet.filter(letter => !guessedLetters.has(letter));
  };

  // Get wrong letters
  const getWrongLetters = () => {
    return Array.from(guessedLetters).filter(letter => !currentWord.includes(letter));
  };

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
          🪢 Hangman
        </motion.h2>
        <p className="text-gray-300 mb-4">
          Guess the letters to save your pet from being hanged!
        </p>

        {/* Pet Display */}
        <motion.div
          className="text-center mb-4"
          animate={{
            scale: gameStatus === 'lost' ? [1, 1.1, 1] : 1,
            rotate: gameStatus === 'lost' ? [0, -5, 5, 0] : 0
          }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-6xl mb-2">{petEmoji}</div>
          <div className="text-4xl">
            {HANGMAN_STAGES[wrongGuesses]}
          </div>
          <div className="text-gray-300 mt-2">
            Wrong guesses: {wrongGuesses}/{MAX_WRONG_GUESSES}
          </div>
        </motion.div>

        {!gameStarted ? (
          <motion.button
            className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-red-500/30 transition-all duration-300 btn-modern"
            onClick={startGame}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🎮 Start Game
          </motion.button>
        ) : (
          <div className="flex flex-col items-center gap-4 mb-4">
            <div className="glass-card px-6 py-3 rounded-lg max-w-md">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">{getDisplayWord()}</div>
                <div className="text-sm text-gray-300 italic">💡 Hint: {currentHint}</div>
              </div>
            </div>
            <div className="glass-card px-4 py-2 rounded-lg">
              <span className="text-white font-semibold">Wrong: {getWrongLetters().join(', ') || 'None'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Game Area */}
      {gameStarted && (
        <div className="flex flex-col items-center space-y-6">
          {/* Letter Buttons */}
          {gameStatus === 'playing' && (
            <motion.div
              className="grid grid-cols-6 md:grid-cols-8 gap-2 max-w-2xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              {getAvailableLetters().map((letter) => (
                <motion.button
                  key={letter}
                  className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={() => guessLetter(letter)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: letter.charCodeAt(0) * 0.01,
                    type: "spring",
                    stiffness: 200
                  }}
                >
                  {letter}
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* Game Result */}
          <AnimatePresence>
            {(gameStatus === 'won' || gameStatus === 'lost') && (
              <motion.div
                className="text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: 0.5 }}
              >
                <div className="glass-card p-6 rounded-2xl inline-block">
                  {gameStatus === 'won' ? (
                    <div>
                      <h3 className="text-3xl font-bold text-green-400 mb-2">🎉 You Won!</h3>
                      <p className="text-gray-300 mb-2">Word: {currentWord}</p>
                      <p className="text-gray-300">Great job saving your pet!</p>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-3xl font-bold text-red-400 mb-2">💀 Game Over!</h3>
                      <p className="text-gray-300 mb-2">Word was: {currentWord}</p>
                      <p className="text-gray-300">Your pet has been hanged! 😢</p>
                    </div>
                  )}

                  <div className="flex gap-3 justify-center mt-4">
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
          </AnimatePresence>
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
              <span className="text-2xl">🎯</span>
              <div>
                <strong className="text-white">Objective:</strong> Guess all letters in the hidden word
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔤</span>
              <div>
                <strong className="text-white">Letters:</strong> Click on letters to guess them
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">❌</span>
              <div>
                <strong className="text-white">Wrong Guesses:</strong> You can make up to 6 wrong guesses
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🏆</span>
              <div>
                <strong className="text-white">Win:</strong> Guess the word before running out of guesses
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🪢</span>
              <div>
                <strong className="text-white">Lose:</strong> Too many wrong guesses and your pet gets hanged!
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📝</span>
              <div>
                <strong className="text-white">Theme:</strong> All words are pet and animal related
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default HangmanGame;
