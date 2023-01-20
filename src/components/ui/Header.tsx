import { useSession } from 'next-auth/react';
import { UserMenu } from './UserMenu';
import { RectangleGroupIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/router';

export const Header: React.FC<{ visible: boolean }> = ({ visible }) => {
  const { status } = useSession();
  const { route } = useRouter();
  if (!visible) return null;

  return (
    <header className="absolute right-0 top-4 flex w-full items-center justify-end gap-x-4 px-2 md:top-32 md:px-0">
      <Link
        href="/dashboard"
        className={`btn-ghost flex items-center rounded p-0.5 px-2 ${route === '/dashboard' ? 'text-primary' : ''}`}
      >
        <RectangleGroupIcon className="h-5 w-5" />
        <span className="ml-1 font-medium">Dashboard</span>
      </Link>

      {status === 'authenticated' && <UserMenu />}
    </header>
  );
};
