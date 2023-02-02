import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { SEO } from '~/components/common/SEO';
import { WatchlistCardSkeleton } from '~/components/features/watchlist/WatchlistCardSkeleton';
import { Pluralize } from '~/components/util/Pluralize';
import { api } from '~/utils/api';

const Dashboard: NextPage = () => {
  const { data: watchlists, isLoading } = api.watchlist.all.useQuery();
  const router = useRouter();

  return (
    <>
      <SEO />
      <div className="prose">
        <h1>My watchlists</h1>
        <p>All the watchlists you own or are a member of.</p>
        <Link className="btn-primary btn-sm btn mb-4" href="/new">
          Create new
        </Link>
        <div className="not-prose flex w-full flex-wrap gap-4">
          {isLoading && new Array(4).fill(undefined).map((_, i) => <WatchlistCardSkeleton key={i} />)}
          {!!watchlists &&
            watchlists.map((watchlist) => (
              <div
                key={watchlist.id}
                // Prettier keeps messing up the class ordering, leading to false positives
                // eslint-disable-next-line prettier/prettier
                className="card-compact card glass w-full cursor-pointer pt-6 pb-2 md:w-64"
                onClick={() => router.push(`/watchlist/${watchlist.id}`)}
              >
                <div className="card-body">
                  <h2 className="card-title mt-2 inline-block truncate">{watchlist.name}</h2>
                  <div className="flex justify-between">
                    <div className="flex flex-col gap-2">
                      <Pluralize word="member" count={watchlist.memberCount} />
                      <Pluralize word="entry" count={watchlist.watchableCount} />
                    </div>
                    {watchlist.isOwner && <div className="badge-ghost badge font-medium">owner</div>}
                  </div>
                </div>
              </div>
            ))}
          {watchlists?.length === 0 && (
            <div className="w-full text-center">You don&apos;t have any watchlists yet.</div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
