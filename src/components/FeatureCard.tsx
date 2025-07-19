'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  href: string;
  gradient: string;
  delay?: number;
}

export function FeatureCard({ icon, title, description, href, gradient, delay = 0 }: FeatureCardProps) {
  return (
    <motion.div
      className="group relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -5 }}
    >
      <motion.div
        className="glass-morphism-dark p-6 rounded-xl cursor-pointer h-full"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => window.location.href = href}
      >
        {/* Gradient Border Effect */}
        <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
        
        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className={`text-4xl bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
              {icon}
            </div>
            <motion.div
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={{ x: -10 }}
              animate={{ x: 0 }}
            >
              <ArrowRight className="w-5 h-5 text-primary-400" />
            </motion.div>
          </div>
          
          <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-primary-300 transition-colors duration-300">
            {title}
          </h3>
          
          <p className="text-gray-300 text-sm leading-relaxed">
            {description}
          </p>
          
          {/* Hover Glow Effect */}
          <motion.div
            className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-xl`}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
} 