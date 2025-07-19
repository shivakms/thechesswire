'use client';

import { motion } from 'framer-motion';

interface StatusBadgeProps {
  icon: string;
  text: string;
  isActive: boolean;
  isPulsing?: boolean;
}

export function StatusBadge({ icon, text, isActive, isPulsing = false }: StatusBadgeProps) {
  return (
    <motion.div
      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium ${
        isActive 
          ? 'bg-success-500/20 text-success-400 border border-success-500/30' 
          : 'bg-error-500/20 text-error-400 border border-error-500/30'
      }`}
      animate={isPulsing && isActive ? {
        scale: [1, 1.05, 1],
        opacity: [0.8, 1, 0.8],
      } : {}}
      transition={isPulsing ? {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      } : {}}
    >
      <span className="text-lg">{icon}</span>
      <span className="hidden sm:inline">{text}</span>
    </motion.div>
  );
} 