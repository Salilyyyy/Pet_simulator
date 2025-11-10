import React from 'react';
import { motion } from 'framer-motion';

const BackgroundAnimations: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Reduced Floating Elements - only essential ones */}
      <div className="absolute inset-0">
        {/* Stars - reduced to 2 */}
        <motion.div
          className="absolute text-3xl text-yellow-400 drop-shadow-lg"
          style={{ top: '20%', left: '10%' }}
          animate={{
            y: [-10, 10, -10],
            rotate: [0, 180, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          ⭐
        </motion.div>

        <motion.div
          className="absolute text-2xl text-purple-400 drop-shadow-lg"
          style={{ bottom: '25%', right: '15%' }}
          animate={{
            y: [10, -10, 10],
            rotate: [360, 180, 0],
            scale: [1.1, 1, 1.1]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
            delay: -5
          }}
        >
          ✨
        </motion.div>

        {/* Clouds - reduced to 1 */}
        <motion.div
          className="absolute text-4xl text-blue-300 drop-shadow-lg"
          style={{ top: '15%', right: '30%' }}
          animate={{
            x: [-5, 5, -5],
            scale: [1, 1.02, 1]
          }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          ☁️
        </motion.div>
      </div>

      {/* Simplified Gradient Blobs - reduced to 2 */}
      <motion.div
        className="absolute top-1/3 left-1/4 w-64 h-64 bg-gradient-to-r from-pink-300/10 to-purple-300/10 rounded-full blur-2xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15]
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-gradient-to-r from-blue-300/10 to-cyan-300/10 rounded-full blur-2xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.3, 0.2]
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 8
        }}
      />
    </div>
  );
};

export default BackgroundAnimations;
