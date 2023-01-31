import type { GetServerSidePropsContext } from 'next';
import { getServerAuthSession } from '~/server/common/get-server-auth-session';
import { createContextInner } from '~/server/trpc/context';
import { createProxySSGHelpers } from '@trpc/react-query/ssg';
import { appRouter } from '~/server/trpc/router/_app';
import superjson from 'superjson';
import type { IncomingMessage } from 'http';

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

/**
 * Whether the request is a client navigation request
 *
 * This can be used to determine whether to continue with performing operations in getServerSideProps
 */
export const isLoadedViaClientNavigation = (req: IncomingMessage) => {
  return req.url?.indexOf('/_next/data/') !== -1;
};
