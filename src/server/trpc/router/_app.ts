import { router } from '../trpc';
import { authRouter } from './auth';
import { searchRouter } from './search';
import { watchlistRouter } from './watchlist';
import { inviteRouter } from './invite';

export const appRouter = router({
  auth: authRouter,
  watchlist: watchlistRouter,
  invite: inviteRouter,
  search: searchRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
