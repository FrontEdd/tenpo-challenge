import { useState } from 'react'
import { LoginForm } from '@components/common/LoginForm'
import { useAuth } from '@hooks/useAuth'
import { APP_CONFIG } from '@config/constants'
import { useLanguage } from '@contexts/LanguageContext'
import type { LoginCredentials } from '@app-types/index'

export function LoginPage() {
  const { login, isLoading } = useAuth()
  const { t } = useLanguage()
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(credentials: LoginCredentials) {
    try {
      setError(null)
      await login(credentials.email, credentials.password)
    } catch {
      setError(t.auth.invalidCredentials)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="card">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-stone-100">
            {APP_CONFIG.APP_NAME}
          </h1>
          <p className="text-gray-500 dark:text-stone-400 text-sm mt-1">{t.auth.subtitle}</p>
        </div>

        <LoginForm onSubmit={handleLogin} isLoading={isLoading} error={error} />
      </div>
    </div>
  )
}
