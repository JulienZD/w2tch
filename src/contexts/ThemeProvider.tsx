import { createContext, useContext, type PropsWithChildren } from 'react';

interface ThemeContextType {
  theme: 'winter' | 'night';
}

const theme: ThemeContextType = { theme: 'winter' };

export const ThemeContext = createContext<ThemeContextType>(theme);

export const ThemeContextProvider: React.FC<PropsWithChildren> = ({ children }) => (
  <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
);

const setTheme = (newTheme: 'winter' | 'night') => {
  theme.theme = newTheme;
  document.querySelector('html')?.setAttribute('data-theme', newTheme);
};

export const useTheme = () => {
  const { theme } = useContext(ThemeContext);
  return { theme, setTheme };
};

if (typeof window !== 'undefined') {
  const theme = localStorage.getItem('theme');
  if (theme) {
    setTheme(theme as 'winter' | 'night');
  } else {
    localStorage.setItem('theme', 'night');
    setTheme('night');
  }
}
