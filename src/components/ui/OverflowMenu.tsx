import { Menu, Transition } from '@headlessui/react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/solid';
import { Fragment } from 'react';

type MenuItem = {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  selected?: boolean;
};

const positionMap = {
  left: 'origin-top-left left-0',
  right: 'origin-top-right right-0',
};

const sizeMap = {
  sm: 'w-32',
  md: 'w-40',
  lg: 'w-48',
};

export type OverflowMenuProps = {
  menuButton?: React.ReactNode;
  items: MenuItem[];
  position?: keyof typeof positionMap;
  size?: keyof typeof sizeMap;
};

export const OverflowMenu: React.FC<OverflowMenuProps> = ({
  items,
  menuButton: MenuButton,
  position = 'left',
  size = 'md',
}) => {
  return (
    <Menu as="div" className="relative">
      {MenuButton || (
        <Menu.Button className="btn-ghost rounded-full p-0.5">
          <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
        </Menu.Button>
      )}

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={`${positionMap[position]} ${sizeMap[size]} absolute z-[60] mt-1 divide-y divide-base-200 rounded-md bg-base-100 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none`}
        >
          {items.map((item) => (
            <Menu.Item key={item.label}>
              {({ active }) => (
                <button
                  onClick={item.onClick}
                  className={`${
                    active ? 'bg-base-200' : ''
                  } group flex w-full items-center gap-x-2 rounded-md text-sm text-base-content`}
                >
                  <div
                    className={`${
                      item.selected ? 'border-primary' : 'border-transparent'
                    } flex w-full items-center gap-2 border-l-2 p-2 text-left`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                </button>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};
