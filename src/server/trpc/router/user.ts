import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z, ZodError } from 'zod';
import { profileSchema } from '~/models/user';
import { protectedProcedure, router } from '../trpc';
import { comparePassword, hashPassword } from '~/server/utils/auth/password';

export const userRouter = router({
  settings: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findUnique({ where: { id: ctx.session.user.id } });
  }),
  updateAccount: protectedProcedure
    .input(z.object({ ...profileSchema, currentPassword: z.string().optional() }).partial())
    .mutation(async ({ ctx, input }) => {
      const updateData: Omit<typeof input, 'currentPassword'> = {
        name: input.name,
        email: input.email,
      };

      // Check if the user is trying to change their password
      if (input.password && input.currentPassword) {
        const currentUser = await ctx.prisma.user.findUnique({
          where: { id: ctx.session.user.id },
          select: { password: true },
        });

        // Ensure the current password is correct
        const match = await comparePassword(input.currentPassword, currentUser?.password ?? '');

        if (!match) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Current password is incorrect',
            cause: new ZodError([
              {
                path: ['currentPassword'],
                message: 'Current password is incorrect',
                code: 'custom',
              },
            ]),
          });
        }

        updateData.password = await hashPassword(input.password);
      }

      await ctx.prisma.user
        .update({
          where: { id: ctx.session.user.id },
          data: updateData,
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
