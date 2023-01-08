import { z } from 'zod';
import { searchTMDB } from '~/server/data/tmdb';
import { protectedProcedure, router } from '../trpc';

export const searchRouter = router({
  tmdb: router({
    search: protectedProcedure.input(z.object({ query: z.string().min(2) })).query(async ({ input }) => {
      const { movies, tvShows } = await searchTMDB(input.query);

      return [...movies, ...tvShows].sort((a, b) => b.popularity - a.popularity);
    }),
  }),
});
