import NiceModal from '@ebay/nice-modal-react';
import { UserPlusIcon } from '@heroicons/react/24/solid';
import { TRPCError } from '@trpc/server';
import type { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next';
import pluralize from 'pluralize';
import { AddItem } from '~/components/features/watchlist/AddItem';
import { InviteModal } from '~/components/features/watchlist/invite/InviteModal';
import { WatchlistContent } from '~/components/features/watchlist/WatchListContent';
import { WatchlistContentFilters } from '~/components/features/watchlist/WatchlistContentFilters';
import { WatchlistOverflowMenu } from '~/components/features/watchlist/WatchlistOverflowMenu';
import { Pluralize } from '~/components/util/Pluralize';
import { env } from '~/env/server.mjs';
import { useFilterWatchlistEntries } from '~/hooks/watchlist/useFilterWatchlistEntries';
import type { WithSEOProps } from '~/types/ssr';
import { api } from '~/utils/api';
import { toPossessive } from '~/utils/language';
import { optionalSeo } from '~/utils/seo';
import { createSSGHelper } from '~/utils/ssg';

const WatchList: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ watchlistId }) => {
  const { data: watchlist } = api.watchlist.byId.useQuery({ id: watchlistId });
  const { filteredWatchables, ...filters } = useFilterWatchlistEntries(watchlist?.watchables ?? []);

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
          List by <span className="font-semibold">{watchlist.owner?.name}</span>
        </span>
        <div className="my-0 flex flex-row items-center gap-y-0 gap-x-2 max-md:w-full max-md:justify-between md:before:-ml-2 md:before:content-['•']">
          <div className="flex items-center gap-x-2">
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
          {!readOnly && watchlist.isOwner && <WatchlistOverflowMenu watchlistId={watchlist.id} />}
        </div>
      </div>

      {!readOnly && <AddItem watchlistId={watchlist.id} />}

      {!!watchlist.watchables.length && <WatchlistContentFilters filters={filters} />}

      <div className="divider mt-0.5" />

      <WatchlistContent
        readOnly={readOnly}
        isOwner={watchlist.isOwner}
        items={filteredWatchables}
        watchlistId={watchlistId}
      />
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
      trpcState: ssg.dehydrate(),
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
