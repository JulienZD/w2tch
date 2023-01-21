import type { NextPage } from 'next';
import { SEO } from '~/components/common/SEO';
import { CreateWatchlist } from '~/components/features/watchlist/CreateWatchlist';

const NewWatchlist: NextPage = () => {
  return (
    <>
      <SEO title="Create a new watchlist" />

      <div className="prose">
        <h1>Create a new watchlist</h1>
        <CreateWatchlist />
      </div>
    </>
  );
};

export default NewWatchlist;
