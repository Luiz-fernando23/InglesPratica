import axios from 'axios'
import { tokenStorage } from '../storage/token'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1' })

api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      const refresh = tokenStorage.getRefresh()
      if (refresh) {
        try {
          original._retry = true
          const res = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refresh_token: refresh })
          tokenStorage.setAccess(res.data.access_token)
          if (res.data.refresh_token) localStorage.setItem('refresh_token', res.data.refresh_token)
          original.headers.Authorization = `Bearer ${res.data.access_token}`
          return api(original)
        } catch {
          tokenStorage.clear()
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api
