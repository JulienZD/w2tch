import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { createWatchlistSchema } from '~/models/watchlist';
import { trpc } from '~/utils/trpc';

export const CreateWatchlist: React.FC = () => {
  const createWatchList = trpc.watchlist.create.useMutation();
  const { push } = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof createWatchlistSchema>>({
    resolver: zodResolver(createWatchlistSchema),
  });

  const onCreateWatchList = handleSubmit((data) => {
    if (createWatchList.status === 'loading') return;
    createWatchList.mutate(data);
  });

  const nameError = errors.name?.message ?? createWatchList.error?.data?.zodError?.fieldErrors?.name;

  useEffect(() => {
    if (createWatchList.isSuccess) {
      push('/dashboard').catch(() => undefined);
    }
  }, [createWatchList.isSuccess, push]);

  return (
    <form onSubmit={onCreateWatchList}>
      <div className="form-control">
        <label htmlFor="name" className="label">
          Watchlist name
        </label>
        <input {...register('name')} className="input max-w-xs" placeholder="Favorites" />
        {nameError && <p className="my-0 text-sm text-error">{nameError}</p>}
      </div>

      <button className={`btn-primary btn mt-2 ${createWatchList.status === 'loading' ? 'loading' : ''}`}>
        Create
      </button>
    </form>
  );
};
