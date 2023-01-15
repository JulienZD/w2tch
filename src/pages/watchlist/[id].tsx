import { PlusIcon } from '@heroicons/react/20/solid';
import type { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next';
import { AddItem } from '~/components/features/watchlist/AddItem';
import { InviteModal } from '~/components/features/watchlist/invite/InviteModal';
import { WatchlistContent } from '~/components/features/watchlist/WatchListContent';
import { Pluralize } from '~/components/util/Pluralize';
import { trpc } from '~/utils/trpc';
import NiceModal from '@ebay/nice-modal-react';
const WatchList: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ watchlistId }) => {
  const { data: watchlist } = trpc.watchlist.byId.useQuery({ id: watchlistId });

  const openInviteModal = async () => {
    await NiceModal.show(InviteModal, {
      watchlistId,
    });
  };

  if (!watchlist) {
    return null;
  }

  const unseenWatchables = watchlist.watchables.filter((m) => !m.seenOn);

  return (
    <div className="prose max-w-full">
      <h1>{watchlist.name}</h1>
      <div className="mb-4 flex items-end justify-between gap-x-4 text-sm md:items-center md:justify-start">
        <span>
          List by <span className="font-semibold">{watchlist.owner?.name}</span>
        </span>
        <div className="my-0 flex flex-col gap-y-0 md:flex-row md:items-center">
          <div className="flex items-center">
            <span className="whitespace-nowrap">
              <Pluralize count={watchlist.memberCount} word="member" />
            </span>
            {watchlist.isOwner && (
              <span data-tip="Create Invite" className="tooltip tooltip-left md:tooltip-top">
                <button
                  onClick={openInviteModal}
                  aria-label="Create invite"
                  className="btn-ghost btn-sm btn mx-0.5 px-1"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </span>
            )}
          </div>
          <span className="whitespace-nowrap">
            <Pluralize count={watchlist.watchableCount} word="entry" />
          </span>
        </div>
      </div>

      <AddItem watchlistId={watchlist.id} />

      <div className="divider" />

      <WatchlistContent items={watchlist.watchables} watchlistId={watchlistId} />
    </div>
  );
};

export default WatchList;

// eslint-disable-next-line @typescript-eslint/require-await
export const getServerSideProps: GetServerSideProps<{ watchlistId: string }> = async (ctx) => {
  const watchlistId = ctx.params?.id as string | undefined;

  if (!watchlistId) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      watchlistId,
    },
  };
};
