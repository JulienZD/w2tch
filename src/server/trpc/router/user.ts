import { protectedProcedure, router } from '../trpc';

export const userRouter = router({
  settings: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findUnique({ where: { id: ctx.session.user.id } });
  }),
});
