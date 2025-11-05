import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store';

const StatsGrid: React.FC = () => {
  const { currentPet } = useGameStore();

  if (!currentPet) return null;

  const stats = [
    {
      name: 'Hunger',
      value: currentPet.stats.hunger,
      icon: '🍽️',
      color: 'from-red-400 to-pink-500',
      bgColor: 'from-red-500/20 to-pink-500/20'
    },
    {
      name: 'Happiness',
      value: currentPet.stats.happiness,
      icon: '😊',
      color: 'from-yellow-400 to-orange-500',
      bgColor: 'from-yellow-500/20 to-orange-500/20'
    },
    {
      name: 'Health',
      value: currentPet.stats.health,
      icon: '❤️',
      color: 'from-green-400 to-emerald-500',
      bgColor: 'from-green-500/20 to-emerald-500/20'
    },
    {
      name: 'Energy',
      value: currentPet.stats.energy,
      icon: '⚡',
      color: 'from-blue-400 to-purple-500',
      bgColor: 'from-blue-500/20 to-purple-500/20'
    }
  ];

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.name}
          className={`bg-glass-bg/20 backdrop-blur-md border border-glass-border rounded-2xl p-4 relative overflow-hidden group hover:bg-glass-bg/30 transition-all duration-300`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          whileHover={{ scale: 1.05, y: -2 }}
        >
          {/* Background gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

          {/* Header */}
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-white font-semibold text-sm">{stat.name}</span>
            </div>
            <span className="text-white font-bold text-lg">{Math.round(stat.value)}</span>
          </div>

          {/* Progress Bar */}
          <div className="relative z-10">
            <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div
                className={`h-full bg-gradient-to-r ${stat.color} rounded-full relative`}
                initial={{ width: 0 }}
                animate={{ width: `${stat.value}%` }}
                transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
              >
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.2
                  }}
                />

                {/* Glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} blur-sm opacity-50`} />
              </motion.div>
            </div>

            {/* Status indicator */}
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-300">
                {stat.value >= 80 ? 'Excellent' :
                 stat.value >= 60 ? 'Good' :
                 stat.value >= 40 ? 'Okay' :
                 stat.value >= 20 ? 'Low' : 'Critical'}
              </span>
              <span className="text-xs text-gray-400">100%</span>
            </div>
          </div>

          {/* Animated particles for high stats */}
          {stat.value >= 90 && (
            <motion.div
              className="absolute top-2 right-2"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <span className="text-yellow-300 text-sm">✨</span>
            </motion.div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default StatsGrid;
