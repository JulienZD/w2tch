import React from 'react';
import { SkeletonBadge } from '~/components/ui/loading/SkeletonBadge';
import { SkeletonText } from '~/components/ui/loading/SkeletonText';

export const WatchlistDetailsSkeleton: React.FC = () => (
  <div className="prose max-w-full">
    <div className="flex flex-col gap-x-0">
      {/* Private Watchlist */}
      <SkeletonText className="h-3 w-32" />
      {/* Watchlist */}
      <SkeletonText className="mb-10 mt-4 h-8 w-60" />
    </div>

    <div className="flex flex-col items-start justify-between gap-x-4 text-sm max-md:gap-y-2 md:flex-row md:items-center md:justify-start">
      {/* List by Julien */}
      <SkeletonText className="h-3 w-24" />

      <div className="my-0 flex flex-row items-center gap-y-0 gap-x-2 max-md:w-full max-md:justify-between md:before:-ml-2 md:before:content-['•']">
        <div className="flex items-center gap-x-2">
          <div className="flex items-center gap-x-2">
            {/* 2 Members */}
            <SkeletonText className="h-3 w-20" />
          </div>

          {/* 18 Entries */}
          <SkeletonText className="h-3 w-16" />
        </div>
      </div>
    </div>

    {/* Search bar */}
    <div className="input-bordered input mt-6 h-12 w-full animate-pulse border-slate-700 bg-transparent py-2 pl-3 pr-10 text-sm leading-5" />

    <div className="divider mt-4" />

    <WatchlistContentSkeleton count={6} />
  </div>
);

const titleWidths = ['w-32', 'w-44', 'w-16', 'w-16', 'w-36'];

const WatchlistContentSkeleton: React.FC<{ count: number }> = ({ count }) => (
  <div className="flex flex-col gap-y-4">
    {Array.from({ length: count }, (_, i) => {
      const titleWidth = titleWidths[i % titleWidths.length] || 'w-32';

      return (
        <li key={i} className="not-prose inline-flex h-24 w-full items-center gap-x-4 text-sm">
          {/* Thumbnail */}
          <div className="relative h-24 w-16 shrink-0 animate-pulse rounded-md bg-slate-700 md:w-[72px]" />
          <div className="flex h-full w-full items-center justify-between gap-y-2">
            <div className="flex h-full grow flex-col gap-y-1">
              {/* Title */}
              <SkeletonText className={`h-3 ${titleWidth} mt-2`} />
              <SkeletonBadge className="mt-2 w-16" />
            </div>
          </div>
        </li>
      );
    })}
  </div>
);
