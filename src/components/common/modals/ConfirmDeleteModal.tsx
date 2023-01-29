import NiceModal from '@ebay/nice-modal-react';
import { Modal, type ModalProps } from '~/components/ui/Modal';

type DeleteModalProps = Pick<ModalProps, 'onCancel' | 'title'> & {
  deleteFn: () => void | Promise<void>;
  message?: string;
  buttonLabel?: string;
};

export const ConfirmDeleteModal = NiceModal.create<DeleteModalProps>(
  ({ deleteFn, title, message, onCancel, buttonLabel = 'Delete' }) => (
    <Modal
      title={title}
      primaryBtnColor="danger"
      primaryBtnLabel={buttonLabel}
      primaryBtnOnClick={deleteFn}
      onCancel={onCancel}
      description={message}
    >
      <p className="mt-2">
        This action <span className="font-bold">cannot</span> be undone.
      </p>
    </Modal>
  )
);
