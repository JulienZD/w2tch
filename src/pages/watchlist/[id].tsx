import NiceModal from '@ebay/nice-modal-react';
import { UserPlusIcon } from '@heroicons/react/24/solid';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { SEO } from '~/components/common/SEO';
import { AddItem } from '~/components/features/watchlist/AddItem';
import { InviteModal } from '~/components/features/watchlist/invite/InviteModal';
import { WatchlistContent } from '~/components/features/watchlist/WatchListContent';
import { WatchlistContentFilters } from '~/components/features/watchlist/WatchlistContentFilters';
import { WatchlistOverflowMenu } from '~/components/features/watchlist/WatchlistOverflowMenu';
import { Pluralize } from '~/components/util/Pluralize';
import { useFilterWatchlistEntries } from '~/hooks/watchlist/useFilterWatchlistEntries';
import { api, isApiErrorWithCode, type RouterOutputs } from '~/utils/api';
import { getWatchlistById } from '~/server/data/watchlist/queries';
import { optionalSeo } from '~/utils/seo';
import pluralize from 'pluralize';
import { env } from '~/env/client.mjs';
import { toPossessive } from '~/utils/language';
import { isLoadedViaClientNavigation } from '~/utils/ssr';

const Watchlist: NextPage = () => {
  const router = useRouter();
  const watchlistId = router.query.id as string | undefined;

  const { data: watchlist } = api.watchlist.byId.useQuery(
    { id: watchlistId as string },
    {
      enabled: !!watchlistId,
      onError: (error) => {
        if (isApiErrorWithCode(error, 'UNAUTHORIZED', 'NOT_FOUND')) {
          router.push('/404').catch(() => undefined);
        }
      },
    }
  );
  const { filteredWatchables, ...filters } = useFilterWatchlistEntries(watchlist?.watchables ?? []);

  const openInviteModal = async () => {
    await NiceModal.show(InviteModal, {
      watchlistId,
    });
  };

  if (!watchlist) {
    return (
      <>
        <SEO title="Watchlist" />
        <div className="prose max-w-full">
          <h1 className="mt-0 pt-0">Watchlist</h1>
          <div>
            <span>Loading...</span>
          </div>
        </div>
      </>
    );
  }

  const readOnly = watchlist.isReadOnly;

  return (
    <>
      <SEO {...getWatchlistSeo(watchlist)} />
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
          watchlistId={watchlist.id}
        />
      </div>
    </>
  );
};

export default Watchlist;

Watchlist.getInitialProps = async (ctx) => {
  const watchlistId = ctx.query?.id as string | undefined;

  if (!watchlistId) {
    return {};
  }

  if (isLoadedViaClientNavigation(ctx.req)) {
    return {};
  }

  // From here on out it's server side only

  // We have to defer this import to prevent loading server-code on the client
  const { prisma } = await import('~/server/db/client');

  const watchlist = await getWatchlistById({ id: watchlistId, allowVisibleToPublic: true }, prisma);

  if (!watchlist) {
    return {};
  }

  return {
    watchlistId,
    ...optionalSeo(watchlist?.isVisibleToPublic, getWatchlistSeo(watchlist)),
  };
};

type Watchlist = RouterOutputs['watchlist']['byId'];

const getWatchlistSeo = (watchlist: Pick<Watchlist, 'name' | 'owner' | 'watchableCount'>) => ({
  title: watchlist.name,
  description: `
    See ${toPossessive(watchlist.owner?.name ?? 'unknown')} watchlist on ${env.NEXT_PUBLIC_APP_NAME} | ${
    watchlist.watchableCount
  } ${pluralize('title', watchlist.watchableCount)}
  `.trim(),
});
