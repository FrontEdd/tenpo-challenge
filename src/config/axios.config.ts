import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

// Tipos para los errores
interface ErrorResponse {
  message: string
  status: number
}

// Crear instancia de axios
const apiClient = axios.create({
  baseURL: 'https://api.artic.edu/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authStorage = localStorage.getItem('auth-storage')

    if (authStorage) {
      const { state } = JSON.parse(authStorage)
      const token = state?.token

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  response => response,
  (error: AxiosError<ErrorResponse>) => {
    // Manejar error 401 (No autorizado)
    if (error.response?.status === 401) {
      // Limpiar storage y redirigir al login
      localStorage.removeItem('auth-storage')
      window.location.href = '/login'
    }

    // Manejar otros errores
    const errorMessage = error.response?.data?.message || 'Error en la petición'

    return Promise.reject({
      message: errorMessage,
      status: error.response?.status || 500,
    })
  }
)

export default apiClient
