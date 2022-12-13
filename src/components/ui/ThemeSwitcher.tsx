import { IconMoon, IconSun } from '@tabler/icons';
import { useEffect, useState } from 'react';

export const ThemeSwitcher: React.FC = () => {
  const [theme, setTheme] = useState('night');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const theme = localStorage.getItem('theme');
      if (theme) {
        setTheme(theme);
        document.querySelector('html')?.setAttribute('data-theme', theme);
      }
    }
  }, []);

  const updateTheme = (theme: 'winter' | 'night') => {
    setTheme(theme);
    localStorage.setItem('theme', theme);
    document.querySelector('html')?.setAttribute('data-theme', theme);
  };

  return (
    <label className="swap-rotate swap">
      <input
        type="checkbox"
        checked={theme === 'winter'}
        onChange={() => updateTheme(theme === 'winter' ? 'night' : 'winter')}
      />
      <IconSun className="swap-on" size="28" />
      <IconMoon className="swap-off" size="28" />
    </label>
  );
};
