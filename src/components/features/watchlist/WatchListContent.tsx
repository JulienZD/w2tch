import { Menu, Transition } from '@headlessui/react';
import { EllipsisVerticalIcon, EyeIcon, EyeSlashIcon, TrashIcon } from '@heroicons/react/20/solid';
import type { Movie as PrismaMovie, MoviesOnWatchlists } from '@prisma/client';
import React, { Fragment, memo, useCallback } from 'react';
import { Rating } from '~/components/ui/Rating';
import { SeenBadge } from '~/components/ui/SeenBadge';
import { trpc } from '~/utils/trpc';

type WatchlistItem = Omit<PrismaMovie, 'rating' | 'source'> &
  Pick<MoviesOnWatchlists, 'seenOn'> & {
    rating?: number;
  };

interface WatchlistContentProps {
  items: WatchlistItem[];
  watchlistId: string;
}

// Component is memoized to prevent re-rendering every item when one item is updated
const WatchlistContextMenu: React.FC<{ item: WatchlistItem & Pick<MoviesOnWatchlists, 'seenOn' | 'watchlistId'> }> =
  memo(
    ({ item }) => {
      const trpcUtil = trpc.useContext();

      const editWatchlistItem = trpc.watchlist.editItem.useMutation({
        onMutate: (newItem) => {
          const previousData = trpcUtil.watchlist.byId.getData({ id: newItem.watchlistId });
          if (!previousData) return previousData;

          trpcUtil.watchlist.byId.setData(
            {
              id: newItem.watchlistId,
            },
            {
              ...previousData,
              movies: previousData.movies.map((movie) => {
                if (movie.id === newItem.id) {
                  return {
                    ...movie,
                    seenOn: newItem.seenOn,
                  };
                }
                return movie;
              }),
            }
          );
          return { previousData };
        },
        onError: (_, newItem, context) => {
          if (context?.previousData) {
            trpcUtil.watchlist.byId.setData({ id: newItem.watchlistId }, context.previousData);
          }
        },
      });

      const removeWatchlistItem = trpc.watchlist.removeItem.useMutation({
        onSuccess: async () => {
          await trpcUtil.watchlist.byId.invalidate({ id: item.watchlistId });
        },
      });

      const handleChangeSeen = useCallback(() => {
        editWatchlistItem.mutate({
          id: item.id,
          watchlistId: item.watchlistId,
          seenOn: item.seenOn ? null : new Date(),
        });
      }, [editWatchlistItem, item]);

      const handleRemoveItem = useCallback(() => {
        removeWatchlistItem.mutate({
          id: item.id,
          watchlistId: item.watchlistId,
        });
      }, [removeWatchlistItem, item]);

      return (
        <Menu>
          <Menu.Button className="p-0.5 hover:rounded hover:bg-base-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-base-100 focus-visible:ring-opacity-75">
            <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
          </Menu.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-44 origin-top-right divide-y divide-base-200 rounded-md bg-base-100 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleChangeSeen}
                    className={`${
                      active ? 'bg-base-200 text-base-content' : 'text-base-content'
                    } group flex w-full items-center gap-x-2 rounded-md px-2 py-2 text-sm`}
                  >
                    {item.seenOn ? (
                      <>
                        <EyeSlashIcon className="h-5 w-5" />
                        <span>Mark as not seen</span>
                      </>
                    ) : (
                      <>
                        <EyeIcon className="h-5 w-5" />
                        <span>Mark as seen</span>
                      </>
                    )}
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleRemoveItem}
                    className={`${
                      active ? 'bg-base-200 text-base-content' : 'text-base-content'
                    } group flex w-full items-center gap-x-2 rounded-md px-2 py-2 text-sm`}
                  >
                    <>
                      <TrashIcon className="h-5 w-5 text-error" />
                      <span>Remove</span>
                    </>
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      );
    },
    (prev, next) => prev.item.id === next.item.id && prev.item.seenOn === next.item.seenOn
  );
WatchlistContextMenu.displayName = 'WatchlistContextMenu';

export const WatchlistContent: React.FC<WatchlistContentProps> = ({ items, watchlistId }) => {
  return (
    <table className="table">
      {items.map((item, index) => (
        <Fragment key={item.id}>
          <tr className="table-row hover:bg-base-100/50">
            <td>{index + 1}</td>
            <td>{item.name}</td>
            <td>{item.rating !== undefined && <Rating score={item.rating} />}</td>
            <td>
              <div className="inline-flex h-full w-full items-center justify-end md:h-auto md:justify-between md:gap-x-4">
                <SeenBadge seenOn={item.seenOn} />
              </div>
            </td>
            <td className="not-prose">
              <WatchlistContextMenu item={{ ...item, watchlistId }} />
            </td>
          </tr>
        </Fragment>
      ))}
    </table>
  );
};
