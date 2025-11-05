import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store';

interface DecorationPosition {
  top: number;
  left: number;
}

const ShopTab: React.FC = () => {
  const { currentPet, setMessage } = useGameStore();
  const [purchasedDecorations, setPurchasedDecorations] = useState<Set<string>>(new Set());
  const [decorationPositions, setDecorationPositions] = useState<Record<string, DecorationPosition>>({});
  const roomRef = useRef<HTMLDivElement>(null);

  const decorations = [
    { id: 'lamp', name: 'Modern Lamp', icon: '💡', price: 45, defaultPosition: { top: 15, left: 15 }, description: 'Smart LED lighting' },
    { id: 'plant', name: 'Designer Plant', icon: '🌿', price: 30, defaultPosition: { top: 50, left: 8 }, description: 'Air-purifying greenery' },
    { id: 'bed', name: 'Luxury Bed', icon: '🛋️', price: 80, defaultPosition: { top: 65, left: 60 }, description: 'Premium comfort' },
    { id: 'toy-box', name: 'Smart Storage', icon: '📦', price: 55, defaultPosition: { top: 70, left: 25 }, description: 'Organized toy storage' },
    { id: 'carpet', name: 'Designer Rug', icon: '🌀', price: 65, defaultPosition: { top: 80, left: 40 }, description: 'Contemporary flooring' },
    { id: 'window', name: 'Smart Window', icon: '🏙️', price: 90, defaultPosition: { top: 10, left: 70 }, description: 'City view display' },
    { id: 'bookshelf', name: 'Bookshelf', icon: '📚', price: 70, defaultPosition: { top: 25, left: 75 }, description: 'Pet book collection' },
    { id: 'aquarium', name: 'Mini Aquarium', icon: '🐠', price: 95, defaultPosition: { top: 35, left: 5 }, description: 'Relaxing fish tank' },
    { id: 'tv', name: 'Smart TV', icon: '📺', price: 120, defaultPosition: { top: 20, left: 45 }, description: 'Entertainment center' },
    { id: 'fridge', name: 'Mini Fridge', icon: '🧊', price: 85, defaultPosition: { top: 55, left: 80 }, description: 'Pet snack storage' },
    { id: 'clock', name: 'Wall Clock', icon: '🕐', price: 40, defaultPosition: { top: 8, left: 85 }, description: 'Time management' },
    { id: 'mirror', name: 'Designer Mirror', icon: '🪞', price: 60, defaultPosition: { top: 30, left: 35 }, description: 'Room aesthetics' },
    { id: 'couch', name: 'Pet Couch', icon: '🛋️', price: 75, defaultPosition: { top: 60, left: 50 }, description: 'Comfort seating' },
    { id: 'ball-pit', name: 'Ball Pit', icon: '⚽', price: 50, defaultPosition: { top: 75, left: 10 }, description: 'Play area' },
    { id: 'artwork', name: 'Wall Art', icon: '🎨', price: 55, defaultPosition: { top: 15, left: 30 }, description: 'Pet-themed decor' }
  ];

  const buyDecoration = (decoration: typeof decorations[0]) => {
    if (!currentPet) {
      setMessage("No pet selected!");
      return;
    }

    if (currentPet.coins < decoration.price) {
      setMessage(`Not enough coins! You need ${decoration.price}🪙 but only have ${currentPet.coins}🪙`);
      return;
    }

    if (purchasedDecorations.has(decoration.id)) {
      setMessage(`You already own the ${decoration.name}!`);
      return;
    }

    // Deduct coins
    const updatedPet = { ...currentPet, coins: currentPet.coins - decoration.price };

    // Add decoration to purchased set
    setPurchasedDecorations(prev => new Set([...prev, decoration.id]));

    // Update the pet in the store
    useGameStore.setState({ currentPet: updatedPet });

    setMessage(`🏠 Purchased ${decoration.name}! Added to your pet's room.`);
  };

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
        🏠 Room Decoration Shop
      </motion.h3>

      <motion.p
        className="text-gray-300 text-center mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Buy decorations to make your pet's room more comfortable and beautiful!
      </motion.p>

      {/* Room Preview */}
      <motion.div
        ref={roomRef}
        className="relative bg-gradient-to-br from-slate-900/95 via-gray-800/90 to-zinc-900/95 backdrop-blur-xl border-2 border-slate-600/50 rounded-3xl p-6 shadow-2xl overflow-hidden"
        style={{ height: '600px' }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        {/* Modern Room Background - Dark luxury theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/80 via-gray-900/60 to-zinc-800/80 rounded-3xl"></div>

        {/* Luxury Marble Floor */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-700/90 via-slate-600/70 to-slate-500/50"></div>

        {/* Marble Floor Pattern */}
        <div className="absolute bottom-0 left-0 right-0 h-20 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.1)_0%,transparent_50%),radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.05)_0%,transparent_50%)]"></div>
        </div>

        {/* Modern Wall with accent lighting */}
        <div className="absolute top-0 left-0 right-0 bottom-20 bg-gradient-to-br from-slate-700/40 via-slate-600/30 to-slate-800/50"></div>

        {/* Wall accent lighting */}
        <div className="absolute top-4 left-4 right-4 h-1 bg-gradient-to-r from-cyan-400/30 via-blue-400/40 to-purple-400/30 rounded-full blur-sm"></div>
        <div className="absolute top-6 left-6 right-6 h-0.5 bg-gradient-to-r from-cyan-300/20 via-blue-300/30 to-purple-300/20 rounded-full"></div>

        {/* Corner accent lights */}
        <div className="absolute top-8 left-8 w-3 h-3 bg-cyan-400/60 rounded-full blur-sm animate-pulse"></div>
        <div className="absolute top-8 right-8 w-3 h-3 bg-purple-400/60 rounded-full blur-sm animate-pulse" style={{ animationDelay: '1s' }}></div>

        {/* Purchased Decorations */}
        {decorations.map((decoration) => {
          if (!purchasedDecorations.has(decoration.id)) return null;

          const position = decorationPositions[decoration.id] || decoration.defaultPosition;
          const style = {
            top: `${position.top}%`,
            left: `${position.left}%`,
            cursor: 'grab'
          };

          return (
            <motion.div
              key={`placed-${decoration.id}`}
              ref={roomRef}
              className="absolute text-3xl drop-shadow-lg z-10 select-none"
              style={style}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
              drag
              dragConstraints={roomRef}
              dragElastic={0}
              dragMomentum={false}
              onDragEnd={(event) => {
                if (!roomRef.current) return;

                const roomRect = roomRef.current.getBoundingClientRect();
                const clientX = 'clientX' in event ? event.clientX : 0;
                const clientY = 'clientY' in event ? event.clientY : 0;

                const newLeft = ((clientX - roomRect.left) / roomRect.width) * 100;
                const newTop = ((clientY - roomRect.top) / roomRect.height) * 100;

                // Constrain to room bounds
                const constrainedLeft = Math.max(5, Math.min(85, newLeft));
                const constrainedTop = Math.max(10, Math.min(85, newTop));

                setDecorationPositions(prev => ({
                  ...prev,
                  [decoration.id]: { top: constrainedTop, left: constrainedLeft }
                }));
              }}
              whileDrag={{ scale: 1.1, zIndex: 50 }}
            >
              {decoration.icon}
            </motion.div>
          );
        })}

        {/* Pet Placeholder */}
        <motion.div
          className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-4xl z-20"
          animate={{
            scale: [1, 1.05, 1],
            y: [0, -2, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {currentPet?.typeData.emoji || '🐱'}
        </motion.div>

        <div className="relative z-30 text-center">
          <h4 className="text-lg font-bold text-purple-100 mb-2">Your Pet's Room</h4>
          <p className="text-purple-200/80 text-sm">Purchase decorations below to customize!</p>
        </div>
      </motion.div>

      {/* Decoration Items */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {decorations.map((decoration, index) => {
          const isPurchased = purchasedDecorations.has(decoration.id);

          return (
            <motion.div
              key={decoration.id}
              className={`relative bg-gradient-to-br from-purple-50/10 via-pink-50/5 to-rose-50/10 backdrop-blur-lg border-2 rounded-2xl p-4 shadow-xl transition-all duration-300 overflow-hidden ${
                isPurchased
                  ? 'border-green-400/50 bg-green-50/10'
                  : 'border-purple-200/30 hover:border-purple-400/50'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.6 }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              {isPurchased && (
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  ✓ Owned
                </div>
              )}

              <div className="text-center">
                <div className="text-4xl mb-2 drop-shadow-lg">{decoration.icon}</div>
                <h4 className="text-sm font-bold text-purple-100 mb-1">{decoration.name}</h4>
                <p className="text-purple-200/70 text-xs mb-3 leading-tight">{decoration.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 bg-purple-500/20 px-2 py-1 rounded-full border border-purple-400/30">
                    <span className="text-yellow-300 font-bold text-sm">{decoration.price}</span>
                    <span className="text-yellow-400 text-sm">🪙</span>
                  </div>

                  <motion.button
                    className={`px-4 py-2 rounded-xl font-bold text-xs shadow-lg transition-all duration-300 ${
                      isPurchased
                        ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-purple-500/40'
                    }`}
                    whileHover={!isPurchased ? { scale: 1.05 } : {}}
                    whileTap={!isPurchased ? { scale: 0.95 } : {}}
                    onClick={() => !isPurchased && buyDecoration(decoration)}
                    disabled={isPurchased}
                  >
                    {isPurchased ? 'Owned' : '🛒 Buy'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};

export default ShopTab;
