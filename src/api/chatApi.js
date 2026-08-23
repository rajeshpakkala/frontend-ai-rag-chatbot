import axios from 'axios'

// In development: VITE_API_BASE_URL is empty → Vite proxy handles /chatbot/* → localhost:8080
// In production:  VITE_API_BASE_URL = 'https://your-backend.com' → full URL used directly
const BASE = `${import.meta.env.VITE_API_BASE_URL || ''}/chatbot/rag/api`

export function sendMessage(message) {
  return axios.post(`${BASE}/chat`, { message })
}

export function uploadDocuments(files, username, password) {
  const formData = new FormData()
  files.forEach(file => formData.append('files', file))

  const token = btoa(`${username}:${password}`)

  return axios.post(`${BASE}/documents/upload`, formData, {
    headers: {
      Authorization: `Basic ${token}`,
    },
  })
}
