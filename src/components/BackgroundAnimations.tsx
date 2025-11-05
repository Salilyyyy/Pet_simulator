import React from 'react';
import { motion } from 'framer-motion';

const BackgroundAnimations: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Cute Floating Elements */}
      <div className="absolute inset-0">
        {/* Hearts */}
        <motion.div
          className="absolute text-4xl text-pink-400 drop-shadow-lg"
          style={{ top: '8%', left: '8%' }}
          animate={{
            y: [-15, 15, -15],
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          💖
        </motion.div>

        <motion.div
          className="absolute text-3xl text-red-400 drop-shadow-lg"
          style={{ top: '15%', right: '12%' }}
          animate={{
            y: [15, -15, 15],
            rotate: [-10, 10, -10],
            scale: [1.1, 1, 1.1]
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
            delay: -3
          }}
        >
          💕
        </motion.div>

        {/* Stars */}
        <motion.div
          className="absolute text-2xl text-yellow-400 drop-shadow-lg"
          style={{ top: '25%', left: '15%' }}
          animate={{
            y: [-20, 20, -20],
            rotate: [0, 180, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          ⭐
        </motion.div>

        <motion.div
          className="absolute text-3xl text-purple-400 drop-shadow-lg"
          style={{ bottom: '20%', right: '8%' }}
          animate={{
            y: [20, -20, 20],
            rotate: [360, 180, 0],
            scale: [1.2, 1, 1.2]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
            delay: -8
          }}
        >
          ✨
        </motion.div>

        {/* Cute Animals */}
        <motion.div
          className="absolute text-4xl drop-shadow-lg"
          style={{ top: '35%', right: '20%' }}
          animate={{
            y: [-10, 10, -10],
            x: [-5, 5, -5],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          🐰
        </motion.div>

        <motion.div
          className="absolute text-3xl drop-shadow-lg"
          style={{ bottom: '15%', left: '25%' }}
          animate={{
            y: [10, -10, 10],
            x: [5, -5, 5],
            rotate: [-5, 5, -5]
          }}
          transition={{
            duration: 17,
            repeat: Infinity,
            ease: "easeInOut",
            delay: -5
          }}
        >
          🐱
        </motion.div>

        <motion.div
          className="absolute text-2xl drop-shadow-lg"
          style={{ top: '45%', left: '5%' }}
          animate={{
            y: [-8, 8, -8],
            rotate: [0, 15, -15, 0]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          🐶
        </motion.div>

        {/* Clouds */}
        <motion.div
          className="absolute text-5xl text-blue-300 drop-shadow-lg"
          style={{ top: '10%', right: '35%' }}
          animate={{
            x: [-10, 10, -10],
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          ☁️
        </motion.div>

        <motion.div
          className="absolute text-4xl text-blue-200 drop-shadow-lg"
          style={{ bottom: '25%', left: '35%' }}
          animate={{
            x: [10, -10, 10],
            scale: [1.05, 1, 1.05]
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "easeInOut",
            delay: -10
          }}
        >
          ☁️
        </motion.div>

        {/* Butterflies */}
        <motion.div
          className="absolute text-2xl drop-shadow-lg"
          style={{ top: '50%', right: '5%' }}
          animate={{
            y: [-25, 25, -25],
            x: [-15, 15, -15],
            rotate: [0, 360]
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          🦋
        </motion.div>

        <motion.div
          className="absolute text-2xl drop-shadow-lg"
          style={{ bottom: '35%', left: '8%' }}
          animate={{
            y: [25, -25, 25],
            x: [15, -15, 15],
            rotate: [360, 0]
          }}
          transition={{
            duration: 32,
            repeat: Infinity,
            ease: "easeInOut",
            delay: -12
          }}
        >
          🦋
        </motion.div>
      </div>

      {/* Cute Gradient Blobs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-pink-300/15 to-purple-300/15 rounded-full blur-2xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
          rotate: [0, 90, 0]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-blue-300/15 to-cyan-300/15 rounded-full blur-2xl"
        animate={{
          scale: [1.3, 1, 1.3],
          opacity: [0.3, 0.5, 0.3],
          rotate: [90, 0, 90]
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5
        }}
      />

      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-yellow-200/10 to-pink-200/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.3, 0.1]
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 10
        }}
      />
    </div>
  );
};

export default BackgroundAnimations;
