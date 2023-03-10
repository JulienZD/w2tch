import NiceModal from '@ebay/nice-modal-react';
import type { GetStaticProps, NextPage } from 'next';
import { ConfirmDeleteModal } from '~/components/common/modals/ConfirmDeleteModal';
import { AccountSettingsForm } from '~/components/features/account/settings/AccountSettingsForm';
import { useRequiresAuth } from '~/hooks/useRequiresAuth';
import type { SEOProps } from '~/types/ssr';
import { api } from '~/utils/api';

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
});

const AccountSettings: NextPage = () => {
  const { user } = useRequiresAuth();

  const userSettings = api.me.settings.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const deleteAccount = api.me.deleteAccount.useMutation();

  if (!user || userSettings.isLoading) return null;

  return (
    <div className="prose">
      <h1 className="mb-8">Account Settings</h1>

      {userSettings.data && <AccountSettingsForm user={userSettings.data} />}
      <p className="text-sm">This account was created on {dateFormatter.format(userSettings.data?.createdAt)}.</p>

      <div className="not-prose mt-4 rounded-md border border-red-600  p-4">
        <h2 className="mb-4 text-red-600">Danger Zone</h2>
        <p className="text-sm">
          Deleting your account will remove all of your data from our servers. This action cannot be undone.
        </p>
        <button
          className="btn mt-4 bg-red-800 text-white hover:bg-red-900 focus-visible:outline-red-800"
          onClick={() => {
            return NiceModal.show(ConfirmDeleteModal, {
              title: 'Delete Account',
              message: 'Are you sure you want to delete your account?',
              buttonLabel: 'Delete my account',
              deleteFn: async () => {
                await deleteAccount.mutateAsync();
                window.location.href = '/';
              },
            });
          }}
        >
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default AccountSettings;

export const getStaticProps: GetStaticProps<SEOProps> = () => ({
  props: {
    seo: {
      title: 'Account Settings',
    },
  },
});
