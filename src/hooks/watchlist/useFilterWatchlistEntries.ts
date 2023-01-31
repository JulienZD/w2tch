import type { z } from 'zod';
import { watchlistEntryFilterSchema } from '~/models/watchlist';
import type { RouterOutputs } from '~/utils/api';
import { sortByDate, sortByNumberOrString } from '~/utils/collation';
import { useQueryParam } from '../useQueryParam';

type FilterSchema = typeof watchlistEntryFilterSchema;
type Filters = {
  type: z.infer<FilterSchema['type']> | undefined;
  sort: z.infer<FilterSchema['sort']> | undefined;
};

type Watchables = RouterOutputs['watchlist']['byId']['watchables'];

export const useFilterWatchlistEntries = (watchables: Watchables) => {
  const [type, setType] = useQueryParam('type', {
    schema: watchlistEntryFilterSchema.type,
  });
  const [sort, setSort] = useQueryParam('sort', {
    schema: watchlistEntryFilterSchema.sort,
  });

  const clearFilters = () => {
    setType(undefined);
    setSort(undefined);
  };

  // TODO: See if performance can be improved by e.g. memoization - useMemo doesn't work as well since the params
  // are objects
  const filteredWatchables = collateWatchables(watchables, { type, sort });

  return {
    type,
    setType,
    sort,
    setSort,
    clearFilters,
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
        return sortByDate('seenOn', a, b, sortOrder);
      }

      return sortByNumberOrString(sortBy, a, b, sortOrder) || 0;
    });
};
