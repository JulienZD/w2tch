import { useSession } from 'next-auth/react';
import { UserMenu } from './UserMenu';

export const Header: React.FC<{ visible: boolean }> = ({ visible }) => {
  const { status } = useSession();
  if (!visible) return null;

  return (
    <header className="absolute right-0 top-4 flex w-full justify-end px-2 md:top-32 md:px-0">
      {status === 'authenticated' && <UserMenu />}
    </header>
  );
};
