import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { zInvite, createInviteUrl } from '~/models/watchlistInvite';
import { getWatchlistInviteByCode, getWatchlistInviteById } from '~/server/data/watchlist/invite/queries';
import { getWatchlistById } from '~/server/data/watchlist/queries';
import { protectedProcedure, publicProcedure, router } from '../trpc';

export const inviteRouter = router({
  byCode: publicProcedure.input(z.object({ code: z.string() })).query(async ({ ctx, input }) => {
    const invite = await getWatchlistInviteByCode(input.code, ctx.prisma);
    if (!invite) return null;

    return {
      watchlistName: invite.watchlist.name,
      invitee: invite.watchlist.owner.name as string, // This is never not set
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
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error happened' });
        }
      }
    }),
});
