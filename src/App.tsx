import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from './store';
import PetSelectionScreen from './components/PetSelectionScreen';
import GameScreen from './components/GameScreen';
import BackgroundAnimations from './components/BackgroundAnimations';
import { soundManager } from './utils/sounds';

function App() {
  const { currentScreen, currentPet, checkAchievementsOnly, updatePet } = useGameStore();

  // Check achievements when pet loads (for saved games)
  useEffect(() => {
    if (currentPet && currentScreen === 'game') {
      // Small delay to ensure state is fully loaded
      const timeout = setTimeout(() => {
        checkAchievementsOnly(); // This will trigger checkAchievements
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, [currentPet, currentScreen, checkAchievementsOnly]);

  // Update pet stats periodically (every 5 seconds)
  useEffect(() => {
    if (currentPet && currentScreen === 'game') {
      const interval = setInterval(() => {
        updatePet();
      }, 5000); // 5 seconds

      return () => clearInterval(interval);
    }
  }, [currentPet, currentScreen, updatePet]);

  // Background music control
  useEffect(() => {
    const startMusic = async () => {
      if (currentScreen === 'game' && currentPet) {
        try {
          // Try to start background music when entering game
          await soundManager.startBackgroundMusic();
        } catch (error) {
          console.log('Background music needs user interaction to start');
        }
      } else if (currentScreen === 'selection') {
        // Stop background music when going back to selection
        soundManager.stopBackgroundMusic();
      }
    };

    startMusic();

    // Cleanup on unmount
    return () => {
      soundManager.stopBackgroundMusic();
    };
  }, [currentScreen, currentPet]);

  // Auto-start music on first user interaction
  useEffect(() => {
    const handleFirstInteraction = async () => {
      if (currentScreen === 'game' && currentPet && !soundManager.isBackgroundMusicPlaying()) {
        try {
          await soundManager.startBackgroundMusic();
        } catch (error) {
          console.log('Failed to start background music on interaction');
        }
      }
      // Remove listeners after first interaction
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };

    if (currentScreen === 'game' && currentPet) {
      document.addEventListener('click', handleFirstInteraction);
      document.addEventListener('keydown', handleFirstInteraction);
      document.addEventListener('touchstart', handleFirstInteraction);
    }

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [currentScreen, currentPet]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-purple-900 to-slate-900 flex items-center justify-center p-4 font-poppins overflow-hidden relative">
      <BackgroundAnimations />

      <motion.div
        className="bg-glass-bg/25 backdrop-blur-md border border-glass-border rounded-3xl p-6 max-w-4xl w-full shadow-2xl relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <motion.header
          className="text-center mb-8 relative"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent drop-shadow-2xl text-stroke">
            <motion.span
              className="inline-block"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            >
              🌟
            </motion.span>
            Modern Pet Simulator
            <motion.span
              className="inline-block"
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", delay: 0.5 }}
            >
              🌟
            </motion.span>
          </h1>

          {currentPet && (
            <motion.div
              className="flex justify-center gap-6 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-2 bg-glass-bg/20 backdrop-blur-sm px-4 py-2 rounded-full border border-glass-border">
                <span className="text-lg">⭐</span>
                <span className="font-semibold text-purple-300">Level {currentPet.level}</span>
              </div>
              <div className="flex items-center gap-2 bg-glass-bg/20 backdrop-blur-sm px-4 py-2 rounded-full border border-glass-border">
                <span className="text-lg">🪙</span>
                <span className="font-semibold text-yellow-300">{currentPet.coins}</span>
              </div>
            </motion.div>
          )}
        </motion.header>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {currentScreen === 'selection' ? (
            <PetSelectionScreen key="selection" />
          ) : (
            <GameScreen key="game" />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default App;
