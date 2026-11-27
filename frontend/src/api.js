import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
})

// Attach stored auth token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('civictrack_admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('civictrack_admin_token', token)
  } else {
    localStorage.removeItem('civictrack_admin_token')
  }
}

export const getAuthToken = () => localStorage.getItem('civictrack_admin_token')

export const clearAuthToken = () => {
  localStorage.removeItem('civictrack_admin_token')
  localStorage.removeItem('civictrack_admin_user')
}

export const imageUrl = (path) =>
  path ? (path.startsWith('http') ? path : `http://localhost:8080${path}`) : ''
