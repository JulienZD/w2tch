import { createWatchlistSchema } from '~/models/watchlist';
import { getWatchlistsForUser } from '~/server/data/watchlist';
import { protectedProcedure, router } from '../trpc';

export const watchlistRouter = router({
  all: protectedProcedure.query(({ ctx }) => getWatchlistsForUser(ctx.session.user.id, ctx.prisma)),
  create: protectedProcedure.input(createWatchlistSchema).mutation(async ({ input, ctx }) => {
    const userId = ctx.session.user.id;

    const watchlist = await ctx.prisma.watchlist.create({
      data: {
        owner: { connect: { id: userId } },
        watchers: { create: { watcherId: userId } },
        name: input.name,
      },
    });

    return { id: watchlist.id };
  }),
});
