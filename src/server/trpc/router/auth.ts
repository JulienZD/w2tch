import { signupSchema } from '~/models/auth/signup';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { hashPassword } from '~/server/utils/auth/password';
import * as Sentry from '@sentry/nextjs';

export const authRouter = router({
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),
  getSecretMessage: protectedProcedure.query(() => {
    return 'you can now see this secret message!';
  }),
  signup: publicProcedure.input(signupSchema).mutation(async ({ ctx, input }) => {
    const { name, email, password } = input;
    const hash = await hashPassword(password);

    try {
      await ctx.prisma.user.create({
        data: {
          name,
          email,
          password: hash,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Email already exists',
        });
      }

      Sentry.captureException(error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Something went wrong',
      });
    }

    return true;
  }),
});
