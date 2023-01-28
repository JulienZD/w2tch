import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { zInvite, createInviteUrl } from '~/models/watchlistInvite';
import { getWatchlistInviteByCode } from '~/server/data/watchlist/invite/queries';
import { getWatchlistById, getWatchlistsForUser } from '~/server/data/watchlist/queries';
import { protectedProcedure, publicProcedure, router } from '../trpc';
import * as Sentry from '@sentry/nextjs';

export const inviteRouter = router({
  byCode: publicProcedure.input(z.object({ code: z.string() })).query(async ({ ctx, input }) => {
    const invite = await getWatchlistInviteByCode(input.code, ctx.prisma);
    if (!invite) return null;

    return {
      watchlistName: invite.watchlist.name,
      invitee: invite.watchlist.owner.name,
      watchlistId: invite.watchlistId,
    };
  }),
  create: protectedProcedure
    .input(
      zInvite
        .pick({
          expiresAfterHours: true,
          maxUses: true,
        })
        .extend({ watchlistId: z.string() })
    )
    .mutation(async ({ input, ctx }) => {
      const watchlist = await getWatchlistById(
        { id: input.watchlistId, userId: ctx.session.user.id, ownerOnly: true },
        ctx.prisma
      );
      if (!watchlist) throw new TRPCError({ code: 'NOT_FOUND', message: 'Watchlist not found' });

      const expiresAfterMs = input.expiresAfterHours * 60 * 60 * 1000;

      const createInvite = async () => {
        return ctx.prisma.watchlistInvite.create({
          data: {
            watchlist: { connect: { id: input.watchlistId } },
            inviteCode: Math.random().toString(36).substring(2, 15),
            validUntil: new Date(Date.now() + expiresAfterMs),
            maxUses: input.maxUses,
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
          Sentry.captureException(error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error happened' });
        }
      }
    }),
  join: protectedProcedure.input(z.object({ code: z.string() })).mutation(async ({ ctx, input }) => {
    const invite = await ctx.prisma.watchlistInvite.findFirst({ where: { inviteCode: input.code } });

    if (!invite) throw new TRPCError({ code: 'NOT_FOUND', message: 'Invite not found' });

    if (invite.validUntil && invite.validUntil < new Date()) {
      throw new TRPCError({ code: 'PRECONDITION_FAILED', message: 'Invite has expired' });
    }

    if (invite.maxUses !== null && invite.maxUses <= invite.uses) {
      throw new TRPCError({ code: 'PRECONDITION_FAILED', message: 'Invite has reached max uses' });
    }

    const usersWatchlists = await getWatchlistsForUser(ctx.session.user.id, ctx.prisma);
    if (usersWatchlists.some((w) => w.id === invite.watchlistId)) {
      throw new TRPCError({ code: 'PRECONDITION_FAILED', message: 'Already a member of this watchlist' });
    }

    await ctx.prisma.$transaction([
      ctx.prisma.watchersOnWatchlists.create({
        data: {
          watcherId: ctx.session.user.id,
          watchlistId: invite.watchlistId,
        },
      }),
      ctx.prisma.watchlistInvite.update({
        where: { inviteCode: input.code },
        data: {
          uses: {
            increment: 1,
          },
        },
      }),
    ]);

    return { watchlistId: invite.watchlistId };
  }),
});
