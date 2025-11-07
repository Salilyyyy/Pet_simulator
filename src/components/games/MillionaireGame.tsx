import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store';
import { soundManager } from '../../utils/sounds';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  prize: number;
}

interface Lifeline {
  id: string;
  name: string;
  icon: string;
  used: boolean;
  description: string;
}

const QUESTIONS: Question[] = [
  // Easy Questions (1-5)
  {
    question: "🐱 What do cats love to chase the most?",
    options: ["A. Balls of yarn", "B. Laser pointers", "C. Their own tails", "D. All of the above"],
    correctAnswer: 3,
    difficulty: 'easy',
    prize: 100
  },
  {
    question: "🐶 What is a dog's most important job?",
    options: ["A. Being cute", "B. Protecting their family", "C. Eating treats", "D. Taking naps"],
    correctAnswer: 1,
    difficulty: 'easy',
    prize: 200
  },
  {
    question: "🐰 What do rabbits love to eat most?",
    options: ["A. Carrots", "B. Lettuce", "C. Hay", "D. All of the above"],
    correctAnswer: 3,
    difficulty: 'easy',
    prize: 300
  },
  {
    question: "🐦 Which bird is known for its colorful feathers?",
    options: ["A. Sparrow", "B. Peacock", "C. Pigeon", "D. Crow"],
    correctAnswer: 1,
    difficulty: 'easy',
    prize: 500
  },
  {
    question: "🐠 What do fish need to survive in a tank?",
    options: ["A. Clean water", "B. Food", "C. A filter", "D. All of the above"],
    correctAnswer: 3,
    difficulty: 'easy',
    prize: 1000
  },

  // Medium Questions (6-10)
  {
    question: "🐉 What mythical creature breathes fire?",
    options: ["A. Unicorn", "B. Dragon", "C. Phoenix", "D. Griffin"],
    correctAnswer: 1,
    difficulty: 'medium',
    prize: 2000
  },
  {
    question: "🐱 How many lives do cats supposedly have?",
    options: ["A. 3", "B. 7", "C. 9", "D. 12"],
    correctAnswer: 2,
    difficulty: 'medium',
    prize: 4000
  },
  {
    question: "🐶 What breed of dog is known for herding sheep?",
    options: ["A. Labrador", "B. German Shepherd", "C. Border Collie", "D. Golden Retriever"],
    correctAnswer: 2,
    difficulty: 'medium',
    prize: 8000
  },
  {
    question: "🐰 What is the name of the Easter Bunny's favorite holiday?",
    options: ["A. Christmas", "B. Halloween", "C. Easter", "D. Thanksgiving"],
    correctAnswer: 2,
    difficulty: 'medium',
    prize: 16000
  },
  {
    question: "🐦 What do birds use their feathers for besides flying?",
    options: ["A. Swimming", "B. Keeping warm", "C. Attracting mates", "D. Both B and C"],
    correctAnswer: 3,
    difficulty: 'medium',
    prize: 32000
  },

  // Hard Questions (11-13)
  {
    question: "🐱 What is the rarest color for a cat's fur?",
    options: ["A. Black", "B. White", "C. Ginger", "D. Albino"],
    correctAnswer: 3,
    difficulty: 'hard',
    prize: 64000
  },
  {
    question: "🐶 What is the oldest known dog breed?",
    options: ["A. Greyhound", "B. Saluki", "C. Afghan Hound", "D. Basenji"],
    correctAnswer: 1,
    difficulty: 'hard',
    prize: 125000
  },
  {
    question: "🐦 What bird can fly backwards?",
    options: ["A. Hummingbird", "B. Eagle", "C. Sparrow", "D. None of the above"],
    correctAnswer: 0,
    difficulty: 'hard',
    prize: 250000
  },

  // Expert Question (14)
  {
    question: "🐉 In mythology, what is the dragon's greatest weakness?",
    options: ["A. Fire", "B. Water", "C. A hero's sword", "D. Loud noises"],
    correctAnswer: 2,
    difficulty: 'expert',
    prize: 500000
  },

  // Final Question (15) - The Million Dollar Question
  {
    question: "🎯 What is the most important thing a pet owner can give their animal companion?",
    options: ["A. Expensive toys", "B. Gourmet food", "C. Unconditional love and care", "D. A big house"],
    correctAnswer: 2,
    difficulty: 'expert',
    prize: 1000000
  }
];

