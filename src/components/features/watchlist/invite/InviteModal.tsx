import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { trpc } from '~/utils/trpc';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { ClipboardCopy } from '~/components/util/ClipboardCopy';
import { expiryOptions, expiryOptionsInHours, zInvite } from '~/models/watchlistInvite';
import { zodResolver } from '@hookform/resolvers/zod';

export const InviteModal = NiceModal.create<{ watchlistId: string }>(({ watchlistId }) => {
  const modal = useModal();
  const invite = trpc.invite.create.useMutation();
  const existingInvite = trpc.watchlist.inviteById.useQuery({ watchlistId });

  const [inviteCode, setInviteCode] = useState('');

  const form = useForm<z.infer<typeof zInvite>>({
    defaultValues: {
      expiresAfterHours: expiryOptionsInHours[0],
      hasUnlimitedUsages: true,
      maxUses: 5,
    },
    resolver: zodResolver(zInvite),
  });

  const hasUnlimitedUses = form.watch('hasUnlimitedUsages');

  const handleInvite = form.handleSubmit(async (data) => {
    try {
      const result = await invite.mutateAsync({
        ...data,
        maxUses: data.hasUnlimitedUsages ? null : data.maxUses,
        watchlistId,
      });
      if (!result) {
        return;
      }
      setInviteCode(result.inviteCode);
    } catch (error) {
      // TODO: idk
      console.error(error);
    }
  });

  const formDisabled = !!inviteCode;

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
                <Dialog.Title as="h3" className="mb-2 text-lg font-medium leading-6 text-base-content">
                  Create Watchlist Invite
                </Dialog.Title>

                <form onSubmit={handleInvite}>
                  <div className="form-control my-2">
                    <label className="label-text" htmlFor="expiresAfterHours">
                      Expires after
                    </label>
                    <select
                      {...form.register('expiresAfterHours', { valueAsNumber: true })}
                      disabled={formDisabled}
                      className="input select-bordered select"
                      id="expiresAfterHours"
                      name="expiresAfterHours"
                    >
                      {expiryOptions.map((expiryOption) => (
                        <option key={expiryOption.hours} value={expiryOption.hours}>
                          {expiryOption.label.replace('in ', '')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex min-h-[4.25rem] flex-row-reverse items-center justify-between gap-x-2">
                    <div className="shrink-0">
                      <label
                        className="label inline-flex cursor-pointer flex-row-reverse justify-start gap-x-2"
                        htmlFor="hasUnlimitedUses"
                      >
                        <span className="label-text">Unlimited uses</span>
                        <input
                          {...form.register('hasUnlimitedUsages')}
                          id="hasUnlimitedUses"
                          type="checkbox"
                          disabled={formDisabled}
                          className="checkbox-primary checkbox"
                        />
                      </label>
                    </div>

                    {!hasUnlimitedUses && (
                      <div className="form-control max-w-[7rem] shrink sm:max-w-[8rem]">
                        <label className="label-text" htmlFor="maxUses">
                          Maximum uses
                        </label>
                        <input
                          {...form.register('maxUses', { valueAsNumber: true })}
                          disabled={formDisabled}
                          className="input-bordered input"
                          type="number"
                          min="1"
                        />
                      </div>
                    )}
                  </div>
                </form>

                <div className="mt-6 flex justify-between">
                  <button className="btn-sm btn" onClick={modal.hide}>
                    Cancel
                  </button>
                  <button className="btn-primary btn-sm btn" disabled={formDisabled} onClick={handleInvite}>
                    Create
                  </button>
                </div>
                <div className="mt-2 w-full">
                  <div className="mb-2 text-sm text-base-content">Invite code:</div>
                  <ClipboardCopy text={inviteCode} />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
});
