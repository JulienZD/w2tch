import { Menu } from '@headlessui/react';
import { FunnelIcon, ArrowsUpDownIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { OverflowMenu } from '~/components/ui/OverflowMenu';
import { useBreakpoint } from '~/hooks/useTWBreakpoint';
import type { useFilterWatchlistEntries } from '~/hooks/watchlist/useFilterWatchlistEntries';

type FilterArgs = Omit<ReturnType<typeof useFilterWatchlistEntries>, 'filteredWatchables'>;

type SortFilters = NonNullable<FilterArgs['sort']>;
type SortKey = `${SortFilters['by']}.${SortFilters['order']}`;

const sortedByTextMap = {
  'name.asc': 'Title (A-Z)',
  'name.desc': 'Title (Z-A)',
  'seenAt.desc': 'Seen',
  'seenAt.asc': 'Not seen',
  'rating.asc': 'Lowest Rating',
  'rating.desc': 'Highest Rating',
} satisfies Record<SortKey, string>;

const getSortedByText = (sort: SortFilters | undefined, defaultValue: string) => {
  if (!sort) return defaultValue;

  const category = sortedByTextMap[`${sort.by}.${sort.order}`];
  return category ?? defaultValue;
};

export const WatchlistContentFilters: React.FC<{ filters: FilterArgs }> = ({ filters }) => {
  const sortedByButtonText = getSortedByText(filters.sort, 'Sort');
  const { isMd } = useBreakpoint('md');

  return (
    <div className="mt-4 flex flex-row items-center gap-x-2">
      <OverflowMenu
        menuButton={
          <Menu.Button className="btn-ghost btn-sm btn gap-2 p-0.5">
            <>
              {!filters.type ? 'All types' : filters.type === 'MOVIE' ? 'Movies' : 'TV Shows'}
              <FunnelIcon className="h-4 w-4" />
            </>
          </Menu.Button>
        }
        items={[
          {
            label: 'All',
            onClick: () => filters.setType(undefined),
            selected: filters.type === undefined,
          },
          {
            label: 'Movies',
            onClick: () => filters.setType('MOVIE'),
            selected: filters.type === 'MOVIE',
          },
          {
            label: 'TV Shows',
            onClick: () => filters.setType('TV_SHOW'),
            selected: filters.type === 'TV_SHOW',
          },
        ]}
      />

      <OverflowMenu
        menuButton={
          <Menu.Button className="btn-ghost btn-sm btn gap-2 p-0.5">
            <>
              {sortedByButtonText}
              <ArrowsUpDownIcon className="h-5 w-5" />
            </>
          </Menu.Button>
        }
        items={[
          {
            label: 'Seen',
            icon: <EyeIcon className="h-4 w-4" />,
            onClick: () => filters.setSort({ by: 'seenAt', order: 'desc' }),
            selected: filters.sort?.by === 'seenAt' && filters.sort?.order === 'desc',
          },
          {
            label: 'Not Seen',
            icon: <EyeSlashIcon className="h-4 w-4" />,
            onClick: () => filters.setSort({ by: 'seenAt', order: 'asc' }),
            selected: filters.sort?.by === 'seenAt' && filters.sort?.order === 'asc',
          },
          {
            label: 'Title (A-Z)',
            onClick: () => filters.setSort({ by: 'name', order: 'asc' }),
            selected: filters.sort?.by === 'name' && filters.sort?.order === 'asc',
          },
          {
            label: 'Title (Z-A)',
            onClick: () => filters.setSort({ by: 'name', order: 'desc' }),
            selected: filters.sort?.by === 'name' && filters.sort?.order === 'desc',
          },
          {
            label: 'Rating (Highest)',
            onClick: () => filters.setSort({ by: 'rating', order: 'desc' }),
            selected: filters.sort?.by === 'rating' && filters.sort?.order === 'desc',
          },
          {
            label: 'Rating (Lowest)',
            onClick: () => filters.setSort({ by: 'rating', order: 'asc' }),
            selected: filters.sort?.by === 'rating' && filters.sort?.order === 'asc',
          },
        ]}
      />

      {(filters.type || filters.sort) && (
        <button onClick={filters.clearFilters} className="btn-ghost btn-sm btn ml-4 gap-2 p-0.5">
          {isMd ? 'Clear Filters' : 'Clear'}
        </button>
      )}
    </div>
  );
};
