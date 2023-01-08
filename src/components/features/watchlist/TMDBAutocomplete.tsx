import Image from 'next/image';
import { Autocomplete, type SelectItem } from '~/components/input/Autocomplete';
import { useTMDBSearch } from '~/hooks/useTMDBSearch';

type TMDBAutocompleteProps = {
  setQuery: (query: string) => void;
  query: string;
  onSelect: (item: SelectItem) => void;
  excludeItems?: SelectItem[];
};

export const TMDBAutocomplete: React.FC<TMDBAutocompleteProps> = ({ query, setQuery, onSelect, excludeItems }) => {
  // TODO: Debounce this
  const data = useTMDBSearch(query);

  const items = data.data ?? [];

  const filteredItems = excludeItems ? items.filter((item) => !excludeItems?.find(({ id }) => id === item.id)) : items;

  return (
    <Autocomplete
      onSelect={onSelect}
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
                width={36}
                height={48}
                style={{
                  width: 'auto',
                  height: 'auto',
                }}
                className="max-h-12"
              />
            ) : null}
            <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{item.name}</span>
          </div>
        );
      }}
    />
  );
};
