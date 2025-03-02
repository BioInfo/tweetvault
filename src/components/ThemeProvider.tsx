import React, { createContext, useContext, useEffect } from 'react';
import { useSettings } from '../lib/settings-context';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  const [theme, setTheme] = React.useState<Theme>('light');
  
  // Update theme based on settings and system preference
  useEffect(() => {
    const updateTheme = () => {
      if (settings.theme === 'dark') {
        setTheme('dark');
      } else if (settings.theme === 'light') {
        setTheme('light');
      } else {
        // System preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
      }
    };

    updateTheme();

    // Listen for system preference changes if using system theme
    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => updateTheme();
      
      // Add event listener with compatibility for older browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
      } else {
        // For older browsers
        mediaQuery.addListener(handleChange);
      }
      
      // Cleanup
      return () => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleChange);
        } else {
          // For older browsers
          mediaQuery.removeListener(handleChange);
        }
      };
    }
  }, [settings.theme]);

  // Apply theme to document
  useEffect(() => {
    // Add transition classes for smooth theme changes
    document.documentElement.classList.add('transition-colors', 'duration-300');
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    return () => {
      // Clean up transition classes if component unmounts
      document.documentElement.classList.remove('transition-colors', 'duration-300');
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}