import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { profileSchema } from '~/models/user';
import { protectedProcedure, router } from '../trpc';

export const userRouter = router({
  settings: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findUnique({ where: { id: ctx.session.user.id } });
  }),
  updateAccount: protectedProcedure.input(z.object(profileSchema).partial()).mutation(async ({ ctx, input }) => {
    await ctx.prisma.user
      .update({
        where: { id: ctx.session.user.id },
        data: {
          name: input.name,
          email: input.email,
        },
      })
      .catch((error) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Email already exists',
          });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Something went wrong',
        });
      });
  }),
  deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.user.delete({ where: { id: ctx.session.user.id } });
  }),
});
