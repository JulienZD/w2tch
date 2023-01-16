import type { NextPage } from 'next';
import { SEO } from '~/components/common/SEO';
import { Pluralize } from '~/components/util/Pluralize';
import { useRouter } from 'next/router';
import { trpc } from '~/utils/trpc';

const Dashboard: NextPage = () => {
  const { data: watchlists } = trpc.watchlist.all.useQuery();
  const router = useRouter();

  return (
    <>
      <SEO />
      <div className="prose">
        <h1>My watchlists</h1>
        <p>All the watchlists you own or are a member of.</p>
        <a className="btn-primary btn-sm btn mb-4" href="/new">
          Create new
        </a>
        <div className="flex w-full flex-wrap gap-4">
          {!!watchlists &&
            watchlists.map((watchlist) => (
              <div
                key={watchlist.id}
                className="card-compact card glass w-full cursor-pointer md:w-64"
                onClick={() => router.push(`/watchlist/${watchlist.id}`)}
              >
                <div className="card-body">
                  <h2 className="card-title">
                    {watchlist.name}
                    {watchlist.isOwner && <div className="badge-ghost badge">owner</div>}
                  </h2>
                  <Pluralize word="member" count={watchlist.memberCount} />
                  <Pluralize word="entry" count={watchlist.watchableCount} />
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
