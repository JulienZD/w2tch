import { CheckIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';
import { Autocomplete, type SelectItem } from '~/components/input/Autocomplete';
import { useTMDBSearch } from '~/hooks/useTMDBSearch';
import Image from 'next/image';

type TMDBAutocompleteProps = {
  onSelect: (item: SelectItem) => void;
  excludeItems?: SelectItem[];
};

export const TMDBAutocomplete: React.FC<TMDBAutocompleteProps> = ({ onSelect, excludeItems }) => {
  const [query, setQuery] = useState('');

  // TODO: Debounce this
  const data = useTMDBSearch(query);

  const items = data.data ?? [];

  const filteredItems = excludeItems ? items.filter((item) => !excludeItems?.find(({ id }) => id === item.id)) : items;

  return (
    <Autocomplete
      onSelect={onSelect}
      items={filteredItems}
      onSearch={setQuery}
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
