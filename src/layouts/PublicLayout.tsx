import { Outlet } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@contexts/ThemeContext'
import { useLanguage } from '@contexts/LanguageContext'

export function PublicLayout() {
  const { theme, toggleTheme } = useTheme()
  const { language, toggleLanguage } = useLanguage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-stone-900 dark:to-stone-800 flex items-center justify-center p-4 transition-colors duration-200">
      {/* Controls pinned top-right */}
      <div className="fixed top-4 right-4 flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-gray-500 dark:text-stone-400 bg-white/70 dark:bg-stone-800/70 backdrop-blur-sm hover:bg-white dark:hover:bg-stone-700 transition-colors duration-200"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-sm font-medium text-gray-500 dark:text-stone-400 bg-white/70 dark:bg-stone-800/70 backdrop-blur-sm hover:bg-white dark:hover:bg-stone-700 transition-colors duration-200"
          aria-label={language === 'en' ? 'Cambiar a español' : 'Switch to English'}
        >
          <span className="text-base leading-none" role="img" aria-hidden="true">
            {language === 'en' ? '🇬🇧' : '🇪🇸'}
          </span>
          <span className="text-xs">{language === 'en' ? 'EN' : 'ES'}</span>
        </button>
      </div>

      <Outlet />
    </div>
  )
}
