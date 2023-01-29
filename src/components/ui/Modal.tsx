import { useModal } from '@ebay/nice-modal-react';
import { Transition, Dialog } from '@headlessui/react';
import { Fragment, useCallback } from 'react';

const buttonColors = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'bg-red-700 hover:bg-red-900 focus-visible:outline-red-700',
};

export type ModalProps = {
  title: string;
  description?: string;
  primaryBtnLabel?: string;
  primaryBtnOnClick?: () => Promise<void> | void;
  onCancel?: () => Promise<void> | void;
  children?: React.ReactNode;
  primaryBtnColor?: keyof typeof buttonColors;
};

export const Modal: React.FC<ModalProps> = ({
  title,
  onCancel,
  description,
  children,
  primaryBtnOnClick,
  primaryBtnLabel = 'OK',
  primaryBtnColor = 'primary',
}) => {
  const modal = useModal();

  const handleCancel = useCallback(async () => {
    if (onCancel) {
      await onCancel();
    }
    await modal.hide();
  }, [onCancel, modal]);

  const handlePrimaryAction = useCallback(async () => {
    if (primaryBtnOnClick) {
      await primaryBtnOnClick();
    }
    await modal.hide();
  }, [primaryBtnOnClick, modal]);

  return (
    <Transition appear show={modal.visible} as={Fragment}>
      <Dialog as="div" className="relative z-50" open={modal.visible} onClose={modal.hide}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-base-100 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="mb-6 text-lg font-medium leading-6 text-base-content">
                  {title}
                </Dialog.Title>

                {description && <p>{description}</p>}

                {children}

                <div className="mt-6 flex items-center justify-end gap-x-4">
                  <button className="btn-ghost btn" onClick={handleCancel}>
                    Cancel
                  </button>
                  <button className={`btn ${buttonColors[primaryBtnColor]}`} onClick={handlePrimaryAction}>
                    {primaryBtnLabel ?? 'OK'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
