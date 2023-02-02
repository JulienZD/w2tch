import Image from 'next/image';
import { ExternalWatchableSource, WatchableType as DBWatchableType } from '@prisma/client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import type { zWatchListAddEntry } from '~/server/data/watchlist/mutations';
import { type RouterOutputs, api } from '~/utils/api';
import { TMDBAutocomplete } from './TMDBAutocomplete';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { Rating } from '~/components/ui/Rating';
import { WatchableType } from '~/components/ui/WatchableType';
import { thumbnail } from '~/utils/thumbnail';

type AddItemProps = {
  watchlistId: string;
};

type SearchResult = RouterOutputs['search']['tmdb']['search'][number];

export const AddItem: React.FC<AddItemProps> = ({ watchlistId }) => {
  const [query, setQuery] = useState('');
  const form = useForm<z.infer<typeof zWatchListAddEntry>>({
    defaultValues: {
      id: '',
      type: DBWatchableType.MOVIE,
    },
  });
  const apiUtil = api.useContext();
  const selectedId = form.watch('id');
  const [selectedItem, setSelectedItem] = useState<SearchResult | null>(null);

  const addItem = api.watchlist.addItem.useMutation({
    onSuccess: async () => {
      form.reset();
      setQuery('');
      setSelectedItem(null);
      return apiUtil.watchlist.byId.invalidate({ id: watchlistId });
    },
  });
  const { data: watchlist } = api.watchlist.byId.useQuery({ id: watchlistId });

  const addMovie = form.handleSubmit((movie) => {
    if (addItem.isLoading || !movie.id) return;

    addItem.mutate({ watchlistId, ...movie });
  });

  if (!watchlist) return null;

  return (
    <form onSubmit={addMovie} className="flex flex-col items-start gap-2">
      <TMDBAutocomplete
        initialQuery={query}
        onSelect={(item) => {
          setSelectedItem(item);
          form.setValue('id', String(item.id));
          form.setValue('type', item.type);
          setQuery(item.name);
        }}
        excludeItems={watchlist.watchables}
      />

      {selectedItem && (
        <div className="not-prose flex w-full flex-col">
          <div className="mb-3 flex w-full flex-col gap-y-2">
            <div className="flex w-full items-center justify-between">
              <p className="font-bold">{selectedItem.name}</p>
              <button
                onClick={() => {
                  setQuery('');
                  setSelectedItem(null);
                }}
                data-tip="Clear"
                className="btn-ghost tooltip tooltip-left rounded-full md:tooltip-top"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="flex items-center gap-x-2">
              <WatchableType type={selectedItem.type} />
              {!!selectedItem.rating && selectedItem.rating > 0 && <Rating score={selectedItem.rating} />}
            </div>
          </div>
          <div className="flex flex-col gap-x-5 gap-y-2 md:flex-row">
            {selectedItem.image && (
              <div className="relative h-32 w-24 flex-shrink-0 md:h-[256px] md:w-[171px]">
                <Image
                  src={thumbnail(ExternalWatchableSource.TMDB, selectedItem.image, 'md')}
                  loading="eager"
                  alt=""
                  fill
                  className="rounded-md object-cover"
                />
              </div>
            )}
            <p className="line-clamp-6 md:line-clamp-none">{selectedItem.overview || 'No description available'}</p>
          </div>
        </div>
      )}

      {selectedItem && (
        <button
          type="submit"
          disabled={!selectedId}
          className={`btn-primary btn mt-2 py-2 ${addItem.isLoading ? 'loading' : ''}`}
        >
          Add to watchlist
        </button>
      )}
    </form>
  );
};
