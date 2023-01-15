import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createWatchlistSchema } from '~/models/watchlist';
import { createInviteUrl, zInvite } from '~/models/watchlistInvite';
import { findTMDBEntry } from '~/server/data/tmdb';
import { getWatchlistInviteById } from '~/server/data/watchlist/invite/queries';
import { addEntryToWatchlist, zWatchListAddEntry } from '~/server/data/watchlist/mutations';
import { getWatchlistById, getWatchlistsForUser } from '~/server/data/watchlist/queries';
import { createTRPCErrorFromDatabaseError } from '~/server/utils/errors/db';
import { protectedProcedure, router } from '../trpc';

export const watchlistRouter = router({
  all: protectedProcedure.query(({ ctx }) => getWatchlistsForUser(ctx.session.user.id, ctx.prisma)),
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => getWatchlistById({ id: input.id, userId: ctx.session.user.id }, ctx.prisma)),
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
      const watchlist = await getWatchlistById({ id: input.watchlistId, userId: ctx.session.user.id }, ctx.prisma);

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
      const watchlist = await getWatchlistById({ id: input.watchlistId, userId: ctx.session.user.id }, ctx.prisma);
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
      const watchlist = await getWatchlistById({ id: input.watchlistId, userId: ctx.session.user.id }, ctx.prisma);
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
  inviteById: protectedProcedure.input(z.object({ watchlistId: z.string() })).query(async ({ ctx, input }) => {
    const watchlist = await getWatchlistById({ id: input.watchlistId, userId: ctx.session.user.id }, ctx.prisma);
    if (!watchlist) throw new TRPCError({ code: 'NOT_FOUND', message: 'Watchlist not found' });

    const existingInvite = await getWatchlistInviteById(input.watchlistId, ctx.prisma);
    if (!existingInvite) return null;

    return {
      url: createInviteUrl(existingInvite.inviteCode),
      remainingUses: existingInvite.remainingUses,
      validUntil: existingInvite.validUntil,
      hasUnlimitedUsages: existingInvite.remainingUses === null,
    };
  }),
  createInvite: protectedProcedure
    .input(
      zInvite
        .pick({
          expiresAfterHours: true,
          maxUsages: true,
        })
        .extend({ watchlistId: z.string() })
    )
    .mutation(async ({ input, ctx }) => {
      const watchlist = await getWatchlistById(
        { id: input.watchlistId, userId: ctx.session.user.id, ownerOnly: true },
        ctx.prisma
      );
      if (!watchlist) throw new TRPCError({ code: 'NOT_FOUND', message: 'Watchlist not found' });

      const existingInvite = await getWatchlistInviteById(input.watchlistId, ctx.prisma);
      if (existingInvite) {
        await ctx.prisma.watchlistInvite.delete({ where: { watchlistId: input.watchlistId } });
      }

      const expiresAfterMs = input.expiresAfterHours * 60 * 60 * 1000;

      const createInvite = async () => {
        return ctx.prisma.watchlistInvite.create({
          data: {
            watchlist: { connect: { id: input.watchlistId } },
            inviteCode: Math.random().toString(36).substring(2, 15),
            validUntil: new Date(Date.now() + expiresAfterMs),
            remainingUses: input.maxUsages,
          },
        });
      };

      let attempts = 0;

      while (attempts < 10) {
        try {
          const { inviteCode } = await createInvite();
          return { inviteCode: createInviteUrl(inviteCode) };
        } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
              attempts++;
              continue;
            }
          }
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error happened' });
        }
      }
    }),
});
