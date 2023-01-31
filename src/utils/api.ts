import { httpBatchLink, loggerLink } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';
import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server';
import superjson from 'superjson';
import { z } from 'zod';

import { type AppRouter } from '../server/trpc/router/_app';

const publicUrl = process.env.NEXT_PUBLIC_URL ?? process.env.VERCEL_URL;

export const getBaseUrl = () => {
  if (typeof window !== 'undefined') return ''; // browser should use relative url
  if (publicUrl) return `https://${publicUrl}`; // SSR should use public url
  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export const api = createTRPCNext<AppRouter>({
  config({ ctx }) {
    // Enable react-query mutations and queries locally when there's no internet connection
    const networkMode = process.env.NODE_ENV === 'development' ? 'always' : 'online';

    return {
      transformer: superjson,
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === 'development' || (opts.direction === 'down' && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          headers() {
            if (ctx?.req) {
              return {
                ...ctx.req.headers,
                // Optional: inform server that it's an SSR request
                'x-ssr': '1',
              };
            }
            return {};
          },
        }),
      ],
      queryClientConfig: {
        defaultOptions: {
          mutations: {
            networkMode,
          },
          queries: {
            retry: (failureCount, error) => {
              if (isApiErrorWithCode(error, 'UNAUTHORIZED', 'NOT_FOUND')) {
                return false;
              }
              return failureCount < 3;
            },
            networkMode,
          },
        },
      },
    };
  },
  ssr: false,
});

const zTRPCError = z.object({
  data: z.object({
    code: z.string(),
  }),
});

export const isApiErrorWithCode = (error: unknown, ...errorCodes: string[]) => {
  const parseResult = zTRPCError.safeParse(error);
  if (!parseResult.success) return false;

  const apiError = parseResult.data;

  return errorCodes.includes(apiError.data.code);
};

/**
 * Inference helper for inputs
 * @example type HelloInput = RouterInputs['example']['hello']
 **/
export type RouterInputs = inferRouterInputs<AppRouter>;
/**
 * Inference helper for outputs
 * @example type HelloOutput = RouterOutputs['example']['hello']
 **/
export type RouterOutputs = inferRouterOutputs<AppRouter>;
