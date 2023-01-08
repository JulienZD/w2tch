import type { NextPage } from 'next';
import { SEO } from '~/components/common/SEO';
import { CreateWatchlist } from '~/components/features/watchlist/CreateWatchlist';

const New: NextPage = () => {
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

export default New;

// export const getServerSideProps: GetServerSideProps = async (nextCtx) => {
//   const { ctx, session } = await createSSGHelper(nextCtx);

//   if (!session) {
//     await createTemporaryAccount(ctx.prisma);
//   }

//   return {
//     props: {},
//   };
// };
