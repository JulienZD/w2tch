import { Menu, Transition } from '@headlessui/react';
import { Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/20/solid';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Fragment } from 'react';

export const UserMenu: React.FC = () => {
  const { status, data: session } = useSession();
  if (status !== 'authenticated' || !session.user?.name) return null;

  const { user } = session;

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="badge flex items-center gap-x-1 border-transparent bg-base-100/40 py-3 px-4 text-base-content">
        {user.name}
        <ChevronDownIcon className="h-4 w-4" />
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md border border-base-300 bg-base-100/30 py-1 shadow-sm outline-none backdrop-blur-md">
          <Menu.Item>
            {({ active }) => (
              <Link
                href="/me/settings"
                className={`${
                  active ? 'bg-base-200/30' : ''
                } flex w-full items-center gap-x-2 px-4 py-2 text-sm leading-5`}
              >
                <Cog6ToothIcon className="h-4 w-4" /> Settings
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                className={`${
                  active ? 'bg-base-200/30' : ''
                } flex w-full items-center gap-x-2 px-4 py-2 text-sm leading-5 text-red-600`}
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" /> Sign out
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};
