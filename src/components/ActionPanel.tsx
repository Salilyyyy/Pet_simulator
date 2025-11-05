import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store';

const ActionPanel: React.FC = () => {
  const { feedPet, playWithPet, cleanPet, sleepPet, healPet } = useGameStore();

  const actions = [
    {
      name: 'Feed',
      icon: '🍖',
      cost: '5🪙',
      action: () => feedPet(5),
      color: 'from-red-500 to-pink-600',
      hoverColor: 'hover:shadow-red-500/30'
    },
    {
      name: 'Play',
      icon: '🎾',
      cost: '10🪙',
      action: () => playWithPet(10),
      color: 'from-yellow-500 to-orange-600',
      hoverColor: 'hover:shadow-yellow-500/30'
    },
    {
      name: 'Clean',
      icon: '🧼',
      cost: '8🪙',
      action: () => cleanPet(8),
      color: 'from-blue-500 to-cyan-600',
      hoverColor: 'hover:shadow-blue-500/30'
    },
    {
      name: 'Sleep',
      icon: '😴',
      cost: 'Free',
      action: sleepPet,
      color: 'from-purple-500 to-indigo-600',
      hoverColor: 'hover:shadow-purple-500/30'
    },
    {
      name: 'Heal',
      icon: '💊',
      cost: '15🪙',
      action: () => healPet(15),
      color: 'from-green-500 to-emerald-600',
      hoverColor: 'hover:shadow-green-500/30'
    }
  ];

  return (
    <motion.div
      className="bg-glass-bg/20 backdrop-blur-md border border-glass-border rounded-2xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h4
        className="text-xl font-bold text-white text-center mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Pet Care Actions
      </motion.h4>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {actions.map((action, index) => (
          <motion.button
            key={action.name}
            className={`bg-gradient-to-br ${action.color} text-white border-none rounded-xl p-4 flex flex-col items-center gap-2 transition-all duration-300 shadow-lg ${action.hoverColor} hover:shadow-2xl relative overflow-hidden group`}
            onClick={action.action}
            whileHover={{
              scale: 1.05,
              y: -2,
              boxShadow: `0 20px 40px rgba(0,0,0,0.3)`
            }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            {/* Background glow effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />

            {/* Icon with animation */}
            <motion.span
              className="text-3xl relative z-10"
              whileHover={{
                scale: 1.2,
                rotate: [0, -10, 10, 0]
              }}
              transition={{ duration: 0.3 }}
            >
              {action.icon}
            </motion.span>

            {/* Action name */}
            <span className="font-bold text-sm relative z-10">{action.name}</span>

            {/* Cost */}
            <span className="text-xs opacity-80 relative z-10">{action.cost}</span>

            {/* Shine effect */}
            <motion.div
              className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
              initial={{ x: '-200%' }}
              whileHover={{ x: '200%' }}
              transition={{ duration: 0.6 }}
            />

            {/* Particle effects on hover */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  style={{
                    top: `${20 + i * 25}%`,
                    left: `${20 + i * 30}%`,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </motion.div>
          </motion.button>
        ))}
      </motion.div>

      {/* Tips section */}
      <motion.div
        className="mt-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <p className="text-gray-300 text-sm">
          💡 <strong>Tip:</strong> Keep your pet's stats above 50% to maintain happiness!
        </p>
      </motion.div>
    </motion.div>
  );
};

export default ActionPanel;
