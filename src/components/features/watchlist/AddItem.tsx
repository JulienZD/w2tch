import { useForm } from 'react-hook-form';
import type { WatchListAddMovie } from '~/server/data/watchlist/mutations';
import { trpc } from '~/utils/trpc';
import { TMDBAutocomplete } from './TMDBAutocomplete';

type AddItemProps = {
  watchlistId: string;
};

export const AddItem: React.FC<AddItemProps> = ({ watchlistId }) => {
  const form = useForm<WatchListAddMovie>({
    defaultValues: {
      id: '',
      rating: 0,
      title: '',
    },
  });
  const trpcUtil = trpc.useContext();

  const addItem = trpc.watchlist.addItem.useMutation({
    onSuccess: async () => {
      form.reset();
      return trpcUtil.watchlist.byId.invalidate({ id: watchlistId });
    },
  });
  const { data: watchlist } = trpc.watchlist.byId.useQuery({ id: watchlistId });

  const addMovie = form.handleSubmit((movie) => {
    if (addItem.isLoading || !movie.id) return;

    addItem.mutate({ watchlistId, ...movie });
  });

  if (!watchlist) return null;

  return (
    <form onSubmit={addMovie}>
      <div className="flex items-end gap-x-2">
        <TMDBAutocomplete
          onSelect={(item) => {
            form.setValue('id', String(item.id));
            form.setValue('title', item.name);
          }}
          excludeItems={watchlist.movies}
        />

        <button type="submit" className={`btn-primary btn px-2 py-2 ${addItem.isLoading ? 'loading' : ''}`}>
          Add
        </button>
      </div>
    </form>
  );
};
