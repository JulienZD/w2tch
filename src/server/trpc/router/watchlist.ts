import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createWatchlistSchema, editWatchlistSchema } from '~/models/watchlist';
import { createInviteUrl } from '~/models/watchlistInvite';
import { findTMDBEntry } from '~/server/data/tmdb';
import { getWatchlistInvitesById } from '~/server/data/watchlist/invite/queries';
import { addEntryToWatchlist, zWatchListAddEntry } from '~/server/data/watchlist/mutations';
import { getWatchlistById, getWatchlistsForUser } from '~/server/data/watchlist/queries';
import { createTRPCErrorFromDatabaseError } from '~/server/utils/errors/db';
import { protectedProcedure, publicProcedure, router } from '../trpc';
import * as Sentry from '@sentry/nextjs';

export const watchlistRouter = router({
  all: protectedProcedure.query(({ ctx }) => getWatchlistsForUser(ctx.session.user.id, ctx.prisma)),
  byId: publicProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const user = ctx.session?.user;

    const watchlist = await getWatchlistById(
      { id: input.id, userId: ctx.session?.user?.id, allowVisibleToPublic: true },
      ctx.prisma
    );

    if (!watchlist) {
      if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' });
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Watchlist not found' });
    }

    const userIsMemberOfWatchlist =
      watchlist.ownerId === user?.id || watchlist.watchers.some(({ watcherId }) => watcherId === user?.id);

    // Allow public watchlists to be viewed by anyone
    if (watchlist?.isVisibleToPublic) {
      return {
        ...watchlist,
        isReadOnly: !userIsMemberOfWatchlist,
      };
    }

    // Otherwise, you have to be logged in and be a member of the watchlist
    if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' });
    if (!userIsMemberOfWatchlist) throw new TRPCError({ code: 'NOT_FOUND', message: 'Watchlist not found' });

    return {
      ...watchlist,
      isReadOnly: false,
    };
  }),
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
  edit: protectedProcedure
    .input(z.object({ id: z.string(), ...editWatchlistSchema }))
    .mutation(async ({ input, ctx }) => {
      const watchlist = await getWatchlistById(
        { id: input.id, userId: ctx.session.user.id, ownerOnly: true },
        ctx.prisma
      );

      if (!watchlist) throw new TRPCError({ code: 'NOT_FOUND', message: 'Watchlist not found' });

      await ctx.prisma.watchlist.update({
        where: { id: input.id },
        data: {
          name: input.name,
          isVisibleToPublic: input.isVisibleToPublic,
        },
      });
    }),
  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ input, ctx }) => {
    const watchlist = await getWatchlistById(
      { id: input.id, userId: ctx.session.user.id, ownerOnly: true },
      ctx.prisma
    );

    if (!watchlist) throw new TRPCError({ code: 'NOT_FOUND', message: 'Watchlist not found' });

    await ctx.prisma.watchlist.delete({ where: { id: input.id } });
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
        Sentry.captureException(error);
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
  invitesById: protectedProcedure.input(z.object({ watchlistId: z.string() })).query(async ({ ctx, input }) => {
    const watchlist = await getWatchlistById(
      { id: input.watchlistId, userId: ctx.session.user.id, ownerOnly: true },
      ctx.prisma
    );
    if (!watchlist) throw new TRPCError({ code: 'NOT_FOUND', message: 'Watchlist not found' });

    const existingInvites = await getWatchlistInvitesById(input.watchlistId, ctx.prisma);
    if (!existingInvites?.length) return null;

    return existingInvites.map((invite) => ({
      maxUses: invite.maxUses,
      uses: invite.uses,
      code: invite.inviteCode,
      url: createInviteUrl(invite.inviteCode),
      validUntil: invite.validUntil,
      hasUnlimitedUsages: invite.maxUses === null,
    }));
  }),
});
