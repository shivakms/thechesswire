// File: /components/onboarding/AgeConfirmationModal.tsx
'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Check, X, Sparkles, Lock } from 'lucide-react';
import BambaiNarrator from './BambaiNarrator';
import { useEffect } from 'react';

interface AgeConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  voiceEnabled: boolean;
  username: string;
}

export default function AgeConfirmationModal({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  voiceEnabled,
  username 
}: AgeConfirmationModalProps) {
  
  useEffect(() => {
    if (isOpen && voiceEnabled) {
      BambaiNarrator.speak(
        'One final declaration before your journey begins. Your honesty shapes your destiny.',
        'calm'
      );
    }
  }, [isOpen, voiceEnabled]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
            onClick={onCancel}
          />

          {/* Modal - Updated with better scroll handling */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4 md:p-6"
          >
            <div className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Glow effects */}
              <div className="absolute -inset-4 bg-gradient-to-r from-[#40E0D0] via-purple-600 to-pink-600 rounded-3xl blur-2xl opacity-30 animate-pulse" />
              
              {/* Main modal - Added max-height and scroll */}
              <div className="relative bg-black/95 backdrop-blur-2xl rounded-3xl border border-white/20 p-6 md:p-10 shadow-2xl">
                {/* Animated pattern */}
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `
                      radial-gradient(circle at 20% 50%, rgba(64, 224, 208, 0.1) 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)
                    `,
                  }} />
                </div>

                {/* Header - Smaller on mobile */}
                <div className="relative z-10 text-center mb-6 md:mb-8">
                  <motion.div
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                    className="inline-block mb-4 md:mb-6"
                  >
                    <Shield 
                      className="w-16 h-16 md:w-20 md:h-20 text-[#40E0D0] mx-auto" 
                      style={{
                        filter: 'drop-shadow(0 0 30px rgba(64, 224, 208, 0.6))',
                      }}
                    />
                  </motion.div>

                  <motion.h2 
                    className="text-3xl md:text-4xl font-black mb-2 md:mb-3"
                    style={{
                      fontFamily: "'Orbitron', sans-serif",
                      background: 'linear-gradient(135deg, #40E0D0, #9333EA)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: '0 0 30px rgba(64, 224, 208, 0.3)',
                    }}
                  >
                    Welcome to TheChessWire
                  </motion.h2>
                  
                  <p className="text-base md:text-lg text-gray-300" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {username}, before your journey begins, please confirm:
                  </p>
                </div>

                {/* Confirmation items - Smaller padding on mobile */}
                <div className="relative z-10 space-y-3 md:space-y-4 mb-6 md:mb-8">
                  {[
                    {
                      icon: Shield,
                      text: 'I am 18 years or older and legally permitted to access chess content in my jurisdiction',
                      color: '#40E0D0'
                    },
                    {
                      icon: Check,
                      text: 'I accept the Terms & Conditions and Privacy Policy',
                      color: '#9333EA'
                    },
                    {
                      icon: Sparkles,
                      text: 'I understand that Bambai AI creates dynamic, emotionally-driven chess narratives',
                      color: '#EC4899'
                    },
                    {
                      icon: Lock,
                      text: 'I acknowledge that all content is generated by AI systems for entertainment and education',
                      color: '#F59E0B'
                    }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
                    >
                      <div 
                        className="p-1.5 md:p-2 rounded-lg flex-shrink-0"
                        style={{ 
                          background: `${item.color}20`,
                          border: `1px solid ${item.color}40`
                        }}
                      >
                        <item.icon 
                          className="w-4 h-4 md:w-5 md:h-5" 
                          style={{ color: item.color }}
                        />
                      </div>
                      <p 
                        className="text-gray-300 text-xs md:text-sm flex-1"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {item.text}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* Privacy notice - Smaller on mobile */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="relative z-10 p-3 md:p-4 rounded-xl bg-[#40E0D0]/10 border border-[#40E0D0]/30 mb-6 md:mb-8"
                >
                  <p 
                    className="text-xs md:text-sm text-[#40E0D0] text-center flex items-center justify-center gap-2"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    <Lock className="w-3 h-3 md:w-4 md:h-4" />
                    Your data is encrypted and your privacy is sacred to us
                  </p>
                </motion.div>

                {/* Action buttons - Always visible */}
                <div className="relative z-10 flex gap-3 md:gap-4">
                  <motion.button
                    onClick={onCancel}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 md:py-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold transition-all"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    <span className="flex items-center justify-center gap-2 text-sm md:text-base">
                      <X className="w-4 h-4 md:w-5 md:h-5" />
                      Cancel
                    </span>
                  </motion.button>

                  <motion.button
                    onClick={onConfirm}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative flex-1 py-3 md:py-4 rounded-xl overflow-hidden group"
                  >
                    {/* Gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#40E0D0] via-purple-500 to-pink-500 opacity-90 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                      animate={{ x: ['-200%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    
                    <span 
                      className="relative z-10 text-black font-bold flex items-center justify-center gap-2 text-sm md:text-base"
                      style={{ fontFamily: "'Orbitron', sans-serif" }}
                    >
                      Begin My Legacy
                      <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                    </span>
                  </motion.button>
                </div>

                {/* Legal disclaimer - Smaller text */}
                <p 
                  className="text-[10px] md:text-xs text-gray-500 text-center mt-3 md:mt-4 relative z-10"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  This confirmation is legally binding and logged for compliance purposes
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}