const MillionaireGame: React.FC = () => {
  const { setMessage, completeMiniGame } = useGameStore();
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [prizeMoney, setPrizeMoney] = useState(0);
  const [isRevealing, setIsRevealing] = useState(false);
  const [showWalkAway, setShowWalkAway] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  const [lifelines, setLifelines] = useState<Lifeline[]>([
    {
      id: 'fifty-fifty',
      name: '50/50',
      icon: '5️⃣0️⃣',
      used: false,
      description: 'Removes two wrong answers'
    },
    {
      id: 'ask-audience',
      name: 'Ask the Audience',
      icon: '👥',
      used: false,
      description: 'Shows audience poll results'
    },
    {
      id: 'phone-friend',
      name: 'Phone a Friend',
      icon: '📞',
      used: false,
      description: 'Get help from a friend'
    }
  ]);

  const [availableOptions, setAvailableOptions] = useState<number[]>([0, 1, 2, 3]);
  const [audiencePoll, setAudiencePoll] = useState<number[]>([]);
  const [friendAnswer, setFriendAnswer] = useState<number | null>(null);

  const shuffleQuestions = (questions: Question[]): Question[] => {
    const shuffled = [...questions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const startGame = () => {
    const shuffledQuestions = shuffleQuestions(QUESTIONS);
    setShuffledQuestions(shuffledQuestions);
    setGameStarted(true);
    setCurrentQuestion(0);
    setPrizeMoney(0);
    setTimeLeft(30);
    setSelectedAnswer(null);
    setGameCompleted(false);
    setGameWon(false);
    setAvailableOptions([0, 1, 2, 3]);
    setAudiencePoll([]);
    setFriendAnswer(null);
    setLifelines(lifelines.map(l => ({ ...l, used: false })));
    soundManager.playGameStart();
  };

  const useLifeline = (lifelineId: string) => {
    if (lifelines.find(l => l.id === lifelineId)?.used) return;

    const question = shuffledQuestions[currentQuestion];
    const correctAnswer = question.correctAnswer;

    setLifelines(prev => prev.map(l =>
      l.id === lifelineId ? { ...l, used: true } : l
    ));

    switch (lifelineId) {
      case 'fifty-fifty':
        // Remove two wrong answers
        const wrongAnswers = [0, 1, 2, 3].filter(i => i !== correctAnswer);
        const toRemove = wrongAnswers.slice(0, 2);
        setAvailableOptions(prev => prev.filter(i => !toRemove.includes(i)));
        soundManager.playMatchSuccess();
        break;

      case 'ask-audience':
        // Simulate audience poll (correct answer gets highest percentage)
        const poll = [0, 1, 2, 3].map(i => {
          if (i === correctAnswer) return Math.floor(Math.random() * 30) + 50; // 50-80%
          return Math.floor(Math.random() * 20) + 5; // 5-25%
        });
        setAudiencePoll(poll);
        soundManager.playMatchSuccess();
        break;

      case 'phone-friend':
        // Friend gives correct answer 80% of the time
        const isCorrect = Math.random() < 0.8;
        setFriendAnswer(isCorrect ? correctAnswer : [0, 1, 2, 3].filter(i => i !== correctAnswer)[Math.floor(Math.random() * 3)]);
        soundManager.playMatchSuccess();
        break;
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null || isRevealing) return;

    setSelectedAnswer(answerIndex);
    setIsRevealing(true);

    soundManager.playTileSelect();

    // Reveal answer after a delay
    setTimeout(() => {
      const question = shuffledQuestions[currentQuestion];
      const isCorrect = answerIndex === question.correctAnswer;

      if (isCorrect) {
        soundManager.playMatchSuccess();
        setPrizeMoney(question.prize);

        if (currentQuestion === shuffledQuestions.length - 1) {
          // Won the game!
          setGameWon(true);
          setGameCompleted(true);
          completeMiniGame('millionaire', question.prize, 0);
        } else {
          // Continue to next question
          setTimeout(() => {
            setCurrentQuestion(prev => prev + 1);
            setSelectedAnswer(null);
            setTimeLeft(30);
            setAvailableOptions([0, 1, 2, 3]);
            setAudiencePoll([]);
            setFriendAnswer(null);
            setIsRevealing(false);
          }, 2000);
        }
      } else {
        soundManager.playMatchFailure();
        // Game over - keep the guaranteed prize money
        const guaranteedPrize = currentQuestion >= 9 ? 32000 : currentQuestion >= 4 ? 1000 : 0;
        setTimeout(() => {
          setGameCompleted(true);
          completeMiniGame('millionaire', guaranteedPrize, 1);
        }, 2000);
      }
    }, 2000);
  };

  const handleWalkAway = () => {
    setGameCompleted(true);
    completeMiniGame('millionaire', prizeMoney, 0);
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  useEffect(() => {
    if (!gameStarted || gameCompleted || isRevealing) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up - game over
          soundManager.playMatchFailure();
          const guaranteedPrize = currentQuestion >= 9 ? 32000 : currentQuestion >= 4 ? 1000 : 0;
          setGameCompleted(true);
          completeMiniGame('millionaire', guaranteedPrize, 1);
          return 0;
        }
        if (prev === 6) {
          soundManager.playTimerWarning();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameCompleted, isRevealing, currentQuestion, completeMiniGame]);

  const question = shuffledQuestions[currentQuestion] || QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / shuffledQuestions.length) * 100;

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
          className="text-4xl font-bold gradient-text mb-4"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          💰 Ai Là Triệu Phú
        </motion.h2>
        <p className="text-gray-300 mb-4">
          Answer questions to win big prizes!
        </p>

        {!gameStarted ? (
          <motion.button
            className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-yellow-500/30 transition-all duration-300 btn-modern"
            onClick={startGame}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🎮 Let's Play!
          </motion.button>
        ) : (
          <div className="flex justify-center gap-6 mb-4">
            <div className="glass-card px-4 py-2 rounded-lg">
              <span className="text-white font-semibold">Question: {currentQuestion + 1}/15</span>
            </div>
            <div className="glass-card px-4 py-2 rounded-lg">
              <span className="text-white font-semibold">Prize: {formatMoney(prizeMoney)}</span>
            </div>
            <div className="glass-card px-4 py-2 rounded-lg">
              <span className="text-white font-semibold">Time: {timeLeft}s</span>
            </div>
          </div>
        )}
      </div>

      {gameStarted && !gameCompleted && (
        <>
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full bg-gray-700 rounded-full h-4">
              <motion.div
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-4 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Question {currentQuestion + 1}</span>
              <span>{formatMoney(question.prize)}</span>
            </div>
          </div>

          {/* Lifelines */}
          <div className="flex justify-center gap-4 mb-6">
            {lifelines.map((lifeline) => (
              <motion.button
                key={lifeline.id}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200 ${
                  lifeline.used
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
                onClick={() => useLifeline(lifeline.id)}
                disabled={lifeline.used}
                whileHover={!lifeline.used ? { scale: 1.05 } : {}}
                whileTap={!lifeline.used ? { scale: 0.95 } : {}}
              >
                {lifeline.icon} {lifeline.name}
              </motion.button>
            ))}
          </div>

          {/* Lifeline Results */}
          {audiencePoll.length > 0 && (
            <motion.div
              className="glass-card p-4 mb-4 text-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h4 className="text-white font-bold mb-2">👥 Audience Poll Results:</h4>
              <div className="grid grid-cols-4 gap-2">
                {['A', 'B', 'C', 'D'].map((letter, index) => (
                  <div key={letter} className="text-center">
                    <div className="text-2xl font-bold text-white">{letter}</div>
                    <div className="text-sm text-gray-300">{audiencePoll[index]}%</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {friendAnswer !== null && (
            <motion.div
              className="glass-card p-4 mb-4 text-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h4 className="text-white font-bold mb-2">📞 Your friend says:</h4>
              <p className="text-xl text-yellow-400">
                Answer {['A', 'B', 'C', 'D'][friendAnswer]}
              </p>
            </motion.div>
          )}

          {/* Question */}
          <motion.div
            className="glass-card p-6 mb-6 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-2xl font-bold text-white mb-6">
              {question.question}
            </h3>

            {/* Answer Options */}
            <div className="grid grid-cols-2 gap-4">
              {question.options.map((option, index) => {
                const isAvailable = availableOptions.includes(index);
                const isSelected = selectedAnswer === index;
                const isCorrect = index === question.correctAnswer;
                const isWrong = selectedAnswer === index && !isCorrect && isRevealing;

                return (
                  <motion.button
                    key={index}
                    className={`p-4 rounded-xl font-bold text-left transition-all duration-300 ${
                      !isAvailable
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : isRevealing && isCorrect
                        ? 'bg-green-600 text-white ring-4 ring-green-400'
                        : isWrong
                        ? 'bg-red-600 text-white ring-4 ring-red-400'
                        : isSelected
                        ? 'bg-yellow-500 text-black ring-4 ring-yellow-400'
                        : 'bg-gray-600 hover:bg-gray-500 text-white'
                    }`}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={!isAvailable || isRevealing}
                    whileHover={!isRevealing && isAvailable ? { scale: 1.02 } : {}}
                    whileTap={!isRevealing && isAvailable ? { scale: 0.98 } : {}}
                  >
                    <span className="text-xl mr-3">
                      {['A', 'B', 'C', 'D'][index]}.
                    </span>
                    {option}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Walk Away Button */}
          {currentQuestion >= 4 && !isRevealing && (
            <div className="text-center">
              <motion.button
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-green-500/30 transition-all duration-300"
                onClick={() => setShowWalkAway(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🚪 Walk Away with {formatMoney(prizeMoney)}
              </motion.button>
            </div>
          )}
        </>
      )}

      {/* Walk Away Confirmation */}
      <AnimatePresence>
        {showWalkAway && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="glass-card p-6 max-w-md mx-4 text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h3 className="text-2xl font-bold text-white mb-4">
                Walk Away?
              </h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to walk away with {formatMoney(prizeMoney)}?
              </p>
              <div className="flex gap-4 justify-center">
                <motion.button
                  className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg font-bold"
                  onClick={() => setShowWalkAway(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Keep Playing
                </motion.button>
                <motion.button
                  className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-bold"
                  onClick={handleWalkAway}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Walk Away
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Completion */}
      {gameCompleted && (
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="glass-card p-6 rounded-2xl inline-block">
            <h3 className="text-3xl font-bold text-white mb-4">
              {gameWon ? '🎉 Congratulations!' : '💔 Game Over'}
            </h3>
            <p className="text-xl text-yellow-400 mb-4">
              You won: {formatMoney(prizeMoney)}
            </p>
            <p className="text-gray-300 mb-6">
              {gameWon
                ? 'You\'re a millionaire! 🤑'
                : `You reached question ${currentQuestion + 1} of 15`
              }
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
              <span className="text-2xl">❓</span>
              <div>
                <strong className="text-white">Questions:</strong> Answer 15 multiple choice questions
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">💰</span>
              <div>
                <strong className="text-white">Prizes:</strong> Money doubles with each correct answer
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🛟</span>
              <div>
                <strong className="text-white">Lifelines:</strong> 50/50, Ask Audience, Phone Friend
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">⏰</span>
              <div>
                <strong className="text-white">Timer:</strong> 30 seconds per question
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MillionaireGame;
