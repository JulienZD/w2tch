import NiceModal from '@ebay/nice-modal-react';
import { UserPlusIcon } from '@heroicons/react/24/solid';
import { TRPCError } from '@trpc/server';
import type { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next';
import pluralize from 'pluralize';
import { AddItem } from '~/components/features/watchlist/AddItem';
import { InviteModal } from '~/components/features/watchlist/invite/InviteModal';
import { WatchlistContent } from '~/components/features/watchlist/WatchListContent';
import { WatchlistContextMenu } from '~/components/features/watchlist/WatchlistContextMenu';
import { Pluralize } from '~/components/util/Pluralize';
import type { WithSEOProps } from '~/types/ssr';
import { createSSGHelper } from '~/utils/ssg';
import { trpc } from '~/utils/trpc';
import { optionalSeo } from '~/utils/seo';
import { toPossessive } from '~/utils/language';
import { env } from '~/env/server.mjs';

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

  const readOnly = watchlist.isReadOnly;

  return (
    <div className="prose max-w-full">
      <div className="flex flex-col gap-x-0">
        <span>{watchlist.isVisibleToPublic ? 'Public' : 'Private'} watchlist</span>
        <h1 className="mt-0 pt-0">{watchlist.name}</h1>
      </div>
      <div className="flex flex-col items-start justify-between gap-x-4 text-sm md:flex-row md:items-center md:justify-start">
        <span>
          List by <span className="font-semibold">{watchlist.owner?.name?.repeat(5)}</span>
        </span>
        <div className="my-0 flex flex-row items-center gap-y-0 gap-x-2 max-md:w-full max-md:justify-between">
          <div className="flex items-center">
            <div className="flex items-center">
              <span className="whitespace-nowrap">
                <Pluralize count={watchlist.memberCount} word="member" />
              </span>
              {watchlist.isOwner && (
                <span data-tip="Invite People" className="tooltip tooltip-top">
                  <button
                    onClick={openInviteModal}
                    aria-label="Invite People"
                    className="btn-ghost btn-sm btn mx-0.5 px-1"
                  >
                    <UserPlusIcon className="h-5 w-5" />
                  </button>
                </span>
              )}
            </div>
            <span className="whitespace-nowrap">
              <Pluralize count={watchlist.watchableCount} word="entry" />
            </span>
          </div>
          {!readOnly && <WatchlistContextMenu watchlistId={watchlist.id} />}
        </div>
      </div>

      {!readOnly && <AddItem watchlistId={watchlist.id} />}

      <div className="divider" />

      <WatchlistContent readOnly={readOnly} items={watchlist.watchables} watchlistId={watchlistId} />
    </div>
  );
};

export default WatchList;

export const getServerSideProps: GetServerSideProps<WithSEOProps<{ watchlistId: string }, true>> = async (ctx) => {
  const watchlistId = ctx.params?.id as string | undefined;

  if (!watchlistId) {
    return {
      notFound: true,
    };
  }

  const { ssg } = await createSSGHelper(ctx);
  const watchlist = await ssg.watchlist.byId.fetch({ id: watchlistId }).catch((err) => {
    if (err instanceof TRPCError && err.code === 'PRECONDITION_FAILED') {
      return {} as never;
    }
    return null;
  });

  if (!watchlist) {
    return {
      notFound: true,
    };
  }

  await ssg.watchlist.byId.prefetch({ id: watchlistId });

  return {
    props: {
      watchlistId,
      ...optionalSeo(watchlist.isVisibleToPublic, {
        title: watchlist.name,
        description: `
            See ${toPossessive(watchlist.owner?.name ?? 'unknown')} watchlist on ${env.NEXT_PUBLIC_APP_NAME} | ${
          watchlist.watchableCount
        } ${pluralize('title', watchlist.watchableCount)}
        `.trim(),
      }),
    },
  };
};
