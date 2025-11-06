import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store';
import { soundManager } from '../../utils/sounds';

type CellValue = 'X' | 'O' | null;
type GameState = 'playing' | 'petTurn' | 'won' | 'lost' | 'tie';

const TicTacToeGame: React.FC = () => {
  const { currentPet, setMessage, completeMiniGame } = useGameStore();
  const [board, setBoard] = useState<CellValue[]>(Array(9).fill(null));
  const [gameState, setGameState] = useState<GameState>('playing');
  const [winner, setWinner] = useState<'player' | 'pet' | 'tie' | null>(null);

  // Get pet emoji
  const petEmoji = currentPet?.typeData.emoji || '🐱';

  // Check for winner
  const checkWinner = (board: CellValue[]): 'X' | 'O' | null => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];

    for (let line of lines) {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  };

  // Check if board is full
  const isBoardFull = (board: CellValue[]): boolean => {
    return board.every(cell => cell !== null);
  };

  // Get best move for pet (simple AI)
  const getBestMove = (board: CellValue[]): number => {
    // Check if pet can win
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        const testBoard = [...board];
        testBoard[i] = 'O';
        if (checkWinner(testBoard) === 'O') {
          return i;
        }
      }
    }

    // Check if player can win and block
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        const testBoard = [...board];
        testBoard[i] = 'X';
        if (checkWinner(testBoard) === 'X') {
          return i;
        }
      }
    }

    // Take center if available
    if (board[4] === null) return 4;

    // Take corners
    const corners = [0, 2, 6, 8];
    for (let corner of corners) {
      if (board[corner] === null) {
        return corner;
      }
    }

    // Take any available spot
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        return i;
      }
    }

    return -1; // Should never happen
  };

  // Handle cell click
  const handleCellClick = (index: number) => {
    if (gameState !== 'playing' || board[index] !== null) return;

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);

    soundManager.playTileSelect();

    // Check for winner
    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner('player');
      setGameState('won');
      completeMiniGame('tic-tac-toe', 25, 1);
      setMessage('🎉 You won the Tic Tac Toe game!');
      return;
    }

    // Check for tie
    if (isBoardFull(newBoard)) {
      setWinner('tie');
      setGameState('tie');
      completeMiniGame('tic-tac-toe', 10, 0);
      setMessage('🤝 It\'s a tie!');
      return;
    }

    // Pet's turn
    setGameState('petTurn');

    // Pet makes move after a short delay
    setTimeout(() => {
      const petMove = getBestMove(newBoard);
      if (petMove !== -1) {
        const petBoard = [...newBoard];
        petBoard[petMove] = 'O';
        setBoard(petBoard);

        // Check for pet winner
        const petWinner = checkWinner(petBoard);
        if (petWinner) {
          setWinner('pet');
          setGameState('lost');
          completeMiniGame('tic-tac-toe', 5, 0);
          setMessage('💔 You lost to your pet!');
          return;
        }

        // Check for tie after pet move
        if (isBoardFull(petBoard)) {
          setWinner('tie');
          setGameState('tie');
          completeMiniGame('tic-tac-toe', 10, 0);
          setMessage('🤝 It\'s a tie!');
          return;
        }
      }

      setGameState('playing');
    }, 1000);
  };

  // Start new game
  const startNewGame = () => {
    setBoard(Array(9).fill(null));
    setGameState('playing');
    setWinner(null);
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
          ⭕ Tic Tac Toe
        </motion.h2>
        <p className="text-gray-300 mb-4">
          Challenge your pet to a game of Tic Tac Toe!
        </p>

        {/* Pet Display */}
        <motion.div
          className="text-center mb-4"
          animate={{
            scale: gameState === 'petTurn' ? [1, 1.1, 1] : 1,
            rotate: gameState === 'petTurn' ? [0, -5, 5, 0] : 0
          }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-6xl mb-2">{petEmoji}</div>
          <div className="text-gray-300">
            {gameState === 'petTurn' && "Pet is thinking... 🤔"}
            {gameState === 'playing' && "Your turn! 🎯"}
          </div>
        </motion.div>
      </div>

      {/* Game Board */}
      <div className="flex justify-center mb-8">
        <motion.div
          className="grid grid-cols-3 gap-2 bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-2xl shadow-2xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {board.map((cell, index) => (
            <motion.button
              key={index}
              className={`
                w-20 h-20 bg-glass-bg/30 backdrop-blur-md border-2 border-glass-border rounded-xl
                flex items-center justify-center text-4xl font-bold transition-all duration-300
                ${cell === null && gameState === 'playing' ? 'hover:bg-glass-bg/50 hover:scale-105' : ''}
                ${cell === 'X' ? 'text-blue-400' : cell === 'O' ? 'text-red-400' : 'text-gray-400'}
              `}
              onClick={() => handleCellClick(index)}
              disabled={cell !== null || gameState !== 'playing'}
              whileHover={cell === null && gameState === 'playing' ? { scale: 1.05 } : {}}
              whileTap={cell === null && gameState === 'playing' ? { scale: 0.95 } : {}}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 + 0.4 }}
            >
              <AnimatePresence>
                {cell && (
                  <motion.span
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    {cell}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Game Result */}
      <AnimatePresence>
        {(gameState === 'won' || gameState === 'lost' || gameState === 'tie') && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: 0.5 }}
          >
            <div className="glass-card p-6 rounded-2xl inline-block">
              {winner === 'player' && (
                <div>
                  <h3 className="text-3xl font-bold text-green-400 mb-2">🎉 You Win!</h3>
                  <p className="text-gray-300">Congratulations! You beat your pet!</p>
                </div>
              )}
              {winner === 'pet' && (
                <div>
                  <h3 className="text-3xl font-bold text-red-400 mb-2">💔 You Lost!</h3>
                  <p className="text-gray-300">Your pet was too smart this time!</p>
                </div>
              )}
              {winner === 'tie' && (
                <div>
                  <h3 className="text-3xl font-bold text-yellow-400 mb-2">🤝 It's a Tie!</h3>
                  <p className="text-gray-300">Great game! Both players did well!</p>
                </div>
              )}

              <div className="flex gap-3 justify-center mt-4">
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
      </AnimatePresence>

      {/* Instructions */}
      {board.every(cell => cell === null) && (
        <motion.div
          className="glass-card p-6 rounded-2xl mt-8 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-xl font-bold text-white mb-4 text-center">📋 How to Play</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div className="flex items-start gap-3">
              <span className="text-2xl">❌</span>
              <div>
                <strong className="text-white">You:</strong> Click on empty squares to place X
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">⭕</span>
              <div>
                <strong className="text-white">Pet:</strong> Automatically places O after your turn
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🏆</span>
              <div>
                <strong className="text-white">Goal:</strong> Get 3 in a row (horizontal, vertical, or diagonal)
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🧠</span>
              <div>
                <strong className="text-white">AI:</strong> Your pet plays smart - try to beat it!
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TicTacToeGame;
