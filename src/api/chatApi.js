import axios from 'axios'

const BASE = '/chatbot/rag/api'

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
