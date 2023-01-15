import type { WatchableType as DBWatchableType } from '@prisma/client';

const readableType = {
  MOVIE: 'Movie',
  TV_SHOW: 'TV Show',
} satisfies Record<DBWatchableType, string>;

interface WatchableTypeProps {
  type: DBWatchableType;
}

export const WatchableType: React.FC<WatchableTypeProps> = ({ type }) => {
  return <span className="badge-ghost badge">{readableType[type]}</span>;
};
