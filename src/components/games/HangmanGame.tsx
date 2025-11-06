import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store';
import { soundManager } from '../../utils/sounds';

const WORDS = [
  'CAT', 'DOG', 'BIRD', 'FISH', 'HORSE', 'RABBIT', 'TURTLE', 'HAMSTER',
  'PARROT', 'GOLDFISH', 'FERRET', 'GUINEA', 'PIGEON', 'CANARY', 'MOUSE',
  'HEDGEHOG', 'CHINCHILLA', 'GERBIL', 'BUDGIE', 'COCKATIEL', 'LOVEBIRD',
  'FINCH', 'COCKATOO', 'MACAW', 'AFRICANGREY', 'COCKATOOS', 'CONURE',
  'LORAKEET', 'ROSELLA', 'ECLECTUS', 'QUAKER', 'PIÑATA', 'SUNCONURE',
  'GOLDENCONURE', 'CRIMSONROSELLA', 'KINGPARROT', 'REGENTPARROT',
  'SUPERBCONURE', 'MUSKLOVEBIRD', 'FISHCROW', 'RAVEN', 'MAGPIE', 'JAY',
  'CROW', 'ROOK', 'STARLING', 'MYNAH', 'THRUSH', 'WARBLER', 'SPARROW',
  'SWALLOW', 'SWIFT', 'WOODPECKER', 'KINGFISHER', 'BEEATER', 'ROLLER',
  'CUCKOO', 'OWL', 'NIGHTJAR', 'SWIFTLET', 'HUMMINGBIRD', 'SUNBIRD',
  'FLOWERPECKER', 'WHITEYE', 'BULBUL', 'BABBLER', 'LAUGHINGTHRUSH',
  'Sibia', 'YUHINA', 'MINIVET', 'FLYCATCHER', 'SHRIKE', 'DRONGO',
  'ORIOLE', 'CHLOROPSIS', 'LEAFBIRD', 'SUNBIRD', 'SPIDERHUNTER',
  'NECTARINIA', 'PYCNONOTUS', 'SAXICOLA', 'MUSCICAPA', 'FICEDULA',
  'CYANOPICA', 'UROCYANUS', 'CORVUS', 'PICA', 'GARGOYLE', 'STURNUS',
  'ACRIDOTHERES', 'TURDUS', 'SYLVIIDAE', 'PASSER', 'HIRUNDO', 'APUS',
  'PICIDAE', 'ALCEDINIDAE', 'MEROPIDAE', 'CORACIIDAE', 'CUCULIDAE',
  'STRIGIDAE', 'CAPRIMULGIDAE', 'APODIDAE', 'TROCHILIDAE', 'NECTARINIIDAE',
  'DICAEIDAE', 'ZOSTEROPIDAE', 'PYCNONOTIDAE', 'TIMALIIDAE', 'LEIOTHRICHIDAE',
  'SYLVIIDAE', 'MUSCICAPIDAE', 'LANIIDAE', 'DICRURIDAE', 'ORIOLIDAE',
  'ICTERIDAE', 'CHLOROPSIDAE', 'DICAEIDAE', 'ARACHNOTHERA', 'NECTARINIIDAE'
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
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');

  // Get pet emoji
  const petEmoji = currentPet?.typeData.emoji || '🐱';

  // Initialize game
  const startGame = useCallback(() => {
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    setCurrentWord(randomWord);
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
          <div className="flex justify-center gap-6 mb-4">
            <div className="glass-card px-4 py-2 rounded-lg">
              <span className="text-white font-semibold">Word: {getDisplayWord()}</span>
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
