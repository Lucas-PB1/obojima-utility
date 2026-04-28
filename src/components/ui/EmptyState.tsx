import React from 'react';
import { motion } from 'motion/react';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  className?: string;
}

export function EmptyState({ icon, title, description, className = '' }: EmptyStateProps) {
  return (
    <motion.div
      className={`text-center py-16 ${className}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 28 }}
    >
      <motion.div
        className="text-7xl mb-6"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        {icon}
      </motion.div>
      <h3 className="text-2xl font-black text-totoro-gray mb-3 tracking-tight uppercase">
        {title}
      </h3>
      <p className="text-totoro-blue/50 font-bold max-w-sm mx-auto leading-relaxed text-sm">
        {description}
      </p>
    </motion.div>
  );
}
