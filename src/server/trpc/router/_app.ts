import { router } from '../trpc';
import { authRouter } from './auth';
import { exampleRouter } from './example';
import { searchRouter } from './search';
import { watchlistRouter } from './watchlist';
import { inviteRouter } from './invite';

export const appRouter = router({
  example: exampleRouter,
  auth: authRouter,
  watchlist: watchlistRouter,
  invite: inviteRouter,
  search: searchRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
