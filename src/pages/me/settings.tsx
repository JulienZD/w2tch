import type { NextPage } from 'next';
import { AccountSettingsForm } from '~/components/features/account/settings/AccountSettingsForm';
import { useRequiresAuth } from '~/hooks/useRequiresAuth';
import { trpc } from '~/utils/trpc';

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
});

const AccountSettings: NextPage = () => {
  const { user } = useRequiresAuth();

  const userSettings = trpc.me.settings.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

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
