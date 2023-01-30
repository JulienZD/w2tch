import { api } from '~/utils/api';

export const useTMDBSearch = (query: string) => {
  return api.search.tmdb.search.useQuery(
    { query },
    { enabled: query.length > 1, refetchOnMount: false, refetchOnReconnect: false, refetchOnWindowFocus: false }
  );
};
