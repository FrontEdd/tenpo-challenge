import axios, { AxiosError } from 'axios'

const apiClient = axios.create({
  baseURL: 'https://api.artic.edu/api/v1',
  timeout: 15000,
})

apiClient.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    const message =
      (error.response?.data as { message?: string } | undefined)?.message ??
      'Error en la petición'
    return Promise.reject({ message, status: error.response?.status ?? 500 })
  }
)

export default apiClient
