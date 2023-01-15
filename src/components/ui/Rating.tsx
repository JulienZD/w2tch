import { StarIcon } from '@heroicons/react/20/solid';

type RatingProps = {
  score: number;
  className?: string;
};

export const Rating: React.FC<RatingProps> = ({ score, className = '' }) => (
  <span className={`flex select-none items-center gap-x-1 ${className}`}>
    <StarIcon className="h-4 w-4 fill-yellow-500" />
    {score}
  </span>
);
