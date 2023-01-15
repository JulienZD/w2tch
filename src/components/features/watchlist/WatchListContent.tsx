import Image from 'next/image';
import { Rating } from '~/components/ui/Rating';
import { Runtime } from '~/components/ui/Runtime';
import { WatchableType } from '~/components/ui/WatchableType';
import { type RouterOutputs } from '~/utils/trpc';
import { WatchlistContextMenu } from './WatchlistContextMenu';

type WatchlistItem = NonNullable<RouterOutputs['watchlist']['byId']>['watchables'][number];

interface WatchlistContentProps {
  items: WatchlistItem[];
  watchlistId: string;
}

export const WatchlistContent: React.FC<WatchlistContentProps> = ({ items, watchlistId }) => {
  return (
    <ul className="not-prose list-none pl-0">
      {items.map((item) => (
        <li key={item.id} className="not-prose inline-flex h-24 w-full items-center gap-x-4 text-sm">
          {item.image && (
            <Image
              src={`https://image.tmdb.org/t/p/w185${item.image}`}
              alt=""
              width={72}
              height={96}
              style={{
                width: 'auto',
                height: 'auto',
              }}
              className={`max-h-24 transition ${item.seenOn ? 'grayscale' : ''} rounded`}
            />
          )}
          <div className={`flex h-full w-full items-center justify-between gap-y-2 ${!item.image ? 'pl-[76px]' : ''} `}>
            <div className="flex h-full grow flex-col gap-y-1">
              <span className={`whitespace-pre-wrap ${item.seenOn ? 'line-through' : ''} font-medium`}>
                {item.name}
              </span>
              <WatchableType type={item.type} />
              <div className="flex items-center gap-x-2">
                {item.runtime && <Runtime minutes={item.runtime} />}
                {item.rating !== undefined && <Rating score={item.rating} />}
              </div>
            </div>
          </div>
          <WatchlistContextMenu item={{ ...item, watchlistId }} />
        </li>
      ))}
    </ul>
  );
};
