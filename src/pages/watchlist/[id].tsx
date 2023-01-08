import type { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next';
import { Pluralize } from '~/components/util/Pluralize';
import { trpc } from '~/utils/trpc';
import { PlusIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';
import { AddItem } from '~/components/features/watchlist/AddItem';
import { WatchlistContent } from '~/components/features/watchlist/WatchListContent';

const WatchList: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ watchlistId }) => {
  const { data: watchlist } = trpc.watchlist.byId.useQuery({ id: watchlistId });

  const [showAddMovieForm, setShowAddMovieForm] = useState(false);
  const [randomizerMode, setRandomizerMode] = useState(false);

  const openInviteModal = () => undefined;

  if (!watchlist) {
    return null;
  }

  const unseenMovies = watchlist.movies.filter((m) => !m.seenOn);

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
            <Pluralize count={watchlist.movieCount} word="movie" />
          </span>
        </div>
      </div>
      <div className={`${!randomizerMode ? 'justify-between' : 'justify-end'} ${showAddMovieForm ? '' : 'flex'}`}>
        {!randomizerMode ? (
          <>
            <button className="btn-primary btn-sm btn" onClick={() => setShowAddMovieForm((old) => !old)}>
              {showAddMovieForm ? 'Hide search' : 'Add movie'}
            </button>
            <AddItem watchlistId={watchlist.id} showForm={showAddMovieForm} />
          </>
        ) : (
          <button
            className="btn-secondary btn-sm btn"
            onClick={() => setRandomizerMode((old) => !old)}
            disabled={!unseenMovies.length}
            title={!unseenMovies.length ? 'There are no unseen movies!' : ''}
          >
            {!randomizerMode ? 'Pick a random movie' : 'Back'}
          </button>
        )}
      </div>

      <div className="divider" />

      <WatchlistContent items={watchlist.movies} watchlistId={watchlistId} />
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
