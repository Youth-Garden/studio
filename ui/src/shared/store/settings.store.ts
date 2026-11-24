import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Locale } from '../../lib/i18n';

export type CanvasPattern = 'dots' | 'lines' | 'cross' | 'none';
export type AppTheme = 'dark' | 'midnight' | 'amoled' | 'light';

interface SettingsState {
  locale: Locale;
  theme: AppTheme;
  canvasPattern: CanvasPattern;
  sidebarWidth: number;
  isSidebarOpen: boolean;
  
  // Actions
  setLocale: (locale: Locale) => void;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
  setCanvasPattern: (pattern: CanvasPattern) => void;
  setSidebarWidth: (width: number) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      locale: 'vi',
      theme: 'dark',
      canvasPattern: 'dots',
      sidebarWidth: 380,
      isSidebarOpen: true,

      setLocale: (locale) => set({ locale }),
      setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        if (theme === 'light') {
          document.documentElement.classList.remove('dark');
        } else {
          document.documentElement.classList.add('dark');
        }
        set({ theme });
      },
      toggleTheme: () => {
        const current = get().theme;
        const nextTheme: AppTheme = current === 'light' ? 'dark' : 'light';
        get().setTheme(nextTheme);
      },
      setCanvasPattern: (canvasPattern) => set({ canvasPattern }),
      setSidebarWidth: (sidebarWidth) => set({ sidebarWidth }),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
    }),
    {
      name: 'studio-user-settings',
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          document.documentElement.setAttribute('data-theme', state.theme);
          if (state.theme === 'light') {
            document.documentElement.classList.remove('dark');
          } else {
            document.documentElement.classList.add('dark');
          }
        }
      },
    }
  )
);
