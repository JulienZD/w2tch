import { z } from 'zod';
import { searchTMDB } from '~/server/data/tmdb';
import { protectedProcedure, router } from '../trpc';

export const searchRouter = router({
  tmdb: router({
    search: protectedProcedure.input(z.object({ query: z.string().min(2) })).query(async ({ input }) => {
      const { movies, tvShows } = await searchTMDB(input.query);

      const result = [...movies, ...tvShows].sort((a, b) => b.popularity - a.popularity);

      const lowercaseQuery = input.query.toLowerCase();
      // place exact matches at the top
      const exactMatches = result.filter((item) => item.name.toLowerCase().startsWith(lowercaseQuery));
      const nonExactMatches = result.filter((item) => !item.name.toLowerCase().startsWith(lowercaseQuery));

      return [...exactMatches, ...nonExactMatches];
    }),
  }),
});
