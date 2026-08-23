import UploadPanel from './components/UploadPanel'
import ChatPanel from './components/ChatPanel'

export default function App() {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">

      {/* Header */}
      <header className="flex-shrink-0 bg-slate-900 text-white px-6 py-3.5 flex items-center gap-3 shadow-lg">
        <div className="text-2xl">🤖</div>
        <div className="flex-1">
          <h1 className="text-base font-bold leading-tight tracking-tight">
            AI RAG Chatbot
          </h1>
          <p className="text-xs text-slate-400">
            Powered by OpenAI · PGVector · Spring AI
          </p>
        </div>
        <div className="text-xs text-slate-500 bg-slate-800 px-3 py-1 rounded-full">
          Backend: localhost:8080
        </div>
      </header>

      {/* Body — split panel */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left panel — Document Upload */}
        <div className="w-[380px] flex-shrink-0 overflow-y-auto">
          <UploadPanel />
        </div>

        {/* Vertical divider */}
        <div className="w-px bg-gray-200 flex-shrink-0" />

        {/* Right panel — Chat */}
        <div className="flex-1 overflow-hidden">
          <ChatPanel />
        </div>
      </div>
    </div>
  )
}
