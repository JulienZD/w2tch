import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createWatchlistSchema } from '~/models/watchlist';
import { findTMDBEntry } from '~/server/data/tmdb';
import { addEntryToWatchlist, zWatchListAddEntry } from '~/server/data/watchlist/mutations';
import { getWatchlistById, getWatchlistsForUser } from '~/server/data/watchlist/queries';
import { createTRPCErrorFromDatabaseError } from '~/server/utils/errors/db';
import { protectedProcedure, router } from '../trpc';

export const watchlistRouter = router({
  all: protectedProcedure.query(({ ctx }) => getWatchlistsForUser(ctx.session.user.id, ctx.prisma)),
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => getWatchlistById(input.id, ctx.session.user.id, ctx.prisma)),
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
  addItem: protectedProcedure
    .input(zWatchListAddEntry.extend({ watchlistId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const watchlist = await getWatchlistById(input.watchlistId, ctx.session.user.id, ctx.prisma);

      if (!watchlist) throw new TRPCError({ code: 'NOT_FOUND', message: 'Watchlist not found' });

      const tmdbEntry = await findTMDBEntry(input.id, input.type);

      if (!tmdbEntry) throw new TRPCError({ code: 'NOT_FOUND', message: 'Entry not found' });

      try {
        await addEntryToWatchlist(input.watchlistId, { ...tmdbEntry, type: input.type }, ctx.prisma);
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          throw createTRPCErrorFromDatabaseError(error);
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error happened' });
      }
    }),
  editItem: protectedProcedure
    .input(z.object({ id: z.string(), watchlistId: z.string(), seenOn: z.date().or(z.null()) }))
    .mutation(async ({ input, ctx }) => {
      const watchlist = await getWatchlistById(input.watchlistId, ctx.session.user.id, ctx.prisma);
      if (!watchlist) throw new TRPCError({ code: 'NOT_FOUND', message: 'Watchlist not found' });

      await ctx.prisma.watchablesOnWatchlists.update({
        where: {
          watchableId_watchlistId: {
            watchableId: input.id,
            watchlistId: input.watchlistId,
          },
        },
        data: {
          seenOn: input.seenOn,
        },
      });
    }),
  removeItem: protectedProcedure
    .input(z.object({ id: z.string(), watchlistId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const watchlist = await getWatchlistById(input.watchlistId, ctx.session.user.id, ctx.prisma);
      if (!watchlist) throw new TRPCError({ code: 'NOT_FOUND', message: 'Watchlist not found' });

      await ctx.prisma.watchablesOnWatchlists.delete({
        where: {
          watchableId_watchlistId: {
            watchableId: input.id,
            watchlistId: input.watchlistId,
          },
        },
      });
    }),
});
