import { type GetServerSidePropsContext } from 'next';
import { getServerSession } from 'next-auth/next';

import { createAuthOptions } from '../../pages/api/auth/[...nextauth]';

/**
 * Wrapper for getServerSession https://next-auth.js.org/configuration/nextjs
 * See example usage in trpc createContext or the restricted API route
 */
export const getServerAuthSession = async (ctx: {
  req: GetServerSidePropsContext['req'];
  res: GetServerSidePropsContext['res'];
}) => {
  const authOptions = createAuthOptions(ctx.req as never, ctx.res as never);
  return await getServerSession(ctx.req, ctx.res, authOptions);
};
