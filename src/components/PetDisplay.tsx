import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store';

const PetDisplay: React.FC = () => {
  const { currentPet, switchToPetSelection, setMessage } = useGameStore();
  const [showCustomization, setShowCustomization] = useState(false);

  if (!currentPet) return null;

  const handleChangePet = () => {
    if (confirm('Are you sure you want to change your pet? Your current pet\'s progress will be saved.')) {
      switchToPetSelection();
    }
  };

  const getMoodEmoji = () => {
    const avgStats = (currentPet.stats.hunger + currentPet.stats.happiness + currentPet.stats.health + currentPet.stats.energy) / 4;
    if (avgStats >= 80) return '😊';
    if (avgStats >= 60) return '🙂';
    if (avgStats >= 40) return '😐';
    if (avgStats >= 20) return '😟';
    return '😢';
  };

  const getMoodText = () => {
    const avgStats = (currentPet.stats.hunger + currentPet.stats.happiness + currentPet.stats.health + currentPet.stats.energy) / 4;
    if (avgStats >= 80) return 'Happy';
    if (avgStats >= 60) return 'Content';
    if (avgStats >= 40) return 'Neutral';
    if (avgStats >= 20) return 'Unhappy';
    return 'Sad';
  };

  return (
    <motion.div
      className="flex flex-col lg:flex-row items-center justify-center gap-8"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Pet Container */}
      <div className="relative mb-20">
        {/* Pet House */}
        <motion.div
          className="relative w-80 h-60 bg-gradient-to-b from-amber-800 to-amber-900 rounded-2xl shadow-2xl border-4 border-amber-700 overflow-visible"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {/* House Background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-12 border-transparent border-b-red-600" />
            <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-b-9 border-transparent border-b-red-800" />
            <div className="absolute top-8 right-8 w-6 h-8 bg-blue-400 rounded opacity-60" />
            <div className="absolute top-8 left-8 w-6 h-8 bg-blue-400 rounded opacity-60" />
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-12 h-16 bg-amber-900 rounded-t" />
          </div>

          {/* Pet */}
          <motion.div
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-32 rounded-full flex items-center justify-center shadow-lg cursor-pointer"
            style={{
              backgroundColor: currentPet.customization?.color || '#FFD700',
              transform: `scale(${currentPet.customization?.size || 1})`
            }}
            animate={{
              y: [0, -5, 0],
              rotate: [0, 2, -2, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            whileHover={{ scale: (currentPet.customization?.size || 1) * 1.1 }}
          >
            <motion.span
              className="text-6xl"
              style={{
                filter: `hue-rotate(${currentPet.customization?.color ? '0deg' : '0deg'}) brightness(1.2)`,
                transform: `scale(${currentPet.customization?.size || 1})` // Scale with container
              }}
              animate={{
                scale: [1, 1.05, 1].map(s => s * (currentPet.customization?.size || 1)),
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {currentPet.typeData.emoji}
            </motion.span>

            {/* Accessory */}
            {currentPet.customization?.accessory && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-2xl z-10 drop-shadow-lg">
                {currentPet.customization.accessory}
              </div>
            )}

            {/* Pet Sparkles */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-300 rounded-full"
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

          {/* Level Progress Bar */}
          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 w-64 space-y-1">
            {/* Level Indicator */}
            <div className="flex items-center justify-center">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                ⭐ Level {currentPet.level}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-4 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
              <motion.div
                className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-full relative"
                style={{
                  width: `${(currentPet.experience / (currentPet.level * 100)) * 100}%`
                }}
                initial={{ width: 0 }}
                animate={{
                  width: `${(currentPet.experience / (currentPet.level * 100)) * 100}%`
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs font-bold drop-shadow-sm">
                    {currentPet.experience}/{currentPet.level * 100} XP
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Next Level Info */}
            <div className="text-center">
              <span className="text-white text-xs opacity-80">
                {currentPet.level * 100 - currentPet.experience} XP to Level {currentPet.level + 1}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Pet Info Panel */}
      <motion.div
        className="text-center max-w-sm"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <h3 className="text-2xl font-bold text-pink-200 mb-4 drop-shadow-lg">
          {currentPet.name}
        </h3>

        <div className="bg-glass-bg/20 backdrop-blur-md border border-glass-border rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">{getMoodEmoji()}</span>
            <span className="text-purple-200 font-medium drop-shadow-md">{getMoodText()}</span>
          </div>
          <p className="text-blue-200 text-sm font-medium drop-shadow-sm">
            {currentPet.typeData.personality}
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <motion.button
            className="bg-glass-bg/30 backdrop-blur-md border border-glass-border text-white px-4 py-2 rounded-xl hover:bg-glass-bg/50 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleChangePet}
          >
            Change Pet
          </motion.button>
          <motion.button
            className="bg-glass-bg/30 backdrop-blur-md border border-glass-border text-white px-4 py-2 rounded-xl hover:bg-glass-bg/50 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCustomization(true)}
          >
            Customize
          </motion.button>
        </div>
      </motion.div>

      {/* Pet Customization Modal */}
      <AnimatePresence>
        {showCustomization && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gradient-to-br from-slate-800/95 via-gray-800/90 to-zinc-800/95 backdrop-blur-xl border-2 border-slate-600/50 rounded-3xl p-8 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="text-center mb-6">
                <h3 className="text-3xl font-bold text-white mb-2">
                  🎨 Customize {currentPet.name}
                </h3>
                <p className="text-gray-300">Make your pet unique with accessories and colors!</p>
              </div>

              {/* Preview */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-32 h-32 bg-gradient-to-br from-yellow-200 to-orange-300 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-6xl">{currentPet.typeData.emoji}</span>
                  </div>
                  {(currentPet.customization?.accessory) && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-2xl">
                      {currentPet.customization.accessory}
                    </div>
                  )}
                </div>
              </div>

              {/* Customization Options */}
              <div className="space-y-6">
                {/* Accessories */}
                <div>
                  <h4 className="text-lg font-bold text-white mb-3">🎩 Accessories</h4>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { emoji: null, name: 'None', price: 0 },
                      { emoji: '🎩', name: 'Top Hat', price: 25 },
                      { emoji: '👒', name: 'Sun Hat', price: 20 },
                      { emoji: '🧢', name: 'Cap', price: 15 },
                      { emoji: '🎀', name: 'Bow', price: 18 },
                      { emoji: '👓', name: 'Glasses', price: 22 },
                      { emoji: '💍', name: 'Necklace', price: 30 },
                      { emoji: '🎪', name: 'Party Hat', price: 12 }
                    ].map((accessory) => (
                      <motion.button
                        key={accessory.name}
                        className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                          currentPet.customization.accessory === accessory.emoji
                            ? 'border-purple-400 bg-purple-500/20'
                            : 'border-slate-600/50 bg-slate-700/30 hover:border-purple-400/50'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          const updatedPet = {
                            ...currentPet,
                            customization: {
                              ...currentPet.customization,
                              accessory: accessory.emoji
                            }
                          };
                          useGameStore.setState({ currentPet: updatedPet });
                          setMessage(`✨ Equipped ${accessory.name}!`);
                        }}
                      >
                        <div className="text-2xl mb-1">{accessory.emoji || '❌'}</div>
                        <div className="text-xs text-white font-medium">{accessory.name}</div>
                        {accessory.price > 0 && (
                          <div className="text-xs text-yellow-400">{accessory.price}🪙</div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div>
                  <h4 className="text-lg font-bold text-white mb-3">🎨 Colors</h4>
                  <div className="grid grid-cols-6 gap-3">
                    {[
                      { color: '#FFD700', name: 'Gold' },
                      { color: '#FF6B6B', name: 'Red' },
                      { color: '#4ECDC4', name: 'Teal' },
                      { color: '#45B7D1', name: 'Blue' },
                      { color: '#96CEB4', name: 'Green' },
                      { color: '#FFEAA7', name: 'Yellow' },
                      { color: '#DDA0DD', name: 'Plum' },
                      { color: '#98D8C8', name: 'Mint' },
                      { color: '#F7DC6F', name: 'Amber' },
                      { color: '#BB8FCE', name: 'Lavender' },
                      { color: '#85C1E9', name: 'Sky' },
                      { color: '#F8C471', name: 'Orange' }
                    ].map((colorOption) => (
                      <motion.button
                        key={colorOption.name}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                          currentPet.customization.color === colorOption.color
                            ? 'border-white shadow-lg shadow-white/30'
                            : 'border-slate-600/50 hover:border-white/50'
                        }`}
                        style={{ backgroundColor: colorOption.color }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          const updatedPet = {
                            ...currentPet,
                            customization: {
                              ...currentPet.customization,
                              color: colorOption.color
                            }
                          };
                          useGameStore.setState({ currentPet: updatedPet });
                          setMessage(`🎨 Changed color to ${colorOption.name}!`);
                        }}
                      >
                        <div className="text-xs text-white font-bold drop-shadow">
                          {colorOption.name}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Size */}
                <div>
                  <h4 className="text-lg font-bold text-white mb-3">📏 Size</h4>
                  <div className="flex items-center justify-center gap-4">
                    <motion.button
                      className="px-4 py-2 bg-slate-600/50 text-white rounded-xl hover:bg-slate-500/50 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const newSize = Math.max(0.5, currentPet.customization.size - 0.05);
                        const updatedPet = {
                          ...currentPet,
                          customization: {
                            ...currentPet.customization,
                            size: newSize
                          }
                        };
                        useGameStore.setState({ currentPet: updatedPet });
                      }}
                    >
                      ➖ Smaller
                    </motion.button>

                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {Math.round(currentPet.customization.size * 100)}%
                      </div>
                      <div className="text-sm text-gray-400">Size</div>
                    </div>

                    <motion.button
                      className="px-4 py-2 bg-slate-600/50 text-white rounded-xl hover:bg-slate-500/50 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const newSize = Math.min(2.0, currentPet.customization.size + 0.05);
                        const updatedPet = {
                          ...currentPet,
                          customization: {
                            ...currentPet.customization,
                            size: newSize
                          }
                        };
                        useGameStore.setState({ currentPet: updatedPet });
                      }}
                    >
                      ➕ Bigger
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-center mt-8">
                <motion.button
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl shadow-lg hover:shadow-purple-500/40 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCustomization(false)}
                >
                  Done Customizing ✨
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PetDisplay;
