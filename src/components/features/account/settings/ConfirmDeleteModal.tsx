import NiceModal from '@ebay/nice-modal-react';
import { Modal } from '~/components/ui/Modal';

export const ConfirmDeleteModal = NiceModal.create<{ onDelete: () => void | Promise<void> }>(({ onDelete }) => (
  <Modal
    title="Delete Account"
    primaryBtnColor="danger"
    primaryBtnLabel="Delete my account"
    primaryBtnOnClick={onDelete}
  >
    <p>Are you sure you want to delete your account?</p>
    <p className="mt-2">
      This action <span className="font-bold">cannot</span> be undone.
    </p>
  </Modal>
));
