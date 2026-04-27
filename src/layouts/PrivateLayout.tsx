import { Outlet } from 'react-router-dom'
import { LogOut, User, Moon, Sun } from 'lucide-react'
import { useAuth } from '@hooks/useAuth'
import { APP_CONFIG } from '@config/constants'
import { useTheme } from '@contexts/ThemeContext'
import { useLanguage } from '@contexts/LanguageContext'

export function PrivateLayout() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { language, t, toggleLanguage } = useLanguage()

  return (
    <div className="h-screen bg-gray-50 dark:bg-stone-900 flex flex-col overflow-hidden transition-colors duration-200">
      <header className="bg-white dark:bg-stone-800 border-b border-gray-200 dark:border-stone-700 shadow-sm flex-shrink-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-primary-600">
            {APP_CONFIG.APP_NAME}
          </span>

          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 dark:text-stone-400 hover:bg-gray-100 dark:hover:bg-stone-700 transition-colors duration-200"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Language toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-sm font-medium text-gray-500 dark:text-stone-400 hover:bg-gray-100 dark:hover:bg-stone-700 transition-colors duration-200"
              aria-label={language === 'en' ? 'Cambiar a español' : 'Switch to English'}
            >
              <span className="text-base leading-none" role="img" aria-hidden="true">
                {language === 'en' ? '🇬🇧' : '🇪🇸'}
              </span>
              <span className="text-xs hidden sm:block">{language === 'en' ? 'EN' : 'ES'}</span>
            </button>

            <div className="w-px h-5 bg-gray-200 dark:bg-stone-700 mx-1" />

            {/* User info */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-stone-400">
              <User size={16} className="text-gray-400 dark:text-stone-500" />
              <span className="hidden sm:block">{user?.name ?? user?.email}</span>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-stone-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
              aria-label={t.nav.logout}
            >
              <LogOut size={16} />
              <span className="hidden sm:block">{t.nav.logout}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-hidden max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        <Outlet />
      </main>
    </div>
  )
}
