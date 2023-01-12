import { trpc } from '~/utils/trpc';

export const useTMDBSearch = (query: string) => {
  return trpc.search.tmdb.search.useQuery(
    { query },
    { enabled: query.length > 1, refetchOnMount: false, refetchOnReconnect: false, refetchOnWindowFocus: false }
  );
};
