import { z } from 'zod';
import { profileSchema } from '~/models/user';
import { protectedProcedure, router } from '../trpc';

export const userRouter = router({
  settings: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findUnique({ where: { id: ctx.session.user.id } });
  }),
  updateAccount: protectedProcedure.input(z.object(profileSchema)).mutation(async ({ ctx, input }) => {
    await ctx.prisma.user.update({
      where: { id: ctx.session.user.id },
      data: {
        name: input.name,
      },
    });
  }),
  deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.user.delete({ where: { id: ctx.session.user.id } });
  }),
});
