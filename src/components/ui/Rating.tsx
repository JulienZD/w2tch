import { StarIcon } from '@heroicons/react/20/solid';

type RatingProps = {
  score: number;
};

export const Rating: React.FC<RatingProps> = ({ score }) => (
  <span className="flex select-none items-center gap-x-1">
    <StarIcon className="h-4 w-4 fill-yellow-500" />
    {score}
  </span>
);
