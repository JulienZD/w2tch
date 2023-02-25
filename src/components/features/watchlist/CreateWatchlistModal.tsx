import NiceModal from '@ebay/nice-modal-react';
import { FormModal } from '~/components/ui/FormModal';
import { type ModalProps } from '~/components/ui/Modal';
import { useTrpcForm } from '~/hooks/useTrpcForm';
import { createWatchlistSchema } from '~/models/watchlist';
import { api } from '~/utils/api';

type CreateWatchlistModalProps = Pick<ModalProps, 'onCancel'>;

export const CreateWatchlistModal = NiceModal.create<CreateWatchlistModalProps>(({ onCancel }) => {
  const createWatchlist = api.watchlist.create.useMutation();

  const { form, errors } = useTrpcForm({
    defaultValues: {
      name: '',
    },
    schema: createWatchlistSchema,
    mutation: createWatchlist,
  });

  return (
    <FormModal
      form={form}
      title="New watchlist"
      submitBtnLabel="Create"
      isLoading={createWatchlist.isLoading}
      onSubmit={async (data) => {
        if (createWatchlist.isLoading) return;

        const result = await createWatchlist.mutateAsync(data);
        return result.id;
      }}
      onCancel={onCancel}
    >
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
