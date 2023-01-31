import Image from 'next/image';
import { Rating } from '~/components/ui/Rating';
import { Runtime } from '~/components/ui/Runtime';
import { WatchableType } from '~/components/ui/WatchableType';
import { thumbnail } from '~/utils/thumbnail';
import { type RouterOutputs } from '~/utils/api';
import { WatchlistEntryOverflowMenu } from './WatchlistEntryOverflowMenu';

type WatchlistItem = NonNullable<RouterOutputs['watchlist']['byId']>['watchables'][number];

interface WatchlistContentProps {
  items: WatchlistItem[];
  watchlistId: string;
  readOnly?: boolean;
  isOwner: boolean;
}

export const WatchlistContent: React.FC<WatchlistContentProps> = ({ items, watchlistId, readOnly, isOwner }) => {
  return (
    <ul className="not-prose list-none pl-0">
      {items.length ? (
        items.map((item) => (
          <li key={item.id} className="not-prose inline-flex h-24 w-full items-center gap-x-4 text-sm">
            {item.image && (
              <div className="relative h-24 w-16 shrink-0 md:w-[72px]">
                <Image
                  src={thumbnail(item.source, item.image, 'sm')}
                  alt=""
                  fill
                  className={`object-cover transition ${item.seenOn ? 'grayscale' : ''} rounded`}
                />
              </div>
            )}
            <div
              className={`flex h-full w-full items-center justify-between gap-y-2 ${!item.image ? 'pl-[76px]' : ''} `}
            >
              <div className="flex h-full grow flex-col gap-y-1">
                <span className={`whitespace-pre-wrap ${item.seenOn ? 'line-through' : ''} font-medium`}>
                  {item.name}
                </span>
                <WatchableType type={item.type} />
                <div className="flex items-center gap-x-2">
                  {item.rating !== undefined && <Rating className="min-w-[2.5rem]" score={item.rating} />}
                  {item.runtime !== undefined && <Runtime minutes={item.runtime} />}
                </div>
              </div>
            </div>
            {!readOnly && <WatchlistEntryOverflowMenu item={{ ...item, watchlistId }} />}
          </li>
        ))
      ) : (
        <li className="not-prose flex w-full items-center gap-x-4 text-sm">
          <span className="whitespace-pre-wrap">
            {`This watchlist is empty, ${
              isOwner ? 'use the search bar to add something!' : 'ask the owner to add something!'
            }`}
          </span>
        </li>
      )}
    </ul>
  );
};
