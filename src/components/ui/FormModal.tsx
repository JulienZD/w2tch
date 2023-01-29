import { useModal } from '@ebay/nice-modal-react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useCallback } from 'react';
import type { UseFormHandleSubmit } from 'react-hook-form';

const buttonColors = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'bg-red-700 hover:bg-red-900 focus-visible:outline-red-700',
};

type SubmitHandler = ReturnType<UseFormHandleSubmit<Record<string, unknown>>>;

export type FormModalProps = {
  title: string;
  description?: string;
  submitBtnLabel?: string;
  submitBtnColor?: keyof typeof buttonColors;
  isLoading?: boolean;
  onSubmit: SubmitHandler;
  onCancel?: () => Promise<void> | void;
  children?: React.ReactNode;
};

export const FormModal: React.FC<FormModalProps> = ({
  title,
  onCancel,
  description,
  children,
  onSubmit,
  submitBtnLabel = 'Save',
  submitBtnColor = 'primary',
  isLoading = false,
}) => {
  const modal = useModal();

  const handleCancel = useCallback(async () => {
    if (onCancel) {
      await onCancel();
    }
    modal.remove();
  }, [onCancel, modal]);

  const handleSubmit = useCallback<SubmitHandler>(
    async (event) => {
      try {
        await onSubmit(event);
        modal.remove();
      } catch (error) {
        console.error(error);
      }
    },
    [onSubmit, modal]
  );

  return (
    <Transition appear show={modal.visible} as={Fragment}>
      <Dialog as="div" className="relative z-50" open={modal.visible} onClose={modal.remove}>
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

                <form onSubmit={handleSubmit}>
                  {children}

                  <div className="mt-6 flex items-center justify-end gap-x-4">
                    <button type="button" className="btn-ghost btn" onClick={handleCancel}>
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`btn ${buttonColors[submitBtnColor]} ${isLoading ? 'loading' : ''}`}
                    >
                      {submitBtnLabel}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};