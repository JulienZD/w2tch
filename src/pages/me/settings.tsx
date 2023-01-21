import type { NextPage } from 'next';
import { AccountSettingsForm } from '~/components/features/account/settings/AccountSettingsForm';
import { useRequiresAuth } from '~/hooks/useRequiresAuth';
import { trpc } from '~/utils/trpc';

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'medium',
});

const AccountSettings: NextPage = () => {
  const { user } = useRequiresAuth();

  const userSettings = trpc.me.settings.useQuery();

  if (!user || userSettings.isLoading) return null;

  return (
    <div className="prose">
      <h1 className="mb-4">Account Settings</h1>

      {userSettings.data && <AccountSettingsForm user={userSettings.data} />}
      <p className="text-sm">This account was created on {dateFormatter.format(userSettings.data?.createdAt)}.</p>
    </div>
  );
};

export default AccountSettings;