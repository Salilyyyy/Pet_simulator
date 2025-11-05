import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store';
import { PET_TYPES } from '../constants';
import { PetType } from '../types';

const PetSelectionScreen: React.FC = () => {
  const { createPet } = useGameStore();
  const [selectedPetType, setSelectedPetType] = useState<PetType | null>(null);
  const [petName, setPetName] = useState('');

  const handlePetSelect = (petType: PetType) => {
    setSelectedPetType(petType);
    setPetName(''); // Reset name input
  };

  const handleConfirmPet = () => {
    if (selectedPetType && petName.trim()) {
      createPet(selectedPetType, petName.trim());
      setSelectedPetType(null);
    }
  };

  const handleCancel = () => {
    setSelectedPetType(null);
    setPetName('');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100
      }
    }
  } as const;

  return (
    <motion.div
      className="text-center"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Selection Header */}
      <motion.div
        className="mb-8"
        variants={itemVariants}
      >
        <h2 className="text-3xl font-bold text-pink-300 mb-2 drop-shadow-xl">
          Choose Your Perfect Companion!
        </h2>
        <p className="text-purple-200 text-lg font-medium drop-shadow-lg">
          Each pet has unique traits and care requirements
        </p>
      </motion.div>

      {/* Pet Options Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
      >
        {Object.entries(PET_TYPES).map(([petType, petData]) => (
          <motion.div
            key={petType}
            className="group cursor-pointer"
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePetSelect(petType as PetType)}
          >
            <div className="bg-glass-bg/20 backdrop-blur-md border border-glass-border rounded-2xl p-6 h-80 flex flex-col transition-all duration-300 hover:bg-glass-bg/30 hover:shadow-2xl hover:shadow-purple-500/20 relative overflow-hidden">
              {/* Hover Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

              {/* Pet Preview */}
              <motion.div
                className="text-center mb-4 relative"
                whileHover={{ scale: 1.1 }}
              >
                <div className="text-6xl mb-2 filter drop-shadow-lg">
                  {petData.emoji}
                </div>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-pink-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>

              {/* Pet Info */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-pink-200 mb-2 drop-shadow-lg">
                  {petData.name}
                </h3>
                <p className="text-blue-200 mb-4 font-medium drop-shadow-md">
                  {petData.personality}
                </p>

                {/* Traits */}
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-medium border border-blue-500/30">
                    {petData.name === 'Cat' && '🎯 Independent'}
                    {petData.name === 'Dog' && '❤️ Loyal'}
                    {petData.name === 'Rabbit' && '🥰 Cute'}
                    {petData.name === 'Bird' && '🕊️ Free-spirited'}
                    {petData.name === 'Fish' && '😌 Calm'}
                    {petData.name === 'Dragon' && '🔮 Mystical'}
                  </span>
                  <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm font-medium border border-purple-500/30">
                    {petData.name === 'Cat' && '🎮 Playful'}
                    {petData.name === 'Dog' && '⚡ Energetic'}
                    {petData.name === 'Rabbit' && '😊 Shy'}
                    {petData.name === 'Bird' && '😄 Cheerful'}
                    {petData.name === 'Fish' && '💃 Graceful'}
                    {petData.name === 'Dragon' && '💪 Powerful'}
                  </span>
                </div>
              </div>

              {/* Selection Indicator */}
              <motion.div
                className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                initial={false}
              >
                <motion.span
                  className="text-white text-sm"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  ✓
                </motion.span>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Name Input Modal */}
      <AnimatePresence>
        {selectedPetType && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gradient-to-br from-slate-800/95 via-gray-800/90 to-zinc-800/95 backdrop-blur-xl border-2 border-slate-600/50 rounded-3xl p-8 shadow-2xl max-w-md w-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">
                  {PET_TYPES[selectedPetType].emoji}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Name Your {PET_TYPES[selectedPetType].name}!
                </h3>
                <p className="text-gray-300 mb-6">
                  Give your new companion a special name
                </p>

                <div className="mb-6">
                  <input
                    type="text"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    placeholder={`Enter ${PET_TYPES[selectedPetType].name.toLowerCase()} name...`}
                    className="w-full px-4 py-3 bg-slate-700/50 border-2 border-slate-600/50 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none transition-colors duration-300 text-center text-lg font-medium"
                    maxLength={20}
                    autoFocus
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && petName.trim()) {
                        handleConfirmPet();
                      }
                    }}
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    {petName.length}/20 characters
                  </p>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-green-500/40 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleConfirmPet}
                    disabled={!petName.trim()}
                  >
                    🐾 Adopt {petName.trim() || '...'}
                  </motion.button>
                  <motion.button
                    className="px-6 py-3 bg-slate-600/50 text-gray-300 rounded-xl font-medium hover:bg-slate-500/50 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCancel}
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Message */}
      <motion.div
        className="mt-8 text-pink-200 font-medium drop-shadow-md"
        variants={itemVariants}
      >
        <p>Take good care of your pet and watch it grow! 🐾</p>
      </motion.div>
    </motion.div>
  );
};

export default PetSelectionScreen;
