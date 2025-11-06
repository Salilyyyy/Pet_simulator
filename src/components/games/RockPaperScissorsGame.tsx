import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store';
import { soundManager } from '../../utils/sounds';

type Choice = 'rock' | 'paper' | 'scissors';
type GameState = 'choosing' | 'countdown' | 'result' | 'gameOver';

interface RoundResult {
  playerChoice: Choice;
  petChoice: Choice;
  winner: 'player' | 'pet' | 'tie';
}

const CHOICES = [
  { id: 'rock' as Choice, emoji: '✊', name: 'Rock' },
  { id: 'paper' as Choice, emoji: '✋', name: 'Paper' },
  { id: 'scissors' as Choice, emoji: '✌️', name: 'Scissors' }
] as const;

const RockPaperScissorsGame: React.FC = () => {
  const { currentPet, setMessage, completeMiniGame } = useGameStore();
  const [gameState, setGameState] = useState<GameState>('choosing');
  const [countdown, setCountdown] = useState(3);
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [petChoice, setPetChoice] = useState<Choice | null>(null);
  const [rounds, setRounds] = useState<RoundResult[]>([]);
  const [playerLosses, setPlayerLosses] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);

  // Get pet emoji
  const petEmoji = currentPet?.typeData.emoji || '🐱';

  // Determine winner of a round
  const getWinner = (player: Choice, pet: Choice): 'player' | 'pet' | 'tie' => {
    if (player === pet) return 'tie';

    if (
      (player === 'rock' && pet === 'scissors') ||
      (player === 'scissors' && pet === 'paper') ||
      (player === 'paper' && pet === 'rock')
    ) {
      return 'player';
    }

    return 'pet';
  };

  // Handle player choice
  const handleChoice = (choice: Choice) => {
    if (gameState !== 'choosing') return;

    setPlayerChoice(choice);
    setGameState('countdown');
    setCountdown(3);

    soundManager.playTileSelect();
  };

  // Countdown effect
  useEffect(() => {
    if (gameState !== 'countdown') return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Generate pet choice immediately when countdown reaches 0
          const randomChoice = CHOICES[Math.floor(Math.random() * CHOICES.length)].id;
          setPetChoice(randomChoice);

          // Small delay before showing result
          setTimeout(() => {
            // Determine winner
            const winner = getWinner(playerChoice!, randomChoice);

            // Add round result
            const roundResult: RoundResult = {
              playerChoice: playerChoice!,
              petChoice: randomChoice,
              winner
            };

            setRounds(prev => [...prev, roundResult]);

            // Update losses if player lost
            if (winner === 'pet') {
              setPlayerLosses(prev => {
                const newLosses = prev + 1;
                if (newLosses >= 3) {
                  setGameState('gameOver');
                  completeMiniGame('rock-paper-scissors', Math.max(0, currentRound * 10 - newLosses * 5), Math.floor(currentRound / 2));
                  setMessage(`💔 You lost 3 rounds! Final score: ${Math.max(0, currentRound * 10 - newLosses * 5)}`);
                }
                return newLosses;
              });
            }

            setGameState('result');
          }, 500); // 0.5 second delay to show the pet choice

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, playerChoice, currentRound, completeMiniGame, setMessage]);

  // Reset for next round
  const nextRound = () => {
    setCurrentRound(prev => prev + 1);
    setGameState('choosing');
    setPlayerChoice(null);
    setPetChoice(null);
    setCountdown(3);
  };

  // Start new game
  const startNewGame = () => {
    setGameState('choosing');
    setPlayerChoice(null);
    setPetChoice(null);
    setCountdown(3);
    setRounds([]);
    setPlayerLosses(0);
    setCurrentRound(1);
    soundManager.playGameStart();
  };

  // Go back to menu
  const backToMenu = () => {
    startNewGame();
    // This will be handled by the parent component
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
          ✂️ Rock Paper Scissors
        </motion.h2>
        <p className="text-gray-300 mb-4">
          Challenge your pet to a game of Rock Paper Scissors!
        </p>

        {/* Game Stats */}
        <div className="flex justify-center gap-6 mb-4">
          <div className="glass-card px-4 py-2 rounded-lg">
            <span className="text-white font-semibold">Round: {currentRound}</span>
          </div>
          <div className="glass-card px-4 py-2 rounded-lg">
            <span className="text-white font-semibold">Losses: {playerLosses}/3</span>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex flex-col items-center space-y-8">
        {/* Pet Display */}
        <motion.div
          className="text-center"
          animate={{
            scale: gameState === 'result' ? [1, 1.1, 1] : 1,
            rotate: gameState === 'result' ? [0, -5, 5, 0] : 0
          }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-8xl mb-4">{petEmoji}</div>
          <div className="text-6xl">
            {gameState === 'countdown' && countdown > 0 && (
              <motion.span
                key={countdown}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                className="inline-block"
              >
                {countdown}
              </motion.span>
            )}
            {petChoice && (gameState === 'countdown' || gameState === 'result') && (
              <motion.span
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: gameState === 'countdown' ? 0 : 0.3 }}
                className="inline-block"
              >
                {CHOICES.find(c => c.id === petChoice)?.emoji}
              </motion.span>
            )}
          </div>
        </motion.div>

        {/* Player Choice Display */}
        {playerChoice && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-gray-300 mb-2">You chose:</p>
            <div className="text-6xl">
              {CHOICES.find(c => c.id === playerChoice)?.emoji}
            </div>
          </motion.div>
        )}

        {/* Choice Buttons */}
        {gameState === 'choosing' && (
          <motion.div
            className="flex gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {CHOICES.map((choice, index) => (
              <motion.button
                key={choice.id}
                className="glass-card p-6 rounded-2xl hover:bg-glass-bg/50 transition-all duration-300"
                onClick={() => handleChoice(choice.id)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.5 }}
              >
                <div className="text-6xl mb-2">{choice.emoji}</div>
                <div className="text-white font-semibold">{choice.name}</div>
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Result Display */}
        {gameState === 'result' && rounds.length > 0 && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="glass-card p-6 rounded-2xl inline-block">
              {(() => {
                const lastRound = rounds[rounds.length - 1];
                if (lastRound.winner === 'tie') {
                  return (
                    <div>
                      <h3 className="text-2xl font-bold text-yellow-400 mb-2">🤝 It's a Tie!</h3>
                      <p className="text-gray-300">Both chose {CHOICES.find(c => c.id === lastRound.playerChoice)?.name}</p>
                    </div>
                  );
                } else if (lastRound.winner === 'player') {
                  return (
                    <div>
                      <h3 className="text-2xl font-bold text-green-400 mb-2">🎉 You Win!</h3>
                      <p className="text-gray-300">
                        {CHOICES.find(c => c.id === lastRound.playerChoice)?.name} beats {CHOICES.find(c => c.id === lastRound.petChoice)?.name}
                      </p>
                    </div>
                  );
                } else {
                  return (
                    <div>
                      <h3 className="text-2xl font-bold text-red-400 mb-2">� You Lose!</h3>
                      <p className="text-gray-300">
                        {CHOICES.find(c => c.id === lastRound.petChoice)?.name} beats {CHOICES.find(c => c.id === lastRound.playerChoice)?.name}
                      </p>
                    </div>
                  );
                }
              })()}
            </div>
          </motion.div>
        )}

        {/* Next Round Button */}
        {gameState === 'result' && playerLosses < 3 && (
          <motion.button
            className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-blue-500/30 transition-all duration-300 btn-modern"
            onClick={nextRound}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Next Round →
          </motion.button>
        )}

        {/* Game Over */}
        {gameState === 'gameOver' && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="glass-card p-6 rounded-2xl inline-block">
              <h3 className="text-2xl font-bold text-red-400 mb-2">
                💔 Game Over!
              </h3>
              <p className="text-gray-300 mb-4">
                You lost 3 rounds to your pet!
              </p>
              <div className="flex gap-3 justify-center">
                <motion.button
                  className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-2 rounded-xl font-bold btn-modern"
                  onClick={startNewGame}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🔄 Play Again
                </motion.button>
                <motion.button
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-xl font-bold btn-modern"
                  onClick={backToMenu}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🏠 Back to Menu
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>



      {/* Instructions */}
      {gameState === 'choosing' && rounds.length === 0 && (
        <motion.div
          className="glass-card p-6 rounded-2xl mt-8 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-xl font-bold text-white mb-4 text-center">� How to Play</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div className="flex items-start gap-3">
              <span className="text-2xl">✊</span>
              <div>
                <strong className="text-white">Rock:</strong> Beats Scissors
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">✋</span>
              <div>
                <strong className="text-white">Paper:</strong> Beats Rock
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">✌️</span>
              <div>
                <strong className="text-white">Scissors:</strong> Beats Paper
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🏆</span>
              <div>
                <strong className="text-white">Goal:</strong> Don't lose 3 rounds!
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default RockPaperScissorsGame;
