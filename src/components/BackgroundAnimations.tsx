import React from 'react';
import { motion } from 'framer-motion';

const BackgroundAnimations: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Minimal static background elements */}
      <div className="absolute inset-0">
        {/* Single static star */}
        <div
          className="absolute text-2xl text-yellow-400/30 drop-shadow-lg"
          style={{ top: '20%', left: '10%' }}
        >
          ⭐
        </div>

        {/* Single static sparkle */}
        <div
          className="absolute text-xl text-purple-400/30 drop-shadow-lg"
          style={{ bottom: '25%', right: '15%' }}
        >
          ✨
        </div>

        {/* Single static cloud */}
        <div
          className="absolute text-3xl text-blue-300/20 drop-shadow-lg"
          style={{ top: '15%', right: '30%' }}
        >
          ☁️
        </div>
      </div>

      {/* Static gradient blobs */}
      <div
        className="absolute top-1/3 left-1/4 w-64 h-64 bg-gradient-to-r from-pink-300/5 to-purple-300/5 rounded-full blur-2xl"
      />

      <div
        className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-gradient-to-r from-blue-300/5 to-cyan-300/5 rounded-full blur-2xl"
      />
    </div>
  );
};

export default BackgroundAnimations;
