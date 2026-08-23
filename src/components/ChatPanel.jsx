import { useState, useRef, useEffect } from 'react'
import { sendMessage } from '../api/chatApi'

export default function ChatPanel() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    setInput('')
    textareaRef.current.style.height = 'auto'

    setMessages(prev => [...prev, { role: 'user', content: text }])
    setLoading(true)

    try {
      const res = await sendMessage(text)
      setMessages(prev => [
        ...prev,
        {
          role: 'ai',
          content: res.data.answer,
          grounded: res.data.grounded,
          citations: res.data.citations || [],
        },
      ])
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'ai',
          content: err.response?.data?.message || 'Something went wrong. Please try again.',
          grounded: false,
          citations: [],
          error: true,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleTextareaChange = (e) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">

        {/* Empty State */}
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 gap-3 py-20">
            <div className="text-6xl">💬</div>
            <p className="text-base font-semibold text-gray-500">
              Ask anything about your documents
            </p>
            <p className="text-sm text-gray-400 max-w-xs">
              Upload your PDF or text files on the left, then start asking questions here.
              Every answer is grounded in your documents only.
            </p>
          </div>
        )}

        {/* Message List */}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'user' ? (
              /* User bubble */
              <div className="max-w-[75%] bg-blue-600 text-white px-4 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed shadow-sm">
                {msg.content}
              </div>
            ) : (
              /* AI bubble + citations */
              <div className="max-w-[80%] flex flex-col gap-2">
                <div
                  className={`px-4 py-3 rounded-2xl rounded-tl-sm text-sm leading-relaxed shadow-sm ${
                    msg.error
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : msg.grounded
                      ? 'bg-white text-gray-800 border border-gray-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {!msg.grounded && !msg.error && (
                    <span className="inline-block mr-1">⚠️</span>
                  )}
                  {msg.content}
                </div>

                {/* Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 px-1">
                    {msg.citations.map((c, ci) => (
                      <span
                        key={ci}
                        className="inline-flex items-center gap-1 text-xs bg-white text-gray-500 px-2.5 py-1 rounded-full border border-gray-200 shadow-sm"
                        title={`Chunk: ${c.chunkId}`}
                      >
                        <span>📎</span>
                        <span className="font-medium text-gray-600">{c.documentName}</span>
                        {c.pageNumber && (
                          <span className="text-gray-400">· p.{c.pageNumber}</span>
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Loading dots */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1.5 items-center h-4">
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0ms' }}
                />
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white px-4 py-3 flex-shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your documents..."
            rows={1}
            className="flex-1 resize-none px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
            style={{ minHeight: '42px', maxHeight: '120px' }}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-lg"
          >
            {loading ? (
              <span className="text-sm animate-spin inline-block">⟳</span>
            ) : (
              '→'
            )}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1.5 ml-1">
          Enter to send &nbsp;·&nbsp; Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
