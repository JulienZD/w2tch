import type { GetServerSidePropsContext } from 'next';
import { getServerAuthSession } from '~/server/common/get-server-auth-session';
import { createContextInner } from '~/server/trpc/context';
import { createProxySSGHelpers } from '@trpc/react-query/ssg';
import { appRouter } from '~/server/trpc/router/_app';
import superjson from 'superjson';

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
