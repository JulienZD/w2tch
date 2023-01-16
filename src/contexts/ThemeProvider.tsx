import { createContext, useContext, useCallback, useEffect, useState, type PropsWithChildren } from 'react';

type Theme = 'winter' | 'night';

interface ThemeContextType {
  theme: Theme;
  setTheme: (newTheme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('winter');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currTheme = localStorage.getItem('theme') as Theme | null;
      if (currTheme) {
        setTheme(currTheme);
        document.querySelector('html')?.setAttribute('data-theme', currTheme);
      }
    }
  }, []);

  const updateTheme = useCallback((theme: Theme) => {
    setTheme(theme);
    localStorage.setItem('theme', theme);
    document.querySelector('html')?.setAttribute('data-theme', theme);
  }, []);

  return <ThemeContext.Provider value={{ theme, setTheme: updateTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const value = useContext(ThemeContext);

  if (!value) throw new Error('useTheme must be used within a ThemeContextProvider');

  return value;
};

if (typeof window !== 'undefined') {
  const initializeTheme = (newTheme: 'winter' | 'night') => {
    localStorage.setItem('theme', newTheme);
    document.querySelector('html')?.setAttribute('data-theme', newTheme);
  };

  const theme = localStorage.getItem('theme');

  if (theme) {
    initializeTheme(theme as 'winter' | 'night');
  } else {
    initializeTheme('night');
  }
}
