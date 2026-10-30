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

export const CatalogSkeleton: React.FC = () => (
  <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
    <div className="flex justify-between items-end">
      <div className="space-y-2">
        <ShimmerEffect className="h-4 w-32 rounded" />
        <ShimmerEffect className="h-8 w-64 rounded-xl" />
        <ShimmerEffect className="h-4 w-96 rounded" />
      </div>
      <ShimmerEffect className="h-10 w-80 rounded-2xl" />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="glass-card rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-6 space-y-4">
          <ShimmerEffect className="w-full aspect-[200/120] rounded-2xl" />
          <div className="space-y-2">
            <ShimmerEffect className="h-4 w-32 rounded" />
            <ShimmerEffect className="h-6 w-44 rounded-lg" />
            <ShimmerEffect className="h-10 w-full rounded-md" />
          </div>
          <div className="pt-4 border-t border-neutral-200/50 dark:border-neutral-800/50 flex justify-between items-center">
            <ShimmerEffect className="h-6 w-28 rounded-lg" />
            <ShimmerEffect className="h-9 w-32 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const CalculatorSkeleton: React.FC = () => (
  <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="glass-panel rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
      <div className="lg:col-span-7 space-y-6">
        <ShimmerEffect className="h-6 w-44 rounded" />
        <div className="grid grid-cols-4 gap-2.5">
          {[1, 2, 3, 4].map((i) => (
            <ShimmerEffect key={i} className="h-12 rounded-2xl" />
          ))}
        </div>
        <ShimmerEffect className="h-6 w-36 rounded" />
        <div className="grid grid-cols-3 gap-2.5">
          {[1, 2, 3].map((i) => (
            <ShimmerEffect key={i} className="h-12 rounded-2xl" />
          ))}
        </div>
        <ShimmerEffect className="h-6 w-32 rounded" />
        <div className="grid grid-cols-2 gap-2.5">
          {[1, 2].map((i) => (
            <ShimmerEffect key={i} className="h-12 rounded-2xl" />
          ))}
        </div>
      </div>
      <div className="lg:col-span-5 rounded-3xl p-8 space-y-6 bg-neutral-200/40 dark:bg-neutral-800/40">
        <ShimmerEffect className="h-5 w-40 rounded" />
        <ShimmerEffect className="w-full aspect-[200/120] rounded-2xl" />
        <ShimmerEffect className="h-12 w-48 rounded-xl" />
        <ShimmerEffect className="h-14 w-full rounded-full" />
      </div>
    </div>
  </div>
);

export const PlotsMapSkeleton: React.FC = () => (
  <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="glass-panel rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 rounded-2xl min-h-[380px] bg-neutral-200/50 dark:bg-neutral-800/50 relative overflow-hidden">
        <ShimmerEffect className="w-full h-full rounded-2xl" />
      </div>
      <div className="lg:col-span-5 space-y-6">
        <ShimmerEffect className="h-6 w-32 rounded" />
        <ShimmerEffect className="h-8 w-64 rounded-xl" />
        <ShimmerEffect className="h-24 w-full rounded-2xl" />
        <ShimmerEffect className="h-32 w-full rounded-2xl" />
      </div>
    </div>
  </div>
);
