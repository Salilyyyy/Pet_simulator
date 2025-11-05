import React from 'react';
import { motion } from 'framer-motion';

const AchievementsTab: React.FC = () => {
  const achievements = [
    { name: 'First Pet', description: 'Get your first pet companion', icon: '🎉', unlocked: true },
    { name: 'Level Master', description: 'Reach level 5', icon: '⭐', unlocked: false },
    { name: 'Perfect Care', description: 'Keep all stats above 90%', icon: '💎', unlocked: false }
  ];

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h3
        className="text-2xl font-bold text-white text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Achievements
      </motion.h3>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {achievements.map((achievement, index) => (
          <motion.div
            key={achievement.name}
            className={`bg-glass-bg/20 backdrop-blur-md border border-glass-border rounded-2xl p-6 flex items-center gap-4 transition-all duration-300 ${
              achievement.unlocked ? 'hover:bg-glass-bg/30' : 'opacity-60'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.4 }}
            whileHover={achievement.unlocked ? { scale: 1.02 } : {}}
          >
            <div className={`text-4xl ${achievement.unlocked ? 'filter drop-shadow-lg' : 'grayscale'}`}>
              {achievement.icon}
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-white mb-1">{achievement.name}</h4>
              <p className="text-gray-300 text-sm mb-3">{achievement.description}</p>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                achievement.unlocked
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                  : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
              }`}>
                {achievement.unlocked ? '✅ Unlocked' : '🔒 Locked'}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default AchievementsTab;
