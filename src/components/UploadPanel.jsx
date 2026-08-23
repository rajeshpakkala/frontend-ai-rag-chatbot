import { useState, useRef } from 'react'
import { uploadDocuments } from '../api/chatApi'

const ALLOWED_TYPES = ['application/pdf', 'text/plain', 'text/markdown']

export default function UploadPanel() {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [files, setFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [status, setStatus] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const addFiles = (incoming) => {
    const valid = incoming.filter(f => ALLOWED_TYPES.includes(f.type))
    const skipped = incoming.length - valid.length

    setFiles(prev => {
      const existing = new Set(prev.map(f => f.name))
      const fresh = valid.filter(f => !existing.has(f.name))
      return [...prev, ...fresh]
    })

    if (skipped > 0) {
      setStatus({
        type: 'error',
        message: `${skipped} file(s) skipped — only PDF, TXT and MD are supported.`,
      })
    } else {
      setStatus(null)
    }
  }

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = () => setIsDragging(false)
  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    addFiles(Array.from(e.dataTransfer.files))
  }
  const handleFileInput = (e) => addFiles(Array.from(e.target.files))
  const removeFile = (name) => setFiles(prev => prev.filter(f => f.name !== name))

  const handleUpload = async () => {
    if (!username.trim() || !password.trim()) {
      setStatus({ type: 'error', message: 'Please enter your username and password.' })
      return
    }
    if (files.length === 0) {
      setStatus({ type: 'error', message: 'Please select at least one file to upload.' })
      return
    }

    setUploading(true)
    setStatus(null)

    try {
      const res = await uploadDocuments(files, username, password)
      setStatus({
        type: 'success',
        message: `${res.data.count} document(s) uploaded and indexed successfully.`,
      })
      setFiles([])
    } catch (err) {
      if (err.response?.status === 401) {
        setStatus({ type: 'error', message: 'Invalid credentials. Access denied.' })
      } else {
        setStatus({
          type: 'error',
          message: err.response?.data?.message || 'Upload failed. Please try again.',
        })
      }
    } finally {
      setUploading(false)
    }
  }

  const fileIcon = (name) => name.endsWith('.pdf') ? '📄' : '📝'

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200 p-5 gap-4 overflow-y-auto">

      {/* Title */}
      <div>
        <h2 className="text-base font-semibold text-gray-800">Upload Documents</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Only the admin user can upload. Uploaded files are indexed into the vector database.
        </p>
      </div>

      {/* Credentials */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
          Admin Credentials
        </p>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="w-full mb-2 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
        />
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all select-none ${
          isDragging
            ? 'border-blue-400 bg-blue-50 scale-[1.01]'
            : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
        }`}
      >
        <div className="text-4xl mb-2">📂</div>
        <p className="text-sm font-medium text-gray-700">Drag &amp; drop files here</p>
        <p className="text-xs text-gray-400 mt-1">or click to browse</p>
        <p className="text-xs text-gray-300 mt-2">PDF · TXT · MD</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.txt,.md"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">
            Selected ({files.length})
          </p>
          {files.map(file => (
            <div
              key={file.name}
              className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 border border-gray-200"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg">{fileIcon(file.name)}</span>
                <div className="min-w-0">
                  <p className="text-sm text-gray-700 truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFile(file.name)}
                className="text-gray-400 hover:text-red-500 ml-2 text-xl leading-none transition-colors"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Status */}
      {status && (
        <div
          className={`rounded-lg px-3 py-2.5 text-sm flex items-start gap-2 ${
            status.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          <span className="mt-0.5">{status.type === 'success' ? '✅' : '❌'}</span>
          <span>{status.message}</span>
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="mt-auto w-full py-2.5 px-4 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {uploading
          ? '⏳ Uploading...'
          : files.length > 0
          ? `Upload ${files.length} Document${files.length > 1 ? 's' : ''}`
          : 'Upload Documents'}
      </button>
    </div>
  )
}
