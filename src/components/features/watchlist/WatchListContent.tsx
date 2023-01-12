import { Menu, Transition } from '@headlessui/react';
import { EllipsisVerticalIcon, EyeIcon, EyeSlashIcon, TrashIcon } from '@heroicons/react/20/solid';
import type { Watchable as PrismaWatchable, WatchablesOnWatchlists } from '@prisma/client';
import { forwardRef, Fragment, memo, useCallback } from 'react';
import { Rating } from '~/components/ui/Rating';
import { SeenBadge } from '~/components/ui/SeenBadge';
import { useBreakpoint } from '~/hooks/useTWBreakpoint';
import { trpc } from '~/utils/trpc';

type WatchlistItem = Omit<PrismaWatchable, 'rating' | 'source'> &
  Pick<WatchablesOnWatchlists, 'seenOn'> & {
    rating?: number;
  };

interface WatchlistContentProps {
  items: WatchlistItem[];
  watchlistId: string;
}

// ref is required by headlessui when rending as a menu item
const ToggleMarkAsSeen = forwardRef<
  HTMLButtonElement,
  {
    className?: string;
    onClick: () => void;
    showText?: boolean;
    toggled: boolean;
  }
>(({ onClick, toggled, showText, className }, ref) => {
  const iconClassName = 'h-5 w-5';
  const tooltipText = toggled ? 'Mark as not seen' : 'Mark as seen';
  return (
    <button
      ref={ref}
      onClick={onClick}
      data-tip={tooltipText}
      className={`${className ?? ''} ${showText ? '' : 'tooltip tooltip-top'}`}
    >
      {toggled ? (
        <>
          <EyeSlashIcon data-tip="Mark as not seen" className={iconClassName} />
          {showText && <span>Mark as not seen</span>}
        </>
      ) : (
        <>
          <EyeIcon data-tip="Mark as seen" className={iconClassName} />
          {showText && <span>Mark as seen</span>}
        </>
      )}
    </button>
  );
});
ToggleMarkAsSeen.displayName = 'ToggleMarkAsSeen';

// Component is memoized to prevent re-rendering every item when one item is updated
const WatchlistContextMenu: React.FC<{ item: WatchlistItem & Pick<WatchablesOnWatchlists, 'seenOn' | 'watchlistId'> }> =
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
        <Menu>
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
            <Menu.Items className="absolute right-0 z-50 mt-2 w-44 origin-top-right divide-y divide-base-200 rounded-md bg-base-100 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <Menu.Item>
                {({ active }) => (
                  <ToggleMarkAsSeen
                    onClick={handleChangeSeen}
                    toggled={!!item.seenOn}
                    showText
                    className={`${
                      active ? 'bg-base-200 text-base-content' : 'text-base-content'
                    } group flex w-full items-center gap-x-2 rounded-md px-2 py-2 text-sm md:hidden`}
                  />
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
  const editItem = trpc.watchlist.editItem.useMutation();
  const trpcUtil = trpc.useContext();

  const { isMd } = useBreakpoint('md');
  const toggleMarkAsSeen = useCallback(
    async ({ id, newSeenOn }: { id: string; newSeenOn: Date | null }) => {
      await editItem.mutateAsync(
        {
          id,
          watchlistId,
          seenOn: newSeenOn,
        },
        {
          onSuccess: () => {
            const oldData = trpcUtil.watchlist.byId.getData({ id: watchlistId });
            if (!oldData) return;

            trpcUtil.watchlist.byId.setData(
              {
                id: watchlistId,
              },
              {
                ...oldData,
                watchables: oldData.watchables.map((watchable) => {
                  if (watchable.id === id) {
                    return {
                      ...watchable,
                      seenOn: newSeenOn,
                    };
                  }
                  return watchable;
                }),
              }
            );
          },
        }
      );
    },
    [editItem, trpcUtil.watchlist.byId, watchlistId]
  );

  return (
    <table className="table-transparent table">
      <tbody>
        {items.map((item, index) => (
          <Fragment key={item.id}>
            <tr className="table-row hover:bg-base-100/50">
              <td>{index + 1}</td>
              {isMd ? (
                <>
                  <td>{item.name}</td>
                  <td>{item.rating !== undefined && <Rating score={item.rating} />}</td>
                  <td>
                    <div className="inline-flex h-auto w-full items-center justify-between gap-x-4">
                      <SeenBadge seenOn={item.seenOn} />
                    </div>
                  </td>
                  <td>
                    <ToggleMarkAsSeen
                      className="btn-ghost rounded-full p-1"
                      toggled={!!item.seenOn}
                      onClick={() => toggleMarkAsSeen({ id: item.id, newSeenOn: item.seenOn ? null : new Date() })}
                    />
                  </td>
                </>
              ) : (
                <td className="w-full">
                  <div className="inline-flex w-full items-center justify-between gap-x-4">
                    <div className="inline-flex flex-col">
                      <span className="whitespace-pre-wrap">{item.name}</span>
                      {item.rating !== undefined && <Rating score={item.rating} />}
                    </div>
                    <SeenBadge seenOn={item.seenOn} />
                  </div>
                </td>
              )}
              <td className="not-prose">
                <WatchlistContextMenu item={{ ...item, watchlistId }} />
              </td>
            </tr>
          </Fragment>
        ))}
      </tbody>
    </table>
  );
};
