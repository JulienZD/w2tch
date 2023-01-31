import React from 'react';

export const WatchlistCardSkeleton: React.FC = () => (
  // ESlint is disabled because prettier kept messing up the class ordering, leading to false positives
  // eslint-disable-next-line prettier/prettier
  <div className="card-compact card glass h-36 w-full cursor-pointer md:w-64">
    <div className="card-body animate-pulse">
      <div className="card-title mt-10">
        <div className="h-4 w-24 rounded bg-slate-700" />
        <div className="badge h-4 w-12 border-slate-700 bg-slate-700" />
      </div>
      <div className="mt-4 h-2 w-16 rounded bg-slate-700" />
      <div className="h-2 w-16 rounded bg-slate-700" />
    </div>
  </div>
);
