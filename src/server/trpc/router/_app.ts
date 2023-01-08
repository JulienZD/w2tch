import { router } from '../trpc';
import { authRouter } from './auth';
import { exampleRouter } from './example';
import { watchlistRouter } from './watchlist';

export const appRouter = router({
  example: exampleRouter,
  auth: authRouter,
  watchlist: watchlistRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
