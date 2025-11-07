import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store';
import { soundManager } from '../../utils/sounds';

interface SudokuCell {
  value: number;
  isFixed: boolean;
  isValid: boolean;
  notes: Set<number>;
}

const SudokuGame: React.FC = () => {
  const { setMessage, completeMiniGame } = useGameStore();
  const [board, setBoard] = useState<SudokuCell[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{row: number, col: number} | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [mistakes, setMistakes] = useState(0);
  const [hints, setHints] = useState(3);

  const BOARD_SIZE = 9;
  const BOX_SIZE = 3;

  const generatePuzzle = useCallback(() => {
    // Create empty board
    const newBoard: SudokuCell[][] = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
      newBoard[row] = [];
      for (let col = 0; col < BOARD_SIZE; col++) {
        newBoard[row][col] = {
          value: 0,
          isFixed: false,
          isValid: true,
          notes: new Set()
        };
      }
    }

    // Fill diagonal boxes first (they don't conflict)
    fillDiagonalBoxes(newBoard);

    // Fill remaining cells
    fillRemaining(newBoard, 0, BOX_SIZE);

    // Remove some numbers to create puzzle (difficulty based on removals)
    const cellsToRemove = 45; // Medium difficulty
    const positions = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        positions.push({row, col});
      }
    }

    // Shuffle positions
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }

    // Remove numbers
    for (let i = 0; i < cellsToRemove && i < positions.length; i++) {
      const {row, col} = positions[i];
      newBoard[row][col].value = 0;
      newBoard[row][col].isFixed = false;
    }

    return newBoard;
  }, []);

  const fillDiagonalBoxes = (board: SudokuCell[][]) => {
    for (let box = 0; box < BOARD_SIZE; box += BOX_SIZE) {
      fillBox(board, box, box);
    }
  };

  const fillBox = (board: SudokuCell[][], row: number, col: number) => {
    let num;
    for (let i = 0; i < BOX_SIZE; i++) {
      for (let j = 0; j < BOX_SIZE; j++) {
        do {
          num = Math.floor(Math.random() * BOARD_SIZE) + 1;
        } while (!isSafe(board, row + i, col + j, num));
        board[row + i][col + j].value = num;
        board[row + i][col + j].isFixed = true;
      }
    }
  };

  const fillRemaining = (board: SudokuCell[][], i: number, j: number): boolean => {
    if (j >= BOARD_SIZE && i < BOARD_SIZE - 1) {
      i = i + 1;
      j = 0;
    }
    if (i >= BOARD_SIZE && j >= BOARD_SIZE) {
      return true;
    }
    if (i < BOX_SIZE) {
      if (j < BOX_SIZE) {
        j = BOX_SIZE;
      }
    } else if (i < BOARD_SIZE - BOX_SIZE) {
      if (j === Math.floor(i / BOX_SIZE) * BOX_SIZE) {
        j = j + BOX_SIZE;
      }
    } else {
      if (j === BOARD_SIZE - BOX_SIZE) {
        i = i + 1;
        j = 0;
        if (i >= BOARD_SIZE) {
          return true;
        }
      }
    }

    for (let num = 1; num <= BOARD_SIZE; num++) {
      if (isSafe(board, i, j, num)) {
        board[i][j].value = num;
        board[i][j].isFixed = true;
        if (fillRemaining(board, i, j + 1)) {
          return true;
        }
        board[i][j].value = 0;
        board[i][j].isFixed = false;
      }
    }
    return false;
  };

  const isSafe = (board: SudokuCell[][], row: number, col: number, num: number): boolean => {
    // Check row
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[row][x].value === num) {
        return false;
      }
    }

    // Check column
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[x][col].value === num) {
        return false;
      }
    }

    // Check 3x3 box
    const startRow = row - (row % BOX_SIZE);
    const startCol = col - (col % BOX_SIZE);
    for (let i = 0; i < BOX_SIZE; i++) {
      for (let j = 0; j < BOX_SIZE; j++) {
        if (board[i + startRow][j + startCol].value === num) {
          return false;
        }
      }
    }

    return true;
  };

  const validateBoard = (board: SudokuCell[][]): boolean => {
    // Check if all cells are filled
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col].value === 0) {
          return false;
        }
      }
    }

    // Check rows, columns, and boxes
    for (let i = 0; i < BOARD_SIZE; i++) {
      if (!isValidRow(board, i) || !isValidCol(board, i) || !isValidBox(board, i)) {
        return false;
      }
    }

    return true;
  };

  const isValidRow = (board: SudokuCell[][], row: number): boolean => {
    const seen = new Set<number>();
    for (let col = 0; col < BOARD_SIZE; col++) {
      const val = board[row][col].value;
      if (val !== 0) {
        if (seen.has(val)) return false;
        seen.add(val);
      }
    }
    return true;
  };

  const isValidCol = (board: SudokuCell[][], col: number): boolean => {
    const seen = new Set<number>();
    for (let row = 0; row < BOARD_SIZE; row++) {
      const val = board[row][col].value;
      if (val !== 0) {
        if (seen.has(val)) return false;
        seen.add(val);
      }
    }
    return true;
  };

  const isValidBox = (board: SudokuCell[][], boxIndex: number): boolean => {
    const seen = new Set<number>();
    const startRow = Math.floor(boxIndex / BOX_SIZE) * BOX_SIZE;
    const startCol = (boxIndex % BOX_SIZE) * BOX_SIZE;

    for (let row = 0; row < BOX_SIZE; row++) {
      for (let col = 0; col < BOX_SIZE; col++) {
        const val = board[startRow + row][startCol + col].value;
        if (val !== 0) {
          if (seen.has(val)) return false;
          seen.add(val);
        }
      }
    }
    return true;
  };

  const updateCellValidation = (board: SudokuCell[][]): SudokuCell[][] => {
    const newBoard = board.map(row => row.map(cell => ({ ...cell, isValid: true })));

    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const cell = newBoard[row][col];
        if (cell.value !== 0 && !cell.isFixed) {
          // Check if this number conflicts with others in row, column, or box
          for (let i = 0; i < BOARD_SIZE; i++) {
            // Check row
            if (i !== col && newBoard[row][i].value === cell.value) {
              newBoard[row][col].isValid = false;
              newBoard[row][i].isValid = false;
            }
            // Check column
            if (i !== row && newBoard[i][col].value === cell.value) {
              newBoard[row][col].isValid = false;
              newBoard[i][col].isValid = false;
            }
          }

          // Check 3x3 box
          const boxStartRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
          const boxStartCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
          for (let i = 0; i < BOX_SIZE; i++) {
            for (let j = 0; j < BOX_SIZE; j++) {
              const checkRow = boxStartRow + i;
              const checkCol = boxStartCol + j;
              if ((checkRow !== row || checkCol !== col) &&
                  newBoard[checkRow][checkCol].value === cell.value) {
                newBoard[row][col].isValid = false;
                newBoard[checkRow][checkCol].isValid = false;
              }
            }
          }
        }
      }
    }

    return newBoard;
  };

  const startGame = () => {
    setGameStarted(true);
    const puzzle = generatePuzzle();
    setBoard(puzzle);
    setSelectedCell(null);
    setSelectedNumber(null);
    setGameCompleted(false);
    setTimeLeft(600);
    setMistakes(0);
    setHints(3);
    soundManager.playGameStart();
  };

  const handleCellClick = (row: number, col: number) => {
    if (!gameStarted || gameCompleted) return;

    const cell = board[row][col];
    if (cell.isFixed) return;

    setSelectedCell({ row, col });
    soundManager.playTileSelect();
  };

  const handleNumberClick = (number: number) => {
    if (!selectedCell || !gameStarted || gameCompleted) return;

    const { row, col } = selectedCell;
    const cell = board[row][col];

    if (cell.isFixed) return;

    const newBoard = board.map(r => r.map(c => ({ ...c, notes: new Set(c.notes) })));
    newBoard[row][col].value = number;
    newBoard[row][col].notes.clear();

    // Validate the board
    const validatedBoard = updateCellValidation(newBoard);
    setBoard(validatedBoard);

    // Check if the move was incorrect
    if (!validatedBoard[row][col].isValid) {
      setMistakes(prev => prev + 1);
      soundManager.playMatchFailure();
    } else {
      soundManager.playMatchSuccess();
    }

    // Check win condition
    if (validateBoard(validatedBoard)) {
      setGameCompleted(true);
      soundManager.playGameComplete();
      const score = Math.max(0, 1000 - mistakes * 50 - Math.floor((600 - timeLeft) / 10));
      completeMiniGame('sudoku', score, mistakes);
    }
  };

  const handleHint = () => {
    if (hints <= 0 || !gameStarted || gameCompleted) return;

    // Find a random empty cell and fill it with the correct number
    const emptyCells = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col].value === 0) {
          emptyCells.push({ row, col });
        }
      }
    }

    if (emptyCells.length === 0) return;

    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const { row, col } = randomCell;

    // Find the correct number for this cell
    for (let num = 1; num <= BOARD_SIZE; num++) {
      if (isSafe(board, row, col, num)) {
        const newBoard = board.map(r => r.map(c => ({ ...c, notes: new Set(c.notes) })));
        newBoard[row][col].value = num;
        newBoard[row][col].isFixed = true; // Make it fixed so player can't change it
        setBoard(updateCellValidation(newBoard));
        setHints(prev => prev - 1);
        soundManager.playMatchSuccess();
        break;
      }
    }
  };

  const handleErase = () => {
    if (!selectedCell || !gameStarted || gameCompleted) return;

    const { row, col } = selectedCell;
    const cell = board[row][col];

    if (cell.isFixed) return;

    const newBoard = board.map(r => r.map(c => ({ ...c, notes: new Set(c.notes) })));
    newBoard[row][col].value = 0;
    newBoard[row][col].notes.clear();
    setBoard(updateCellValidation(newBoard));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!gameStarted || gameCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameCompleted(true);
          setMessage(`⏰ Time's up! You made ${mistakes} mistakes.`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameCompleted, mistakes, setMessage]);

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
          🧩 Pet Sudoku
        </motion.h2>
        <p className="text-gray-300 mb-4">
          Fill the grid with numbers 1-9. No repeats in rows, columns, or boxes!
        </p>

        {!gameStarted ? (
          <motion.button
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-blue-500/30 transition-all duration-300 btn-modern"
            onClick={startGame}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🎮 Start Game
          </motion.button>
        ) : (
          <div className="flex justify-center gap-6 mb-4">
            <div className="glass-card px-4 py-2 rounded-lg">
              <span className="text-white font-semibold">Time: {formatTime(timeLeft)}</span>
            </div>
            <div className="glass-card px-4 py-2 rounded-lg">
              <span className="text-white font-semibold">Mistakes: {mistakes}</span>
            </div>
            <div className="glass-card px-4 py-2 rounded-lg">
              <span className="text-white font-semibold">Hints: {hints}</span>
            </div>
          </div>
        )}
      </div>

      {/* Game Board */}
      {gameStarted && (
        <motion.div
          className="relative mb-6"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="grid grid-cols-9 gap-1 max-w-2xl mx-auto bg-black/20 p-4 rounded-2xl backdrop-blur-sm">
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                const isInSameRow = selectedCell?.row === rowIndex;
                const isInSameCol = selectedCell?.col === colIndex;
                const isInSameBox = selectedCell &&
                  Math.floor(selectedCell.row / BOX_SIZE) === Math.floor(rowIndex / BOX_SIZE) &&
                  Math.floor(selectedCell.col / BOX_SIZE) === Math.floor(colIndex / BOX_SIZE);

                return (
                  <motion.div
                    key={`${rowIndex}-${colIndex}`}
                    className={`aspect-square rounded-lg cursor-pointer transition-all duration-200 relative ${
                      cell.isFixed
                        ? 'bg-blue-500/20 border-2 border-blue-400/50'
                        : isSelected
                        ? 'bg-yellow-400/30 border-2 border-yellow-400'
                        : (isInSameRow || isInSameCol || isInSameBox)
                        ? 'bg-gray-600/20 border border-gray-400/30'
                        : 'bg-gray-700/10 border border-gray-500/20 hover:bg-gray-600/20'
                    } ${!cell.isValid ? 'ring-2 ring-red-400' : ''}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    whileHover={!cell.isFixed ? { scale: 1.05 } : {}}
                    whileTap={!cell.isFixed ? { scale: 0.95 } : {}}
                  >
                    {/* Cell Content */}
                    <div className="w-full h-full flex items-center justify-center text-xl font-bold">
                      {cell.value !== 0 ? (
                        <span className={`${cell.isFixed ? 'text-blue-300' : cell.isValid ? 'text-white' : 'text-red-400'}`}>
                          {cell.value}
                        </span>
                      ) : cell.notes.size > 0 ? (
                        <div className="grid grid-cols-3 gap-0 text-xs text-gray-400 w-full h-full p-1">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                            <div key={num} className="flex items-center justify-center">
                              {cell.notes.has(num) ? num : ''}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    {/* Thick borders for 3x3 boxes */}
                    <div className={`absolute inset-0 pointer-events-none ${
                      (rowIndex + 1) % 3 === 0 && rowIndex < 8 ? 'border-b-4 border-gray-400' : ''
                    } ${
                      (colIndex + 1) % 3 === 0 && colIndex < 8 ? 'border-r-4 border-gray-400' : ''
                    }`} />
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      )}

      {/* Number Pad */}
      {gameStarted && !gameCompleted && (
        <motion.div
          className="flex flex-col items-center gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="grid grid-cols-9 gap-2 max-w-2xl">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(number => (
              <motion.button
                key={number}
                className={`aspect-square rounded-lg font-bold text-xl transition-all duration-200 ${
                  selectedNumber === number
                    ? 'bg-yellow-400 text-black shadow-lg'
                    : 'bg-gray-600 hover:bg-gray-500 text-white'
                }`}
                onClick={() => {
                  setSelectedNumber(number);
                  handleNumberClick(number);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {number}
              </motion.button>
            ))}
          </div>

          <div className="flex gap-4">
            <motion.button
              className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg font-bold"
              onClick={handleErase}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🗑️ Erase
            </motion.button>
            <motion.button
              className={`px-6 py-2 rounded-lg font-bold ${
                hints > 0
                  ? 'bg-green-600 hover:bg-green-500 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
              onClick={handleHint}
              disabled={hints <= 0}
              whileHover={hints > 0 ? { scale: 1.05 } : {}}
              whileTap={hints > 0 ? { scale: 0.95 } : {}}
            >
              💡 Hint ({hints})
            </motion.button>
          </div>
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
            <h3 className="text-2xl font-bold text-white mb-2">
              {validateBoard(board) ? '🎉 Puzzle Solved!' : '⏰ Time\'s Up!'}
            </h3>
            <p className="text-gray-300 mb-4">
              Mistakes: {mistakes} | Time: {formatTime(600 - timeLeft)} | Hints Used: {3 - hints}
            </p>
            <div className="flex gap-3 justify-center">
              <motion.button
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-xl font-bold btn-modern"
                onClick={startGame}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🔄 New Puzzle
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
              <span className="text-2xl">🎯</span>
              <div>
                <strong className="text-white">Objective:</strong> Fill all cells with numbers 1-9
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📏</span>
              <div>
                <strong className="text-white">Rules:</strong> No repeats in rows, columns, or 3x3 boxes
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔵</span>
              <div>
                <strong className="text-white">Fixed:</strong> Blue numbers are given clues
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <strong className="text-white">Hints:</strong> Get help with difficult cells
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SudokuGame;
