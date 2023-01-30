import Image from 'next/image';
import { useState } from 'react';
import { Autocomplete, type SelectItem } from '~/components/input/Autocomplete';
import { Rating } from '~/components/ui/Rating';
import { useDebounce } from '~/hooks/useDebounce';
import { useTMDBSearch } from '~/hooks/useTMDBSearch';
import type { TMDBEntryType } from '~/server/data/tmdb/models';
import type { RouterOutputs } from '~/utils/api';

type SearchResult = RouterOutputs['search']['tmdb']['search'][number];

type TMDBAutocompleteProps = {
  initialQuery: string;
  onSelect: (item: SelectItem & SearchResult) => void;
  excludeItems?: { externalId: string | number; type: TMDBEntryType }[];
};

const SEARCH_THUMB_WIDTH = 36;
const SEARCH_THUMB_HEIGHT = 48;

export const TMDBAutocomplete: React.FC<TMDBAutocompleteProps> = ({ initialQuery, onSelect, excludeItems }) => {
  const [query, setQuery] = useState(initialQuery ?? '');
  const debouncedQuery = useDebounce(query, 250);

  const data = useTMDBSearch(debouncedQuery);

  const items = data.data ?? [];

  const filteredItems = excludeItems
    ? items.filter((item) => !excludeItems?.find(({ externalId, type }) => type === item.type && externalId == item.id)) // weak comparison is on purpose
    : items;

  return (
    <Autocomplete
      onSelect={onSelect as never} // Handler type is valid, but it would override the component's generic type
      items={filteredItems}
      onSearch={setQuery}
      query={query}
      openDropdownButton={false}
      renderValue={({ item, renderOptions }) => {
        const { selected } = renderOptions;

        return (
          <div className="flex max-h-12 items-center gap-x-2">
            {item.image ? (
              <Image
                src={`https://image.tmdb.org/t/p/w92${item.image}`}
                alt=""
                width={SEARCH_THUMB_WIDTH}
                height={SEARCH_THUMB_HEIGHT}
                style={{
                  width: 'auto',
                  height: 'auto',
                }}
                className="max-h-12"
              />
            ) : null}
            <div className={`flex flex-col justify-between ${!item.image ? `pl-[${SEARCH_THUMB_WIDTH}px]` : ''}`}>
              <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{item.name}</span>
              {!!item.rating && item.rating > 0 && <Rating score={item.rating} />}
            </div>
          </div>
        );
      }}
    />
  );
};
