import axios from 'axios'

// Use relative API URL in production, localhost in development
const API = import.meta.env.PROD ? 'https://1-800-for-rent-production.up.railway.app/api' : (import.meta.env.VITE_API_URL || 'http://localhost:4000/api')

const api = axios.create({ 
  baseURL: API,
  withCredentials: true
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
