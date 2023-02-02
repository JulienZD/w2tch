import React from 'react';
import { SkeletonBadge } from '~/components/ui/loading/SkeletonBadge';
import { SkeletonText } from '~/components/ui/loading/SkeletonText';

export const WatchlistCardSkeleton: React.FC = () => (
  // ESlint is disabled because prettier kept messing up the class ordering, leading to false positives
  // eslint-disable-next-line prettier/prettier
  <div className="card-compact card glass h-36 w-full md:w-64">
    <div className="card-body animate-pulse">
      <div className="card-title mt-10">
        <SkeletonText className="h-4 w-24" variant="dark" />
        <SkeletonBadge />
      </div>
      <SkeletonText className="mt-4 h-2 w-16" variant="dark" />
      <SkeletonText className="h-2 w-16" variant="dark" />
    </div>
  </div>
);
