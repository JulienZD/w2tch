import { createNextApiHandler } from '@trpc/server/adapters/next';
import type { NextApiHandler } from 'next';

import { env } from '../../../env/server.mjs';
import { createContext } from '../../../server/trpc/context';
import { appRouter } from '../../../server/trpc/router/_app';
import { traceDetailedCatchAllRoute } from '~/server/utils/tracing/catch-all-routes';

const trpcApiHandler = createNextApiHandler({
  router: appRouter,
  createContext,
  onError:
    env.NODE_ENV === 'development'
      ? ({ path, error }) => {
          console.error(`❌ tRPC failed on ${path ?? ''}: ${error.message}`);
        }
      : undefined,
});

const handler: NextApiHandler = (req, res) => {
  traceDetailedCatchAllRoute({
    route: '/api/trpc/[trpc]',
    replaceSearchValue: '[trpc]',
    replaceValue: req.query.trpc as string,
  });

  return trpcApiHandler(req, res);
};

export default handler;
