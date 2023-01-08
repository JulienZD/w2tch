import React, { Fragment, useCallback, useState } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

export type SelectItem<T = unknown> = T & {
  id: number | string;
  name: string;
};

type RenderValueProps<T = unknown> = {
  item: SelectItem<T>;
  renderOptions: { selected: boolean; active: boolean; disabled: boolean };
};

type AutocompleteProps<T> = {
  onSelect: (item: SelectItem<T>) => void;
  onSearch?: (query: string) => void;
  items: SelectItem<T>[];
  renderValue?: React.FC<RenderValueProps<T>>;
  openDropdownButton?: boolean;
  placeholder?: string;
};

const DefaultRenderValue: React.FC<RenderValueProps> = ({ item, renderOptions }) => (
  <>
    <span className={`block truncate ${renderOptions.selected ? 'font-medium' : 'font-normal'}`}>{item.name}</span>

    {renderOptions.selected ? (
      <span
        className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
          renderOptions.active ? 'text-white' : 'text-teal-600'
        }`}
      >
        <CheckIcon className="h-5 w-5" aria-hidden="true" />
      </span>
    ) : null}
  </>
);

// eslint-disable-next-line func-style
export function Autocomplete<T>({
  onSelect,
  onSearch,
  items,
  openDropdownButton = true,
  placeholder = 'Search...',
  renderValue: RenderValue,
}: AutocompleteProps<T>) {
  const [selected, setSelected] = useState<SelectItem<T> | undefined>(undefined);
  const [query, setQuery] = useState('');

  const handleSelect = useCallback(
    (selectedValue: SelectItem<T>) => {
      onSelect(selectedValue);
      setSelected(selectedValue);
    },
    [onSelect, setSelected]
  );

  const handleSearch = useCallback(
    (newQuery: string) => {
      setQuery(newQuery);
      if (onSearch) {
        onSearch(newQuery);
      }
    },
    [onSearch, setQuery]
  );

  const Value = RenderValue || DefaultRenderValue;

  return (
    <Combobox value={selected} onChange={handleSelect}>
      <div className="relative mt-1">
        <div className="relative w-full cursor-default overflow-hidden rounded-lg text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
          <Combobox.Input
            placeholder={placeholder}
            className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-base-content focus:ring-0"
            displayValue={(result: SelectItem<T> | undefined) => result?.name ?? ''}
            onChange={(event) => handleSearch(event.target.value)}
          />
          {openDropdownButton && (
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-base-content" aria-hidden="true" />
            </Combobox.Button>
          )}
        </div>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => setQuery('')}
        >
          <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-base-100 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {items.length === 0 && query !== '' ? (
              <div className="relative cursor-default select-none py-2 px-4 text-base-content">Nothing found.</div>
            ) : (
              items.map((result) => (
                <Combobox.Option
                  key={result.id}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 px-4 ${
                      active ? 'bg-teal-600 text-white' : 'text-base-content'
                    }`
                  }
                  value={result}
                >
                  {(options) => <Value item={result} renderOptions={options} />}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  );
}