import * as Sentry from '@sentry/nextjs';

type TraceDetailedCatchAllRouteArgs = {
  route: string;
  replaceSearchValue: string;
  replaceValue: string;
};

/**
 * Fixes the tracing transaction name for catch-all routes by replacing the catch-all part with a detailed route
 *
 * The transaction name is something like: POST /api/trpc/[trpc]
 *
 * After this function is called, the transaction name will be something like: POST /api/trpc/post.byId
 *
 * @param route The route that is being traced, e.g. `/api/trpc/[trpc]`
 * @param replaceSearchValue The value that is being replaced, e.g. `[trpc]`
 * @param replaceValue The value that is replacing the search value, e.g. `/api/trpc/[trpc]` -> `/api/trpc/post.byId`
 */
export const traceDetailedCatchAllRoute = ({
  route,
  replaceSearchValue,
  replaceValue,
}: TraceDetailedCatchAllRouteArgs): void => {
  Sentry.getCurrentHub().configureScope((scope) => {
    const transaction = scope.getSpan()?.transaction;

    // Transaction name is something like: POST /api/trpc/[trpc] or GET /api/auth/[...nextauth]
    if (transaction?.name.endsWith(route)) {
      transaction.setName(transaction.name.replace(replaceSearchValue, replaceValue));
    }
  });
};
