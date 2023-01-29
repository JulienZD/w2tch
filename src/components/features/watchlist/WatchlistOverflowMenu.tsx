import NiceModal from '@ebay/nice-modal-react';
import { Menu, Transition } from '@headlessui/react';
import { EllipsisHorizontalIcon, EyeIcon, EyeSlashIcon, PencilIcon, TrashIcon } from '@heroicons/react/20/solid';
import { useRouter } from 'next/router';
import { Fragment, useCallback } from 'react';
import { ConfirmDeleteModal } from '~/components/common/modals/ConfirmDeleteModal';
import { trpc } from '~/utils/trpc';
import { EditWatchlistModal } from './EditWatchlistModal';

export const WatchlistOverflowMenu: React.FC<{ watchlistId: string }> = ({ watchlistId }) => {
  const { data: watchlist } = trpc.watchlist.byId.useQuery({ id: watchlistId });
  const trpcUtil = trpc.useContext();
  const editWatchlist = trpc.watchlist.edit.useMutation({
    onSuccess: async () => {
      return trpcUtil.watchlist.byId.invalidate({ id: watchlistId });
    },
  });

  const router = useRouter();
  const removeWatchlist = trpc.watchlist.delete.useMutation({
    onSuccess: () => {
      return router.push('/dashboard');
    },
  });

  const handleChangeVisibility = useCallback(
    (newValue: boolean) => {
      editWatchlist.mutate({
        isVisibleToPublic: newValue,
        id: watchlistId,
      });
    },
    [watchlistId, editWatchlist]
  );

  const handleEditWatchlist = useCallback(() => {
    return NiceModal.show(EditWatchlistModal, {
      watchlistId,
    });
  }, [watchlistId]);

  const handleRemoveWatchlist = useCallback(() => {
    return NiceModal.show(ConfirmDeleteModal, {
      title: 'Delete watchlist',
      message: 'Are you sure you want to delete this watchlist?',
      deleteFn: () => {
        removeWatchlist.mutate({
          id: watchlistId,
        });
      },
    });
  }, [removeWatchlist, watchlistId]);

  if (!watchlist) return null;

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="btn-ghost rounded-full p-0.5">
        <EllipsisHorizontalIcon className="h-5 w-5" aria-hidden="true" />
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
        <Menu.Items className="absolute right-0 z-[60] mt-1 w-40 origin-top-right divide-y divide-base-200 rounded-md bg-base-100 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <Menu.Item>
            {({ active }) => {
              const label = `Mark as ${watchlist.isVisibleToPublic ? 'Private' : 'Public'}`;
              const Icon = watchlist.isVisibleToPublic ? EyeSlashIcon : EyeIcon;

              return (
                <button
                  onClick={() => handleChangeVisibility(!watchlist.isVisibleToPublic)}
                  className={`group flex w-full items-center gap-x-2 rounded-md px-2 py-2 text-sm ${
                    active ? 'bg-base-200 text-base-content' : 'text-base-content'
                  }`}
                >
                  <Icon data-tip={label} className="h-5 w-5" />
                  <span className="text-left">{label}</span>
                </button>
              );
            }}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={handleEditWatchlist}
                className={`${
                  active ? 'bg-base-200 text-base-content' : 'text-base-content'
                } group flex w-full items-center gap-x-2 rounded-md border-t border-t-current px-2 py-2 text-sm`}
              >
                <>
                  <PencilIcon className="h-5 w-5" />
                  <span>Edit</span>
                </>
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={handleRemoveWatchlist}
                className={`${
                  active ? 'bg-base-200 text-base-content' : 'text-base-content'
                } group flex w-full items-center gap-x-2 rounded-md border-t border-t-current px-2 py-2 text-sm`}
              >
                <>
                  <TrashIcon className="h-5 w-5 text-error" />
                  <span>Delete</span>
                </>
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};
