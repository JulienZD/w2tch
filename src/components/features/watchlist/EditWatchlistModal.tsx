import NiceModal from '@ebay/nice-modal-react';
import { z } from 'zod';
import { FormModal } from '~/components/ui/FormModal';
import { type ModalProps } from '~/components/ui/Modal';
import { useTrpcForm } from '~/hooks/useTrpcForm';
import { editWatchlistSchema } from '~/models/watchlist';
import { trpc } from '~/utils/trpc';

type EditWatchlistModalProps = Pick<ModalProps, 'onCancel'> & {
  watchlistId: string;
};

export const EditWatchlistModal = NiceModal.create<EditWatchlistModalProps>(({ watchlistId, onCancel }) => {
  const { data: watchlist } = trpc.watchlist.byId.useQuery({ id: watchlistId });

  const util = trpc.useContext();

  const editWatchlist = trpc.watchlist.edit.useMutation({
    onSuccess: async () => {
      return util.watchlist.byId.invalidate({ id: watchlistId });
    },
  });

  const { form, errors } = useTrpcForm({
    defaultValues: {
      name: watchlist?.name,
    },
    schema: z.object({ name: editWatchlistSchema.name }),
    mutation: editWatchlist,
  });

  if (!watchlist) return null;

  const handleSubmit = form.handleSubmit((data) => {
    if (editWatchlist.isLoading) return;
    if (data.name === watchlist.name) return;

    return editWatchlist.mutateAsync({ ...data, id: watchlistId });
  });

  return (
    <FormModal title="Edit watchlist" isLoading={editWatchlist.isLoading} onSubmit={handleSubmit} onCancel={onCancel}>
      <div className="form-control">
        <label htmlFor="name" className="label">
          Name
        </label>

        <input {...form.register('name')} id="name" className="input-bordered input" />
      </div>
      {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
    </FormModal>
  );
});
