import { ThemeSwitcher } from './ThemeSwitcher';

export const Header: React.FC<{ visible: boolean }> = ({ visible }) => {
  if (!visible) return null;

  return (
    <header className="absolute right-4 top-4 md:top-32">
      <ThemeSwitcher />
    </header>
  );
};
