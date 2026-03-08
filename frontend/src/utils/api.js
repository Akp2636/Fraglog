import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Don't log 401s as errors — they're expected for unauth requests
    if (err.response?.status !== 401) {
      console.error('API Error:', err.response?.data?.error || err.message)
    }
    return Promise.reject(err)
  }
)

export default api
