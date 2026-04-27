import { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useLanguage } from '@contexts/LanguageContext'
import type { LoginCredentials } from '@app-types/index'

interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => Promise<void>
  isLoading: boolean
  error: string | null
}

export function LoginForm({ onSubmit, isLoading, error }: LoginFormProps) {
  const { t } = useLanguage()
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Partial<LoginCredentials>>({})

  function validate(): boolean {
    const errors: Partial<LoginCredentials> = {}
    if (!credentials.email) {
      errors.email = t.auth.emailRequired
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
      errors.email = t.auth.emailInvalid
    }
    if (!credentials.password) {
      errors.password = t.auth.passwordRequired
    } else if (credentials.password.length < 6) {
      errors.password = t.auth.passwordTooShort
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    await onSubmit(credentials)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setCredentials(prev => ({ ...prev, [name]: value }))
    if (fieldErrors[name as keyof LoginCredentials]) {
      setFieldErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {error && (
        <div
          role="alert"
          className="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm"
        >
          {error}
        </div>
      )}

      <div className="space-y-1">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-stone-300">
          {t.auth.emailLabel}
        </label>
        <div className="relative">
          <Mail
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-stone-500 pointer-events-none"
          />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={credentials.email}
            onChange={handleChange}
            disabled={isLoading}
            placeholder={t.auth.emailPlaceholder}
            className={`input-field pl-9 ${fieldErrors.email ? 'border-red-400 focus:ring-red-400' : ''}`}
          />
        </div>
        {fieldErrors.email && (
          <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.email}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-stone-300">
          {t.auth.passwordLabel}
        </label>
        <div className="relative">
          <Lock
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-stone-500 pointer-events-none"
          />
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={credentials.password}
            onChange={handleChange}
            disabled={isLoading}
            placeholder={t.auth.passwordPlaceholder}
            className={`input-field pl-9 pr-10 ${fieldErrors.password ? 'border-red-400 focus:ring-red-400' : ''}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-stone-500 hover:text-gray-600 dark:hover:text-stone-300"
            aria-label={showPassword ? t.auth.hidePassword : t.auth.showPassword}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {fieldErrors.password && (
          <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.password}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            {t.auth.signingIn}
          </>
        ) : (
          t.auth.signIn
        )}
      </button>
    </form>
  )
}
