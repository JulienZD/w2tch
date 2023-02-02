type SkeletonBadgeProps = React.HTMLAttributes<HTMLDivElement>;

export const SkeletonBadge: React.FC<SkeletonBadgeProps> = ({ className = '', ...props }) => {
  const classes = `badge h-4 w-12 border-slate-700 bg-slate-700 animate-pulse ${className}`;
  return <div className={classes} {...props} />;
};
