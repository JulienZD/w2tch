import { trpc } from '~/utils/trpc';

export const useTMDBSearch = (query: string) => {
  return trpc.search.tmdb.search.useQuery(
    { query },
    { enabled: query.length > 2, refetchOnMount: false, refetchOnReconnect: false, refetchOnWindowFocus: false }
  );
};
