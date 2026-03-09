import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

const api = axios.create({
  baseURL     : BASE,
  withCredentials: true,
  headers     : { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status !== 401)
      console.error('API:', err.response?.data?.error || err.message)
    return Promise.reject(err)
  }
)

export default api
