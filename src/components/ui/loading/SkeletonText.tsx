import React from 'react';

const variants = {
  dark: 'bg-slate-700',
  light: 'bg-slate-500',
} as const;

type SkeletonTextProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: keyof typeof variants;
};

export const SkeletonText: React.FC<SkeletonTextProps> = ({ variant = 'light', className = '', ...props }) => {
  return <div className={`animate-pulse rounded-2xl ${variants[variant]} ${className}`} {...props} />;
};
