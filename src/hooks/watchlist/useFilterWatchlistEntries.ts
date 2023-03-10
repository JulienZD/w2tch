import { z } from 'zod';
import { watchlistEntryFilterSchema } from '~/models/watchlist';
import type { RouterOutputs } from '~/utils/api';
import { compareDates, compareNumberOrString } from '~/utils/comparison';
import { useQueryParams } from '../useQueryParams';

type FilterSchema = typeof watchlistEntryFilterSchema;
type Filters = {
  type: z.infer<FilterSchema['type']> | undefined;
  sort: z.infer<FilterSchema['sort']> | undefined;
};

type Watchables = RouterOutputs['watchlist']['byId']['watchables'];

export const useFilterWatchlistEntries = (watchables: Watchables) => {
  const { queryParams, setQueryParams } = useQueryParams({
    schema: z.object(watchlistEntryFilterSchema),
  });

  const { type, sort } = queryParams;

  // TODO: See if performance can be improved by e.g. memoization - useMemo doesn't work as well since the params
  // are objects
  const filteredWatchables = collateWatchables(watchables, { type, sort });

  return {
    type,
    sort,
    setType: (type: Filters['type']) => setQueryParams({ type }),
    setSort: (sort: Filters['sort']) => setQueryParams({ sort }),
    clearFilters: () => setQueryParams(undefined),
    filteredWatchables,
  };
};

const collateWatchables = (watchables: Watchables, filters: Filters) => {
  return watchables
    .filter((watchable) => {
      if (filters.type) {
        return watchable.type === filters.type;
      }

      return true;
    })
    .sort((a, b) => {
      if (!filters.sort) return 0;

      const sortBy = filters.sort.by;
      const sortOrder = filters.sort.order === 'asc' ? 1 : -1;

      if (sortBy === 'seenAt') {
        return sortOrder * compareDates('seenOn', a, b);
      }

      return sortOrder * compareNumberOrString(sortBy, a, b) || 0;
    });
};
