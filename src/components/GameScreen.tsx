import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store';
import HomeTab from './tabs/HomeTab';
import MiniGamesTab from './tabs/MiniGamesTab';
import ShopTab from './tabs/ShopTab';
import AchievementsTab from './tabs/AchievementsTab';
import MessageBubble from './MessageBubble';

const GameScreen: React.FC = () => {
  const { activeTab, setActiveTab, message } = useGameStore();

  const tabs = [
    { id: 'home', label: '🏠 Home', component: HomeTab },
    { id: 'minigames', label: '🎮 Mini-Games', component: MiniGamesTab },
    { id: 'shop', label: '🛒 Shop', component: ShopTab },
    { id: 'achievements', label: '🏆 Achievements', component: AchievementsTab }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || HomeTab;

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Navigation Tabs */}
      <motion.div
        className="flex justify-center gap-2 mb-8 bg-glass-bg/20 backdrop-blur-md rounded-2xl p-2 border border-glass-border"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 relative overflow-hidden ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-purple-500/30'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
            onClick={() => setActiveTab(tab.id as any)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-500/20"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
          </motion.button>
        ))}
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <ActiveComponent />
        </motion.div>
      </AnimatePresence>

      {/* Message Bubble */}
      <AnimatePresence>
        {message && (
          <MessageBubble message={message} />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GameScreen;
