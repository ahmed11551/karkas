import React from 'react';
import { motion } from 'motion/react';

const shimmerVariants = {
  initial: { x: '-100%' },
  animate: {
    x: '100%',
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: 'linear' as const,
    },
  },
};

export const ShimmerEffect: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`relative overflow-hidden bg-neutral-200/60 dark:bg-neutral-800/60 rounded-xl ${className}`}>
    <motion.div
      variants={shimmerVariants}
      initial="initial"
      animate="animate"
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent w-full h-full"
    />
  </div>
);

export const BentoStatsSkeleton: React.FC = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
    {/* KPI Strip Skeleton */}
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 grid grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-2">
          <ShimmerEffect className="h-10 w-28 rounded-xl" />
          <ShimmerEffect className="h-4 w-36 rounded-md" />
        </div>
      ))}
    </div>

    {/* Bento Cards Skeleton */}
    <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="glass-card p-7 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 space-y-4">
          <ShimmerEffect className="w-12 h-12 rounded-2xl" />
          <ShimmerEffect className="h-4 w-24 rounded-md" />
          <ShimmerEffect className="h-6 w-48 rounded-lg" />
          <ShimmerEffect className="h-16 w-full rounded-xl" />
          <div className="pt-4 border-t border-neutral-200/50 dark:border-neutral-800/50 flex justify-between">
            <ShimmerEffect className="h-3 w-28 rounded" />
            <ShimmerEffect className="h-3 w-16 rounded" />
          </div>
        </div>
      ))}
    </div>
  </div>
);
