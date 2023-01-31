import { createProxySSGHelpers } from '@trpc/react-query/ssg';
import type { GetServerSidePropsContext } from 'next';
import superjson from 'superjson';
import { getServerAuthSession } from '~/server/common/get-server-auth-session';
import { createContextInner } from '~/server/trpc/context';
import { appRouter } from '~/server/trpc/router/_app';

export const createSSGHelper = async (nextCtx: GetServerSidePropsContext) => {
  const session = await getServerAuthSession(nextCtx);
  const ctx = createContextInner({ session });

  return {
    ssg: createProxySSGHelpers({
      ctx,
      router: appRouter,
      transformer: superjson,
    }),
    ctx,
    session,
  };
};
