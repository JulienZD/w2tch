import { Menu, Transition } from '@headlessui/react';
import { EllipsisVerticalIcon, EyeSlashIcon, EyeIcon, TrashIcon } from '@heroicons/react/20/solid';
import type { WatchablesOnWatchlists } from '@prisma/client';
import { memo, useCallback, Fragment } from 'react';
import { type RouterOutputs, trpc } from '~/utils/trpc';

type WatchlistItem = NonNullable<RouterOutputs['watchlist']['byId']>['watchables'][number];

// Component is memoized to prevent re-rendering every item when one item is updated
export const WatchlistContextMenu: React.FC<{ item: WatchlistItem & Pick<WatchablesOnWatchlists, 'watchlistId'> }> =
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
              watchables: previousData.watchables.map((watchable) => {
                if (watchable.id === newItem.id) {
                  return {
                    ...watchable,
                    seenOn: newItem.seenOn,
                  };
                }
                return watchable;
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
        <Menu as="div" className="relative">
          <Menu.Button className="btn-ghost rounded-full p-0.5">
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
            <Menu.Items className="absolute right-0 z-50 mt-1 w-44 origin-top-right divide-y divide-base-200 rounded-md bg-base-100 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <Menu.Item>
                {({ active }) => {
                  const label = item.seenOn ? 'Mark as not seen' : 'Mark as seen';
                  const Icon = item.seenOn ? EyeSlashIcon : EyeIcon;

                  return (
                    <button
                      onClick={handleChangeSeen}
                      className={`group flex w-full items-center gap-x-2 rounded-md px-2 py-2 text-sm ${
                        active ? 'bg-base-200 text-base-content' : 'text-base-content'
                      }`}
                    >
                      <Icon data-tip={label} className="h-5 w-5" />
                      <span>{label}</span>
                    </button>
                  );
                }}
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
